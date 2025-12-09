const express = require('express');
const pool = require('../config/db.js');
const router = express.Router();

router.get("/submission/exams", async (req, res) => {
    try {
        const invigilatorId = req.user.id;
        const organizerId = req.user.organizationId;

        const query = `
        SELECT 
            e.exam_id,
            e.title AS exam_title,
            e.description AS exam_description,
            e.duration,
            e.total_questions,
            e.exam_type,
            e.status AS exam_status,

            -- total submissions
            COUNT(s.*)::int AS total,

            -- graded & pending
            COUNT(s.*) FILTER (WHERE s.status = 'graded')::int AS graded,
            COUNT(s.*) FILTER (WHERE s.status = 'pending')::int AS pending

        FROM exams e
        LEFT JOIN submissions s ON s.exam_id = e.exam_id
        WHERE e.assigned_to = $1
          AND e.organizer_id = $2
        GROUP BY e.exam_id
        ORDER BY e.exam_id DESC;
        `;

        const result = await pool.query(query, [invigilatorId, organizerId]);

        return res.json({
            success: true,
            exams: result.rows
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Failed to load exam list",
            error: err.message
        });
    }
});

module.exports = router;
