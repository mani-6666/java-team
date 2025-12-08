import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

import {
  FileText,
  TrendingUp,
  Trophy,
  BookOpen
} from "lucide-react";

const stats = [
  { id: 1, label: "Total Exams", value: 6, description: "4 currently active" },
  { id: 2, label: "Attempted", value: 3, description: "3 remaining" },
  { id: 3, label: "Avg Score", value: "85%", description: "Across all attempts" },
  { id: 4, label: "Study Materials", value: 5, description: "Available resources" }
];

const upcomingExams = [
  { id: 1, name: "Mathematics Final Exam", date: "2024-11-15", time: "10:00 AM", difficulty: "Hard" },
  { id: 2, name: "English Literature Essay", date: "2024-11-20", time: "2:00 PM", difficulty: "Medium" }
];

const performanceData = [
  { label: "Day 1", score: 65 },
  { label: "Day 2", score: 72 },
  { label: "Day 3", score: 78 },
  { label: "Day 4", score: 82 },
  { label: "Day 5", score: 88 },
  { label: "Day 6", score: 91 },
  { label: "Day 7", score: 85 }
];

const achievements = [
  { id: 1, title: "First Exam Completed", description: "Completed your first exam", date: "2024-11-05" },
  { id: 2, title: "5 Exams Completed", description: "You have completed 5 exams successfully", date: "2024-11-10" },
  { id: 3, title: "Top Performance", description: "Scored above 90% in 3 exams", date: "2024-11-11" }
];

const statIcons = {
  "Total Exams": FileText,
  "Attempted": Trophy,
  "Avg Score": TrendingUp,
  "Study Materials": BookOpen
};

const levelColors = {
  Hard: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300",
  Medium: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-300",
  Easy: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300"
};

function StatusBadge({ status }) {
  return (
    <span className={`px-3 py-[2px] rounded-full text-xs font-medium ${levelColors[status]}`}>
      {status}
    </span>
  );
}

export default function Dashboard() {
  return (
    <div className="w-full h-full text-gray-900 dark:text-white bg-gray-50 dark:bg-[#0D1117] min-h-screen px-4 sm:px-6 py-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold">Welcome Back, Student!</h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          Track your progress and upcoming exams
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {stats.map(item => {
          const Icon = statIcons[item.label];
          return (
            <div
              key={item.id}
              className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
            >
              <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900">
                <Icon size={18} className="text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <p className="text-lg sm:text-xl font-semibold">{item.value}</p>
                <p className="text-sm">{item.label}</p>
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
          <h3 className="font-semibold text-sm mb-2">Performance Progress</h3>

          <div className="h-[200px] sm:h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
                <XAxis dataKey="label" stroke="#9CA3AF" />
                <YAxis domain={[0, 100]} stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    borderRadius: "6px",
                    border: "none",
                    color: "white"
                  }}
                />
                <Line type="monotone" dataKey="score" stroke="#4F46E5" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
          <h3 className="font-semibold text-sm">Upcoming Exams</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Your scheduled exams</p>

          <div className="space-y-3 mt-3">
            {upcomingExams.map(exam => (
              <div
                key={exam.id}
                className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex justify-between items-center"
              >
                <div>
                  <p className="text-sm font-medium">{exam.name}</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    {exam.date} • {exam.time}
                  </p>
                </div>
                <StatusBadge status={exam.difficulty} />
              </div>
            ))}
          </div>
        </div>

      </div>
      <div className="mt-6">
        <h3 className="font-semibold text-sm dark:text-white">Recent Achievements</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 mt-5">
          {achievements.map(item => (
            <div
              key={item.id}
              className="
                flex items-start gap-4
                p-4
                bg-white dark:bg-gray-800
                rounded-xl
                border border-gray-200 dark:border-gray-700
                shadow-sm
                min-h-[110px]
              "
            >
              <div className="h-11 w-11 flex items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900">
                <Trophy size={20} className="text-blue-600 dark:text-blue-300" />
              </div>

              <div className="flex flex-col justify-center">
                <p className="text-sm font-semibold leading-tight">{item.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-tight">
                  {item.description}
                </p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-2">{item.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
