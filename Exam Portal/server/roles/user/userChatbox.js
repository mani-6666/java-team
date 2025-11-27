
const express = require("express");
const db = require("../config/db");

const router = express.Router();


function getContext(req) {
  return {
    userId: req.user?.id || null,
    role: req.user?.role?.toUpperCase() || null,
    orgId: req.user?.organizationId || null,
  };
}

async function validateUserOrg(userId, orgId) {
  if (!orgId) return true;

  const q = `SELECT organization_id FROM users WHERE id = $1`;
  const r = await db.query(q, [userId]);

  if (!r.rows.length) return false;
  return Number(r.rows[0].organization_id) === Number(orgId);
}

/* ==========================================================
   1️⃣ GET CHAT LIST (Left side)
   GET /chat/list
========================================================== */
router.get("/chat/list", async (req, res) => {
  try {
    const { userId, role, orgId } = getContext(req);
    const filter = (req.query.filter || "all").toLowerCase();

    if (!userId) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    if (role !== "USER") {
      return res
        .status(403)
        .json({ success: false, message: "Access denied: USER role required" });
    }

    if (!(await validateUserOrg(userId, orgId))) {
      return res.status(403).json({
        success: false,
        message: "User does not belong to this organization",
      });
    }

    let q = `
      SELECT 
        c.id AS chat_id,
        c.status,
        TO_CHAR(c.created_at, 'HH24:MI') AS time,
        a.id AS admin_id,
        a.name AS admin_name,
        COALESCE(
          (SELECT message 
           FROM messages 
           WHERE chat_id = c.id 
           ORDER BY created_at DESC 
           LIMIT 1),
          ''
        ) AS last_message
      FROM chats c
      JOIN admins a ON a.id = c.admin_id
      WHERE c.user_id = $1
    `;

    const params = [userId];

    if (filter !== "all") {
      q += ` AND LOWER(c.status) = $2`;
      params.push(filter);
    }

    q += ` ORDER BY c.updated_at DESC NULLS LAST, c.created_at DESC`;

    const r = await db.query(q, params);

    return res.json({
      success: true,
      data: r.rows || [],
    });
  } catch (err) {
    console.error("Chatbox list error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to load chat list",
    });
  }
});

/* ==========================================================
   2️⃣ GET CHAT MESSAGES (Right side)
   GET /chat/messages/:chatId
========================================================== */
router.get("/chat/messages/:chatId", async (req, res) => {
  try {
    const { userId, role, orgId } = getContext(req);
    const chatId = Number(req.params.chatId);

    if (!userId) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    if (role !== "USER") {
      return res
        .status(403)
        .json({ success: false, message: "Access denied: USER role required" });
    }

    if (!(await validateUserOrg(userId, orgId))) {
      return res.status(403).json({
        success: false,
        message: "User does not belong to this organization",
      });
    }

    const q = `
      SELECT 
        m.id,
        m.chat_id,
        m.sender_id,
        m.receiver_id,
        m.message,
        TO_CHAR(m.created_at, 'HH12:MI AM') AS time
      FROM messages m
      JOIN chats c ON c.id = m.chat_id
      WHERE m.chat_id = $1
        AND c.user_id = $2
      ORDER BY m.created_at ASC
    `;

    const r = await db.query(q, [chatId, userId]);

    return res.json({
      success: true,
      messages: r.rows || [],
    });
  } catch (err) {
    console.error("Chatbox messages error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to load messages",
    });
  }
});

/* ==========================================================
   3️⃣ UPDATE CHAT STATUS (dropdown)
   PUT /chat/status
========================================================== */
router.put("/chat/status", async (req, res) => {
  try {
    const { userId, role, orgId } = getContext(req);
    const { chatId, status } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    if (role !== "USER") {
      return res
        .status(403)
        .json({ success: false, message: "Access denied: USER role required" });
    }

    if (!(await validateUserOrg(userId, orgId))) {
      return res.status(403).json({
        success: false,
        message: "User does not belong to this organization",
      });
    }

    await db.query(
      `UPDATE chats 
       SET status = $1, updated_at = NOW()
       WHERE id = $2 AND user_id = $3`,
      [status, chatId, userId]
    );

    return res.json({
      success: true,
      message: "Status updated",
    });
  } catch (err) {
    console.error("Chatbox status error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update status",
    });
  }
});

/* ==========================================================
   4️⃣ SEND MESSAGE (HTTP fallback if WS fails)
   POST /chat/send
========================================================== */
router.post("/chat/send", async (req, res) => {
  try {
    const { userId, role, orgId } = getContext(req);
    const { chatId, senderId, receiverId, message } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    if (role !== "USER") {
      return res
        .status(403)
        .json({ success: false, message: "Access denied: USER role required" });
    }

    if (!(await validateUserOrg(userId, orgId))) {
      return res.status(403).json({
        success: false,
        message: "User does not belong to this organization",
      });
    }

    await db.query(
      `INSERT INTO messages (chat_id, sender_id, receiver_id, message)
       VALUES ($1,$2,$3,$4)`,
      [chatId, senderId, receiverId, message]
    );

    return res.json({
      success: true,
      message: "Message stored",
    });
  } catch (err) {
    console.error("Chatbox send error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to send message",
    });
  }
});

module.exports = router;
