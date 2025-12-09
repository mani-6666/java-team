import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../adminComponents/AdminLayout";

import {
  BookOpen,
  BarChart2,
  Users,
  FileText,
} from "lucide-react";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const API_BASE = "http://localhost:5000";

  const [cards, setCards] = useState({
    activeUsers: 0,
    onlineUsers: 0,
    studyMaterials: 0,
    totalDownloads: 0,
    totalExams: 0,
    activeExams: 0,
    scheduledExams: 0,
    completedExams: 0,
    avgPerformance: 0,
    performanceChange: 0,
  });

  const [recentExams, setRecentExams] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/dashboard`, {
        credentials: "include",
      });
      const data = await res.json();

      if (data.success) {
        setCards(data.cards);
        setRecentExams(data.recent_exams);

        const chart = data.recent_exams.map((e) => ({
          day: new Date(e.start_date).toLocaleDateString(),
          exam: e.questions,
          users: Math.floor(Math.random() * 400) + 50,
        }));
        setChartData(chart);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    }
  };

  const stats = [
    {
      label: "Total Exams",
      value: cards.totalExams,
      icon: <FileText size={22} />,
      sub: `${cards.activeExams} active • ${cards.scheduledExams} scheduled`,
      iconColor: "text-indigo-600",
    },
    {
      label: "Active Users",
      value: cards.activeUsers,
      icon: <Users size={22} />,
      sub: `Online now: ${cards.onlineUsers}`,
      iconColor: "text-purple-600",
    },
    {
      label: "Study Materials",
      value: cards.studyMaterials,
      icon: <BookOpen size={22} />,
      sub: `${cards.totalDownloads} downloads`,
      iconColor: "text-sky-600",
    },
    {
      label: "Avg Performance",
      value: `${cards.avgPerformance.toFixed(1)}%`,
      icon: <BarChart2 size={22} />,
      sub: `${cards.performanceChange >= 0 ? "+" : ""}${cards.performanceChange.toFixed(1)}% from last month`,
      iconColor: "text-emerald-600",
    },
  ];

  return (
    <AdminLayout>
      {/* HEADER */}
      <div className="mb-6 px-1">
        <h1 className="text-2xl sm:text-3xl font-semibold">
          Admin Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Overview of exams & insights
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <div
            key={i}
            className="rounded-2xl bg-white dark:bg-gray-800 border p-4 sm:p-5 shadow-sm"
          >
            <div className="flex justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className="text-xl sm:text-2xl font-semibold mt-1">
                  {s.value}
                </p>
                <p className="text-xs text-gray-500 mt-2 break-words">
                  {s.sub}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${s.iconColor}`}>
                {s.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CHART */}
      <div className="bg-white dark:bg-gray-800 border rounded-2xl p-4 sm:p-5 mb-10">
        <h3 className="text-sm sm:text-md font-medium mb-2">
          Recent Exam Trend
        </h3>
        <div className="h-52 sm:h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="exam"
                stroke="#4F46E5"
                fill="#6366F1"
                opacity={0.4}
              />
              <Area
                type="monotone"
                dataKey="users"
                stroke="#10B981"
                fill="#34D399"
                opacity={0.4}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* EXAMS TABLE */}
      <div className="bg-white dark:bg-gray-800 border rounded-2xl p-4 sm:p-5">
        <h3 className="text-base sm:text-lg font-semibold mb-4">
          Recent Exams
        </h3>

        {/* MOBILE SCROLL */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="p-3 text-left">Title</th>
                <th className="p-3">Type</th>
                <th className="p-3">Duration</th>
                <th className="p-3">Questions</th>
                <th className="p-3">Start Date</th>
                <th className="p-3">End Date</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>

            <tbody>
              {recentExams.map((e) => (
                <tr key={e.id} className="border-t">
                  <td className="p-3 font-medium whitespace-nowrap">
                    {e.title}
                  </td>
                  <td className="p-3 text-center">{e.type}</td>
                  <td className="p-3 text-center">{e.duration}</td>
                  <td className="p-3 text-center">{e.questions}</td>
                  <td className="p-3 text-center whitespace-nowrap">
                    {e.start_date}
                  </td>
                  <td className="p-3 text-center whitespace-nowrap">
                    {e.end_date}
                  </td>
                  <td className="p-3 text-center">
                    <StatusPill status={e.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

function StatusPill({ status }) {
  const base = "px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap";

  if (status === "active")
    return (
      <span className={`${base} bg-emerald-100 text-emerald-800`}>
        Active
      </span>
    );

  if (status === "completed")
    return (
      <span className={`${base} bg-indigo-100 text-indigo-800`}>
        Completed
      </span>
    );

  return (
    <span className={`${base} bg-yellow-100 text-yellow-800`}>
      Upcoming
    </span>
  );
}
