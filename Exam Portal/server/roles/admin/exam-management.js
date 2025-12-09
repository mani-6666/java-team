const pool = require("../config/db");
const express = require("express");

const router = express.Router();

const getExamStatus = (startDate, endDate) => {
  const today = new Date();
  startDate = new Date(startDate);
  endDate = new Date(endDate);

  if (startDate > today) return "upcoming";
  if (endDate < today) return "completed";
  return "active";
};

router.get("/invigilator/search", async (req, res) => {
  try {
    const { orgId, query } = req.query;

    const sql = `
      SELECT id, name, email 
      FROM users
      WHERE organization_id = $1
        AND role = 'invigilator'
        AND name ILIKE $2
      LIMIT 10;
    `;

    const result = await pool.query(sql, [orgId, `%${query}%`]);

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


router.post("/", async (req, res) => {

  try {
    const {
      title,
      type,
      description,
      startDate,
      endDate,
      duration,
      questions,
      totalMarks,
      negativeMarking,
      invigilatorId,     
      invigilatorName    
    } = req.body;

    if (!title || !type || !startDate || !endDate || !questions) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const status = getExamStatus(startDate, endDate);
    const orgId = "ORG001";
    const createdBy = "bae35228-b803-45f0-b54c-2a7b40b2873d";
    await pool.query("BEGIN");

    
    const examInsert = await pool.query(
      `INSERT INTO mainexamportal.exams 
        (org_id, created_by, title, type, duration_min, status, is_deleted, 
         invigilator_id, invigilator_name)
       VALUES ($1,$2,$3,$4,$5,$6,false,$7,$8)
       RETURNING exam_id`,
      [
        orgId,
        createdBy,
        title,
        type,
        duration || 0,
        "scheduled",
        invigilatorId || null,
        invigilatorName || null
      ]
    );

    const examId = examInsert.rows[0].exam_id;

    
    await pool.query(
      `INSERT INTO mainexamportal.exam_details
        (exam_id, description, total_questions, total_marks, 
         negative_marking, start_date, end_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [
        examId,
        description || "",
        questions,
        totalMarks || 0,
        negativeMarking || 0,
        startDate,
        endDate
      ]
    );

    await pool.query("COMMIT");

    res.status(201).json({
      success: true,
      message: "Exam created successfully",
      examId,
      invigilator: {
        id: invigilatorId,
        name: invigilatorName
      }
    });

  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("❌ Exam creation failed:", error);
    res.status(500).json({ error: error.message });
  } 
});



router.get("/", async (req, res) => {
  try {
    const orgId = "ORG001";

    const query = `
      SELECT 
        e.*,
        (SELECT COUNT(*) FROM exam_results er WHERE er.exam_id = e.id) AS attempt_count
      FROM exams e
      WHERE e.organization_id = $1 AND e.is_deleted = false
      ORDER BY e.start_date DESC
    `;

    const result = await pool.query(query, [orgId]);

    res.json({ success: true, data: result.rows });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});



router.get("/:id", async (req, res) => {
  try {
    const orgId = "ORG001";

    const result = await pool.query(
      `SELECT 
         e.*,
         (SELECT COUNT(*) FROM exam_results er WHERE er.exam_id = e.id) AS attempt_count
       FROM exams e
       WHERE e.id=$1 AND e.organization_id=$2 AND e.is_deleted=false`,
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
      startDate,
      endDate,
      duration,
      questions,
      totalMarks
    } = req.body;

    const orgId = req.user.organizationId;

    let status = undefined;
    if (startDate && endDate) {
      status = getExamStatus(startDate, endDate);
    }

    const result = await pool.query(
      `UPDATE exams SET
         title=$1,
         type=$2,
         description=$3,
         start_date=$4,
         end_date=$5,
         duration=$6,
         questions=$7
         total_marks=$8,
         status=$9
       WHERE id=$10 AND organization_id=$11 AND is_deleted=false
       RETURNING *`,
      [
        title,
        type,
        description,
        startDate,
        endDate,
        duration,
        questions,
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

    await pool.query(
      `UPDATE exams 
       SET is_deleted=true 
       WHERE id=$1 AND organization_id=$2`,
      [req.params.id, orgId]
    );

    res.json({ success: true, message: "Exam deleted successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
