
import React, { useState } from "react";
import AdminLayout from "../adminComponents/AdminLayout";
import { Eye, Pencil, Trash2, X } from "lucide-react";
export default function AdminExamManagement() {
  const summary = [
    { label: "Total Exams", value: 48 },
    { label: "Active Exams", value: 3 },
    { label: "Scheduled", value: 5 },
    { label: "Completed", value: 40 },
  ];

  const [searchQuery, setSearchQuery] = useState("");

  const [exams, setExams] = useState([
    {
      id: 1,
      title: "Mathematics Exam",
      type: "Mixed",
      duration: "120",
      q: 50,
      status: "Active",
      attempts: 245,
      avg: "78%",
      startDate: "2025-11-01",
      endDate: "2025-11-01",
      totalMarks: 100,
      negative: "1/3 (33%)",
    },
    {
      id: 2,
      title: "Physics Midterm",
      type: "MCQs",
      duration: "60",
      q: 40,
      status: "Schedule",
      attempts: 0,
      avg: "0%",
      startDate: "",
      endDate: "",
      totalMarks: 0,
      negative: "None",
    },
    {
      id: 3,
      title: "Chemistry Practical",
      type: "Descriptive",
      duration: "90",
      q: 30,
      status: "Completed",
      attempts: 189,
      avg: "72%",
      startDate: "2025-10-10",
      endDate: "2025-10-10",
      totalMarks: 100,
      negative: "1/4 (25%)",
    },
  ]);

  const [newExam, setNewExam] = useState({
    title: "",
    type: "MCQs",
    duration: "",
    q: "",
    startDate: "",
    endDate: "",
    totalMarks: "",
    negative: "None",
  });

  const handleNewExamChange = (field, value) => {
    setNewExam((prev) => ({ ...prev, [field]: value }));
  };

  const createExam = () => {
    if (!newExam.title || !newExam.duration || !newExam.q) {
      alert("Please fill all required fields: Title, Duration, Questions");
      return;
    }

    const newId = exams.length ? exams[exams.length - 1].id + 1 : 1;

    const createdExam = {
      id: newId,
      title: newExam.title,
      type: newExam.type,
      duration: newExam.duration,
      q: Number(newExam.q),
      status: "Active",
      attempts: 0,
      avg: "0%",
      startDate: newExam.startDate || "",
      endDate: newExam.endDate || "",
      totalMarks: newExam.totalMarks ? Number(newExam.totalMarks) : 0,
      negative: newExam.negative || "None",
    };

    setExams([createdExam, ...exams]);
    setShowCreateModal(false);
    setNewExam({
      title: "",
      type: "MCQs",
      duration: "",
      q: "",
      startDate: "",
      endDate: "",
      totalMarks: "",
      negative: "None",
    });
  };

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedExam, setSelectedExam] = useState(null);

  const handleView = (exam) => {
    setSelectedExam(exam);
    setShowViewModal(true);
  };

  const handleEdit = (exam) => {
    setSelectedExam(exam);
    setShowEditModal(true);
  };

  const handleDelete = (exam) => {
    setSelectedExam(exam);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setExams(exams.filter((e) => e.id !== selectedExam.id));
    setShowDeleteModal(false);
  };

  const filtered = exams.filter((e) =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <main className="p-4 sm:p-7">

        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Exam Management
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            Manage all exams — view details, create new exams, and edit existing ones.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {summary.map((s, i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 
              border border-gray-200 dark:border-gray-700 p-4 sm:p-5 shadow-sm"
            >
              <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
              <p className="text-lg sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
                {s.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mb-4">
          <div className="flex gap-3 flex-col sm:flex-row sm:items-center justify-between">
            <div className="w-full sm:w-1/2">
              <input
                type="text"
                placeholder="Search exams..."
                className="px-4 py-2 w-full rounded-xl border border-gray-300 
                  dark:border-gray-700 bg-white dark:bg-gray-800 
                  text-gray-900 dark:text-gray-100 
                  focus:ring-2 focus:ring-blue-500 outline-none transition"
                onChange={(e) => setSearchQuery(e.target.value)}
                value={searchQuery}
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 
                text-white px-3 py-2 rounded-lg text-sm shadow-sm transition"
              >
                Create Exam
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
        
          <div className="sm:hidden space-y-3">
            {filtered.length === 0 && (
              <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border dark:border-gray-700 text-center text-gray-500">
                No exams found.
              </div>
            )}

            {filtered.map((e) => (
              <div
                key={e.id}
                className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{e.title}</h4>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {e.type} • {e.duration} min
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-300">
                      <div>
                        <div className="text-xs text-gray-500">Questions</div>
                        <div className="font-medium">{e.q}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Avg</div>
                        <div className="font-medium">{e.avg}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="text-xs">
                      <StatusPill status={e.status} />
                    </div>

                    <div className="flex items-center gap-2">
                      <Eye
                        className="w-5 h-5 text-sky-600 dark:text-sky-400 cursor-pointer"
                        onClick={() => handleView(e)}
                        aria-label="View"
                      />
                      <Pencil
                        className="w-5 h-5 text-emerald-600 dark:text-emerald-400 cursor-pointer"
                        onClick={() => handleEdit(e)}
                        aria-label="Edit"
                      />
                      <Trash2
                        className="w-5 h-5 text-rose-600 dark:text-rose-400 cursor-pointer"
                        onClick={() => handleDelete(e)}
                        aria-label="Delete"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden sm:block">
            <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-0 shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs uppercase">
                    <tr>
                      <th className="py-3 px-4 text-left">Title</th>
                      <th className="py-3 px-4 text-left">Type</th>
                      <th className="py-3 px-4 text-center">Duration</th>
                      <th className="py-3 px-4 text-center">Questions</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-center">Attempts</th>
                      <th className="py-3 px-4 text-center">Avg</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan="8" className="py-8 text-center text-gray-500 dark:text-gray-400">
                          No exams found.
                        </td>
                      </tr>
                    )}

                    {filtered.map((e) => (
                      <tr
                        key={e.id}
                        className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition"
                      >
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900 dark:text-gray-100">{e.title}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{e.startDate || "—"}</div>
                        </td>

                        <td className="py-3 px-4">{e.type}</td>
                        <td className="py-3 px-4 text-center">{e.duration} min</td>
                        <td className="py-3 px-4 text-center">{e.q}</td>

                        <td className="py-3 px-4 text-center">
                          <StatusPill status={e.status} />
                        </td>

                        <td className="py-3 px-4 text-center">{e.attempts}</td>
                        <td className="py-3 px-4 text-center">{e.avg}</td>

                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-3">
                            <Eye
                              className="w-5 h-5 text-sky-600 dark:text-sky-400 cursor-pointer hover:scale-110 transition"
                              onClick={() => handleView(e)}
                            />
                            <Pencil
                              className="w-5 h-5 text-emerald-600 dark:text-emerald-400 cursor-pointer hover:scale-110 transition"
                              onClick={() => handleEdit(e)}
                            />
                            <Trash2
                              className="w-5 h-5 text-rose-600 dark:text-rose-400 cursor-pointer hover:scale-110 transition"
                              onClick={() => handleDelete(e)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>


        {showCreateModal && (
          <ResponsiveModal title="Create Exam" onClose={() => setShowCreateModal(false)}>
            <CreateExamForm
              newExam={newExam}
              handleNewExamChange={handleNewExamChange}
              createExam={createExam}
              onClose={() => setShowCreateModal(false)}
            />
          </ResponsiveModal>
        )}

        {showViewModal && selectedExam && (
          <ResponsiveModal title="Exam Details" onClose={() => setShowViewModal(false)}>
            <ExamDetails exam={selectedExam} />
          </ResponsiveModal>
        )}

        {showEditModal && selectedExam && (
          <ResponsiveModal title="Edit Exam" onClose={() => setShowEditModal(false)}>
            <EditExamForm
              exam={selectedExam}
              onClose={() => setShowEditModal(false)}
              onSave={(updatedExam) =>
                setExams(exams.map((ex) => (ex.id === updatedExam.id ? updatedExam : ex)))
              }
            />
          </ResponsiveModal>
        )}

        {showDeleteModal && (
          <ResponsiveModal title="Confirm Delete" onClose={() => setShowDeleteModal(false)}>
            <DeleteConfirm
              selectedExam={selectedExam}
              onCancel={() => setShowDeleteModal(false)}
              onDelete={confirmDelete}
            />
          </ResponsiveModal>
        )}
      </main>
    </AdminLayout>
  );
}


function StatusPill({ status = "Active" }) {
  const base = "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ";
  if (status === "Active")
    return <span className={base + "bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200"}>{status}</span>;
  if (status === "Completed")
    return <span className={base + "bg-indigo-100 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-200"}>{status}</span>;
  return <span className={base + "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200"}>{status}</span>;
}


function ResponsiveModal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 
        w-full max-w-3xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6
        max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between mb-4 gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
}


function ExamDetails({ exam }) {
  const Item = ({ label, value }) => (
    <div className="p-3 sm:p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 flex flex-col">
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        {label}
      </p>
      <p className="mt-1 text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 break-words">
        {value || "—"}
      </p>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Header Section */}
      <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <h2 className="text-lg sm:text-xl font-bold text-blue-700 dark:text-blue-300 leading-tight">
          {exam.title}
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
          Complete exam information & details
        </p>
      </div>


      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Item label="Exam Type" value={exam.type} />
        <Item label="Duration" value={`${exam.duration} min`} />
        <Item label="Total Questions" value={exam.q} />
        <Item label="Status" value={exam.status} />
        <Item label="Attempts" value={exam.attempts} />
        <Item label="Average Score" value={exam.avg} />
        <Item label="Start Date" value={exam.startDate} />
        <Item label="End Date" value={exam.endDate} />
        <Item label="Total Marks" value={exam.totalMarks} />
        <Item label="Negative Marking" value={exam.negative} />
      </div>

      <div className="mt-2 p-3 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700">
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          You can modify exam settings any time by editing this exam in the main list.
        </p>
      </div>
    </div>
  );
}


function DeleteConfirm({ selectedExam, onCancel, onDelete }) {
  return (
    <div>
      <p className="mb-4 text-gray-800 dark:text-gray-300">
        Are you sure you want to delete{" "}
        <strong className="text-gray-900 dark:text-gray-100">{selectedExam?.title}</strong>?
      </p>

      <div className="flex justify-end gap-3">
        <button
          className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition"
          onClick={onCancel}
        >
          Cancel
        </button>

        <button
          className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition"
          onClick={onDelete}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function CreateExamForm({ newExam, handleNewExamChange, createExam, onClose }) {
  const inputClass =
    "w-full mt-1 p-3 border rounded-xl bg-white dark:bg-gray-800 " +
    "border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 " +
    "focus:ring-2 focus:ring-blue-500 transition";

  return (
    <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
      <p className="text-gray-600 dark:text-gray-300 text-sm">Define the details for your new exam.</p>

      <div>
        <label className="text-sm font-semibold">Exam Title</label>
        <input
          type="text"
          value={newExam.title}
          onChange={(e) => handleNewExamChange("title", e.target.value)}
          className={inputClass}
          placeholder="Mathematics Exam"
        />
      </div>

      <div>
        <label className="text-sm font-semibold">Description</label>
        <textarea rows="2" className={inputClass} placeholder="Short description"></textarea>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold">Exam Type</label>
          <select
            value={newExam.type}
            onChange={(e) => handleNewExamChange("type", e.target.value)}
            className={inputClass}
          >
            <option>MCQs</option>
            <option>Descriptive</option>
            <option>Coding</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold">Duration (min)</label>
          <input
            type="number"
            value={newExam.duration}
            onChange={(e) => handleNewExamChange("duration", e.target.value)}
            className={inputClass}
            placeholder="120"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold">Start Date</label>
          <input
            type="date"
            value={newExam.startDate}
            onChange={(e) => handleNewExamChange("startDate", e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="text-sm font-semibold">End Date</label>
          <input
            type="date"
            value={newExam.endDate}
            onChange={(e) => handleNewExamChange("endDate", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold">Number of Questions</label>
        <input
          type="number"
          value={newExam.q}
          onChange={(e) => handleNewExamChange("q", e.target.value)}
          className={inputClass}
          placeholder="50"
        />
      </div>

      <div>
        <label className="text-sm font-semibold">Total Marks</label>
        <input
          type="number"
          value={newExam.totalMarks}
          onChange={(e) => handleNewExamChange("totalMarks", e.target.value)}
          className={inputClass}
          placeholder="100"
        />
      </div>

      <div>
        <label className="text-sm font-semibold">Negative Marking</label>
        <select
          value={newExam.negative}
          onChange={(e) => handleNewExamChange("negative", e.target.value)}
          className={inputClass}
        >
          <option>None</option>
          <option>1/3 (33%)</option>
          <option>1/4 (25%)</option>
          <option>1/2 (50%)</option>
        </select>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          onClick={onClose}
          className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 
          text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          Cancel
        </button>

        <button
          onClick={createExam}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl shadow hover:bg-blue-700 transition"
        >
          Create Exam
        </button>
      </div>
    </div>
  );
}

function EditExamForm({ exam, onClose, onSave }) {
  const [updatedExam, setUpdatedExam] = useState({
    ...exam,
    startDate: exam.startDate ?? "",
    endDate: exam.endDate ?? "",
    totalMarks: exam.totalMarks ?? "",
    negative: exam.negative ?? "None",
  });

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 " +
    "border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 " +
    "focus:ring-2 focus:ring-blue-500 transition";

  const handleChange = (field, value) => {
    setUpdatedExam((prev) => ({ ...prev, [field]: value }));
  };

  const save = () => {
    const final = {
      ...updatedExam,
      q: Number(updatedExam.q),
      attempts: Number(updatedExam.attempts),
      totalMarks: updatedExam.totalMarks ? Number(updatedExam.totalMarks) : 0,
    };
    onSave(final);
    onClose();
  };

  return (
    <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold">Exam Title</label>
          <input
            type="text"
            value={updatedExam.title}
            onChange={(e) => handleChange("title", e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="text-sm font-semibold">Exam Type</label>
          <select
            value={updatedExam.type}
            onChange={(e) => handleChange("type", e.target.value)}
            className={inputClass}
          >
            <option>MCQs</option>
            <option>Descriptive</option>
            <option>Coding</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold">Duration (min)</label>
          <input
            type="number"
            value={updatedExam.duration}
            onChange={(e) => handleChange("duration", e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="text-sm font-semibold">Questions</label>
          <input
            type="number"
            value={updatedExam.q}
            onChange={(e) => handleChange("q", e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="text-sm font-semibold">Start Date</label>
          <input
            type="date"
            value={updatedExam.startDate}
            onChange={(e) => handleChange("startDate", e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="text-sm font-semibold">End Date</label>
          <input
            type="date"
            value={updatedExam.endDate}
            onChange={(e) => handleChange("endDate", e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="text-sm font-semibold">Total Marks</label>
          <input
            type="number"
            value={updatedExam.totalMarks}
            onChange={(e) => handleChange("totalMarks", e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="text-sm font-semibold">Negative Marking</label>
          <select
            value={updatedExam.negative}
            onChange={(e) => handleChange("negative", e.target.value)}
            className={inputClass}
          >
            <option>None</option>
            <option>1/3 (33%)</option>
            <option>1/4 (25%)</option>
            <option>1/2 (50%)</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold">Status</label>
          <select
            value={updatedExam.status}
            onChange={(e) => handleChange("status", e.target.value)}
            className={inputClass}
          >
            <option>Active</option>
            <option>Schedule</option>
            <option>Completed</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold">Attempts</label>
          <input
            type="number"
            value={updatedExam.attempts}
            onChange={(e) => handleChange("attempts", e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="text-sm font-semibold">Avg Score (%)</label>
          <input
            type="text"
            value={String(updatedExam.avg).replace("%", "")}
            onChange={(e) => handleChange("avg", e.target.value + "%")}
            className={inputClass}
          />
        </div>
      </div>

      <button
        onClick={save}
        className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition font-semibold"
      >
        Save Changes
      </button>
    </div>
  );
}
