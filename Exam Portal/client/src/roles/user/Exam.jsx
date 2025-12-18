import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { GraduationCap, Flag } from "lucide-react";

const API_BASE = "http://localhost:5000/api/user";

export default function ExamPage() {
  const navigate = useNavigate();
  const { examId } = useParams();

  const [questions, setQuestions] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [marked, setMarked] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const startExam = async () => {
      try {
        const res = await axios.post(
          `${API_BASE}/start-exam`,
          { examId },
          { withCredentials: true }
        );

        if (res.data?.exam?.durationMin) {
          setTimeLeft(res.data.exam.durationMin * 60);
        }

        if (Array.isArray(res.data?.questions)) {
          setQuestions(res.data.questions);
          setAnswers(new Array(res.data.questions.length).fill(null));
          setMarked(new Array(res.data.questions.length).fill(false));
        }
      } catch (err) {
        alert(err.response?.data?.message || "Failed to start exam");
        navigate("/exams");
      }
    };

    startExam();
  }, [examId, navigate]);

  useEffect(() => {
    if (!timeLeft || submitted) return;

    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, submitted]);

  const formatTime = useMemo(() => {
    const m = String(Math.floor(timeLeft / 60)).padStart(2, "0");
    const s = String(timeLeft % 60).padStart(2, "0");
    return `00:${m}:${s}`;
  }, [timeLeft]);

  const handleSubmit = async () => {
    try {
      await axios.post(
        `${API_BASE}/submit-exam`,
        {
          examId,
          answers: answers.map((a, i) => ({
            questionId: questions[i]?.questionId,
            answer: a,
          })),
        },
        { withCredentials: true }
      );

      setSubmitted(true);
      setTimeout(() => navigate("/exams"), 2000);
    } catch (err) {
      alert(err.response?.data?.message || "Submit failed");
    }
  };

  const chooseOption = (optionId) => {
    const copy = [...answers];
    copy[index] = optionId;
    setAnswers(copy);

    const markCopy = [...marked];
    markCopy[index] = false;
    setMarked(markCopy);
  };

  const toggleMark = () => {
    const copy = [...marked];
    copy[index] = !copy[index];
    setMarked(copy);
  };

  const currentQ = questions[index];

  return (
    <div className="min-h-screen bg-[#F5F7FB]">
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <GraduationCap size={22} className="text-indigo-600" />
          <span className="text-lg font-semibold text-indigo-600">
            ExamMarkPro
          </span>
        </div>

        <h2 className="font-semibold text-gray-900">Exam</h2>

        <div className="px-4 py-2 rounded-lg bg-indigo-50 text-indigo-700 font-semibold text-sm">
          {formatTime}
        </div>
      </header>

      {submitted && (
        <div className="flex justify-center mt-4">
          <div className="max-w-4xl w-full bg-white border border-green-500 rounded-lg px-4 py-3 text-center text-green-700 text-sm shadow-sm">
            Your exam has been submitted successfully. Redirecting…
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-6">
        {questions.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center text-gray-500">
            Questions will appear once backend provides question API
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl shadow p-8">
              <p className="text-xs font-semibold text-gray-500 mb-2">
                QUESTION {index + 1} OF {questions.length}
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                {currentQ.questionText}
              </h3>

              <div className="space-y-4">
                {currentQ.options.map((op) => (
                  <label
                    key={op.optionId}
                    className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer ${
                      answers[index] === op.optionId
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-gray-200"
                    }`}
                  >
                    <input
                      type="radio"
                      checked={answers[index] === op.optionId}
                      onChange={() => chooseOption(op.optionId)}
                    />
                    <span>{op.optionText}</span>
                  </label>
                ))}
              </div>

              <div className="flex justify-between mt-8">
                <div className="flex gap-3">
                  <button
                    disabled={index === 0}
                    onClick={() => setIndex((p) => p - 1)}
                    className="px-5 py-2 border rounded-lg"
                  >
                    Previous
                  </button>

                  <button
                    onClick={toggleMark}
                    className="flex items-center gap-2 px-4 py-2 border rounded-lg"
                  >
                    <Flag size={16} /> Mark
                  </button>
                </div>

                <button
                  disabled={index === questions.length - 1}
                  onClick={() => setIndex((p) => p + 1)}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg"
                >
                  Next
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow p-6">
              <button
                onClick={handleSubmit}
                className="w-full py-3 border border-green-600 text-green-700 rounded-lg font-semibold"
              >
                Submit Exam
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
