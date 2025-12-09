const pool = require("../config/db");

const createQuestions = async (req, res) => {

  try {
    const { examId, questions } = req.body;

    if (!examId || !questions || questions.length === 0) {
      return res.status(400).json({ message: "Exam ID and questions required" });
    }

    // CHECK EXAM EXISTS
    const examResult = await pool.query(
      "SELECT type FROM mainexamportal.exams WHERE exam_id = $1",
      [examId]
    );

    if (examResult.rowCount === 0) {
      return res.status(404).json({ message: "Exam not found" });
    }

    const allowedTypes = examResult.rows[0].type
      .split(",")
      .map(t => t.trim());

    await pool.query("BEGIN");

    const createdBy = req.user?.id || null;

    const insertedQuestions = [];

    for (let q of questions) {
      // BASIC VALIDATION
      if (!q.type || !q.questionText) {
        return res.status(400).json({ message: "Every question needs type & text" });
      }

      const qType = q.type;
      if (!allowedTypes.includes(qType)) {
        return res.status(400).json({
          message: `Invalid question type '${qType}', allowed: ${allowedTypes.join(", ")}`
        });
      }

      // INSERT INTO questions TABLE
      const questionInsert = await pool.query(
        `INSERT INTO mainexamportal.questions
          (exam_id, question_text, question_type, marks, created_by)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING question_id`,
        [examId, q.questionText, qType, q.marks || 1, createdBy]
      );

      const questionId = questionInsert.rows[0].question_id;
      insertedQuestions.push(questionId);

      // IF MCQ → INSERT OPTIONS
      if (qType === "MCQ") {
        if (!q.choices || q.choices.length < 2) {
          return res.status(400).json({ message: "MCQ requires at least 2 choices" });
        }

        const correct = q.choices.filter(c => c.isCorrect).length;
        if (correct === 0) {
          return res.status(400).json({ message: "MCQ needs at least 1 correct option" });
        }

        for (let opt of q.choices) {
          await pool.query(
            `INSERT INTO mainexamportal.mcq_questions
              (question_id, option_text, is_correct, created_by)
             VALUES ($1, $2, $3, $4)`,
            [questionId, opt.text, opt.isCorrect === true, createdBy]
          );
        }
      }
    }

    await pool.query("COMMIT");

    res.status(201).json({
      success: true,
      message: "Questions inserted successfully",
      questionIds: insertedQuestions
    });

  } catch (error) {
    await pool.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ error: error.message });
  } 
};

module.exports = createQuestions;
