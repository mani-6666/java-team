const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const path = require("path");


cloudinary.config({
  cloud_name: "dmk31su72",
  api_key: "257932196178783",
  api_secret: "sVVFFDBeGolqL22_NRq13JXxhQw"
});


const formatSize = (bytes) => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(
      null,
      Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname)
    )
});

const upload = multer({ storage });


router.post("/", upload.single("file"), async (req, res) => {
  try {
    const { title, className, category, type } = req.body;
    const userId = req.user.id;
    const orgId = req.user.organizationId;

    if (!req.file) {
      return res.status(400).json({ message: "File required" });
    }

    
    const uploaded = await cloudinary.uploader.upload(req.file.path);

    
    const result = await pool.query(
      `INSERT INTO study_materials 
        (title, class, category, type, file_url, file_size,upload_date, uploaded_by, organization_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [
        title,
        className,
        category,
        type,
        uploaded.secure_url,
        formatSize(req.file.size),
        uploadDate,
        userId,
        orgId
      ]
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
        sm.class,
        sm.category,
        sm.type,
        sm.file_url,
        sm.file_size,
        sm.download_count,
        TO_CHAR(sm.upload_date, 'YYYY-MM-DD') AS upload_date,
        u.name AS uploaded_by
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
       WHERE id = $1`,
      [id]
    );

    const file = await pool.query(
      `SELECT file_url FROM study_materials WHERE id=$1`,
      [id]
    );

    res.json({ success: true, url: file.rows[0].file_url });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { title, className, category, type } = req.body;

    const result = await pool.query(
      `UPDATE study_materials SET
        title=$1, class=$2, category=$3, type=$4
       WHERE id=$5 AND is_deleted=false
       RETURNING *`,
      [title, className, category, type, req.params.id]
    );

    res.json({ success: true, data: result.rows[0] });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.delete("/:id", async (req, res) => {
  try {
    await pool.query(
      `UPDATE study_materials 
       SET is_deleted=true 
       WHERE id=$1`,
      [req.params.id]
    );

    res.json({ success: true, message: "Material deleted" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
