const express = require("express");
const path = require("path");
const db = require("../config/db");

const router = express.Router();

/* --------------------- GET CONTEXT --------------------- */
function getContext(req) {
  return {
    userId: req.user?.id || null,
    userRole: req.user?.role?.toUpperCase() || null,
    orgId: req.user?.organizationId || null,
    query: req.query || {},
  };
}

/* --------------------- Validate User Organization --------------------- */
async function validateUserOrg(userId, orgId) {
  const q = `SELECT organization_id FROM users WHERE id = $1`;
  const r = await db.query(q, [userId]);

  if (!r.rows.length) return false;
  return Number(r.rows[0].organization_id) === Number(orgId);
}

/* --------------------- Build secure URLs --------------------- */
function secureUrls(req, id) {
  const base = `${req.protocol}://${req.get("host")}`;
  return {
    viewUrl: `${base}/api/user/materials/${id}/view`,
    downloadUrl: `${base}/api/user/materials/${id}/download`,
  };
}

/* ===========================================================
   GET ALL MATERIALS (LIST + SEARCH + FILTER)
   =========================================================== */
router.get("/materials", async (req, res) => {
  try {
    const { userId, userRole, orgId, query } = getContext(req);

    if (!userId) return res.status(400).json({ message: "User not found" });
    if (userRole !== "USER") return res.status(403).json({ message: "Unauthorized" });

    if (orgId && !(await validateUserOrg(userId, orgId))) {
      return res.status(403).json({ message: "User does not belong to this organization" });
    }

    const {
      search = "",
      subject = "",
      type = "",
      limit = 10,
      page = 1,
      sortBy = "uploaded_at",
      sortOrder = "DESC",
    } = query;

    const offset = (page - 1) * limit;

    let where = [`is_active = TRUE`];
    let values = [];
    let i = 1;

    if (orgId) {
      where.push(`organization_id = $${i}`);
      values.push(orgId);
      i++;
    }

    if (search) {
      where.push(`LOWER(title) LIKE $${i}`);
      values.push(`%${search.toLowerCase()}%`);
      i++;
    }

    if (subject) {
      where.push(`LOWER(subject) LIKE $${i}`);
      values.push(`%${subject.toLowerCase()}%`);
      i++;
    }

    if (type) {
      where.push(`UPPER(material_type) = $${i}`);
      values.push(type.toUpperCase());
      i++;
    }

    const whereSQL = `WHERE ${where.join(" AND ")}`;

    const countQ = `SELECT COUNT(*) AS total FROM study_materials ${whereSQL}`;
    const countR = await db.query(countQ, values);
    const total = Number(countR.rows[0].total);

    const dataQ = `
      SELECT id, title, description, subject, material_type, file_size_mb, uploaded_at 
      FROM study_materials
      ${whereSQL}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT ${limit} OFFSET ${offset}
    `;
    const dataR = await db.query(dataQ, values);

    const materials = dataR.rows.map((m) => ({
      ...m,
      ...secureUrls(req, m.id),
    }));

    return res.json({
      success: true,
      data: materials,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ message: "Failed to load materials" });
  }
});

/* ===========================================================
   GET SINGLE MATERIAL DETAILS  (WITH is_active CHECK)
   =========================================================== */
router.get("/materials/:id", async (req, res) => {
  try {
    const { userRole, orgId } = getContext(req);
    const id = Number(req.params.id);

    if (userRole !== "USER") return res.status(403).json({ message: "Unauthorized" });

    let values = [id];
    let orgSQL = "";

    if (orgId) {
      orgSQL = "AND organization_id = $2";
      values.push(orgId);
    }

    const q = `
      SELECT * FROM study_materials 
      WHERE id = $1 AND is_active = TRUE ${orgSQL}
      LIMIT 1
    `;

    const r = await db.query(q, values);

    if (!r.rows.length) return res.status(404).json({ message: "Not found" });

    return res.json({
      success: true,
      data: {
        ...r.rows[0],
        ...secureUrls(req, r.rows[0].id),
      },
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch material" });
  }
});

/* ===========================================================
   VIEW MATERIAL (INLINE) WITH is_active CHECK
   =========================================================== */
router.get("/materials/:id/view", async (req, res) => {
  try {
    const id = req.params.id;

    const r = await db.query(
      `SELECT * FROM study_materials WHERE id = $1 AND is_active = TRUE`,
      [id]
    );

    if (!r.rows.length) return res.status(404).json({ message: "Not found" });

    const mat = r.rows[0];

    if (mat.external_url) return res.redirect(mat.external_url);

    const filePath = path.join(__dirname, "..", mat.file_path);

    res.setHeader("Content-Disposition", "inline");
    return res.sendFile(filePath);
  } catch (err) {
    return res.status(500).json({ message: "Error opening material" });
  }
});

/* ===========================================================
   DOWNLOAD MATERIAL (WITH is_active CHECK)
   =========================================================== */
router.get("/materials/:id/download", async (req, res) => {
  try {
    const id = req.params.id;

    const r = await db.query(
      `SELECT * FROM study_materials WHERE id = $1 AND is_active = TRUE`,
      [id]
    );

    if (!r.rows.length) return res.status(404).json({ message: "Not found" });

    const mat = r.rows[0];

    if (mat.external_url) return res.redirect(mat.external_url);

    const filePath = path.join(__dirname, "..", mat.file_path);

    return res.download(filePath, mat.title + ".pdf");
  } catch (err) {
    return res.status(500).json({ message: "Error downloading file" });
  }
});

module.exports = router;
