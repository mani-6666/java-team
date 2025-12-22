import React, { useEffect, useState } from "react";
import axios from "axios";
import { FileText } from "lucide-react";

const GradingQueue = () => {
  const [step, setStep] = useState("queue");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [queue, setQueue] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [marks, setMarks] = useState({});
  const [totalMarks, setTotalMarks] = useState(0);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      const res = await axios.get("/api/priorityQueue", { withCredentials: true });
      setQueue(res.data.priority_queue || []);
    } catch (err) {
      setQueue([]);
    }
  };

  const loadQuestions = async (submission_id) => {
    try {
      const res = await axios.get(
        `/api/priorityQueue/${submission_id}/questions`,
        { withCredentials: true }
      );

      const qList = res.data.question || [];
      setQuestions(qList);

      const initialMarks = {};
      qList.forEach((q) => {
        initialMarks[q.question_id] = q.marks;
      });
      setMarks(initialMarks);
    } catch (err) {
      setQuestions([]);
    }
  };

  const handleGradeNow = (item) => {
    setSelectedStudent(item);
    loadQuestions(item.submission_id);
    setStep("questions");
  };

  const updateQuestionMark = async (question_id, value) => {
    setMarks({ ...marks, [question_id]: value });

    try {
      await axios.put(
        `/api/priorityQueue/${selectedStudent.submission_id}/update-mark`,
        { question_id, marks: value },
        { withCredentials: true }
      );
    } catch (err) {}
  };

  const goToFinalSubmit = () => {
    const total = Object.values(marks).reduce(
      (sum, m) => sum + Number(m || 0),
      0
    );
    setTotalMarks(total);
    setStep("marks");
  };

  const submitFinalMarks = async () => {
    try {
      await axios.put(
        `/api/priorityQueue/${selectedStudent.submission_id}/submit`,
        { total_marks: totalMarks },
        { withCredentials: true }
      );

      setStep("queue");
      setSelectedStudent(null);
      fetchQueue();
    } catch (err) {}
  };

  return (
    <>
    
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Grading Queue
      </h1>
      <p className="text-gray-500 dark:text-gray-300 mb-10">
        Prioritized list of submissions to grade
      </p>

    
      {step === "queue" && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#141414] border border-gray-300 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Priority Queue
          </h2>

          {(queue || []).map((item) => (
            <div
              key={item.submission_id}
              className="
                flex items-center justify-between
                p-4 mb-4
                rounded-xl
                bg-white dark:bg-[#222222]
                border border-gray-300 dark:border-gray-700
              "
            >
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {item.student_name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {item.student_rollno}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Submitted: {new Date(item.submitted_at).toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => handleGradeNow(item)}
                className="
                  flex items-center gap-2
                  px-6 py-2.5
                  rounded-lg
                  bg-blue-600 hover:bg-blue-700
                  text-white font-medium
                "
              >
                <FileText size={16} />
                Grade Now
              </button>
            </div>
          ))}
        </div>
      )}

      {step === "questions" && (
        <div className="max-w-3xl mx-auto p-6 rounded-2xl bg-white dark:bg-[#141414] border border-gray-300 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Questions
          </h2>

          {(questions || []).map((q) => (
            <div key={q.question_id} className="mb-6">
              <p className="font-medium text-gray-900 dark:text-gray-200 mb-2">
                Q{q.question_id}. {q.question_text}
              </p>

              <input
                type="number"
                value={marks[q.question_id] || ""}
                onChange={(e) =>
                  updateQuestionMark(q.question_id, e.target.value)
                }
                className="
                  w-24 px-3 py-2
                  rounded-lg text-center
                  border border-gray-300 dark:border-gray-700
                  dark:bg-[#222222] dark:text-white
                "
              />
            </div>
          ))}

          <div className="flex justify-between mt-8">
            <button
              onClick={() => setStep("queue")}
              className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:text-white"
            >
              Back
            </button>

            <button
              onClick={goToFinalSubmit}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white"
            >
              Next
            </button>
          </div>
        </div>
      )}


      {step === "marks" && (
        <div className="max-w-2xl mx-auto p-8 rounded-2xl bg-white dark:bg-[#141414] border border-gray-300 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
            {selectedStudent?.student_name}
          </h2>

          <p className="text-center text-xl text-gray-700 dark:text-gray-200 mb-8">
            Total Marks: <span className="font-bold">{totalMarks}</span>
          </p>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => setStep("questions")}
              className="px-8 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:text-white"
            >
              Back
            </button>

            <button
              onClick={submitFinalMarks}
              className="px-10 py-2 rounded-lg bg-blue-600 text-white"
            >
              Submit
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default GradingQueue;