import { useState } from "react";
import {
  Clock,
  FileText,
  Play,
  ChevronDown,
  ChevronUp
} from "lucide-react";

export default function MyExam() {
  const [filter1, setFilter1] = useState("All");
  const [filter2, setFilter2] = useState("");
  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);

  const [finalFilter, setFinalFilter] = useState({
    sort: null,
    type: null,
    status: null,
  });

  const filter1Options = ["All", "Name", "Date", "Type", "Status"];
  const filter2Options = {
    All: [],
    Name: ["Ascending (A→Z)", "Descending (Z→A)"],
    Date: ["Ascending", "Descending"],
    Type: ["Mock Test", "Organization Test"],
    Status: ["Active", "Inactive"],
  };
  const originalExams = [
    {
      id: 1,
      name: "Mathematics Final Exam",
      type: "Mock Test",
      duration: 120,
      questions: 50,
      deadline: "2024-11-15",
      status: "Active",
      button: "start",
    },
    {
      id: 2,
      name: "Physics Midterm",
      type: "",
      duration: 90,
      questions: 40,
      deadline: "2024-11-15",
      status: "Active",
      attempted: true,
      notAttempted: true,
      missed: true,
      score: 85,
      button: "start",
    },
    {
      id: 3,
      name: "Chemistry Lab Test",
      type: "Organization Test",
      duration: 120,
      questions: 50,
      deadline: "2024-11-15",
      status: "Inactive",
      button: "completed",
    },
    {
      id: 4,
      name: "Mathematics 1st Term Exam",
      type: "",
      duration: 120,
      questions: 50,
      deadline: "2024-11-15",
      status: "Inactive",
      missed: true,
      button: "missed",
    },
  ];

  const applyFilter = () => {
    let data = [...originalExams];

    if (finalFilter.sort === "name-asc")
      data.sort((a, b) => a.name.localeCompare(b.name));
    if (finalFilter.sort === "name-desc")
      data.sort((a, b) => b.name.localeCompare(a.name));
    if (finalFilter.sort === "date-new")
      data.sort((a, b) => new Date(b.deadline) - new Date(a.deadline));
    if (finalFilter.sort === "date-old")
      data.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

    if (finalFilter.type)
      data = data.filter((e) => e.type === finalFilter.type);

    if (finalFilter.status)
      data = data.filter((e) => e.status === finalFilter.status);

    return data;
  };

  const finalList = applyFilter();

  const handleFilter1 = (value) => {
    setFilter1(value);
    setFilter2("");
    setFinalFilter({ sort: null, type: null, status: null });
    setOpen1(false);
    setOpen2(false);
  };

  const handleFilter2 = (value) => {
    setFilter2(value);

    if (filter1 === "Name") {
      setFinalFilter({
        sort: value.includes("Asc") ? "name-asc" : "name-desc",
        type: null,
        status: null,
      });
    }

    if (filter1 === "Date") {
      setFinalFilter({
        sort: value.includes("Asc") ? "date-old" : "date-new",
        type: null,
        status: null,
      });
    }

    if (filter1 === "Type") {
      setFinalFilter({
        sort: null,
        type: value,
        status: null,
      });
    }

    if (filter1 === "Status") {
      setFinalFilter({
        sort: null,
        type: null,
        status: value,
      });
    }

    setOpen2(false);
    setOpen1(false);
  };
  const Card = ({ exam }) => (
    <div
      className="
        bg-white dark:bg-[#0F1216]
        border border-gray-200 dark:border-gray-700
        rounded-xl p-6 shadow-sm
        h-[280px]
        flex flex-col justify-between
      "
    >
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <h2 className="font-semibold text-[15px] text-gray-900 dark:text-white leading-snug max-w-[70%]">
            {exam.name}
          </h2>

          <span
            className={`
              px-3 py-[3px] text-[11px] rounded-lg border
              ${
                exam.status === "Active"
                  ? "border-green-700 text-green-700"
                  : "border-gray-500 text-gray-500"
              }
            `}
          >
            {exam.status}
          </span>
        </div>
        {exam.type && (
          <span className="inline-block px-3 py-[4px] text-[11px] rounded-lg border border-blue-400 text-blue-600 dark:text-blue-300">
            {exam.type}
          </span>
        )}
        {(exam.attempted || exam.notAttempted || exam.missed) && (
          <div className="flex gap-2">
            {exam.attempted && (
              <span className="px-2 py-[2px] text-[11px] bg-[#E8F9E9] text-[#2E7D32] rounded">Attempted</span>
            )}
            {exam.notAttempted && (
              <span className="px-2 py-[2px] text-[11px] bg-[#FFE0E0] text-[#C62828] rounded">Not Attempted</span>
            )}
            {exam.missed && (
              <span className="px-2 py-[2px] text-[11px] bg-[#FFF4CC] text-[#B78B00] rounded">Missed</span>
            )}
          </div>
        )}
        <div className="flex gap-6 text-gray-700 dark:text-gray-300 text-sm">
          <div className="flex items-center gap-1">
            <Clock size={15} /> {exam.duration} Min
          </div>
          <div className="flex items-center gap-1">
            <FileText size={15} /> {exam.questions} Questions
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Deadline: {exam.deadline}
        </p>
        {exam.score && (
          <>
            <p className="text-xs text-gray-700 dark:text-gray-300">
              Your score:
            </p>
            <div className="w-full h-1.5 bg-gray-200 rounded">
              <div
                className="h-1.5 bg-blue-600 rounded"
                style={{ width: `${exam.score}%` }}
              ></div>
            </div>
          </>
        )}
      </div>
      <div className="mt-4">
        {exam.button === "start" && (
          <button className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium">
            <div className="flex justify-center items-center gap-2">
              <Play size={16} /> Start Exam
            </div>
          </button>
        )}
        {exam.button === "completed" && (
          <div className="flex w-full items-center justify-between gap-3">
            <button className="w-1/2 sm:w-[35%] h-10 bg-[#E5E7EB] text-gray-800 rounded-[10px] text-sm font-medium">
              Completed
            </button>

            <button className="w-1/2 sm:w-[35%] h-10 bg-white dark:bg-transparent border border-blue-600 text-blue-600 dark:text-blue-300 rounded-[10px] text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-950">
              View Result
            </button>
          </div>
        )}
        {exam.button === "missed" && (
          <div className="flex w-full">
            <button className="w-1/2 sm:w-[35%] h-10 bg-[#E5E7EB] text-gray-800 rounded-[10px] text-sm font-medium">
              Missed
            </button>
          </div>
        )}

      </div>
    </div>
  );

  return (
    <div className="w-full bg-gray-50 dark:bg-[#0B0F14] min-h-screen p-4">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Available Exams
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Take mock tests and organization exams
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <button
                className="
                  px-4 py-2 border dark:border-gray-700 rounded-lg
                  bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200
                  flex items-center justify-between gap-2 min-w-[120px]
                "
                onClick={() => {
                  setOpen1(!open1);
                  setOpen2(false);
                }}
              >
                {filter1}
                {open1 ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {open1 && (
                <div className="absolute right-0 mt-2 bg-white dark:bg-gray-800 border dark:border-gray-700 w-40 rounded-lg shadow-lg py-2 z-40">
                  {filter1Options.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleFilter1(option)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <button
                disabled={filter2Options[filter1].length === 0}
                className={`
                  px-4 py-2 border dark:border-gray-700 rounded-lg
                  flex items-center justify-between gap-2 min-w-[120px]
                  ${
                    filter2Options[filter1].length === 0
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
                  }
                `}
                onClick={() => {
                  if (filter2Options[filter1].length > 0) {
                    setOpen2(!open2);
                    setOpen1(false);
                  }
                }}
              >
                {filter2 || "Select"}
                {open2 ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {open2 && (
                <div className="absolute right-0 mt-2 bg-white dark:bg-gray-800 border dark:border-gray-700 w-44 rounded-lg shadow-lg py-2 z-40">
                  {filter2Options[filter1].map((item) => (
                    <button
                      key={item}
                      onClick={() => handleFilter2(item)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {finalList.map((exam) => (
          <Card key={exam.id} exam={exam} />
        ))}
      </div>

    </div>
  );
}
