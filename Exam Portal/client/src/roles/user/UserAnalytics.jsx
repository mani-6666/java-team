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
import { Calendar } from "lucide-react";

const SUBJECT_COLORS = [
  "#C7D2FE",
  "#4F46E5",
  "#E5E7EB",
  "#EF4444",
  "#3B82F6",
  "#10B981",
  "#EAB308",
];

const MemoSubscriberChart = React.memo(({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[260px] flex items-center justify-center text-gray-500">
        No assessment data yet
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 10, right: 20, left: -20, bottom: 5 }}>
        <XAxis dataKey="name" tickLine={false} axisLine={false} />
        <YAxis domain={[0, 100]} tickLine={false} axisLine={false} />
        <Bar dataKey="value" fill="#4F46E5" radius={[6, 6, 0, 0]} barSize={45} />
      </BarChart>
    </ResponsiveContainer>
  );
});

const MemoSubjectChart = React.memo(({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[260px] flex items-center justify-center text-gray-500">
        No performance data yet
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 10, right: 20, left: -20, bottom: 5 }}>
        <XAxis dataKey="name" tickLine={false} axisLine={false} />
        <YAxis domain={[0, 100]} tickLine={false} axisLine={false} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={45}>
          {data.map((entry, idx) => (
            <Cell key={idx} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
});

export default function Analytics() {
  const API = "http://localhost:5000/api/user";
  const userId = 1;
  const orgId = null;
  const period = "6months";

  const [summary, setSummary] = useState({});
  const [performance, setPerformance] = useState({});
  const [ranks, setRanks] = useState({});
  const [examChart, setExamChart] = useState([]);
  const [subjectChart, setSubjectChart] = useState([]);

  const [dateFilterOpen, setDateFilterOpen] = useState(false);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  const safe = (v) => (v === undefined || v === null || v === "" ? 0 : v);

  async function loadSummary() {
    try {
      const res = await axios.get(`${API}/analytics/summary`, {
        params: { userId, orgId, period },
      });
      setSummary(res.data?.data || {});
    } catch (err) {
      console.error(err);
      setSummary({});
    }
  }

  async function loadPerformance() {
    try {
      const res = await axios.get(`${API}/analytics/performance`, {
        params: { userId, orgId, period },
      });
      setPerformance(res.data?.data || {});
    } catch (err) {
      console.error(err);
      setPerformance({});
    }
  }

  async function loadRanks() {
    try {
      const res = await axios.get(`${API}/analytics/ranks`, {
        params: { userId, orgId, period },
      });
      setRanks(res.data?.data || {});
    } catch (err) {
      console.error(err);
      setRanks({});
    }
  }

  async function loadExamChart() {
    try {
      const res = await axios.get(`${API}/analytics/exams-chart`, {
        params: { userId, orgId },
      });
      const list = res.data?.data || [];
      const mapped = list.map((x) => ({
        name: x.title,
        value: Number(x.score || 0),
      }));
      setExamChart(mapped);
    } catch (err) {
      console.error(err);
      setExamChart([]);
    }
  }

  async function loadSubjects() {
    try {
      const res = await axios.get(`${API}/analytics/subjects-chart`, {
        params: { userId, orgId, period },
      });
      const list = res.data?.data || [];
      const mapped = list.map((x, i) => ({
        name: x.subject,
        value: Number(x.avg_score || 0),
        color: SUBJECT_COLORS[i % SUBJECT_COLORS.length],
      }));
      setSubjectChart(mapped);
    } catch (err) {
      console.error(err);
      setSubjectChart([]);
    }
  }

  async function loadExamwiseByRange() {
    if (!dateRange.from || !dateRange.to) {
      loadSubjects();
      return;
    }
    try {
      const res = await axios.get(`${API}/analytics/examwise-performance`, {
        params: { userId, orgId, from: dateRange.from, to: dateRange.to },
      });
      const list = res.data?.data?.performance || [];
      const mapped = list.map((x, i) => ({
        name: x.subject,
        value: Number(x.avg_score || 0),
        color: SUBJECT_COLORS[i % SUBJECT_COLORS.length],
      }));
      setSubjectChart(mapped);
    } catch (err) {
      console.error(err);
      setSubjectChart([]);
    }
  }

  useEffect(() => {
    loadSummary();
    loadPerformance();
    loadRanks();
    loadExamChart();
    loadSubjects();
  }, []);

  const apply = () => {
    setDateFilterOpen(false);
    loadExamwiseByRange();
  };

  const clear = () => {
    setDateRange({ from: "", to: "" });
    setDateFilterOpen(false);
    loadSubjects();
  };

  return (
    <UserLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-[#0B1222] px-2 sm:px-4 pt-1 pb-8">
        <div className="max-w-6xl mx-auto w-full">

          <div className="mb-5">
            <h1 className="text-[26px] font-semibold text-gray-900 dark:text-white">
              Analytics
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-[2px]">
              Track your academic progress and performance
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
            <Card title="Exam Summary">
              <Row label="Total Exams" value={safe(summary.totalExams)} />
              <Row label="Attempted" value={safe(summary.attempted)} />
              <Row label="Pending" value={safe(summary.pending)} />
              <Row label="Completion Rate" value={`${safe(summary.completionRate)}%`} />
            </Card>

            <Card title="Performance Metrics">
              <Row label="Average Score" value={`${safe(performance.avg_score)}%`} />
              <Row label="Highest Score" value={`${safe(performance.highest_score)}%`} />
              <Row label="Lowest Score" value={`${safe(performance.lowest_score)}%`} />
            </Card>

            <Card title="Rank in Exams">
              <Row label="Average Rank" value={safe(ranks.averageRank)} />
              <Row label="Last Exam Rank" value={safe(ranks.lastExamRank)} />
              <Row label="Best Exam Rank" value={safe(ranks.recentExamRank)} />
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card>
              <h2 className="text-sm font-semibold mb-4 text-gray-900 dark:text-white">
                Monthly Assessment Wise
              </h2>
              <MemoSubscriberChart data={examChart} />
            </Card>

            <Card>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Exam-wise Performance
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Your Performance across exams
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
                      <p className="text-xs font-semibold mb-2 text-gray-700 dark:text-gray-200">
                        Select Date Range
                      </p>

                      <div className="space-y-2 mb-3">
                        <div>
                          <span className="text-[11px] text-gray-500 dark:text-gray-400">From</span>
                          <input
                            type="date"
                            value={dateRange.from}
                            onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                            className="w-full border rounded-md px-2 py-1 text-xs bg-white dark:bg-[#1F2937]"
                          />
                        </div>

                        <div>
                          <span className="text-[11px] text-gray-500 dark:text-gray-400">To</span>
                          <input
                            type="date"
                            value={dateRange.to}
                            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                            className="w-full border rounded-md px-2 py-1 text-xs bg-white dark:bg-[#1F2937]"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <button onClick={clear} className="px-3 py-1 rounded-md text-xs border">
                          Clear
                        </button>
                        <button onClick={apply} className="px-3 py-1 rounded-md text-xs bg-[#4F46E5] text-white">
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

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-600 dark:text-gray-400">{label}</span>
      <span className="text-gray-900 dark:text-gray-100 font-medium">{value}</span>
    </div>
  );
}
