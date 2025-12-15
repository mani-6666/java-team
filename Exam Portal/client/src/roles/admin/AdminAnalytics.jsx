import React, { useEffect, useState } from "react";
import AdminLayout from "../adminComponents/AdminLayout";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function AdminAnalytics() {
  const [filter, setFilter] = useState("Today");

  const [userEngagement, setUserEngagement] = useState({
    daily_active_users: 0,
    weekly_active_users: 0,
    monthly_active_users: 0,
    engagement_rate: 0,
  });
  const [examStats, setExamStats] = useState({
    total_exams_created: 0,
    total_attempts: 0,
    avg_completion_rate: 0,
    avg_score: 0,
  });
  const [userStats, setUserStats] = useState({
    total_users: 0,
    total_students: 0,
    total_invigilators: 0,
    active_users: 0,
  });
  const [activityData, setActivityData] = useState([]);

  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

  useEffect(() => {
    fetchUserEngagement();
    fetchExamStats();
    fetchUserStats();
    fetchActivity(filter);

  }, []);

  useEffect(() => {
    fetchActivity(filter);
    
  }, [filter]);

  async function fetchUserEngagement() {
    try {
      const res = await fetch(`${API_BASE}/admin/analytics/stats/user-engagement`, {
        credentials: "include",
      });
      const json = await res.json();
      if (json.success && json.userStats) {
        setUserEngagement(json.userStats);
      }
    } catch (err) {
      console.error("fetchUserEngagement:", err);
    }
  }

  async function fetchExamStats() {
    try {
      const res = await fetch(`${API_BASE}/admin/analytics/stats/exams`, {
        credentials: "include",
      });
      const json = await res.json();
      if (json.success && json.examStats) {
        setExamStats(json.examStats);
      }
    } catch (err) {
      console.error("fetchExamStats:", err);
    }
  }

  async function fetchUserStats() {
    try {
      const res = await fetch(`${API_BASE}/admin/analytics/stats/users`, {
        credentials: "include",
      });
      const json = await res.json();
      if (json.success && json.stats) {
        setUserStats(json.stats);
      }
    } catch (err) {
      console.error("fetchUserStats:", err);
    }
  }

  async function fetchActivity(range) {
    try {
      const res = await fetch(
        `${API_BASE}/admin/analytics/stats/activity?range=${encodeURIComponent(range)}`,
        { credentials: "include" }
      );
      const json = await res.json();
      if (json.success && json.activity) {
        setActivityData(json.activity);
      } else {
       
        setActivityData([]);
      }
    } catch (err) {
      console.error("fetchActivity:", err);
      setActivityData([]);
    }
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-1">Analytics & Reports</h1>
      <p className="text-gray-500 mb-8">Detailed analytics and insights</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white dark:bg-[#0f0f0f] rounded-xl p-6 shadow border border-gray-100">
          <h2 className="font-semibold text-lg mb-4 text-gray-800 dark:text-gray-200">
            User Engagement
          </h2>

          <div className="space-y-3">
            <p className="text-gray-600 text-sm">
              Daily Active Users
              <span className="float-right font-semibold text-gray-900 dark:text-gray-100">
                {userEngagement.daily_active_users ?? 0}
              </span>
            </p>
            <p className="text-gray-600 text-sm">
              Weekly Active Users
              <span className="float-right font-semibold text-gray-900 dark:text-gray-100">
                {userEngagement.weekly_active_users ?? 0}
              </span>
            </p>
            <p className="text-gray-600 text-sm">
              Monthly Active Users
              <span className="float-right font-semibold text-gray-900 dark:text-gray-100">
                {userEngagement.monthly_active_users ?? 0}
              </span>
            </p>

            <p className="text-gray-600 text-sm">
              Engagement Rate
              <span className="float-right font-semibold text-indigo-600">
                {Number(userEngagement.engagement_rate || 0).toFixed(1)}%
              </span>
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0f0f0f] rounded-xl p-6 shadow border border-gray-100">
          <h2 className="font-semibold text-lg mb-4 text-gray-800 dark:text-gray-200">
            Exam Statistics
          </h2>

          <div className="space-y-3">
            <p className="text-gray-600 text-sm">
              Total Exams Created
              <span className="float-right font-semibold">
                {examStats.total_exams_created ?? 0}
              </span>
            </p>
            <p className="text-gray-600 text-sm">
              Total Attempts
              <span className="float-right font-semibold">
                {examStats.total_attempts ?? 0}
              </span>
            </p>
            <p className="text-gray-600 text-sm">
              Average Completion Rate
              <span className="float-right font-semibold">
                {Number(examStats.avg_completion_rate || 0).toFixed(1)}%
              </span>
            </p>
            <p className="text-gray-600 text-sm">
              Average Score
              <span className="float-right font-semibold">
                {Number(examStats.avg_score || 0).toFixed(1)}%
              </span>
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0f0f0f] rounded-xl p-6 shadow border border-gray-100">
          <h2 className="font-semibold text-lg mb-4 text-gray-800 dark:text-gray-200">
            User Statistics
          </h2>

          <div className="space-y-3">
            <p className="text-gray-600 text-sm">
              Total Users
              <span className="float-right font-semibold">{userStats.total_users ?? 0}</span>
            </p>
            <p className="text-gray-600 text-sm">
              Students
              <span className="float-right font-semibold">{userStats.total_students ?? 0}</span>
            </p>
            <p className="text-gray-600 text-sm">
              Invigilators
              <span className="float-right font-semibold">{userStats.total_invigilators ?? 0}</span>
            </p>
            <p className="text-gray-600 text-sm">
              Active Users
              <span className="float-right font-semibold">{userStats.active_users ?? 0}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0f0f0f] rounded-xl p-6 shadow border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">User Activity</h2>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 dark:border-gray-700 py-2 px-3 rounded-lg bg-white dark:bg-[#1b1b1b]"
          >
            <option>Today</option>
            <option>Weekly</option>
            <option>Monthly</option>
            <option>6 Months</option>
            <option>Yearly</option>
          </select>
        </div>

        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#444" />
              <YAxis stroke="#444" />
              <Tooltip />
              <Legend />
              <Bar dataKey="logins" radius={[6, 6, 0, 0]} />
              <Bar dataKey="engagement" radius={[6, 6, 0, 0]} />
              <Bar dataKey="activity" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AdminLayout>
  );
}
