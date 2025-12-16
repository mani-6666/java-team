const express = require("express");
const router = express.Router();
const pool = require("../../config/db.js");
const admin = require("../../config/firebase.js");   // Firebase Admin SDK



router.post("/", async (req, res) => {
  try {
    const { title, category, type, size, fileURL } = req.body;

    const userId = req.user.id;                // from auth middleware
    const orgId = req.user.organizationId;

    if (!fileURL) {
      return res.status(400).json({ message: "File URL missing. Upload to Firebase first." });
    }

    const result = await pool.query(
      `INSERT INTO study_materials 
        (title, category, type, file_url, file_size, upload_date, uploaded_by, organization_id)
       VALUES ($1,$2,$3,$4,$5, NOW(), $6, $7)
       RETURNING *`,
      [title, category, type, fileURL, size, userId, orgId]
    );

    res.status(201).json({ success: true, data: result.rows[0] });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



router.get("/", async (req, res) => {
  try {
    const orgId = req.user.organizationId;

    const result = await pool.query(
      `SELECT 
        sm.id,
        sm.title,
        sm.category,
        sm.type,
        sm.file_size AS size,
        sm.download_count AS downloads,
        TO_CHAR(sm.upload_date, 'YYYY-MM-DD') AS "date",
        u.name AS "uploadedBy"
       FROM study_materials sm
       JOIN users u ON u.id = sm.uploaded_by
       WHERE sm.organization_id = $1 AND sm.is_deleted = false
       ORDER BY sm.upload_date DESC`,
      [orgId]
    );

    res.json({ success: true, data: result.rows });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



router.get("/download/:id", async (req, res) => {
  try {
    const id = req.params.id;

    await pool.query(
      `UPDATE study_materials 
       SET download_count = download_count + 1 
       WHERE id=$1`,
      [id]
    );

    const result = await pool.query(
      `SELECT file_url FROM study_materials WHERE id=$1`,
      [id]
    );

    res.json({ success: true, url: result.rows[0].file_url });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



router.put("/:id", async (req, res) => {
  try {
    const { title, category, type } = req.body;

    const result = await pool.query(
      `UPDATE study_materials SET
        title=$1, category=$2, type=$3
       WHERE id=$4 AND is_deleted=false
       RETURNING *`,
      [title, category, type, req.params.id]
    );

    res.json({ success: true, data: result.rows[0] });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});






router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    // Get file URL to delete from Firebase
    const result = await pool.query(
      `SELECT file_url FROM study_materials WHERE id=$1`,
      [id]
    );

    const fileURL = result.rows[0]?.file_url;

    // OPTIONAL: delete from Firebase Storage
    if (fileURL) {
      const bucket = admin.storage().bucket();
      const fileName = decodeURIComponent(fileURL.split("/o/")[1].split("?")[0]);

      try {
        await bucket.file(fileName).delete();
      } catch (err) {
        console.log("Firebase delete failed (ignored):", err.message);
      }
    }

    // Soft delete in DB
    await pool.query(
      `UPDATE study_materials SET is_deleted=true WHERE id=$1`,
      [id]
    );

    res.json({ success: true, message: "Material deleted" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;