import UserLayout from "../usercomponents/UserLayout";
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Calendar, ChevronDown, ChevronUp } from "lucide-react";

const API_BASE = "http://localhost:5000/api/user";

const MemoSubscriberChart = React.memo(({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-[260px] flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
        No exams found for selected period
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 10, right: 20, left: -20, bottom: 5 }}>
        <XAxis dataKey="subject" tickLine={false} axisLine={false} />
        <YAxis domain={[0, 100]} tickLine={false} axisLine={false} />
        <Bar dataKey="averageScore" fill="#4F46E5" radius={[6, 6, 0, 0]} barSize={45} />
      </BarChart>
    </ResponsiveContainer>
  );
});

const MemoSubjectChart = React.memo(({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-[260px] flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
        Select date range and click Apply to view performance
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 10, right: 20, left: -20, bottom: 5 }}>
        <XAxis dataKey="name" tickLine={false} axisLine={false} />
        <YAxis domain={[0, 100]} tickLine={false} axisLine={false} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={45}>
          {data.map((_, i) => (
            <Cell key={i} fill="#4F46E5" />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
});

export default function Analytics() {
  const [period, setPeriod] = useState("6 Months");
  const [openPeriod, setOpenPeriod] = useState(false);
  const [dateFilterOpen, setDateFilterOpen] = useState(false);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  const [summary, setSummary] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [ranks, setRanks] = useState(null);
  const [examChart, setExamChart] = useState([]);
  const [subjectChart, setSubjectChart] = useState([]);

  const periodParam = period === "6 Months" ? "6months" : "1year"; 

  useEffect(() => {
    fetchSummary();
    fetchMetrics();
    fetchRanks();
    fetchMonthlyAssessment();
  }, [period]);

  const fetchSummary = async () => {
    try {
      const res = await axios.get(`${API_BASE}/analytics/summary`, {
        withCredentials: true,
      });
      setSummary(res.data.success ? res.data.data : null);
    } catch (err) {
      console.error("Summary API error:", err);
      setSummary(null);
    }
  };

  const fetchMetrics = async () => {
    try {
      const res = await axios.get(`${API_BASE}/analytics/performance`, {
        withCredentials: true,
      });
      setMetrics(res.data.success ? res.data.data : null);
    } catch (err) {
      console.error("Metrics API error:", err);
      setMetrics(null);
    }
  };

  const fetchRanks = async () => {
    try {
      const res = await axios.get(`${API_BASE}/analytics/ranks`, {
        withCredentials: true,
      });
      setRanks(res.data.success ? res.data.data : null);
    } catch (err) {
      console.error("Ranks API error:", err);
      setRanks(null);
    }
  };

  const fetchMonthlyAssessment = async () => {
    try {
      const res = await axios.get(`${API_BASE}/analytics/monthly-assessment`, {
        params: {
          period: periodParam,
        },
        withCredentials: true,
      });
      if (res.data?.success) {
        setExamChart(res.data.data || []);
      }

    } catch (err) {
      console.error("Monthly assessment error:", err);
      setExamChart([]);
    }
  };

  const applyDateFilter = async () => {
    if (!dateRange.from || !dateRange.to) return;

    try {
      const res = await axios.get(`${API_BASE}/analytics/exam-wise-performance`, {
        params: {
          from: dateRange.from,
          to: dateRange.to,
        },
        withCredentials: true,
      });

      setSubjectChart(
        res.data.success
          ? res.data.data.map((x) => ({
              name: x.subject,
              value: x.score,
            }))
          : []
      );
    } catch (err) {
      console.error("Exam-wise performance error:", err);
      setSubjectChart([]);
    }

    setDateFilterOpen(false);
  };

  const clearDate = () => {
    setDateRange({ from: "", to: "" });
    setSubjectChart([]);
    setDateFilterOpen(false);
  };

  return (
    <UserLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-[#0B1222] px-2 sm:px-4 pt-1 pb-8">
        <div className="max-w-6xl mx-auto w-full">

          <div className="mb-5">
            <h1 className="text-[26px] font-semibold text-gray-900 dark:text-white">
              Analytics
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Track your academic progress and performance
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
            <Card title="Exam Summary">
              <Row label="Total Exams" value={summary?.totalExams ?? "-"} />
              <Row label="Attempted" value={summary?.attempted ?? "-"} />
              <Row label="Pending" value={summary?.pending ?? "-"} />
              <Row
                label="Completion Rate"
                value={`${summary?.completionRate ?? 0}%`}
              />
            </Card>

            <Card title="Performance Metrics">
              <Row
                label="Average Score"
                value={`${metrics?.averageScore ?? 0}%`}
              />
              <Row
                label="Highest Score"
                value={`${metrics?.highestScore ?? 0}%`}
              />
              <Row
                label="Lowest Score"
                value={`${metrics?.lowestScore ?? 0}%`}
              />
              <Row
                label="Improvement"
                value={`${metrics?.improvement ?? 0}%`}
                isGreen
              />
            </Card>

            <Card title="Rank in Exam">
              <Row label="Average Rank" value={ranks?.averageRank ?? "-"} />
              <Row label="Last Exam Rank" value={ranks?.lastExamRank ?? "-"} />
              <Row label="Best Exam Rank" value={ranks?.bestExamRank ?? "-"} />
              <Row
                label="OverAll Subject Rank"
                value={ranks?.overallSubjectRank ?? "-"}
              />
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Monthly Assessment Wise
                </h2>
                <DropdownSimple
                  open={openPeriod}
                  setOpen={setOpenPeriod}
                  value={period}
                  onChange={setPeriod}
                  options={["6 Months", "1 Year"]}
                />
              </div>
              <MemoSubscriberChart data={examChart} />
            </Card>

            <Card>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Exam-wise Performance
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Your performance across exams
                  </p>
                </div>

                <div className="relative">
                  <button
                    onClick={() => setDateFilterOpen(!dateFilterOpen)}
                    className="p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1F2937]"
                  >
                    <Calendar size={18} />
                  </button>

                  {dateFilterOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-3 z-50">
                      <div className="space-y-3 mb-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            From
                          </span>
                          <input
                            type="date"
                            value={dateRange.from}
                            onChange={(e) =>
                              setDateRange({ ...dateRange, from: e.target.value })
                            }
                            className="w-full border rounded-md px-2 py-1 text-xs"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            To
                          </span>
                          <input
                            type="date"
                            value={dateRange.to}
                            onChange={(e) =>
                              setDateRange({ ...dateRange, to: e.target.value })
                            }
                            className="w-full border rounded-md px-2 py-1 text-xs"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={clearDate}
                          className="px-3 py-1 rounded-md text-xs border"
                        >
                          Clear
                        </button>
                        <button
                          onClick={applyDateFilter}
                          className="px-3 py-1 rounded-md text-xs bg-[#4F46E5] text-white"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <MemoSubjectChart data={subjectChart} />
            </Card>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}

function Card({ children, title }) {
  return (
    <div className="bg-white dark:bg-[#111827] rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
      {title && (
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}

function Row({ label, value, isGreen }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-600 dark:text-gray-400">{label}</span>
      <span
        className={
          isGreen
            ? "text-green-600 font-semibold"
            : "text-gray-900 dark:text-gray-100 font-medium"
        }
      >
        {value}
      </span>
    </div>
  );
}

function DropdownSimple({ open, setOpen, value, onChange, options }) {
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="px-4 py-2 border rounded-md text-sm flex items-center justify-between min-w-[140px]
        bg-white dark:bg-[#1F2937] text-gray-900 dark:text-gray-200 border-gray-300 dark:border-gray-700"
      >
        {value}
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-full bg-white dark:bg-[#1F2937]
          border border-gray-300 dark:border-gray-700 rounded-md shadow-lg z-50">
          {options.map((o) => (
            <button
              key={o}
              onClick={() => {
                onChange(o);
                setOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-sm
              text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
