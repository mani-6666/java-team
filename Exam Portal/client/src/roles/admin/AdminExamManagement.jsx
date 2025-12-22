import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import AdminLayout from "../adminComponents/AdminLayout";
const QUESTIONS_API = `${import.meta.env.VITE_API_BASE_URL}/admin/questions`;
export default function AdminExamManagement() {
  const [examInfo, setExamInfo] = useState({
    title: "",
    type: "Mixed",
    duration: "",
    totalQuestions: "",
  });

  const handleInfoChange = (field, value) => {
    setExamInfo((prev) => ({ ...prev, [field]: value }));
  };
  const [mcq, setMcq] = useState([
    { id: Date.now(), question: "", choices: ["", ""], type: "MCQ" },
  ]);

  const addMcq = () => {
    setMcq([{ id: Date.now(), question: "", choices: ["", ""], type: "MCQ" }, ...mcq]);
  };

  const deleteMcq = (id) => {
    setMcq(mcq.filter((m) => m.id !== id));
  };

  const updateMcqQuestion = (id, value) => {
    setMcq(mcq.map((m) => (m.id === id ? { ...m, question: value } : m)));
  };

  const updateChoice = (mcqId, index, value) => {
    setMcq(
      mcq.map((m) =>
        m.id === mcqId
          ? { ...m, choices: m.choices.map((c, i) => (i === index ? value : c)) }
          : m
      )
    );
  };

  const addChoice = (id) => {
    setMcq(mcq.map((m) => (m.id === id ? { ...m, choices: [...m.choices, ""] } : m)));
  };

  const removeChoice = (id, index) => {
    setMcq(mcq.map((m) =>
      m.id === id ? { ...m, choices: m.choices.filter((_, i) => i !== index) } : m
    ));
  };

  const [codingQuestions, setCodingQuestions] = useState([
    { id: Date.now() + 1, question: "" },
  ]);

  const addCoding = () => {
    setCodingQuestions([{ id: Date.now(), question: "" }, ...codingQuestions]);
  };

  const updateCoding = (id, value) => {
    setCodingQuestions(codingQuestions.map((c) =>
      c.id === id ? { ...c, question: value } : c
    ));
  };

  const deleteCoding = (id) => {
    setCodingQuestions(codingQuestions.filter((c) => c.id !== id));
  };

  const [descriptiveQuestions, setDescriptiveQuestions] = useState([
    { id: Date.now() + 2, question: "" },
  ]);

  const addDescriptive = () => {
    setDescriptiveQuestions([{ id: Date.now(), question: "" }, ...descriptiveQuestions]);
  };

  const updateDescriptive = (id, value) => {
    setDescriptiveQuestions(descriptiveQuestions.map((d) =>
      d.id === id ? { ...d, question: value } : d
    ));
  };

  const deleteDescriptive = (id) => {
    setDescriptiveQuestions(descriptiveQuestions.filter((d) => d.id !== id));
  };

  const submitExamQuestions = async () => {
    const examId = Number(new URLSearchParams(window.location.search).get("id"));
    if (!examId) return alert("Exam ID missing");

    const questions = [];

    mcq.forEach((m) =>
      questions.push({
        type: "MCQ",
        questionText: m.question,
        marks: 1,
        choices: m.choices.map((c) => ({ text: c, isCorrect: false })),
      })
    );

    codingQuestions.forEach((c) =>
      questions.push({ type: "Coding", questionText: c.question, marks: 1 })
    );

    descriptiveQuestions.forEach((d) =>
      questions.push({ type: "Descriptive", questionText: d.question, marks: 1 })
    );

    try {
      const res = await fetch(QUESTIONS_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ examId, questions }),
      });

      const data = await res.json();
      if (!res.ok) return alert(data.message || "Failed");
      alert("Questions saved successfully ✅");
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <AdminLayout>
      <div className="px-1 dark:text-white">
        <h1 className="text-2xl sm:text-3xl font-semibold mb-6">
          Exam Management
        </h1>

       
        <h2 className="text-2xl font-semibold mb-3">MCQ Questions</h2>
        <button onClick={addMcq} className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-md flex items-center gap-2">
          <Plus size={18} /> Add MCQ
        </button>

        {mcq.map((m) => (
          <div key={m.id} className="bg-white dark:bg-[#0f0f0f] p-6 rounded-xl shadow mb-4">
            <div className="flex justify-end">
              <button onClick={() => deleteMcq(m.id)} className="text-red-600">
                <Trash2 size={18} />
              </button>
            </div>

            <textarea
              value={m.question}
              onChange={(e) => updateMcqQuestion(m.id, e.target.value)}
              className="w-full border h-24 rounded-lg p-3 mb-3 dark:bg-[#1a1a1a]"
            />

            {m.choices.map((c, i) => (
              <div key={i} className="flex gap-3 mb-2">
                <input disabled type="radio" />
                <input
                  className="flex-1 border p-2 rounded-lg dark:bg-[#1a1a1a]"
                  value={c}
                  onChange={(e) => updateChoice(m.id, i, e.target.value)}
                />
                <button onClick={() => removeChoice(m.id, i)} className="text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            <button onClick={() => addChoice(m.id)} className="text-blue-600 text-sm">
              + Add Option
            </button>
          </div>
        ))}

        <h2 className="text-2xl font-semibold mt-10 mb-3">Coding Questions</h2>
        <button onClick={addCoding} className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-md flex items-center gap-2">
          <Plus size={18} /> Add Coding Question
        </button>

        {codingQuestions.map((c) => (
          <div key={c.id} className="bg-white dark:bg-[#0f0f0f] p-6 rounded-xl shadow mb-4">
            <div className="flex justify-end">
              <button onClick={() => deleteCoding(c.id)} className="text-red-600">
                <Trash2 size={18} />
              </button>
            </div>

            <textarea
              value={c.question}
              onChange={(e) => updateCoding(c.id, e.target.value)}
              className="w-full border h-24 rounded-lg p-3 dark:bg-[#1a1a1a]"
            />
          </div>
        ))}


        <h2 className="text-2xl font-semibold mt-10 mb-3">Descriptive Questions</h2>
        <button onClick={addDescriptive} className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-md flex items-center gap-2">
          <Plus size={18} /> Add Descriptive Question
        </button>

        {descriptiveQuestions.map((d) => (
          <div key={d.id} className="bg-white dark:bg-[#0f0f0f] p-6 rounded-xl shadow mb-4">
            <div className="flex justify-end">
              <button onClick={() => deleteDescriptive(d.id)} className="text-red-600">
                <Trash2 size={18} />
              </button>
            </div>

            <textarea
              value={d.question}
              onChange={(e) => updateDescriptive(d.id, e.target.value)}
              className="w-full border h-28 rounded-lg p-3 dark:bg-[#1a1a1a]"
            />
          </div>
        ))}

        <div className="flex justify-center pt-10">
          <button onClick={submitExamQuestions} className="px-8 py-3 bg-blue-600 text-white rounded-xl shadow-lg">
            Submit
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
