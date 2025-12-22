import React, { useEffect, useState } from "react";
import { Clock, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const StudentSubmissions = () => {
  const navigate = useNavigate();

  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const res = await axios.get("/api/submission/exams", {
        withCredentials: true,
      });
      setExams(res.data.exams || []);
    } catch (err) {
      setError("Failed to load exams");
    }
    setLoading(false);
  };

  const getStatusColor = (status) =>
    status === "Completed"
      ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
      : "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300";

  return (
    <>
     
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Student Submissions
      </h1>
      <p className="text-gray-500 dark:text-gray-300 mb-10">
        Evaluate and grade student submissions
      </p>

      {loading && <p className="text-gray-500">Loading exams...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && exams.length === 0 && (
        <p className="text-gray-500">No exams found.</p>
      )}


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {exams.map((exam, index) => (
          <div
            key={index}
            className="
              p-6 rounded-2xl
              bg-white dark:bg-[#141414]
              border border-gray-300 dark:border-gray-700
            "
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                  {exam.exam_title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {exam.exam_description || "No description"}
                </p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  exam.exam_status
                )}`}
              >
                {exam.exam_status}
              </span>
            </div>

           
            <div className="flex gap-8 mb-6">
              <Metric label="Total" value={exam.total} />
              <Metric label="Graded" value={exam.graded} color="text-green-500" />
              <Metric label="Pending" value={exam.pending} color="text-red-500" />
            </div>

            <div className="space-y-2 mb-6 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Clock size={14} />
                <span>{exam.duration} mins</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText size={14} />
                <span>{exam.total_questions} questions</span>
              </div>
            </div>

          
            <span className="inline-block mb-6 px-3 py-1 text-xs font-medium border border-blue-500 text-blue-500 rounded-full">
              {exam.exam_type}
            </span>

      
            <button
              onClick={() => navigate("/gradingqueue")}
              className="
                w-full py-2.5 rounded-lg
                bg-blue-600 hover:bg-blue-700
                text-white font-medium transition
              "
            >
              Start Grading
            </button>
          </div>
        ))}
      </div>
    </>
  );
};

export default StudentSubmissions;

function Metric({ label, value, color = "text-gray-900 dark:text-white" }) {
  return (
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}