import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../adminComponents/AdminLayout";

import {
  BookOpen,
  BarChart2,
  Users,
  FileText,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";

import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
export default function AdminDashboard() {
  const navigate = useNavigate();
  const lineData = useMemo(
    () => [
      { day: "Nov 5", exam: 20, users: 180 },
      { day: "Nov 6", exam: 250, users: 30 },
      { day: "Nov 7", exam: 150, users: 260 },
      { day: "Nov 8", exam: 350, users: 500 },
      { day: "Nov 9", exam: 450, users: 390 },
      { day: "Nov 10", exam: 320, users: 400 },
      { day: "Nov 11", exam: 380, users: 330 },
    ],
    []
  );
  const barData = useMemo(
    () => [
      { subject: "Mat", value: 100 },
      { subject: "Phy", value: 92 },
      { subject: "Che", value: 90 },
      { subject: "Eng", value: 80 },
      { subject: "Sci", value: 80 },
    ],
    []
  );
  const barColors = {
    Mat: "#6366F1",
    Phy: "#10B981",
    Che: "#F59E0B",
    Eng: "#EF4444",
    Sci: "#3B82F6",
  };
  const stats = [
    {
      label: "Total Exams",
      value: "150",
      icon: <FileText size={22} />,
      sub: "3 active • 5 scheduled",
      accent: "from-indigo-50 to-indigo-100",
      iconColor: "text-indigo-600",
    },
    {
      label: "Active Users",
      value: "1,245",
      icon: <Users size={22} />,
      sub: "Online now: 156",
      accent: "from-purple-50 to-purple-100",
      iconColor: "text-purple-600",
    },
    {
      label: "Study Materials",
      value: "127",
      icon: <BookOpen size={22} />,
      sub: "2,456 total downloads",
      accent: "from-sky-50 to-sky-100",
      iconColor: "text-sky-600",
    },
    {
      label: "Avg Performance",
      value: "79%",
      icon: <BarChart2 size={22} />,
      sub: "+5% from last month",
      accent: "from-emerald-50 to-emerald-100",
      iconColor: "text-emerald-600",
    },
  ]
  const [exams, setExams] = useState([
    {
      id: 1,
      title: "Mathematics Exam",
      type: "Mixed",
      duration: "120 min",
      q: 50,
      status: "Active",
      attempts: 245,
      avg: "78%",
    },
    {
      id: 2,
      title: "Physics Midterm",
      type: "MCQs",
      duration: "60 min",
      q: 40,
      status: "Schedule",
      attempts: 0,
      avg: "0%",
    },
    {
      id: 3,
      title: "Chemistry Practical",
      type: "Descriptive",
      duration: "90 min",
      q: 30,
      status: "Completed",
      attempts: 189,
      avg: "72%",
    },
    {
      id: 4,
      title: "English Literature",
      type: "Mixed",
      duration: "120 min",
      q: 40,
      status: "Active",
      attempts: 156,
      avg: "85%",
    },
  ]);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [viewExam, setViewExam] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const startEdit = (exam) => {
    setEditId(exam.id);
    setEditData({ ...exam });
  };
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const saveEdit = () => {
    setExams((prev) => prev.map((ex) => (ex.id === editId ? editData : ex)));
    setEditId(null);
  };

  const confirmDelete = (id) => {
    setExams((prev) => prev.filter((e) => e.id !== id));
    setDeleteId(null);
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-gray-100">
          Admin Dashboard
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
          Overview of exams, charts & real-time insights.
        </p>
      </div>

    
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {s.label}
                </p>
                <p className="text-2xl font-semibold mt-1 text-gray-900 dark:text-gray-100">
                  {s.value}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {s.sub}
                </p>
              </div>

              <div
                className={`p-3 rounded-lg shadow-sm bg-white/60 dark:bg-white/10 ${s.iconColor}`}
              >
                {s.icon}
              </div>
            </div>

            <div
              className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r ${s.accent} opacity-30`}
            />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
       
        <div className="rounded-2xl bg-white dark:bg-gray-800 border dark:border-gray-700 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
  <h3 className="text-md font-medium text-gray-900 dark:text-gray-100">Exam Performance</h3>
  <p className="text-xs text-gray-500 dark:text-gray-400">Last 7 days</p>
</div>

<div className="flex items-center gap-6 mb-3">
  <div className="flex items-center gap-2">
    <span className="h-3 w-3 rounded-full bg-indigo-600 shadow-sm"></span>
    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
      Exam
    </span>
  </div>

  <div className="flex items-center gap-2">
    <span className="h-3 w-3 rounded-full bg-emerald-600 shadow-sm"></span>
    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
      Users
    </span>
  </div>

</div>



          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={lineData}
                margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
              >
                <defs>
           
                  <linearGradient id="examShade" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="#4F46E5" stopOpacity={0.04} />
                  </linearGradient>

              
                  <linearGradient id="usersShade" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0.04} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3"
                  stroke="#e5e7eb"
                  opacity={0.5}
                  vertical={false}
                />

                <XAxis
                  dataKey="day"
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  contentStyle={{
                    background: "white",
                    borderRadius: 12,
                    border: "1px solid #e5e7eb",
                    boxShadow: "0px 8px 24px rgba(0,0,0,0.08)",
                  }}
                />

                
                <Area
                  type="monotone"
                  dataKey="exam"
                  stroke="#4F46E5"
                  fill="url(#examShade)"
                  strokeWidth={3}
                  dot={false}
                />

                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#10B981"
                  fill="url(#usersShade)"
                  strokeWidth={3}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

     
        <div className="rounded-2xl bg-white dark:bg-gray-800 border dark:border-gray-700 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-md font-medium text-gray-900 dark:text-gray-100">
              Subject-wise Performance
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Top subjects</p>
          </div>

          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e6e6e6" opacity={0.6} />
                <XAxis dataKey="subject" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  wrapperStyle={{
                    background: "white",
                    borderRadius: 8,
                    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                  }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {barData.map((entry, idx) => (
                    <Cell key={idx} fill={barColors[entry.subject]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

   
      <div className="rounded-2xl bg-white dark:bg-gray-800 border dark:border-gray-700 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Exam Management
          </h3>

          <button
            onClick={() => navigate("/admin/exams")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm shadow-sm transition"
          >
            Create Exam
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
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
              {exams.map((e) => {
                const editing = editId === e.id;

                return (
                  <tr
                    key={e.id}
                    className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition"
                  >
                    <td className="py-3 px-4">
                      {editing ? (
                        <input
                          name="title"
                          value={editData.title}
                          onChange={handleEditChange}
                          className="px-3 py-2 rounded-md border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 w-full"
                        />
                      ) : (
                        <span className="text-gray-900 dark:text-gray-100 font-medium">
                          {e.title}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      {editing ? (
                        <select
                          name="type"
                          value={editData.type}
                          onChange={handleEditChange}
                          className="px-3 py-2 rounded-md border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                        >
                          <option>Mixed</option>
                          <option>MCQs</option>
                          <option>Descriptive</option>
                        </select>
                      ) : (
                        <span className="text-gray-700 dark:text-gray-200">
                          {e.type}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {editing ? (
                        <input
                          name="duration"
                          value={editData.duration}
                          onChange={handleEditChange}
                          className="w-20 px-2 py-1 rounded-md border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-center"
                        />
                      ) : (
                        <span className="text-gray-700 dark:text-gray-200">
                          {e.duration}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {editing ? (
                        <input
                          name="q"
                          value={editData.q}
                          onChange={handleEditChange}
                          type="number"
                          className="w-20 px-2 py-1 rounded-md border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-center"
                        />
                      ) : (
                        <span className="text-gray-700 dark:text-gray-200">
                          {e.q}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {editing ? (
                        <select
                          name="status"
                          value={editData.status}
                          onChange={handleEditChange}
                          className="px-3 py-2 rounded-md border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                        >
                          <option>Active</option>
                          <option>Schedule</option>
                          <option>Completed</option>
                        </select>
                      ) : (
                        <StatusPill status={e.status} />
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {editing ? (
                        <input
                          name="attempts"
                          value={editData.attempts}
                          onChange={handleEditChange}
                          type="number"
                          className="w-20 px-2 py-1 rounded-md border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-center"
                        />
                      ) : (
                        <span className="text-gray-700 dark:text-gray-200">
                          {e.attempts}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {editing ? (
                        <input
                          name="avg"
                          value={editData.avg}
                          onChange={handleEditChange}
                          className="w-20 px-2 py-1 rounded-md border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-center"
                        />
                      ) : (
                        <span className="text-gray-700 dark:text-gray-200">
                          {e.avg}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {editing ? (
                        <div className="flex items-center justify-center gap-4">
                          <button
                            onClick={saveEdit}
                            className="text-emerald-600 dark:text-emerald-400 text-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditId(null)}
                            className="text-rose-600 dark:text-rose-400 text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-4">
                          <Eye
                            size={16}
                            onClick={() => setViewExam(e)}
                            className="text-sky-600 dark:text-sky-400 cursor-pointer hover:scale-110 transition"
                          />
                          <Edit
                            size={16}
                            onClick={() => startEdit(e)}
                            className="text-emerald-600 dark:text-emerald-400 cursor-pointer hover:scale-110 transition"
                          />
                          <Trash2
                            size={16}
                            onClick={() => setDeleteId(e.id)}
                            className="text-rose-600 dark:text-rose-400 cursor-pointer hover:scale-110 transition"
                          />
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

     
      {viewExam && (
        <Modal onClose={() => setViewExam(null)} title="Exam Details">
          <div className="space-y-3 text-sm text-gray-700 dark:text-gray-200">
            <Field label="Title" value={viewExam.title} />
            <Field label="Type" value={viewExam.type} />
            <Field label="Duration" value={viewExam.duration} />
            <Field label="Questions" value={viewExam.q} />
            <Field label="Status" value={viewExam.status} />
            <Field label="Attempts" value={viewExam.attempts} />
            <Field label="Avg Score" value={viewExam.avg} />
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setViewExam(null)}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </Modal>
      )}

     
      {deleteId !== null && (
        <Modal onClose={() => setDeleteId(null)} title="Delete Exam">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Are you sure you want to delete exam ID{" "}
            <strong className="text-gray-900 dark:text-gray-100">
              {deleteId}
            </strong>
            ?
          </p>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setDeleteId(null)}
              className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={() => confirmDelete(deleteId)}
              className="px-4 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700"
            >
              Delete
            </button>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}

function StatusPill({ status = "Active" }) {
  const base =
    "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ";
  if (status === "Active")
    return (
      <span
        className={
          base +
          "bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200"
        }
      >
        {status}
      </span>
    );
  if (status === "Completed")
    return (
      <span
        className={
          base +
          "bg-indigo-100 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-200"
        }
      >
        {status}
      </span>
    );
  return (
    <span
      className={
        base +
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200"
      }
    >
      {status}
    </span>
  );
}

function Modal({ title, children, onClose = () => {} }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border dark:border-gray-700 p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-300 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            ✕
          </button>
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div className="flex items-start gap-4">
      <p className="w-36 text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-sm text-gray-900 dark:text-gray-100">{value ?? "—"}</p>
    </div>
  );
}
