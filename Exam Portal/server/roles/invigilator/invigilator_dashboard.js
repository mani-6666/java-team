const pool=require("../../config/db.js")

const invigilatorDashboardRoutes = async (req, res) => {
  try {
    const invigilatorId = req.user.id; 
    const role = req.user.role;

    if (role !== "invigilator") {
      return res.status(403).json({ 
        message: "Access denied — invigilator only" 
      });
    }
   
    const examsQuery = `
      SELECT exam_id, title
      FROM exams
      WHERE assigned_to = $1
    `;
    const exams = (await pool.query(examsQuery, [invigilatorId])).rows;
    
    const submissionsQuery = `
      SELECT submission_id, exam_id, student_name, answer, marks, evaluated_by, status
      FROM submissions
      WHERE exam_id IN (
        SELECT exam_id FROM exams WHERE assigned_to = $1
      )
      ORDER BY submission_id ASC
    `;
    let submissions = (await pool.query(submissionsQuery, [invigilatorId])).rows;

   
      if (req.query.evaluatedBy) {
      submissions = submissions.filter(
        (s) => String(s.evaluated_by) === String(req.query.evaluatedBy)
      );
    }

    const submissionsByExam = {};
    submissions.forEach(sub => {
      if (!submissionsByExam[sub.exam_id]) {
        submissionsByExam[sub.exam_id] = [];
      }
      submissionsByExam[sub.exam_id].push(sub);
    });

     return res.json({
      exams,
      submissionsByExam,
      submissions
    });

  } catch (err) {
    console.error("Dashboard Error:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};
module.exports={invigilatorDashboardRoutes};
