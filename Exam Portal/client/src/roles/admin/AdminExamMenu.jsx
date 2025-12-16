import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
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

  /* ================= STATE ================= */
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [searchDate, setSearchDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);

  const [newExam, setNewExam] = useState({
    title: "",
    description: "",
    type: [],
    duration: "",
    q: "",
    startDate: "",
    endDate: "",
    totalMarks: "",
    negative: "None",
  });

  /* ================= FETCH ================= */
  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_BASE, { credentials: "include" });
      const json = await res.json();

      if (json.success) {
        setExams(
          json.data.map((e) => ({
            id: e.id,
            title: e.title,
            description: e.description || "",
            type: e.type,
            duration: e.duration_min,
            q: e.total_questions,
            status: capitalize(e.status),
            attempts: e.attemptcount || 0,
            avg: `${Math.round(e.avg || 0)}%`,
            startDate: e.start_date,
            endDate: e.end_date,
          }))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= CREATE ================= */
  const createExam = async () => {
    if (!newExam.title || !newExam.duration || !newExam.q) {
      alert("Please fill all required fields");
      return;
    }

    const payload = {
      title: newExam.title,
      description: newExam.description,
      type: newExam.type.join(","),
      duration: Number(newExam.duration),
      questions: Number(newExam.q),
      startDate: newExam.startDate,
      endDate: newExam.endDate,
      totalMarks: Number(newExam.totalMarks || 0),
      negativeMarking: newExam.negative,
      invigilatorId: null,
      invigilatorName: null,
    };

    try {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!json.success) {
        alert(json.message || "Exam creation failed");
        return;
      }

      setShowCreateModal(false);
      resetForm();
      fetchExams();
    } catch (err) {
      alert("Server error");
    }
  };

  const resetForm = () => {
    setNewExam({
      title: "",
      description: "",
      type: [],
      duration: "",
      q: "",
      startDate: "",
      endDate: "",
      totalMarks: "",
      negative: "None",
    });
  };

  /* ================= DELETE ================= */
  const confirmDelete = async () => {
    await fetch(`${API_BASE}/${selectedExam.id}`, {
      method: "DELETE",
      credentials: "include",
    });
    setShowDeleteModal(false);
    fetchExams();
  };

  /* ================= FILTER ================= */
  const filtered = exams.filter((e) => {
    const q = searchQuery.toLowerCase();
    return (
      (e.title.toLowerCase().includes(q) ||
        e.type.toLowerCase().includes(q) ||
        e.status.toLowerCase().includes(q)) &&
      (filterType === "All" || e.type.includes(filterType)) &&
      (!searchDate || e.startDate === searchDate || e.endDate === searchDate)
    );
  });

  const todayISO = new Date().toISOString().slice(0, 10);

  /* ================= UI ================= */
  return (
    <AdminLayout>
      <main className="p-4 sm:p-6">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
          <h1 className="text-2xl font-semibold">Exam Menu</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl"
          >
            Create Exam
          </button>
        </div>

        {/* FILTERS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <input
            className="w-full px-4 py-2 border rounded-xl"
            placeholder="Search exams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <select
            className="w-full px-4 py-2 border rounded-xl"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="MCQs">MCQs</option>
            <option value="Descriptive">Descriptive</option>
            <option value="Coding">Coding</option>
          </select>

          <div className="relative">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="w-full px-4 py-2 border rounded-xl flex justify-between items-center"
            >
              {searchDate || "Today"} <CalendarDays size={18} />
            </button>

            {showDatePicker && (
              <div className="absolute mt-2 bg-white border p-3 rounded-xl w-full z-10">
                <input
                  type="date"
                  className="border p-2 w-full"
                  value={searchDate}
                  onChange={(e) => {
                    setSearchDate(e.target.value);
                    setShowDatePicker(false);
                  }}
                />
                <button
                  className="mt-2 w-full bg-blue-100 rounded p-2"
                  onClick={() => {
                    setSearchDate(todayISO);
                    setShowDatePicker(false);
                  }}
                >
                  Today
                </button>
              </div>
            )}
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto border rounded-xl bg-white -mx-4 sm:mx-0">
          <table className="w-full text-sm min-w-[900px]">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Title</th>
                <th>Type</th>
                <th>Duration</th>
                <th>Questions</th>
                <th>Status</th>
                <th>Attempts</th>
                <th>Avg</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-6 text-center">Loading…</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-6 text-center">No exams</td>
                </tr>
              ) : (
                filtered.map((e) => (
                  <tr key={e.id} className="border-t">
                    <td className="p-3">{e.title}</td>
                    <td>{e.type}</td>
                    <td>{e.duration} min</td>
                    <td>{e.q}</td>
                    <td><StatusPill status={e.status} /></td>
                    <td>{e.attempts}</td>
                    <td>{e.avg}</td>
                    <td className="flex gap-4 p-3 justify-center">
                      <Eye onClick={() => { setSelectedExam(e); setShowViewModal(true); }} />
                      <Pencil onClick={() => navigate(`/admin/exam-management?id=${e.id}`)} />
                      <Trash2 className="text-red-600" onClick={() => { setSelectedExam(e); setShowDeleteModal(true); }} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* VIEW */}
        {showViewModal && (
          <Modal title="Exam Details" onClose={() => setShowViewModal(false)}>
            <ExamDetails exam={selectedExam} />
          </Modal>
        )}

        {/* DELETE */}
        {showDeleteModal && (
          <Modal title="Delete Exam" onClose={() => setShowDeleteModal(false)}>
            <DeleteConfirm selectedExam={selectedExam} onDelete={confirmDelete} />
          </Modal>
        )}

        {/* CREATE */}
       {showCreateModal && (
  <Modal title="Create Exam" onClose={() => setShowCreateModal(false)}>
    <CreateExamForm
      newExam={newExam}
      setNewExam={setNewExam}
      createExam={createExam}
      onClose={() => setShowCreateModal(false)}
    />
  </Modal>
)}

       
      </main>
    </AdminLayout>
  );
}

/* ================= HELPERS ================= */
const capitalize = (s) => s?.charAt(0).toUpperCase() + s.slice(1);

function StatusPill({ status }) {
  const map = {
    Active: "bg-green-100 text-green-700",
    Upcoming: "bg-yellow-100 text-yellow-700",
    Completed: "bg-blue-100 text-blue-700",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${map[status]}`}>
      {status}
    </span>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-4 sm:p-6 rounded-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between mb-4">
          <h2 className="font-semibold">{title}</h2>
          <X onClick={onClose} />
        </div>
        {children}
      </div>
    </div>
  );
}

function ExamDetails({ exam }) {
  return (
    <div className="space-y-2 text-sm">
      <p><b>Title:</b> {exam.title}</p>
      <p><b>Type:</b> {exam.type}</p>
      <p><b>Duration:</b> {exam.duration} min</p>
      <p><b>Questions:</b> {exam.q}</p>
      <p><b>Start:</b> {exam.startDate}</p>
      <p><b>End:</b> {exam.endDate}</p>
    </div>
  );
}

function DeleteConfirm({ selectedExam, onDelete }) {
  return (
    <>
      <p>Delete <b>{selectedExam.title}</b>?</p>
      <div className="flex justify-end mt-4">
        <button className="px-4 py-2 bg-red-600 text-white rounded" onClick={onDelete}>
          Delete
        </button>
      </div>
    </>
  );
}


function CreateExamForm({ newExam, setNewExam, createExam, onClose }) {

  const input = "w-full px-4 py-2 border rounded-lg text-sm";

  return (
    <div className="space-y-4">

      {/* Subtitle */}
      <p className="text-sm text-gray-500">
        Define the details for your new exam. Click create when you're done.
      </p>

      {/* Exam Title */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Exam Title</label>
        <input
          className={input}
          placeholder="Mathematics Exam"
          value={newExam.title}
          onChange={(e) =>
            setNewExam({ ...newExam, title: e.target.value })
          }
        />
      </div>

      {/* Description */}
      <div className="space-y-1">
        <textarea
          className={`${input} resize-none`}
          rows={3}
          placeholder="Description"
          value={newExam.description}
          onChange={(e) =>
            setNewExam({ ...newExam, description: e.target.value })
          }
        />
      </div>

      {/* Exam Type */}
   {/* Exam Type */}
<div className="space-y-2">
  <label className="text-sm font-medium">Exam Type</label>

  <div className="flex gap-6 text-sm">
    {["MCQs", "Descriptive", "Coding"].map((t) => (
      <label key={t} className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={newExam.type.includes(t)}
          onChange={() =>
            setNewExam((prev) => ({
              ...prev,
              type: prev.type.includes(t)
                ? prev.type.filter((x) => x !== t)
                : [...prev.type, t],
            }))
          }
        />
        {t}
      </label>
    ))}
  </div>
</div>


      {/* Assign Invigilator */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Assign Invigilator</label>
        <input
          className={input}
          placeholder="Michel Brown"
          value={newExam.invigilatorName || ""}
          onChange={(e) =>
            setNewExam({ ...newExam, invigilatorName: e.target.value })
          }
        />
      </div>

      {/* Duration */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Duration (min)</label>
        <input
          type="number"
          className={input}
          placeholder="120"
          value={newExam.duration}
          onChange={(e) =>
            setNewExam({ ...newExam, duration: e.target.value })
          }
        />
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-sm font-medium">Start Date</label>
          <input
            type="date"
            className={input}
            value={newExam.startDate}
            onChange={(e) =>
              setNewExam({ ...newExam, startDate: e.target.value })
            }
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">End Date</label>
          <input
            type="date"
            className={input}
            value={newExam.endDate}
            onChange={(e) =>
              setNewExam({ ...newExam, endDate: e.target.value })
            }
          />
        </div>
      </div>

      {/* Number of Questions */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Number of Questions</label>
        <input
          type="number"
          className={input}
          placeholder="50"
          value={newExam.q}
          onChange={(e) =>
            setNewExam({ ...newExam, q: e.target.value })
          }
        />
      </div>

      {/* Total Marks */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Total Marks</label>
        <input
          type="number"
          className={input}
          placeholder="100"
          value={newExam.totalMarks}
          onChange={(e) =>
            setNewExam({ ...newExam, totalMarks: e.target.value })
          }
        />
      </div>

      {/* Negative Marking */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Negative Marking</label>
        <select
          className={input}
          value={newExam.negative}
          onChange={(e) =>
            setNewExam({ ...newExam, negative: e.target.value })
          }
        >
          <option value="None">None</option>
          <option value="1/3">1/3 (33%)</option>
          <option value="1/4">1/4 (25%)</option>
          <option value="1/2">1/2 (50%)</option>
        </select>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-4">
       <button
  className="px-4 py-2 border rounded-lg text-sm"
  onClick={() => {
    setNewExam({
      title: "",
      description: "",
      type: [],
      duration: "",
      q: "",
      startDate: "",
      endDate: "",
      totalMarks: "",
      negative: "None",
    });
    <button
  className="px-4 py-2 border rounded-lg text-sm"
  onClick={() => {
    setNewExam({
      title: "",
      description: "",
      type: [],
      duration: "",
      q: "",
      startDate: "",
      endDate: "",
      totalMarks: "",
      negative: "None",
    });
    onClose(); // ✅ closes popup
  }}
>
  Cancel
</button>

  }}
>
  Cancel
</button>


        <button
          onClick={createExam}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm"
        >
          Create Exam
        </button>
      </div>
    </div>
  );
}
