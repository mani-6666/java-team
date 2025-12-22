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

export default function Analytics() {

  const [summary, setSummary] = useState(null);
  const [breakdown, setBreakdown] = useState(null);
  const [activity, setActivity] = useState(null);
  const [monthlyAttempts, setMonthlyAttempts] = useState([]);
  const [examTypeAttempts, setExamTypeAttempts] = useState([]);

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
    <>
     
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Analytics
      </h1>
      <p className="text-gray-500 dark:text-gray-300 mb-10">
        View your grading statistics and performance
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

        {summary && (
          <div className="p-6 rounded-2xl bg-white dark:bg-[#141414] border border-gray-300 dark:border-gray-700">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
              Grading Summary
            </h3>

            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <Row label="Total Graded" value={summary.total_graded} />
              <Row label="Pending" value={summary.pending} />
              <Row label="Total Exams" value={summary.total_exams} />
              <Row label="Average Time" value={`${summary.avg_time} min`} />
            </div>
          </div>
        )}

        {breakdown && (
          <div className="p-6 rounded-2xl bg-white dark:bg-[#141414] border border-gray-300 dark:border-gray-700">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
              Grading Breakdown
            </h3>

            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <Row label="Coding Exams" value={breakdown.coding_exams} />
              <Row label="Descriptive Exams" value={breakdown.descriptive_exams} />
              <Row label="Mixed Exams" value={breakdown.mixed_exams} />
              <Row label="Total Exams" value={breakdown.total_exams} />
              <Row label="Lowest Score" value={breakdown.lowest_score} />
              <Row label="Improvement %" value={`${breakdown.improvement}%`} />
            </div>
          </div>
        )}

        {activity && (
          <div className="p-6 rounded-2xl bg-white dark:bg-[#141414] border border-gray-300 dark:border-gray-700">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
              Grade Activity
            </h3>

            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <Row label="Graded Today" value={activity.today} />
              <Row label="Graded This Week" value={activity.week} />
              <Row label="Graded This Month" value={activity.month} />
              <Row label="Graded This Year" value={activity.year} />
            </div>
          </div>
        )}

      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-[#141414] border border-gray-300 dark:border-gray-700 mb-10">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Monthly Attempts Trend
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Insight into exam activity
          </p>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyAttempts}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="attempts" stroke="#3B82F6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

 
      <div className="p-6 rounded-2xl bg-white dark:bg-[#141414] border border-gray-300 dark:border-gray-700">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Exam Attempts by Type
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Insights by exam categories
          </p>
        </div>

        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={examTypeAttempts}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="exam_type" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="attempts" fill="#3B82F6" radius={[8, 8, 0, 0]} barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}


function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}