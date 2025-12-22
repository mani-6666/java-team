import React, { useEffect, useState } from "react";
import axios from "axios";
import { Clock, CheckCircle, FileText, FileEdit } from "lucide-react";

const InvigilatorDashboard = () => {
  const [summary, setSummary] = useState({});
  const [recent, setRecent] = useState([]);
  const [progress, setProgress] = useState([]);
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    fetchSummary();
    fetchRecent();
    fetchProgress();
    fetchActivity();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await axios.get("/api/dashboard/summary", { withCredentials: true });
      setSummary(res.data.summary || {});
    } catch (err) {
      console.log("Summary Error:", err);
    }
  };

  const fetchRecent = async () => {
    try {
      const res = await axios.get("/api/dashboard/recent", { withCredentials: true });
      setRecent(res.data.recent_submissions || []);
    } catch (err) {
      console.log("Recent Error:", err);
      setRecent([]);
    }
  };

  const fetchProgress = async () => {
    try {
      const res = await axios.get("/api/dashboard/progress", { withCredentials: true });
      setProgress(res.data.grading_progress || []);
    } catch (err) {
      console.log("Progress Error:", err);
      setProgress([]);
    }
  };

  const fetchActivity = async () => {
    try {
      const res = await axios.get("/api/dashboard/activity", { withCredentials: true });
      setActivity(res.data.grading_activity || []);
    } catch (err) {
      console.log("Activity Error:", err);
      setActivity([]);
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Invigilator Dashboard</h1>
      <p className="text-gray-500 dark:text-gray-300 mb-10">Manage and evaluate student submissions</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <DashboardCard icon={Clock} count={summary.pending_review || 0} label="Pending Review" sub="Awaiting Evaluation" />
        <DashboardCard icon={CheckCircle} count={summary.graded || 0} label="Graded" sub="Completed Evaluation" />
        <DashboardCard icon={FileText} count={summary.total_submissions || 0} label="Total Submissions" sub="All Time" />
        <DashboardCard icon={FileEdit} count={summary.exams_created || 0} label="Exams Created" sub="Total Exams Created" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">

        <div className="p-6 rounded-2xl border bg-white dark:bg-[#141414] col-span-2 border-gray-300 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Submissions</h2>

          <div className="space-y-4 mt-4">
            {(recent || []).map((sub, i) => (
              <div key={i} className="border p-4 rounded-xl bg-white dark:bg-[#222222] border-gray-300 dark:border-gray-700 flex justify-between">
                <div>
                  <h3 className="font-semibold dark:text-white">{sub.student_name}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{sub.exam_title}</p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs">
                    {new Date(sub.submitted_at).toLocaleString()}
                  </p>
                </div>

                <span className="px-4 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300">
                  {sub.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl border bg-white dark:bg-[#141414] border-gray-300 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Grading Progress</h2>

          <div className="space-y-6 mt-5">
            {(progress || []).map((item, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm dark:text-white">
                  <span>{item.exam_title}</span>
                  <span>{item.graded}/{item.total}</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <div className="h-full bg-blue-500" style={{ width: `${item.completion}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>


      <div className="p-6 rounded-xl border bg-white dark:bg-[#141414] border-gray-300 dark:border-gray-700">
        <h2 className="text-xl font-semibold dark:text-white mb-4">Grading Activity</h2>

        <div className="space-y-4">
          {(activity || []).map((a, i) => (
            <div key={i} className="border p-4 rounded-xl bg-white dark:bg-[#222222] border-gray-300 dark:border-gray-700 flex justify-between">
              <div>
                <h3 className="font-semibold dark:text-white">Graded Submission</h3>
                <p className="text-gray-600 dark:text-gray-300">{a.student_name} — {a.exam_title} ({a.marks})</p>
              </div>

              <span className="text-gray-500 dark:text-gray-300 text-sm">
                {new Date(a.graded_at).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default InvigilatorDashboard;

function DashboardCard({ icon: Icon, count, label, sub }) {
  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-[#141414] border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-[#E8EBFF] flex items-center justify-center">
          <Icon size={28} className="text-[#647BFF]" />
        </div>
        <div>
          <div className="text-3xl font-bold dark:text-white">{count}</div>
          <p className="text-gray-600 dark:text-gray-300">{label}</p>
        </div>
      </div>

      <div className="mt-4 border-t dark:border-gray-700" />

      <p className="mt-4 text-gray-500 dark:text-gray-400">{sub}</p>
    </div>
  );
}