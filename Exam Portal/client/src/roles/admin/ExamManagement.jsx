import React from "react";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";

export default function ExamManagement() {
  const summary = [
    { label: "Total Exams", value: 48 },
    { label: "Active Exams", value: 3 },
    { label: "Scheduled", value: 5 },
    { label: "Completed", value: 40 },
  ];

  const exams = [
    {
      title: "Mathematics Exam",
      type: "Mixed",
      duration: "120 min",
      q: 50,
      status: "Active",
      attempts: 245,
      avg: "78%",
    },
    {
      title: "Physics Midterm",
      type: "MCQs",
      duration: "60 min",
      q: 40,
      status: "Schedule",
      attempts: 0,
      avg: "0%",
    },
    {
      title: "Chemistry Practical",
      type: "Descriptive",
      duration: "90 min",
      q: 30,
      status: "Completed",
      attempts: 189,
      avg: "72%",
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader />

        <main className="p-8">
          <h1 className="text-3xl font-bold mb-2">Exam Management</h1>
          <p className="text-gray-500 mb-6">Create, edit and manage exams</p>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {summary.map((s, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-2xl shadow border border-gray-100"
              >
                <p className="text-sm text-gray-500">{s.label}</p>
                <p className="text-2xl font-bold mt-2">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Exams Table */}
          <div className="bg-white p-6 rounded-2xl shadow border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">All Exams</h3>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                Create Exam
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 text-gray-600">
                  <tr>
                    <th className="py-3 px-4 text-left">Title</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Questions</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Attempts</th>
                    <th className="py-3 px-4">Avg Score</th>
                    <th className="py-3 px-4">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {exams.map((e, i) => (
                    <tr
                      key={i}
                      className="border-t border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">{e.title}</td>
                      <td className="py-3 px-4 text-center">{e.type}</td>
                      <td className="py-3 px-4 text-center">{e.duration}</td>
                      <td className="py-3 px-4 text-center">{e.q}</td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            e.status === "Active"
                              ? "bg-green-100 text-green-700"
                              : e.status === "Completed"
                              ? "bg-indigo-100 text-indigo-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {e.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">{e.attempts}</td>
                      <td className="py-3 px-4 text-center">{e.avg}</td>

                      <td className="py-3 px-4 text-center">✎ 👁️ 🗑️</td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
