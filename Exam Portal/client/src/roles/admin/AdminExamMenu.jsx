
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../adminComponents/AdminLayout";
import {
  Eye,
  Pencil,
  Trash2,
  Plus,
  FileText,
  BarChart3,
  Calendar,
} from "lucide-react";

const API_BASE = "/api/exams";

export default function AdminExamMenu() {
  const navigate = useNavigate();

  const [cards, setCards] = useState([
    { label: "Total Exams", value: 0, icon: FileText, color: "bg-blue-500" },
    { label: "Active Exams", value: 0, icon: BarChart3, color: "bg-emerald-500" },
    { label: "Scheduled", value: 0, icon: Calendar, color: "bg-amber-500" },
    { label: "Completed", value: 0, icon: FileText, color: "bg-violet-500" },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState(null);

  const toggleSort = () => {
    if (sortOrder === null) setSortOrder("asc");
    else if (sortOrder === "asc") setSortOrder("desc");
    else setSortOrder(null);
  };

  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [newExam, setNewExam] = useState({
    title: "",
    type: [],
    duration: "",
    q: "",
    startDate: "",
    endDate: "",
    totalMarks: "",
    negative: "None",
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_BASE);
      const json = await res.json();
      setExams(json.data || []);
    } catch (e) {
      setError("Failed to load exams");
    }
    setLoading(false);
  };

  const fetchCards = async () => {
    try {
      const res = await fetch(`${API_BASE}/stats/cards`);
      const json = await res.json();
      setCards([
        { label: "Total Exams", value: json.cards.total_exams, icon: FileText, color: "bg-blue-500" },
        { label: "Active Exams", value: json.cards.active_exams, icon: BarChart3, color: "bg-emerald-500" },
        { label: "Scheduled", value: json.cards.scheduled_exams, icon: Calendar, color: "bg-amber-500" },
        { label: "Completed", value: json.cards.completed_exams, icon: FileText, color: "bg-violet-500" },
      ]);
    } catch {}
  };

  useEffect(() => {
    fetchExams();
    fetchCards();
  }, []);

  const createExam = async () => {
    if (!newExam.title || !newExam.duration || !newExam.q) {
      alert("Please fill required fields");
      return;
    }

    const payload = {
      title: newExam.title,
      type: newExam.type.length ? newExam.type.join(", ") : "MCQs",
      description: "",
      startDate: newExam.startDate,
      endDate: newExam.endDate,
      duration: Number(newExam.duration),
      totalMarks: newExam.totalMarks || 0,
      negative: newExam.negative,
    };

    try {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      setExams((prev) => [json.data, ...prev]);
      setShowCreateModal(false);

      setNewExam({
        title: "",
        type: [],
        duration: "",
        q: "",
        startDate: "",
        endDate: "",
        totalMarks: "",
        negative: "None",
      });

      fetchCards();
    } catch (err) {
      alert("Error creating exam");
    }
  };

  const confirmDelete = async () => {
    await fetch(`${API_BASE}/${selectedExam.id}`, { method: "DELETE" });
    setExams(exams.filter((e) => e.id !== selectedExam.id));
    setShowDeleteModal(false);
  };

  const filtered = exams;

  return (
    <AdminLayout>
      <main className="p-4 sm:p-7 text-gray-900 dark:text-white">

        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold dark:text-white">Exam Menu</h1>

          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={18} /> Create Exam
          </button>
        </div>

        {/* CARD STATS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {cards.map((c, i) => {
            const Icon = c.icon;
            return (
              <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow flex flex-col gap-2">
                <div className={`p-2 rounded-lg text-white ${c.color} w-fit`}>
                  <Icon size={20} />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">{c.label}</p>
                <p className="text-2xl font-semibold dark:text-white">{c.value}</p>
              </div>
            );
          })}
        </div>

        {/* TABLE */}
        <div className="rounded-xl border border-gray-300 dark:border-gray-700 overflow-x-auto">
          <table className="min-w-full text-sm dark:text-white">
           
           <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs uppercase">
  <tr>
    <th className="p-3 text-left">Title</th>
    <th className="p-3">Type</th>
    <th className="p-3">Duration</th>
    <th className="p-3">Questions</th>
    <th className="p-3">Attempts</th>
    <th className="p-3">Avg Score</th>
    <th className="p-3">Status</th>
    <th className="p-3">Actions</th>
  </tr>
</thead>

<tbody>
  {filtered.map((e) => (
    <tr key={e.id} className="border-t border-gray-300 dark:border-gray-700">
      <td className="p-3">{e.title}</td>
      <td className="p-3 text-center">{e.type}</td>
      <td className="p-3 text-center">{e.duration} min</td>

      {/* QUESTIONS */}
      <td className="p-3 text-center">{e.questions || e.q || "—"}</td>

      {/* ATTEMPTS */}
      <td className="p-3 text-center">{e.attempts || 0}</td>

      {/* AVERAGE SCORE */}
      <td className="p-3 text-center">{e.avg_score || "0%"}</td>

      {/* STATUS */}
      <td className="p-3 text-center">{e.status}</td>

      {/* ACTIONS */}
      <td className="p-3 flex gap-3 justify-center">
        <Eye className="text-blue-500 cursor-pointer" />
        <Pencil className="text-green-500 cursor-pointer" />
        <Trash2
          className="text-red-500 cursor-pointer"
          onClick={() => {
            setSelectedExam(e);
            setShowDeleteModal(true);
          }}
        />
      </td>
    </tr>
  ))}
</tbody>




          </table>
        </div>

        {/* CREATE EXAM POPUP */}
        {showCreateModal && (
          <ResponsiveModal title="Create Exam" onClose={() => setShowCreateModal(false)}>
            <CreateExamForm
              newExam={newExam}
              setNewExam={setNewExam}
              createExam={createExam}
              onClose={() => setShowCreateModal(false)}
            />
          </ResponsiveModal>
        )}

        {/* DELETE POPUP */}
        {showDeleteModal && (
          <ResponsiveModal title="Delete Exam" onClose={() => setShowDeleteModal(false)}>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Are you sure you want to delete this exam?
            </p>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-400 dark:border-gray-600 rounded-lg dark:text-white"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                Delete
              </button>
            </div>
          </ResponsiveModal>
        )}

      </main>
    </AdminLayout>
  );
}

/* ======================================================
   INLINE POPUP COMPONENTS (DARK MODE ENABLED)
   ====================================================== */

function ResponsiveModal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl w-[90%] sm:w-[520px] max-h-[90vh] overflow-y-auto relative shadow-xl dark:text-white">

        <button
          className="absolute top-4 right-4 text-gray-600 dark:text-gray-300 text-xl"
          onClick={onClose}
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold dark:text-white mb-1">{title}</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Define the details for your new exam.
        </p>

        {children}
      </div>
    </div>
  );
}
function CreateExamForm({ newExam, setNewExam, createExam, onClose }) {

  const input =
    "w-full p-2 border rounded-lg mt-1 bg-white dark:bg-gray-800 " +
    "text-gray-900 dark:text-white border-gray-300 dark:border-gray-600";

  const label = "text-sm font-medium text-gray-700 dark:text-gray-200";

  return (
    <div className="space-y-4">

      {/* Exam Title */}
      <div>
        <label className={label}>Exam Name</label>
        <input
          className={input}
          placeholder="Enter exam name"
          value={newExam.title}
          onChange={(e) => setNewExam({ ...newExam, title: e.target.value })}
        />
      </div>

      {/* Exam Type */}
      <div>
        <label className={label}>Exam Type</label>
        <select
          className={input}
          value={newExam.type[0] || ""}
          onChange={(e) => setNewExam({ ...newExam, type: [e.target.value] })}
        >
          <option value="">Select Type</option>
          <option value="MCQs">MCQs</option>
          <option value="Descriptive">Descriptive</option>
          <option value="Coding">Coding</option>
       
        </select>
      </div>

      {/* Description */}
      <div>
        <label className={label}>Description</label>
        <textarea
          rows="3"
          placeholder="Write a short description..."
          className={input}
          value={newExam.description}
          onChange={(e) => setNewExam({ ...newExam, description: e.target.value })}
        />
      </div>

      {/* Duration */}
      <div>
        <label className={label}>Duration (in minutes)</label>
        <input
          type="number"
          className={input}
          placeholder="Example: 90"
          value={newExam.duration}
          onChange={(e) => setNewExam({ ...newExam, duration: e.target.value })}
        />
      </div>

      {/* Start & End Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={label}>Start Date</label>
          <input
            type="date"
            className={input}
            value={newExam.startDate}
            onChange={(e) => setNewExam({ ...newExam, startDate: e.target.value })}
          />
        </div>

        <div>
          <label className={label}>End Date</label>
          <input
            type="date"
            className={input}
            value={newExam.endDate}
            onChange={(e) => setNewExam({ ...newExam, endDate: e.target.value })}
          />
        </div>
      </div>

      {/* Questions */}
      <div>
        <label className={label}>Total Questions</label>
        <input
          type="number"
          className={input}
          placeholder="Example: 50"
          value={newExam.q}
          onChange={(e) => setNewExam({ ...newExam, q: e.target.value })}
        />
      </div>

      {/* Total Marks */}
      <div>
        <label className={label}>Total Marks</label>
        <input
          type="number"
          className={input}
          placeholder="Example: 100"
          value={newExam.totalMarks}
          onChange={(e) => setNewExam({ ...newExam, totalMarks: e.target.value })}
        />
      </div>

      {/* Negative Marking */}
      <div>
        <label className={label}>Negative Marking</label>
        <select
          className={input}
          value={newExam.negative}
          onChange={(e) => setNewExam({ ...newExam, negative: e.target.value })}
        >
          <option value="None">None</option>
          <option value="1/4 (25%)">1/4 (25%)</option>
          <option value="1/3 (33%)">1/3 (33%)</option>
          <option value="1/2 (50%)">1/2 (50%)</option>
        </select>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-4 pt-4">
        <button
          onClick={onClose}
          className="px-4 py-2 border rounded-lg border-gray-400 dark:border-gray-600 dark:text-white"
        >
          Cancel
        </button>

        <button
          onClick={createExam}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Create Exam
        </button>
      </div>

    </div>
  );
}