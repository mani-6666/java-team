const express = require("express");
const pool = require("../config/db.js");
const router = express.Router();


router.get("/exams", async (req, res) => {
  try {
    const invigilatorId = req.user.id;
    const role = req.user.role;

    if (role !== "invigilator") {
      return res.status(403).json({ 
        message: "Access denied — invigilator only" 
      });
    }

    const examsQuery = `
      SELECT exam_id, title, subject, exam_type
      FROM exams
      WHERE assigned_to = $1
      ORDER BY exam_id
    `;
    const exams = (await pool.query(examsQuery, [invigilatorId])).rows;

    return res.json({
      success: true,
      exams
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load assigned exams",
      error: error.message
    });
  }
});


router.get("/exams/:examId/submissions", async (req, res) => {
  try {
    const invigilatorId = req.user.id;
    const role = req.user.role;
    const { examId } = req.params;
    const { status } = req.query; 

    if (role !== "invigilator") {
      return res.status(403).json({ 
        message: "Access denied — invigilator only" 
      });
    }

    let submissionsQuery = `
      SELECT 
        submission_id,
        exam_id,
        student_name,
        answer,
        marks,
        evaluated_by,
        status
      FROM submissions
      WHERE exam_id = $1
    `;
    const params = [examId];

    if (status) {
      submissionsQuery += ` AND status = $2`;
      params.push(status);
    }

    submissionsQuery += ` ORDER BY 
      CASE WHEN status = 'pending' THEN 0 ELSE 1 END,
      submission_id ASC`;

    const submissions = (await pool.query(submissionsQuery, params)).rows;

    return res.json({
      success: true,
      examId,
      submissions
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load submissions",
      error: error.message
    });
  }
});


module.exports = router;