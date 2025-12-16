import React, { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { ChevronDown, ChevronUp } from "lucide-react";
import UserLayout from "../../components/UserLayout";

const MemoSubscriberChart = React.memo(({ data }) => (
  <ResponsiveContainer width="100%" height={260}>
    <BarChart data={data} margin={{ top: 10, right: 20, left: -20, bottom: 5 }}>
      <XAxis
        dataKey="name"
        tickLine={false}
        axisLine={false}
        tick={{ fill: "#6B7280", fontSize: 12 }}
      />
      <YAxis
        domain={[0, 100]}
        ticks={[0, 20, 40, 60, 80, 100]}
        tickLine={false}
        axisLine={false}
        tick={{ fill: "#9CA3AF", fontSize: 11 }}
      />
      <Bar dataKey="value" fill="#4F46E5" radius={[6, 6, 0, 0]} barSize={45} />
    </BarChart>
  </ResponsiveContainer>
));

const MemoSubjectChart = React.memo(({ data }) => (
  <ResponsiveContainer width="100%" height={260}>
    <BarChart data={data} margin={{ top: 10, right: 20, left: -20, bottom: 5 }}>
      <XAxis
        dataKey="name"
        tickLine={false}
        axisLine={false}
        tick={{ fill: "#6B7280", fontSize: 12 }}
      />
      <YAxis
        domain={[0, 100]}
        ticks={[0, 20, 40, 60, 80, 100]}
        tickLine={false}
        axisLine={false}
        tick={{ fill: "#9CA3AF", fontSize: 11 }}
      />
      <Bar
        dataKey="value"
        radius={[6, 6, 0, 0]}
        barSize={45}
        label={({ x, y, width, index }) => (
          <text
            x={x + width / 2}
            y={y - 4}
            fill={data[index].labelColor}
            textAnchor="middle"
            fontSize="11"
            fontWeight="500"
          >
            {data[index].label}
          </text>
        )}
      >
        {data.map((entry, idx) => (
          <Cell key={idx} fill={entry.color} />
        ))}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
));

export default function UserAnalytics() {
  const [subscriberPeriod, setSubscriberPeriod] = useState("3 Months");
  const [openPeriod, setOpenPeriod] = useState(false);

  const subscriberOptions = ["3 Months", "6 Months", "1 Year"];

  const subscriberData = useMemo(
    () => [
      { name: "Mathematics", value: 60 },
      { name: "CSE", value: 95 },
      { name: "Physics", value: 78 },
      { name: "Chemistry", value: 85 },
      { name: "Physics Lab", value: 68 },
    ],
    []
  );

  const subjectData = useMemo(
    () => [
      { name: "Mat", value: 100, color: "#C7D2FE", label: "Mat : 100", labelColor: "#6366F1" },
      { name: "Phy", value: 92, color: "#4F46E5", label: "Phy : 92", labelColor: "#10B981" },
      { name: "Che", value: 90, color: "#E5E7EB", label: "Che : 90", labelColor: "#EAB308" },
      { name: "Eng", value: 80, color: "#E5E7EB", label: "Eng : 80", labelColor: "#EF4444" },
      { name: "Sci", value: 70, color: "#E5E7EB", label: "Sci : 70", labelColor: "#3B82F6" },
    ],
    []
  );

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
              <Row label="Total Exams" value="6" />
              <Row label="Attempted" value="3" />
              <Row label="Pending" value="3" />
              <Row label="Completion Rate" value="50%" />
            </Card>

            <Card title="Performance Metrics">
              <Row label="Average Score" value="85%" />
              <Row label="Highest Score" value="92%" />
              <Row label="Lowest Score" value="78%" />
              <Row label="Improvement" value="+14%" isGreen />
            </Card>

            <Card title="Rank in Exam">
              <Row label="Average Rank" value="3rd" />
              <Row label="Last Exam Rank" value="2nd" />
              <Row label="Best Exam Rank" value="1st" />
              <Row label="Overall Subject Rank" value="2nd" />
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
                  value={subscriberPeriod}
                  onChange={setSubscriberPeriod}
                  options={subscriberOptions}
                />
              </div>

              <MemoSubscriberChart data={subscriberData} />
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
                  <input
                    type="date"
                    className="p-2 rounded-md border border-gray-300 dark:border-gray-700 
                               bg-white dark:bg-[#1F2937] text-gray-700 dark:text-gray-200 
                               text-sm cursor-pointer"
                  />
                </div>
              </div>

              <MemoSubjectChart data={subjectData} />
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
    <div className="flex justify-between">
      <span className="text-gray-600 dark:text-gray-400">{label}</span>
      <span
        className={
          isGreen ? "text-green-600 font-semibold" : "text-gray-900 dark:text-gray-100 font-medium"
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
        className="
          px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md
          bg-white dark:bg-[#1F2937] text-sm text-gray-700 dark:text-gray-200
          flex items-center justify-between min-w-[150px]
        "
      >
        {value}
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {open && (
        <div
          className="
          absolute right-0 mt-2 w-full bg-white dark:bg-[#1F2937]
          border border-gray-300 dark:border-gray-700 rounded-md shadow-lg z-50
        "
        >
          {options.map((item) => (
            <button
              key={item}
              onClick={() => {
                onChange(item);
                setOpen(false);
              }}
              className="
                w-full text-left px-4 py-2 text-sm
                text-gray-700 dark:text-gray-200
                hover:bg-gray-100 dark:hover:bg-gray-800
              "
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
