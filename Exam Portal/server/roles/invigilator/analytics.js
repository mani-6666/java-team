const express = require("express");
const pool = require("../config/db");
const router = express.Router();


// GRADING SUMMARY
router.get("/summary", async (req, res) => {
  try {
    const invigilatorId = req.user.id;
    const organizerId = req.user.organizationId;

    const query = `
      SELECT
        COUNT(*) FILTER (WHERE s.status='graded')::int AS total_graded,
        COUNT(*) FILTER (WHERE s.status='pending')::int AS pending,
        COUNT(DISTINCT e.exam_id)::int AS total_exams,
        COALESCE(
            AVG(EXTRACT(EPOCH FROM (s.graded_at - s.submitted_at)) / 60),
        0)::int AS avg_time
      FROM submissions s
      JOIN exams e ON e.exam_id = s.exam_id
      WHERE e.assigned_to=$1 AND e.organizer_id=$2
    `;

    const { rows } = await pool.query(query, [invigilatorId, organizerId]);
    return res.json({ success: true, grading_summary: rows[0] });
      } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
//  GRADING BREAKDOWN
router.get("/breakdown", async (req, res) => {
  try {
    const invigilatorId = req.user.id;
    const organizerId = req.user.organizationId;

    const query = `
      WITH 
      coding AS (
        SELECT COUNT(*) AS cnt 
        FROM exams 
        WHERE exam_type ILIKE 'Coding'
        AND assigned_to=$1 AND organizer_id=$2
      ),
      descriptive AS (
        SELECT COUNT(*) AS cnt 
        FROM exams 
        WHERE exam_type ILIKE 'Descriptive'
        AND assigned_to=$1 AND organizer_id=$2
      ),
      mixed AS (
        SELECT COUNT(*) AS cnt 
        FROM exams 
        WHERE exam_type ILIKE 'Mixed'
        AND assigned_to=$1 AND organizer_id=$2
      ),

      scores AS (
        SELECT MIN(s.total_marks) AS lowest 
        FROM submissions s
        JOIN exams e ON e.exam_id=s.exam_id
        WHERE s.status='graded' 
        AND e.assigned_to=$1 AND e.organizer_id=$2
      ),

      this_week AS (
        SELECT COALESCE(AVG(s.total_marks),0) AS avg_mark
        FROM submissions s 
        JOIN exams e ON e.exam_id=s.exam_id
        WHERE s.status='graded'
        AND s.graded_at >= NOW() - INTERVAL '7 days'
        AND e.assigned_to=$1 AND e.organizer_id=$2
      ),

      prev_week AS (
        SELECT COALESCE(AVG(s.total_marks),0) AS avg_mark
        FROM submissions s 
        JOIN exams e ON e.exam_id=s.exam_id
        WHERE s.status='graded'
        AND s.graded_at BETWEEN NOW() - INTERVAL '14 days' 
            AND NOW() - INTERVAL '7 days'
        AND e.assigned_to=$1 AND e.organizer_id=$2
      )

      SELECT 
        (SELECT cnt FROM coding)::int AS coding_exams,
        (SELECT cnt FROM descriptive)::int AS descriptive_exams,
        (SELECT cnt FROM mixed)::int AS mixed_exams,

        (SELECT cnt FROM coding) + 
        (SELECT cnt FROM descriptive) + 
        (SELECT cnt FROM mixed) AS total_exams,

        COALESCE((SELECT lowest FROM scores), 0)::int AS lowest_score,

        CASE 
          WHEN (SELECT avg_mark FROM prev_week) = 0 THEN 0
          ELSE ROUND(
            (
              (SELECT avg_mark FROM this_week) - 
              (SELECT avg_mark FROM prev_week)
            ) / (SELECT avg_mark FROM prev_week) * 100
          )::int
        END AS improvement
    `;

    const { rows } = await pool.query(query, [invigilatorId, organizerId]);
    return res.json({ success: true, grading_breakdown: rows[0] });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});


 // GRADE ACTIVITY (Today, Week, Month, Year)
router.get("/activity", async (req, res) => {
  try {
    const invigilatorId = req.user.id;
    const organizerId = req.user.organizationId;

    const query = `
      SELECT
        COUNT(*) FILTER (WHERE s.status='graded' AND s.graded_at::date = CURRENT_DATE)::int AS today,
        COUNT(*) FILTER (WHERE s.status='graded' AND s.graded_at >= NOW() - INTERVAL '7 days')::int AS week,
        COUNT(*) FILTER (WHERE s.status='graded' AND DATE_TRUNC('month', s.graded_at) = DATE_TRUNC('month', CURRENT_DATE))::int AS month,
        COUNT(*) FILTER (WHERE s.status='graded' AND DATE_TRUNC('year', s.graded_at) = DATE_TRUNC('year', CURRENT_DATE))::int AS year
      FROM submissions s
      JOIN exams e ON e.exam_id = s.exam_id
      WHERE e.assigned_to=$1 AND e.organizer_id=$2
    `;

    const { rows } = await pool.query(query, [invigilatorId, organizerId]);
    return res.json({ success: true, grade_activity: rows[0] });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// MONTHLY ATTEMPTS
router.get("/attempts/monthly", async (req, res) => {
  try {
    const invigilatorId = req.user.id;
    const organizerId = req.user.organizationId;

    const query = `
      SELECT
        TO_CHAR(s.submitted_at, 'YYYY Mon') AS month,
        COUNT(*)::int AS attempts
      FROM submissions s
      JOIN exams e ON e.exam_id = s.exam_id
      WHERE e.assigned_to=$1 AND e.organizer_id=$2
      GROUP BY month
      ORDER BY MIN(s.submitted_at)
    `;

    const { rows } = await pool.query(query, [invigilatorId, organizerId]);
    return res.json({ success: true, monthly_attempts: rows });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});


// ATTEMPTS BY EXAM TYPE
router.get("/attempts/exam-types", async (req, res) => {
  try {
    const invigilatorId = req.user.id;
    const organizerId = req.user.organizationId;

    const query = `
      SELECT 
        e.exam_type,
        COUNT(s.submission_id)::int AS attempts
      FROM exams e
      LEFT JOIN submissions s ON s.exam_id = e.exam_id
      WHERE e.assigned_to=$1 AND e.organizer_id=$2
      GROUP BY e.exam_type
      ORDER BY exam_type ASC
    `;

    const { rows } = await pool.query(query, [invigilatorId, organizerId]);
    return res.json({ success: true, exam_type_attempts: rows });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});


module.exports = router;
