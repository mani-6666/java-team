import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";

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
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export default function Dashboard() {
  const navigate = useNavigate();

  const [deleteId, setDeleteId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [viewExam, setViewExam] = useState(null);

  const lineData = [
    { day: "Nov 5", exam: 200, users: 180 },
    { day: "Nov 6", exam: 250, users: 230 },
    { day: "Nov 7", exam: 300, users: 260 },
    { day: "Nov 8", exam: 350, users: 300 },
    { day: "Nov 9", exam: 450, users: 390 },
    { day: "Nov 10", exam: 420, users: 350 },
    { day: "Nov 11", exam: 380, users: 330 },
  ];

  const barData = [
    { subject: "Mat", value: 100 },
    { subject: "Phy", value: 92 },
    { subject: "Che", value: 90 },
    { subject: "Eng", value: 80 },
    { subject: "Sci", value: 80 },
  ];

  const stats = [
    {
      label: "Total Exams",
      value: "150",
      icon: <FileText size={26} />,
      sub: "3 active, 5 scheduled",
      iconColor: "text-blue-600",
      bg: "bg-blue-100 dark:bg-blue-900",
    },
    {
      label: "Active Users",
      value: "1,245",
      icon: <Users size={26} />,
      sub: "Online now: 156",
      iconColor: "text-purple-600",
      bg: "bg-purple-100 dark:bg-purple-900",
    },
    {
      label: "Study Materials",
      value: "127",
      icon: <BookOpen size={26} />,
      sub: "2,456 total downloads",
      iconColor: "text-indigo-600",
      bg: "bg-indigo-100 dark:bg-indigo-900",
    },
    {
      label: "Avg. Performance",
      value: "79%",
      icon: <BarChart2 size={26} />,
      sub: "+5% from last month",
      iconColor: "text-green-600",
      bg: "bg-green-100 dark:bg-green-900",
    },
  ];

  const [exams, setExams] = useState([
    { id: 1, title: "Mathematics Exam", type: "Mixed", duration: "120 min", q: 50, status: "Active", attempts: 245, avg: "78%" },
    { id: 2, title: "Physics Midterm", type: "MCQs", duration: "60 min", q: 40, status: "Schedule", attempts: 0, avg: "0%" },
    { id: 3, title: "Chemistry Practical", type: "Descriptive", duration: "90 min", q: 30, status: "Completed", attempts: 189, avg: "72%" },
    { id: 4, title: "English Literature", type: "Mixed", duration: "120 min", q: 40, status: "Active", attempts: 156, avg: "85%" },
  ]);

  const startEdit = (exam) => {
    setEditId(exam.id);
    setEditData({ ...exam });
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const saveEdit = () => {
    const updated = exams.map((ex) => (ex.id === editId ? { ...editData } : ex));
    setExams(updated);
    setEditId(null);
  };

  const cancelEdit = () => setEditId(null);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 dark:text-gray-100 overflow-hidden">
      <AdminSidebar />

      {/* RIGHT CONTENT */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />

        <main className="flex-1 overflow-y-auto p-6 md:p-8">

          <h1 className="text-3xl font-bold mb-1">Admin Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Welcome to your organization dashboard
          </p>

          {/* STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((s, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{s.label}</p>
                    <p className="text-3xl font-bold mt-1">{s.value}</p>
                  </div>
                  <div className={`${s.bg} ${s.iconColor} p-3 rounded-xl`}>
                    {s.icon}
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* CHARTS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <h3 className="font-semibold mb-4">Exam Performance (Line)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="day" stroke="#aaa" />
                  <YAxis stroke="#aaa" />
                  <Tooltip />
                  <Line type="monotone" dataKey="exam" stroke="#4F46E5" strokeWidth={3} />
                  <Line type="monotone" dataKey="users" stroke="#10B981" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <h3 className="font-semibold mb-4">Subject-wise Performance (Bar)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="subject" stroke="#aaa" />
                  <YAxis stroke="#aaa" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* EXAM TABLE */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Exam Management</h3>

              <button
                onClick={() => navigate("/admin/exams")}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700"
              >
                Create Exam
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium">
                  <tr>
                    <th className="py-3 px-4 text-left">Title</th>
                    <th className="py-3 px-4 text-left">Type</th>
                    <th className="py-3 px-4 text-center">Duration</th>
                    <th className="py-3 px-4 text-center">Questions</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Attempts</th>
                    <th className="py-3 px-4 text-center">Avg Score</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {exams.map((e) => {
                    const isEditing = editId === e.id;

                    return (
                      <tr
                        key={e.id}
                        className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        {/* TITLE */}
                        <td className="py-3 px-4">
                          {isEditing ? (
                            <input
                              name="title"
                              value={editData.title}
                              onChange={handleEditChange}
                              className="border dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg px-2 py-1 w-full"
                            />
                          ) : (
                            e.title
                          )}
                        </td>

                        {/* TYPE */}
                        <td className="py-3 px-4">
                          {isEditing ? (
                            <select
                              name="type"
                              value={editData.type}
                              onChange={handleEditChange}
                              className="border dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg px-2 py-1"
                            >
                              <option>Mixed</option>
                              <option>MCQs</option>
                              <option>Descriptive</option>
                            </select>
                          ) : (
                            e.type
                          )}
                        </td>

                        {/* DURATION */}
                        <td className="py-3 px-4 text-center">
                          {isEditing ? (
                            <input
                              name="duration"
                              value={editData.duration}
                              onChange={handleEditChange}
                              className="border dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg px-2 py-1 w-24 text-center"
                            />
                          ) : (
                            e.duration
                          )}
                        </td>

                        {/* QUESTIONS */}
                        <td className="py-3 px-4 text-center">
                          {isEditing ? (
                            <input
                              name="q"
                              value={editData.q}
                              onChange={handleEditChange}
                              className="border dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg px-2 py-1 w-20 text-center"
                            />
                          ) : (
                            e.q
                          )}
                        </td>

                        {/* STATUS */}
                        <td className="py-3 px-4 text-center">
                          {isEditing ? (
                            <select
                              name="status"
                              value={editData.status}
                              onChange={handleEditChange}
                              className="border dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg px-2 py-1"
                            >
                              <option>Active</option>
                              <option>Schedule</option>
                              <option>Completed</option>
                            </select>
                          ) : (
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                e.status === "Active"
                                  ? "bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200"
                                  : e.status === "Completed"
                                  ? "bg-indigo-200 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-200"
                                  : "bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200"
                              }`}
                            >
                              {e.status}
                            </span>
                          )}
                        </td>

                        {/* ATTEMPTS */}
                        <td className="py-3 px-4 text-center">
                          {isEditing ? (
                            <input
                              name="attempts"
                              value={editData.attempts}
                              onChange={handleEditChange}
                              className="border dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg px-2 py-1 w-20 text-center"
                            />
                          ) : (
                            e.attempts
                          )}
                        </td>

                        {/* AVG */}
                        <td className="py-3 px-4 text-center">
                          {isEditing ? (
                            <input
                              name="avg"
                              value={editData.avg}
                              onChange={handleEditChange}
                              className="border dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg px-2 py-1 w-20 text-center"
                            />
                          ) : (
                            e.avg
                          )}
                        </td>

                        {/* ACTIONS */}
                        <td className="py-3 px-4 flex justify-center gap-3">
                          {isEditing ? (
                            <>
                              <button
                                onClick={saveEdit}
                                className="text-green-600 dark:text-green-300 font-semibold hover:underline"
                              >
                                Save
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="text-red-600 dark:text-red-300 font-semibold hover:underline"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <Eye
                                size={16}
                                onClick={() => setViewExam(e)}
                                className="text-blue-600 dark:text-blue-300 cursor-pointer hover:scale-110 transition"
                              />
                              <Edit
                                size={16}
                                onClick={() => startEdit(e)}
                                className="text-green-600 dark:text-green-300 cursor-pointer hover:scale-110 transition"
                              />
                              <Trash2
                                size={16}
                                onClick={() => setDeleteId(e.id)}
                                className="text-red-600 dark:text-red-300 cursor-pointer hover:scale-110 transition"
                              />
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* VIEW POPUP */}
      {viewExam && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-[90%] max-w-md">
            <h3 className="text-xl font-semibold mb-3">Exam Details</h3>

            <div className="space-y-2">
              <p><strong>Title:</strong> {viewExam.title}</p>
              <p><strong>Type:</strong> {viewExam.type}</p>
              <p><strong>Duration:</strong> {viewExam.duration}</p>
              <p><strong>Questions:</strong> {viewExam.q}</p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    viewExam.status === "Active"
                      ? "bg-green-100 dark:bg-green-700 text-green-700 dark:text-green-200"
                      : viewExam.status === "Completed"
                      ? "bg-indigo-100 dark:bg-indigo-700 text-indigo-700 dark:text-indigo-200"
                      : "bg-yellow-100 dark:bg-yellow-700 text-yellow-700 dark:text-yellow-200"
                  }`}
                >
                  {viewExam.status}
                </span>
              </p>
              <p><strong>Attempts:</strong> {viewExam.attempts}</p>
              <p><strong>Average Score:</strong> {viewExam.avg}</p>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setViewExam(null)}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE POPUP */}
      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-80">
            <h3 className="text-lg font-semibold mb-4">Delete Exam?</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
              Are you sure you want to delete exam ID {deleteId}?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                onClick={() => {
                  setExams(exams.filter((ex) => ex.id !== deleteId));
                  setDeleteId(null);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
