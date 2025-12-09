const express = require('express');
const pool = require('../config/db.js');
const router = express.Router();


//  GET PRIORITY QUEUE 
router.get("/priorityQueue", async (req, res) => {
    try {
        const invigilatorId = req.user.id;
        const organizerId = req.user.organizationId;

        const query = `
        SELECT
            s.submission_id,
            s.student_name,
            s.student_rollno,
            s.submitted_at,
            e.exam_type,
            COALESCE(s.total_marks, 0) AS marks,
            ROW_NUMBER() OVER (
                ORDER BY e.due_at ASC NULLS LAST, s.submitted_at ASC
            ) AS priority
        FROM submissions s
        JOIN exams e ON e.exam_id = s.exam_id
        WHERE e.assigned_to = $1
        AND e.organizer_id = $2
        AND s.status = 'pending'
        ORDER BY priority ASC;
        `;

        const result = await pool.query(query, [invigilatorId, organizerId]);

        return res.json({
            success: true,
            priority_queue: result.rows
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Failed to load grading queue",
            error: err.message
        });
    }
});


//  GET QUESTIONS + ANSWERS 
router.get("/priorityQueue/:submission_id/questions", async (req, res) => {
    try {
        const submissionId = req.params.submission_id;

        const query = `
        SELECT 
            question_id,
            question_text,
            answer_text,
            COALESCE(marks, 0) AS marks
        FROM submission_answers 
        WHERE submission_id = $1
        ORDER BY question_id ASC;
        `;

        const result = await pool.query(query, [submissionId]);

        return res.json({
            success: true,
            questions: result.rows
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Failed to load questions",
            error: err.message
        });
    }
});


//  UPDATE MARK FOR EACH QUESTION 
router.put("/priorityQueue/:submission_id/update-mark", async (req, res) => {
    try {
        const submissionId = req.params.submission_id;
        const { question_id, marks } = req.body;

        const query = `
        UPDATE submission_answers
        SET marks = $1
        WHERE submission_id = $2 AND question_id = $3
        RETURNING submission_id, question_id, marks;
        `;

        const result = await pool.query(query, [marks, submissionId, question_id]);

        return res.json({
            success: true,
            updated: result.rows[0]
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Failed to update marks",
            error: err.message
        });
    }
});


// SUBMIT TOTAL MARKS 
router.put("/priorityQueue/:submission_id/submit", async (req, res) => {
    try {
        const submissionId = req.params.submission_id;
        const invigilatorId = req.user.id;
        const { total_marks } = req.body;

        const query = `
        UPDATE submissions
        SET
            total_marks = $1,
            status = 'graded',
            evaluated_by = $2,
            graded_at = NOW()
        WHERE submission_id = $3
        RETURNING submission_id, student_name, total_marks, status, graded_at;
        `;

        const result = await pool.query(query, [total_marks, invigilatorId, submissionId]);

        return res.json({
            success: true,
            message: "Grading completed successfully!",
            submission: result.rows[0]
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Failed to submit total marks",
            error: err.message
        });
    }
});


module.exports = router;
