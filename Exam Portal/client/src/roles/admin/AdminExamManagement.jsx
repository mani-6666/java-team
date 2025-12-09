
import React, { useState } from "react";
import AdminLayout from "../adminComponents/AdminLayout";
import { Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

const API = "http://localhost:5000/admin/questions";

export default function AdminExamManagement() {
  const [examId, setExamId] = useState("");
  const [mcqs, setMcqs] = useState([
    {
      id: Date.now(),
      question: "",
      choices: [
        { id: 1, text: "", isCorrect: false },
        { id: 2, text: "", isCorrect: false },
      ],
    },
  ]);

  const [codingQuestions, setCodingQuestions] = useState([
    { id: Date.now() + 1, question: "" },
  ]);

  const [descriptiveQuestions, setDescriptiveQuestions] = useState([
    { id: Date.now() + 2, question: "" },
  ]);

  const [savedData, setSavedData] = useState({
    mcqs: [],
    coding: [],
    descriptive: [],
  });


  const addMcq = () => {
    setMcqs((prev) => [
      {
        id: Date.now(),
        question: "",
        choices: [
          { id: 1, text: "", isCorrect: false },
          { id: 2, text: "", isCorrect: false },
        ],
      },
      ...prev,
    ]);
    toast.success("New MCQ added");
  };

  const deleteMcq = (id) => {
    setMcqs((prev) => prev.filter((q) => q.id !== id));
    toast.error("MCQ deleted");
  };

  const updateMcqQuestion = (id, value) => {
    setMcqs((prev) =>
      prev.map((q) => (q.id === id ? { ...q, question: value } : q))
    );
  };

  const updateChoiceText = (mcqId, choiceIdx, value) => {
    setMcqs((prev) =>
      prev.map((mcq) => {
        if (mcq.id !== mcqId) return mcq;
        const choices = mcq.choices.map((c, idx) =>
          idx === choiceIdx ? { ...c, text: value } : c
        );
        return { ...mcq, choices };
      })
    );
  };

  const addChoice = (mcqId) => {
    setMcqs((prev) =>
      prev.map((mcq) => {
        if (mcq.id !== mcqId) return mcq;
        const nextId = mcq.choices.length
          ? Math.max(...mcq.choices.map((c) => c.id)) + 1
          : 1;
        return {
          ...mcq,
          choices: [...mcq.choices, { id: nextId, text: "", isCorrect: false }],
        };
      })
    );
    toast.success("Choice added");
  };

  const removeChoice = (mcqId, choiceIdx) => {
    setMcqs((prev) =>
      prev.map((mcq) => {
        if (mcq.id !== mcqId) return mcq;
        const choices = mcq.choices.filter((_, idx) => idx !== choiceIdx);
        return { ...mcq, choices };
      })
    );
    toast.success("Choice removed");
  };

  const markCorrect = (mcqId, choiceIdx) => {
    setMcqs((prev) =>
      prev.map((mcq) => {
        if (mcq.id !== mcqId) return mcq;
        const choices = mcq.choices.map((c, idx) => ({
          ...c,
          isCorrect: idx === choiceIdx,
        }));
        return { ...mcq, choices };
      })
    );
  };

  const saveMcqToBuffer = (id) => {
    const mcq = mcqs.find((m) => m.id === id);
    if (!mcq || !mcq.question.trim()) {
      toast.error("Enter question text");
      return;
    }
    if (!mcq.choices || mcq.choices.length < 2) {
      toast.error("Add at least 2 choices");
      return;
    }
    const hasCorrect = mcq.choices.some((c) => c.isCorrect);
    if (!hasCorrect) {
      toast.error("Mark one correct choice");
      return;
    }

    setSavedData((prev) => ({ ...prev, mcqs: [mcq, ...prev.mcqs] }));
    toast.success("MCQ saved");
  };

  // =================== CODING =====================
  const addCodingQuestion = () => {
    setCodingQuestions((prev) => [
      { id: Date.now(), question: "" },
      ...prev,
    ]);
    toast.success("Coding question added");
  };

  const updateCodingQuestion = (id, value) => {
    setCodingQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, question: value } : q))
    );
  };

  const deleteCoding = (id) => {
    setCodingQuestions((prev) => prev.filter((q) => q.id !== id));
    toast.error("Coding question deleted");
  };

  const saveCoding = (id) => {
    const q = codingQuestions.find((c) => c.id === id);
    if (!q || !q.question.trim()) {
      toast.error("Enter coding question");
      return;
    }
    setSavedData((prev) => ({ ...prev, coding: [q, ...prev.coding] }));
    toast.success("Coding saved");
  };

  // ================= DESCRIPTIVE ====================
  const addDescriptive = () => {
    setDescriptiveQuestions((prev) => [
      { id: Date.now(), question: "" },
      ...prev,
    ]);
    toast.success("Descriptive question added");
  };

  const updateDescriptive = (id, value) => {
    setDescriptiveQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, question: value } : q))
    );
  };

  const deleteDescriptive = (id) => {
    setDescriptiveQuestions((prev) => prev.filter((q) => q.id !== id));
    toast.error("Descriptive question deleted");
  };

  const saveDescriptive = (id) => {
    const q = descriptiveQuestions.find((d) => d.id === id);
    if (!q || !q.question.trim()) {
      toast.error("Enter descriptive question");
      return;
    }
    setSavedData((prev) => ({
      ...prev,
      descriptive: [q, ...prev.descriptive],
    }));
    toast.success("Descriptive saved");
  };

  // ================= SUBMIT ALL =====================
  const handleSubmit = async () => {
    if (!examId) {
      toast.error("Enter Exam ID");
      return;
    }

    const payload = [];

    savedData.mcqs.forEach((m) => {
      payload.push({
        type: "mcq",
        questionText: m.question,
        choices: m.choices.map((c) => ({
          text: c.text,
          isCorrect: c.isCorrect,
        })),
      });
    });

    savedData.coding.forEach((c) => {
      payload.push({
        type: "coding",
        questionText: c.question,
      });
    });

    savedData.descriptive.forEach((d) => {
      payload.push({
        type: "descriptive",
        questionText: d.question,
      });
    });

    if (payload.length === 0) {
      toast.error("No saved questions");
      return;
    }

    try {
      const res = await axios.post(API, {
        examId: Number(examId),
        questions: payload,
      });
      toast.success(`${res.data.count} questions submitted`);
      setSavedData({ mcqs: [], coding: [], descriptive: [] });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Upload failed");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 p-4 min-h-screen bg-white text-black dark:bg-gray-900 dark:text-white">

        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-[#4f6df5] text-white rounded-md"
          >
            Submit All Saved
          </button>
        </div>

        {/* ================= MCQs ================= */}
        <section className="space-y-4">
          <div className="flex justify-between">
            <h2 className="text-lg font-semibold">MCQ Questions</h2>
            <button
              onClick={addMcq}
              className="px-3 py-2 bg-[#4f6df5] text-white rounded-md flex items-center gap-2"
            >
              <Plus size={16} /> Add MCQ
            </button>
          </div>

          {mcqs.map((mcq) => (
            <div
              key={mcq.id}
              className="bg-white dark:bg-gray-800 text-black dark:text-white p-4 rounded-lg border border-gray-300 dark:border-gray-700 space-y-3"
            >
              <div className="flex justify-end">
                <button
                  onClick={() => deleteMcq(mcq.id)}
                  className="text-red-600 dark:text-red-400 p-2"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <textarea
                value={mcq.question}
                onChange={(e) =>
                  updateMcqQuestion(mcq.id, e.target.value)
                }
                placeholder="Enter MCQ Question..."
                className="w-full bg-white dark:bg-gray-700 text-black dark:text-white border border-gray-300 dark:border-gray-600 rounded-md p-2"
                rows={3}
              />

              <p className="font-medium">Choices</p>
              {mcq.choices.map((choice, idx) => (
                <div key={choice.id} className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={choice.isCorrect}
                    onChange={() => markCorrect(mcq.id, idx)}
                  />
                  <input
                    value={choice.text}
                    onChange={(e) =>
                      updateChoiceText(mcq.id, idx, e.target.value)
                    }
                    className="flex-1 bg-white dark:bg-gray-700 text-black dark:text-white border border-gray-300 dark:border-gray-600 rounded-md p-2"
                    placeholder="Choice"
                  />
                  <button
                    onClick={() => removeChoice(mcq.id, idx)}
                    className="text-red-600 dark:text-red-400 p-2"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}

              <button className="text-blue-600 dark:text-blue-400 text-sm" onClick={() => addChoice(mcq.id)}>
                + Add Option
              </button>

              <div className="flex justify-end">
                <button
                  onClick={() => saveMcqToBuffer(mcq.id)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                >
                  Save
                </button>
              </div>
            </div>
          ))}
        </section>

        {/* ================= CODING ================= */}
        <section className="space-y-4">
          <div className="flex justify-between">
            <h2 className="text-lg font-semibold">Coding Questions</h2>
            <button
              onClick={addCodingQuestion}
              className="px-3 py-2 bg-[#4f6df5] text-white rounded-md flex items-center gap-2"
            >
              <Plus size={16} /> Add Coding
            </button>
          </div>

          {codingQuestions.map((cq) => (
            <div
              key={cq.id}
              className="bg-white dark:bg-gray-800 text-black dark:text-white p-4 rounded-lg border border-gray-300 dark:border-gray-700 space-y-3"
            >
              <div className="flex justify-end">
                <button
                  onClick={() => deleteCoding(cq.id)}
                  className="text-red-600 dark:text-red-400 p-2"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <textarea
                value={cq.question}
                onChange={(e) =>
                  updateCodingQuestion(cq.id, e.target.value)
                }
                placeholder="Enter coding question..."
                className="w-full bg-white dark:bg-gray-700 text-black dark:text-white border border-gray-300 dark:border-gray-600 rounded-md p-2"
                rows={3}
              />

              <div className="flex justify-end">
                <button
                  onClick={() => saveCoding(cq.id)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                >
                  Save
                </button>
              </div>
            </div>
          ))}
        </section>

        {/* ================= DESCRIPTIVE ================= */}
        <section className="space-y-4">
          <div className="flex justify-between">
            <h2 className="text-lg font-semibold">Descriptive Questions</h2>
            <button
              onClick={addDescriptive}
              className="px-3 py-2 bg-[#4f6df5] text-white rounded-md flex items-center gap-2"
            >
              <Plus size={16} /> Add Descriptive
            </button>
          </div>

          {descriptiveQuestions.map((dq) => (
            <div
              key={dq.id}
              className="bg-white dark:bg-gray-800 text-black dark:text-white p-4 rounded-lg border border-gray-300 dark:border-gray-700 space-y-3"
            >
              <div className="flex justify-end">
                <button
                  onClick={() => deleteDescriptive(dq.id)}
                  className="text-red-600 dark:text-red-400 p-2"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <textarea
                value={dq.question}
                onChange={(e) =>
                  updateDescriptive(dq.id, e.target.value)
                }
                placeholder="Enter descriptive question..."
                className="w-full bg-white dark:bg-gray-700 text-black dark:text-white border border-gray-300 dark:border-gray-600 rounded-md p-2"
                rows={4}
              />

              <div className="flex justify-end">
                <button
                  onClick={() => saveDescriptive(dq.id)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                >
                  Save
                </button>
              </div>
            </div>
          ))}
        </section>
      </div>
    </AdminLayout>
  );
}
