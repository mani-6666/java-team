const client = require("../config/db");

const express=require('express');

const router = express.Router();

const getExamStatus = (eDate) => {
  const today = new Date();
  const examDate = new Date(eDate);

  if (examDate > today) return "upcoming";
  if (exam.toDateString() === today.toDateString()) return "active";
  return "completed";
};

router.post("/", async (req, res) => {
  try {
    const {
      title,
      type,
      description,
      examDate,
      duration,
      totalMarks
    } = req.body;

    if (!title || !type || !examDate) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const status = getExamStatus(examDate);

    const result = await client.query(
      `INSERT INTO exams 
       (title, type, description, exam_date, duration, total_marks, status, organization_id, is_deleted)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,false)
       RETURNING *`,
      [
        title,
        type,
        description || "",
        examDate,
        duration || 0,
        totalMarks || 0,
        status,
        req.user.organizationId
      ]
    );

    res.status(201).json({ success: true, data: result.rows[0] });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const { status = "", type = "", date = "" } = req.query;
    const orgId = req.user.organizationId;

    let query = `SELECT * FROM exams WHERE organization_id=${orgId} AND is_deleted=false`;

    if (status) query += ` AND status='${status}'`;
    if (type) query += ` AND type='${type}'`;
    if (date) query += ` AND exam_date='${date}'`;

    query += ` ORDER BY exam_date DESC`;

    const result = await client.query(query);
    res.json({ success: true, data: result.rows });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get("/:id", async (req, res) => {
  try {
    const orgId = req.user.organizationId;

    const result = await client.query(
      `SELECT * FROM exams 
       WHERE id=$1 AND organization_id=$2 AND is_deleted=false`,
      [req.params.id, orgId]
    );

    res.json({ success: true, data: result.rows[0] });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.put("/:id", async (req, res) => {
  try {
    const {
      title,
      type,
      description,
      examDate,
      duration,
      totalMarks
    } = req.body;

    const status = examDate ? getExamStatus(examDate) : undefined;

    const orgId = req.user.organizationId;

    const result = await client.query(
      `UPDATE exams SET
         title=$1,
         type=$2,
         description=$3,
         exam_date=$4,
         duration=$5,
         total_marks=$6,
         status=$7
       WHERE id=$8 AND organization_id=$9 AND is_deleted=false
       RETURNING *`,
      [
        title,
        type,
        description,
        examDate,
        duration,
        totalMarks,
        status,
        req.params.id,
        orgId
      ]
    );

    res.json({ success: true, data: result.rows[0] });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.delete("/:id", async (req, res) => {
  try {
    const orgId = req.user.organizationId;

    await client.query(
      `UPDATE exams 
       SET is_deleted=true 
       WHERE id=$1 AND organization_id=$2`,
      [req.params.id, orgId]
    );

    res.json({ success: true, message: "Exam deleted successfully (soft delete)" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports=router;
