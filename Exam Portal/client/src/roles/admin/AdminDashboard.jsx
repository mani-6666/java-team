import React, { useCallback, useEffect, useState } from "react";
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
const STATUS = {
  ACTIVE: "active",
  COMPLETED: "completed",
  UPCOMING: "upcoming",
};
const API_BASE = import.meta.env.VITE_API_BASE_URL;
export default function AdminDashboard() {
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
  const fetchDashboard = useCallback(async () => {
    const response = await fetch(`${API_BASE}/admin/dashboard`, {
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    const data = await response.json();
    if (!data?.success) {
      return;
    }
    setCards(data.cards ?? {});
    setRecentExams(data.recent_exams ?? []);
    const chart = (data.recent_exams ?? []).map((exam) => ({
      day: new Date(exam.start_date).toLocaleDateString(),
      exam: Number(exam.questions ?? 0),
      users: Number(exam.attempted_users ?? 0),
    }));
    setChartData(chart);
  }, []);
  useEffect(() => {
    fetchDashboard().catch(() => {});
  }, [fetchDashboard]);
  const stats = [
    {
      label: "Total Exams",
      value: cards.totalExams,
      Icon: FileText,
      sub: `${cards.activeExams} active • ${cards.scheduledExams} scheduled`,
      color: "text-indigo-600",
    },
    {
      label: "Active Users",
      value: cards.activeUsers,
      Icon: Users,
      sub: `Online now: ${cards.onlineUsers}`,
      color: "text-purple-600",
    },
    {
      label: "Study Materials",
      value: cards.studyMaterials,
      Icon: BookOpen,
      sub: `${cards.totalDownloads} downloads`,
      color: "text-sky-600",
    },
    {
      label: "Avg Performance",
      value: `${Number(cards.avgPerformance).toFixed(1)}%`,
      Icon: BarChart2,
      sub: `${Number(cards.performanceChange).toFixed(1)}% from last month`,
      color: "text-emerald-600",
    },
  ];
  return (
    <AdminLayout>
      <div className="mb-6 px-1">
        <h1 className="text-2xl sm:text-3xl font-semibold">Admin Dashboard</h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Overview of exams & insights
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, Icon, sub, color }) => (
          <div
            key={label}
            className="rounded-2xl bg-white dark:bg-gray-800 border p-4 sm:p-5 shadow-sm"
          >
            <div className="flex justify-between gap-3">
              <div>
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-xl sm:text-2xl font-semibold mt-1">
                  {value}
                </p>
                <p className="text-xs text-gray-500 mt-2">{sub}</p>
              </div>
              <div className={`p-3 rounded-lg ${color}`}>
                <Icon size={22} />
              </div>
            </div>
          </div>
        ))}
      </div>
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
                fillOpacity={0.4}
              />
              <Area
                type="monotone"
                dataKey="users"
                stroke="#10B981"
                fill="#34D399"
                fillOpacity={0.4}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 border rounded-2xl p-4 sm:p-5">
        <h3 className="text-base sm:text-lg font-semibold mb-4">
          Recent Exams
        </h3>

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
              {recentExams.map((exam) => (
                <tr
                  key={`${exam.id}-${exam.start_date}`}
                  className="border-t"
                >
                  <td className="p-3 font-medium">{exam.title}</td>
                  <td className="p-3 text-center">{exam.type}</td>
                  <td className="p-3 text-center">{exam.duration}</td>
                  <td className="p-3 text-center">{exam.questions}</td>
                  <td className="p-3 text-center">
                    {exam.start_date}
                  </td>
                  <td className="p-3 text-center">
                    {exam.end_date}
                  </td>
                  <td className="p-3 text-center">
                    <StatusPill status={exam.status} />
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
  const base =
    "px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap";
  switch (status) {
    case STATUS.ACTIVE:
      return (
        <span className={`${base} bg-emerald-100 text-emerald-800`}>
          Active
        </span>
      );
    case STATUS.COMPLETED:
      return (
        <span className={`${base} bg-indigo-100 text-indigo-800`}>
          Completed
        </span>
      );
    default:
      return (
        <span className={`${base} bg-yellow-100 text-yellow-800`}>
          Upcoming
        </span>
      );
  }
}
