
import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import axios from "axios";

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

  const [userStats, setUserStats] = useState(null);
  const [examStats, setExamStats] = useState(null);
  const [materialStats, setMaterialStats] = useState(null);

  const [activityData, setActivityData] = useState([]);


  useEffect(() => {
    fetchUserStats();
    fetchExamStats();
    fetchMaterialStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/admin/analytics/stats/users"
      );
      setUserStats(res.data.userStats);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchExamStats = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/admin/analytics/stats/exams"
      );
      setExamStats(res.data.examStats);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMaterialStats = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/admin/analytics/stats/materials"
      );
      setMaterialStats(res.data.materialStats);
    } catch (err) {
      console.error(err);
    }
  };

  const chartSets = {
    Today: [
      { name: "8AM", logins: 12, engagement: 6, activity: 8 },
      { name: "10AM", logins: 18, engagement: 8, activity: 11 },
      { name: "12PM", logins: 22, engagement: 10, activity: 13 },
      { name: "2PM", logins: 15, engagement: 7, activity: 10 },
      { name: "4PM", logins: 19, engagement: 9, activity: 12 },
    ],
    Weekly: [
      { name: "Mon", logins: 42, engagement: 20, activity: 30 },
      { name: "Tue", logins: 38, engagement: 18, activity: 28 },
      { name: "Wed", logins: 45, engagement: 22, activity: 33 },
      { name: "Thu", logins: 50, engagement: 25, activity: 36 },
      { name: "Fri", logins: 43, engagement: 19, activity: 29 },
    ],
    Monthly: [
      { name: "Week 1", logins: 160, engagement: 70, activity: 110 },
      { name: "Week 2", logins: 180, engagement: 85, activity: 120 },
      { name: "Week 3", logins: 175, engagement: 82, activity: 118 },
      { name: "Week 4", logins: 190, engagement: 90, activity: 130 },
    ],
    "6 Months": [
      { name: "Jan", logins: 600, engagement: 250, activity: 400 },
      { name: "Feb", logins: 650, engagement: 280, activity: 420 },
      { name: "Mar", logins: 700, engagement: 300, activity: 450 },
      { name: "Apr", logins: 720, engagement: 330, activity: 490 },
      { name: "May", logins: 680, engagement: 290, activity: 440 },
      { name: "Jun", logins: 750, engagement: 350, activity: 510 },
    ],
    Yearly: [
      { name: "2020", logins: 3000, engagement: 1400, activity: 2100 },
      { name: "2021", logins: 3500, engagement: 1600, activity: 2300 },
      { name: "2022", logins: 3800, engagement: 1700, activity: 2600 },
      { name: "2023", logins: 4200, engagement: 1900, activity: 2900 },
      { name: "2024", logins: 4600, engagement: 2100, activity: 3100 },
    ],
  };

  useEffect(() => {
    setActivityData(chartSets[filter]);
  }, [filter]);

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-1">Analytics & Reports</h1>
      <p className="text-gray-500 mb-6">Detailed analytics and insights</p>

      {/* ----------- STATS CARDS ----------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* USER STATS */}
        <div className="bg-white dark:bg-[#0f0f0f] rounded-xl p-6 shadow">
          <h2 className="font-semibold text-lg mb-4">User Engagement</h2>

          <p className="text-sm">
            Daily Active Users{" "}
            <span className="float-right font-semibold">
              {userStats?.daily_active_users || 0}
            </span>
          </p>

          <p className="text-sm mt-2">
            Weekly Active Users{" "}
            <span className="float-right font-semibold">
              {userStats?.weekly_active_users || 0}
            </span>
          </p>

          <p className="text-sm mt-2">
            Monthly Active Users{" "}
            <span className="float-right font-semibold">
              {userStats?.monthly_active_users || 0}
            </span>
          </p>

          <p className="text-sm mt-2">
            Engagement Rate{" "}
            <span className="float-right font-semibold">
              {(userStats?.engagement_rate || 0).toFixed(1)}%
            </span>
          </p>
        </div>

        {/* EXAM STATS */}
        <div className="bg-white dark:bg-[#0f0f0f] rounded-xl p-6 shadow">
          <h2 className="font-semibold text-lg mb-4">Exam Statistics</h2>

          <p className="text-sm">
            Total Exams Created{" "}
            <span className="float-right font-semibold">
              {examStats?.total_exams_created || 0}
            </span>
          </p>

          <p className="text-sm mt-2">
            Total Attempts{" "}
            <span className="float-right font-semibold">
              {examStats?.total_attempts || 0}
            </span>
          </p>

          <p className="text-sm mt-2">
            Avg Completion Rate{" "}
            <span className="float-right font-semibold">
              {(examStats?.avg_completion_rate || 0).toFixed(1)}%
            </span>
          </p>

          <p className="text-sm mt-2">
            Avg Score{" "}
            <span className="float-right font-semibold">
              {(examStats?.avg_score || 0).toFixed(1)}%
            </span>
          </p>
        </div>

        {/* MATERIAL STATS */}
        <div className="bg-white dark:bg-[#0f0f0f] rounded-xl p-6 shadow">
          <h2 className="font-semibold text-lg mb-4">Content Metrics</h2>

          <p className="text-sm">
            Total Materials{" "}
            <span className="float-right font-semibold">
              {materialStats?.total_materials || 0}
            </span>
          </p>

          <p className="text-sm mt-2">
            Total Downloads{" "}
            <span className="float-right font-semibold">
              {materialStats?.total_downloads || 0}
            </span>
          </p>

          <p className="text-sm mt-2">
            Avg Downloads / Material{" "}
            <span className="float-right font-semibold">
              {Number(materialStats?.avg_download_per_material || 0).toFixed(1)}
            </span>
          </p>

          <p className="text-sm mt-2">
            Most Popular Category{" "}
            <span className="float-right font-semibold">
              {materialStats?.most_popular_category || "--"}
            </span>
          </p>
        </div>
      </div>

      {/* ----------- ACTIVITY CHART ----------- */}
      <div className="bg-white dark:bg-[#0f0f0f] rounded-xl p-6 shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg">User Activity</h2>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border py-2 px-3 rounded-lg bg-white dark:bg-[#1b1b1b]"
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
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />

              <Bar dataKey="logins" fill="#4f6df5" />
              <Bar dataKey="engagement" fill="#ff4136" />
              <Bar dataKey="activity" fill="#fdbc40" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AdminLayout>
  );
}
