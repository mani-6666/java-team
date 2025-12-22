const pool = require("../config/db");

const validateRequest = (examId, questions) => {
  if (!examId || !Array.isArray(questions) || questions.length === 0) {
    throw new Error("Exam ID and questions required");
  }
};

const getAllowedTypes = async (examId) => {
  const result = await pool.query(
    "SELECT type FROM mainexamportal.exams WHERE exam_id = $1",
    [examId]
  );

  if (result.rowCount === 0) {
    throw new Error("Exam not found");
  }

  return result.rows[0].type.split(",").map(t => t.trim());
};

const validateQuestion = (question, allowedTypes) => {
  if (!question.type || !question.questionText) {
    throw new Error("Every question needs type & text");
  }

  if (!allowedTypes.includes(question.type)) {
    throw new Error(
      `Invalid question type '${question.type}', allowed: ${allowedTypes.join(", ")}`
    );
  }
};

const insertQuestion = async (examId, question, createdBy) => {
  const result = await pool.query(
    `INSERT INTO mainexamportal.questions
      (exam_id, question_text, question_type, marks, created_by)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING question_id`,
    [
      examId,
      question.questionText,
      question.type,
      question.marks || 1,
      createdBy
    ]
  );

  return result.rows[0].question_id;
};

const validateMCQ = (choices) => {
  if (!Array.isArray(choices) || choices.length < 2) {
    throw new Error("MCQ requires at least 2 choices");
  }

  const correctCount = choices.filter(c => c.isCorrect).length;
  if (correctCount === 0) {
    throw new Error("MCQ needs at least 1 correct option");
  }
};

const insertMCQOptions = async (questionId, choices, createdBy) => {
  for (const option of choices) {
    await pool.query(
      `INSERT INTO mainexamportal.mcq_questions
        (question_id, option_text, is_correct, created_by)
       VALUES ($1, $2, $3, $4)`,
      [questionId, option.text, option.isCorrect === true, createdBy]
    );
  }
};

const createQuestions = async (req, res) => {
  try {
    const { examId, questions } = req.body;
    const createdBy = req.user?.id || null;

    validateRequest(examId, questions);

    const allowedTypes = await getAllowedTypes(examId);

    await pool.query("BEGIN");

    const questionIds = [];

    for (const question of questions) {
      validateQuestion(question, allowedTypes);

      const questionId = await insertQuestion(
        examId,
        question,
        createdBy
      );

      questionIds.push(questionId);

      if (question.type === "MCQ") {
        validateMCQ(question.choices);
        await insertMCQOptions(
          questionId,
          question.choices,
          createdBy
        );
      }
    }

    await pool.query("COMMIT");

    return res.status(201).json({
      success: true,
      message: "Questions inserted successfully",
      questionIds
    });

  } catch (error) {
    await pool.query("ROLLBACK");

    const status =
      error.message === "Exam not found" ||
      error.message.includes("Invalid") ||
      error.message.includes("required")
        ? 400
        : 500;

    return res.status(status).json({ message: error.message });
  }
};

module.exports = createQuestions;
