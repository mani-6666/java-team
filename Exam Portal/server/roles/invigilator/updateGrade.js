const express = require("express");
const pool = require("../config/db.js");
const router = express.Router();

router.get("/priorityQueue", async (req, res) => {
  try {
    const invigilatorId = req.user.id;
    const org_Id = req.user.organizationId;

    const query = `
      SELECT 
         ea.attempt_id,
         ud.name AS student_name,
         u.user_id AS student_roll,
         e.title AS exam_title,
         e.type AS exam_type,
         ea.started_at AS submitted_at,
         ea.score AS marks
      FROM mainexamportal.exam_attempt ea
      JOIN mainexamportal.users u ON u.user_id=ea.user_id
      JOIN mainexamportal.user_details ud ON ud.user_id=u.user_id
      JOIN mainexamportal.exams e ON e.exam_id=ea.exam_id
      WHERE e.invigilator_id=$1
        AND e.org_id=$2
        AND u.is_deleted=false
        AND ud.is_deleted=false
      ORDER BY ea.started_at ASC;
    `;

    const result = await pool.query(query, [invigilatorId, org_Id]);

    return res.json({
      success: true,
      priority_queue: result.rows,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to load grading queue",
      error: err.message,
    });
  }
});


router.get("/priorityQueue/:attempt_id/questions", async (req, res) => {
  try {
    const attemptId = req.params.attempt_id;

    const query = `
      SELECT 
          q.question_id,
          q.question_text,
          ans.answer_text,
          COALESCE(ans.marks_awarded, 0) AS marks
      FROM questions q
      LEFT JOIN attempt_answers ans 
             ON ans.question_id = q.question_id 
            AND ans.attempt_id = $1
      WHERE q.exam_id = (
          SELECT exam_id FROM exam_attempt WHERE attempt_id = $1
      )
      ORDER BY q.question_id ASC;
    `;

    const result = await pool.query(query, [attemptId]);

    return res.json({
      success: true,
      questions: result.rows,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to load questions",
      error: err.message,
    });
  }
});


router.put("/priorityQueue/:attempt_id/update-mark", async (req, res) => {
  try {
    const attemptId = req.params.attempt_id;
    const { question_id, marks } = req.body;

    const query = `
      UPDATE attempt_answers
      SET marks_awarded = $1
      WHERE attempt_id = $2 AND question_id = $3
      RETURNING attempt_id, question_id, marks_awarded;
    `;

    const result = await pool.query(query, [marks, attemptId, question_id]);

    return res.json({
      success: true,
      updated: result.rows[0],
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to update marks",
      error: err.message,
    });
  }
});


router.put("/priorityQueue/:attempt_id/submit", async (req, res) => {
  try {
    const attemptId = req.params.attempt_id;
    const invigilatorId = req.user.id;
    const { total_marks } = req.body;

    const query = `
      UPDATE exam_attempt
      SET 
          graded_marks = $1,
          status = 'graded',
          graded_by = $2,
          graded_at = NOW()
      WHERE attempt_id = $3
      RETURNING attempt_id, graded_marks, status, graded_at;
    `;

    const result = await pool.query(query, [
      total_marks,
      invigilatorId,
      attemptId,
    ]);

    return res.json({
      success: true,
      message: "Grading completed successfully!",
      submission: result.rows[0],
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to submit total marks",
      error: err.message,
    });
  }
});
module.exports = router;
