const pool = require("../../config/db");
const express = require("express");

const router = express.Router();

const getExamStatus = (startDate, endDate) => {
  const today = new Date();
  startDate = new Date(startDate);
  endDate = new Date(endDate);

  if (startDate > today) return "scheduled";
  if (endDate < today) return "completed";
  return "active";
};

router.get("/invigilator/search", async (req, res) => {
  try {
    const orgId=req.user.organizationId;
    const {  query } = req.query;

    const sql = `
      SELECT asi_id, full_name, email 
      FROM mainexamportal.asi_users
      WHERE org_id = $1
        AND role = 'invigilator'
        AND full_name ILIKE $2
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
    const orgId = req.user.organizationId;
    const createdBy = req.user.id;
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
        status,
        false,
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
    const orgId = req.user.organizationId;

    const query = `
      SELECT 
        e.*,
        COALESCE(
          (SELECT COUNT(*) FROM mainexamportal.exam_attempt er WHERE er.exam_id = e.exam_id),
          0
        ) AS attempt_count,

        COALESCE(
          (SELECT AVG(er.score) FROM mainexamportal.exam_attempt er WHERE er.exam_id = e.exam_id),
          0
        ) AS avg_score

      FROM mainexamportal.exams e
      WHERE e.org_id = $1 AND e.is_deleted = false
      ORDER BY e.created_at DESC
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
    const orgId = req.user.organizationId;

    const result = await pool.query(
      `SELECT 
         e.*,
         (SELECT COUNT(*) FROM mainexamportal.exam_attempt er WHERE er.exam_id = e.exam_id) AS attempt_count
       FROM mainexamportal.exams e
       WHERE e.id=$1 AND e.org_id=$2 AND e.is_deleted=false`,
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
      `UPDATE mainexamportal.exams SET
         title=$1,
         type=$2,
         description=$3,
         start_date=$4,
         end_date=$5,
         duration=$6,
         questions=$7
         total_marks=$8,
         status=$9
       WHERE id=$10 AND org_id=$11 AND is_deleted=false
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
      `UPDATE mainexamportal.exams 
       SET is_deleted=true 
       WHERE id=$1 AND org_id=$2`,
      [req.params.id, orgId]
    );

    res.json({ success: true, message: "Exam deleted successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;