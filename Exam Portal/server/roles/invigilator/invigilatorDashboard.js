const express = require("express");
const pool = require("../config/db");
const router = express.Router();


// DASHBOARD SUMMARY
router.get("/summary", async (req, res) => {
  try {
    const invigilatorId = req.user.id;       
    const organizerId = req.user.organizationId;

    // Pending Review
    const pending = await pool.query(`
      SELECT COUNT(*)::int AS pending
      FROM submissions s
      JOIN exams e ON e.exam_id = s.exam_id
      WHERE s.status='pending'
      AND e.assigned_to=$1 AND e.organizer_id=$2
    `, [invigilatorId, organizerId]);

    // Graded
    const graded = await pool.query(`
      SELECT COUNT(*)::int AS graded
      FROM submissions s
      JOIN exams e ON e.exam_id=s.exam_id
      WHERE s.status='graded'
      AND e.assigned_to=$1 AND e.organizer_id=$2
    `, [invigilatorId, organizerId]);

    // Total Submissions
    const total = await pool.query(`
      SELECT COUNT(*)::int AS total
      FROM submissions s
      JOIN exams e ON e.exam_id=s.exam_id
      WHERE e.assigned_to=$1 AND e.organizer_id=$2
    `, [invigilatorId, organizerId]);

    // Exams created by invigilator
    const examsCreated = await pool.query(`
      SELECT COUNT(*)::int AS exams_created
      FROM exams
      WHERE assigned_to=$1 AND organizer_id=$2
    `, [invigilatorId, organizerId]);

    return res.json({
      success: true,
      summary: {
        pending_review: pending.rows[0].pending,
        graded: graded.rows[0].graded,
        total_submissions: total.rows[0].total,
        exams_created: examsCreated.rows[0].exams_created
      }
    });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});


//RECENT SUBMISSIONS
router.get("/recent", async (req, res) => {
  try {
    const invigilatorId = req.user.id;
    const organizerId = req.user.organizationId;

    const recent = await pool.query(`
      SELECT 
        s.submission_id,
        s.student_name,
        e.title AS exam_title,
        s.submitted_at,
        s.status
      FROM submissions s
      JOIN exams e ON e.exam_id=s.exam_id
      WHERE e.assigned_to=$1 AND e.organizer_id=$2
      ORDER BY s.submitted_at DESC
      LIMIT 5
    `, [invigilatorId, organizerId]);

    return res.json({ success: true, recent_submissions: recent.rows });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});


//  GRADING PROGRESS
router.get("/progress", async (req, res) => {
  try {
    const invigilatorId = req.user.id;
    const organizerId = req.user.organizationId;

    const progress = await pool.query(`
      SELECT
        e.exam_id,
        e.title AS exam_title,
        COUNT(s.submission_id)::int AS total,
        COUNT(s.submission_id) FILTER (WHERE s.status='graded')::int AS graded
      FROM exams e
      LEFT JOIN submissions s ON s.exam_id = e.exam_id
      WHERE e.assigned_to=$1 AND e.organizer_id=$2
      GROUP BY e.exam_id
      ORDER BY e.exam_id
    `, [invigilatorId, organizerId]);

    const formatted = progress.rows.map(item => ({
      ...item,
      completion: item.total === 0 
        ? 0 
        : Math.round(((item.graded || 0) / item.total) * 100)   // FIXED
    }));

    return res.json({ success: true, grading_progress: formatted });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});


// GRADING ACTIVITY 
router.get("/activity", async (req, res) => {
  try {
    const invigilatorId = req.user.id;
    const organizerId = req.user.organizationId;

    const activity = await pool.query(`
      SELECT 
        s.student_name,
        e.title AS exam_title,
        s.total_marks AS marks,    -- FIXED
        s.graded_at
      FROM submissions s
      JOIN exams e ON e.exam_id=s.exam_id
      WHERE s.status='graded'
      AND e.assigned_to=$1 AND e.organizer_id=$2
      ORDER BY s.graded_at DESC
      LIMIT 5
    `, [invigilatorId, organizerId]);

    return res.json({ success: true, grading_activity: activity.rows });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
