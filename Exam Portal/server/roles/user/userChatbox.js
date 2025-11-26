const express = require("express");
const db = require("../config/db");

const router = express.Router();


function getContext(req) {
  return {
    userId: req.user?.id || null,
    role: req.user?.role?.toUpperCase() || null,
    orgId: req.user?.organizationId || null,
    query: req.query || {},
  };
}

async function validateUserOrg(userId, orgId) {
  if (!orgId) return true;
  const q = `SELECT organization_id FROM users WHERE id = $1`;
  const r = await db.query(q, [userId]);
  if (!r.rows.length) return false;
  return Number(r.rows[0].organization_id) === Number(orgId);
}


router.post("/messages/tickets", async (req, res) => {
  try {
    const { userId, role, orgId } = getContext(req);
    const { subject, message } = req.body;

    if (!userId) return res.status(400).json({ success: false, message: "User not found" });
    if (role !== "USER")
      return res.status(403).json({ success: false, message: "USER role required" });
    if (!(await validateUserOrg(userId, orgId)))
      return res.status(403).json({ success: false, message: "Organization mismatch" });

    if (!subject || !message) {
      return res.status(400).json({ success: false, message: "Subject & message required" });
    }

    const ticketQ = `
      INSERT INTO tickets (user_id, subject, status, created_at, updated_at, last_message_at)
      VALUES ($1, $2, 'PENDING', NOW(), NOW(), NOW())
      RETURNING id, subject, status, created_at;
    `;
    const t = await db.query(ticketQ, [userId, subject]);
    const ticket = t.rows[0];

    const msgQ = `
      INSERT INTO ticket_messages (ticket_id, sender_id, is_admin, message, created_at)
      VALUES ($1, $2, FALSE, $3, NOW())
      RETURNING id, message, created_at;
    `;
    const m = await db.query(msgQ, [ticket.id, userId, message]);

    return res.status(201).json({
      success: true,
      message: "Ticket created",
      data: { ticket, firstMessage: m.rows[0] },
    });
  } catch (err) {
    console.error("Create ticket error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/messages/tickets", async (req, res) => {
  try {
    const { userId, role, orgId, query } = getContext(req);
    const { status = "all" } = query;

    if (!userId) return res.status(400).json({ success: false, message: "User not found" });
    if (role !== "USER")
      return res.status(403).json({ success: false, message: "USER role required" });
    if (!(await validateUserOrg(userId, orgId)))
      return res.status(403).json({ success: false, message: "Organization mismatch" });

    const allowedStatuses = ["PENDING", "ACTIVE", "INPROGRESS", "RESOLVED", "CLOSED"];

    const values = [userId];
    let where = [`t.user_id = $1`];

    if (status.toLowerCase() !== "all") {
      const S = status.toUpperCase();
      if (!allowedStatuses.includes(S))
        return res.status(400).json({ success: false, message: "Invalid status filter" });

      where.push(`t.status = $2`);
      values.push(S);
    }

    const q = `
      SELECT
        t.id,
        t.subject,
        t.status,
        t.created_at,
        t.updated_at,
        t.last_message_at,
        au.full_name AS admin_name,
        (
          SELECT tm.message
          FROM ticket_messages tm
          WHERE tm.ticket_id = t.id
          ORDER BY tm.created_at DESC LIMIT 1
        ) AS last_message
      FROM tickets t
      LEFT JOIN users au ON au.id = t.admin_id
      WHERE ${where.join(" AND ")}
      ORDER BY t.last_message_at DESC;
    `;

    const r = await db.query(q, values);

    const tickets = r.rows.map((row) => ({
      id: row.id,
      subject: row.subject,
      status: row.status,
      adminName: row.admin_name || "Support Admin",
      lastMessage: row.last_message,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      lastMessageAt: row.last_message_at,
    }));

    return res.json({ success: true, data: tickets });
  } catch (err) {
    console.error("List tickets error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});


router.get("/messages/tickets/:ticketId", async (req, res) => {
  try {
    const { userId, role, orgId } = getContext(req);
    const ticketId = Number(req.params.ticketId);

    if (!userId) return res.status(400).json({ success: false, message: "User not found" });
    if (role !== "USER")
      return res.status(403).json({ success: false, message: "USER role required" });
    if (!(await validateUserOrg(userId, orgId)))
      return res.status(403).json({ success: false, message: "Organization mismatch" });

 
    const tQ = `
      SELECT t.*, u.full_name AS admin_name
      FROM tickets t
      LEFT JOIN users u ON u.id = t.admin_id
      WHERE t.id = $1 AND t.user_id = $2
    `;
    const tR = await db.query(tQ, [ticketId, userId]);
    if (!tR.rows.length)
      return res.status(404).json({ success: false, message: "Ticket not found" });

    const ticket = tR.rows[0];


    const msgQ = `
      SELECT id, message, sender_id, is_admin, created_at
      FROM ticket_messages
      WHERE ticket_id = $1
      ORDER BY created_at ASC;
    `;
    const mR = await db.query(msgQ, [ticketId]);

    const messages = mR.rows.map((m) => ({
      id: m.id,
      message: m.message,
      createdAt: m.created_at,
      isAdmin: m.is_admin,
      senderType: m.is_admin ? "ADMIN" : "USER",
      isMine: !m.is_admin,
    }));

    return res.json({
      success: true,
      data: { ticket, messages },
    });
  } catch (err) {
    console.error("Get chat error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});


router.post("/messages/tickets/:ticketId/messages", async (req, res) => {
  try {
    const { userId, role, orgId } = getContext(req);
    const ticketId = Number(req.params.ticketId);
    const { message } = req.body;

    if (!userId) return res.status(400).json({ success: false, message: "User not found" });
    if (role !== "USER")
      return res.status(403).json({ success: false, message: "USER role required" });
    if (!message || !message.trim())
      return res.status(400).json({ success: false, message: "Message required" });

  
    const check = await db.query(
      `SELECT id FROM tickets WHERE id = $1 AND user_id = $2`,
      [ticketId, userId]
    );
    if (!check.rows.length)
      return res.status(404).json({ success: false, message: "Ticket not found" });

    const q = `
      INSERT INTO ticket_messages (ticket_id, sender_id, is_admin, message, created_at)
      VALUES ($1, $2, FALSE, $3, NOW())
      RETURNING id, message, created_at;
    `;
    const r = await db.query(q, [ticketId, userId, message]);

    await db.query(
      `UPDATE tickets SET updated_at = NOW(), last_message_at = NOW() WHERE id = $1`,
      [ticketId]
    );

    return res.status(201).json({
      success: true,
      message: "Message sent",
      data: r.rows[0],
    });
  } catch (err) {
    console.error("Send message error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});


router.put("/messages/tickets/:ticketId/status", async (req, res) => {
  try {
    const { userId, role, orgId } = getContext(req);
    const ticketId = Number(req.params.ticketId);
    const { status } = req.body;

    if (!userId) return res.status(400).json({ success: false, message: "User not found" });
    if (role !== "USER")
      return res.status(403).json({ success: false, message: "USER role required" });

    const allowed = ["PENDING", "ACTIVE", "INPROGRESS", "RESOLVED", "CLOSED"];
    const S = String(status || "").toUpperCase();
    if (!allowed.includes(S))
      return res.status(400).json({ success: false, message: "Invalid status" });

    const t = await db.query(
      `SELECT id FROM tickets WHERE id = $1 AND user_id = $2`,
      [ticketId, userId]
    );
    if (!t.rows.length)
      return res.status(404).json({ success: false, message: "Ticket not found" });

    const q = `
      UPDATE tickets SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, subject, status, updated_at;
    `;
    const r = await db.query(q, [S, ticketId]);

    return res.json({
      success: true,
      message: "Status updated",
      data: r.rows[0],
    });
  } catch (err) {
    console.error("Status update error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
