import pool from "../congig/db.js";

export const getInvigilatorDashboard = async (req, res) => {
  try {
    const invigilatorId = 1; 
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
    const allSubmissions = (await pool.query(submissionsQuery, [invigilatorId])).rows;

   
    const pendingSubmissions = allSubmissions.filter(s => s.status === "pending");
    const completedSubmissions = allSubmissions.filter(s => s.status === "completed");

 
    const submissionsByExam = {};
    allSubmissions.forEach(sub => {
      if (!submissionsByExam[sub.exam_id]) submissionsByExam[sub.exam_id] = [];
      submissionsByExam[sub.exam_id].push(sub);
    });

    return res.json({
      exams,
      submissionsByExam,
      pendingSubmissions,
      completedSubmissions
    });

  } catch (err) {
    console.error("Dashboard Error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};
