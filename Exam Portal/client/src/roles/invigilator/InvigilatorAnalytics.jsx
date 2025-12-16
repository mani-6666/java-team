
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function InvigilatorAnalytics() {

  // -------------- STATES --------------
  const [summary, setSummary] = useState(null);
  const [breakdown, setBreakdown] = useState(null);
  const [activity, setActivity] = useState(null);
  const [monthlyAttempts, setMonthlyAttempts] = useState([]);
  const [examTypeAttempts, setExamTypeAttempts] = useState([]);

  // dropdowns
  const [lineDropdown, setLineDropdown] = useState(false);
  const [lineFilter, setLineFilter] = useState("Last 2 Weeks");

  const [examDropdown, setExamDropdown] = useState(false);
  const [examFilter, setExamFilter] = useState("All Exams");

  // -------------- FETCH DATA FROM BACKEND --------------
  useEffect(() => {
    fetchSummary();
    fetchBreakdown();
    fetchActivity();
    fetchMonthlyAttempts();
    fetchExamTypeAttempts();
  }, []);

  const fetchSummary = async () => {
    const res = await axios.get("/api/analytics/summary", { withCredentials: true });
    setSummary(res.data.grading_summary);
  };

  const fetchBreakdown = async () => {
    const res = await axios.get("/api/analytics/breakdown", { withCredentials: true });
    setBreakdown(res.data.grading_breakdown);
  };

  const fetchActivity = async () => {
    const res = await axios.get("/api/analytics/activity", { withCredentials: true });
    setActivity(res.data.grade_activity);
  };

  const fetchMonthlyAttempts = async () => {
    const res = await axios.get("/api/analytics/attempts/monthly", { withCredentials: true });
    setMonthlyAttempts(res.data.monthly_attempts);
  };

  const fetchExamTypeAttempts = async () => {
    const res = await axios.get("/api/analytics/attempts/exam-types", { withCredentials: true });
    setExamTypeAttempts(res.data.exam_type_attempts);
  };


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1b1c1f] p-8 transition-all">

      {/* ------------------- HEADER ------------------- */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Analytics
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          View your grading statistics and performance
        </p>
      </div>


      {/* ------------------- SUMMARY CARDS ------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        {/* CARD 1 - Grading Summary */}
        {summary && (
          <div className="bg-white dark:bg-[#23272A] rounded-xl border shadow-sm p-6 border-gray-200 dark:border-[#2f3237]">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Grading Summary
            </h3>

            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <div className="flex justify-between"><span>Total Graded</span><span>{summary.total_graded}</span></div>
              <div className="flex justify-between"><span>Pending</span><span>{summary.pending}</span></div>
              <div className="flex justify-between"><span>Total Exams</span><span>{summary.total_exams}</span></div>
              <div className="flex justify-between"><span>Average Time</span><span>{summary.avg_time} min</span></div>
            </div>
          </div>
        )}

        {/* CARD 2 - Breakdown */}
        {breakdown && (
          <div className="bg-white dark:bg-[#23272A] rounded-xl border shadow-sm p-6 border-gray-200 dark:border-[#2f3237]">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Grading Breakdown
            </h3>

            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <div className="flex justify-between"><span>Coding Exams</span><span>{breakdown.coding_exams}</span></div>
              <div className="flex justify-between"><span>Descriptive Exams</span><span>{breakdown.descriptive_exams}</span></div>
              <div className="flex justify-between"><span>Mixed Exams</span><span>{breakdown.mixed_exams}</span></div>
              <div className="flex justify-between"><span>Total Exams</span><span>{breakdown.total_exams}</span></div>
              <div className="flex justify-between"><span>Lowest Score</span><span>{breakdown.lowest_score}</span></div>
              <div className="flex justify-between"><span>Improvement %</span><span>{breakdown.improvement}%</span></div>
            </div>
          </div>
        )}

        {/* CARD 3 - Activity */}
        {activity && (
          <div className="bg-white dark:bg-[#23272A] rounded-xl border shadow-sm p-6 border-gray-200 dark:border-[#2f3237]">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Grade Activity
            </h3>

            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <div className="flex justify-between"><span>Graded Today</span><span>{activity.today}</span></div>
              <div className="flex justify-between"><span>Graded This Week</span><span>{activity.week}</span></div>
              <div className="flex justify-between"><span>Graded This Month</span><span>{activity.month}</span></div>
              <div className="flex justify-between"><span>Graded This Year</span><span>{activity.year}</span></div>
            </div>
          </div>
        )}

      </div>



      {/* ------------------- LINE CHART ------------------- */}
      <div className="bg-white dark:bg-[#23272A] rounded-xl border shadow-sm p-6 mb-8 border-gray-200 dark:border-[#2f3237]">

        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">Monthly Attempts Trend</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Insight into exam activity</p>
          </div>

        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyAttempts}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="month" tick={{ fill: "#ccc" }} />
            <YAxis tick={{ fill: "#ccc" }} />
            <Tooltip contentStyle={{ background: "#222", border: "none", color: "#fff" }} />
            <Line type="monotone" dataKey="attempts" stroke="#4F6BFF" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>



      {/* ------------------- BAR CHART ------------------- */}
      <div className="bg-white dark:bg-[#23272A] rounded-xl border shadow-sm p-6 border-gray-200 dark:border-[#2f3237]">

        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">Exam Attempts by Type</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Insights by exam categories</p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={examTypeAttempts}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#444" />
            <XAxis dataKey="exam_type" tick={{ fill: "#ccc" }} />
            <YAxis tick={{ fill: "#ccc" }} />
            <Tooltip contentStyle={{ background: "#222", border: "none", color: "#fff" }} />
            <Bar dataKey="attempts" fill="#4F6BFF" radius={[8, 8, 0, 0]} barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}

