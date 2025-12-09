import UserLayout from "../usercomponents/UserLayout";
import { useState } from "react";
import { Clock, FileText, Play, ChevronDown, ChevronUp } from "lucide-react";

const filter1Options = ["All", "Name", "Date", "Type", "Status"];

const filter2Options = {
  All: [],
  Name: ["Ascending (A→Z)", "Descending (Z→A)"],
  Date: ["Ascending", "Descending"],
  Type: ["MCQs", "Coding"],
  Status: ["Active", "Inactive"]
};

const convertDate = (d) => {
  const [day, month, year] = d.split("-");
  return new Date(`${year}-${month}-${day}`);
};

const originalExams = [
  {
    id: 1,
    name: "Mathematics Final Exam",
    type: "MCQs",
    duration: 120,
    questions: 50,
    startDate: "11-11-2024",
    examDate: "15-11-2024",
    deadline: "15-11-2024",
    userStatus: "Active",
    status: "Active",
    button: "start"
  },
  {
    id: 2,
    name: "Physics Midterm",
    type: "MCQs",
    duration: 90,
    questions: 40,
    startDate: "11-11-2024",
    examDate: "15-11-2024",
    deadline: "20-11-2024",
    userStatus: "Active",
    status: "Active",
    attempted: true,
    notAttempted: true,
    missed: true,
    score: 85,
    button: "start"
  },
  {
    id: 3,
    name: "Chemistry Lab Test",
    type: "Coding",
    duration: 120,
    questions: 50,
    startDate: "11-11-2024",
    examDate: "15-11-2024",
    deadline: "10-11-2024",
    userStatus: "Active",
    status: "Inactive",
    button: "completed"
  },
  {
    id: 4,
    name: "Mathematics 1st Term Exam",
    type: "Coding",
    duration: 120,
    questions: 50,
    startDate: "11-11-2024",
    examDate: "15-11-2024",
    deadline: "01-11-2024",
    userStatus: "Active",
    status: "Inactive",
    missed: true,
    button: "missed"
  }
];

function StatusBadge({ status }) {
  return status === "Active" ? (
    <span className="px-2.5 py-[3px] text-[11px] rounded-md border border-green-500 text-green-700 bg-white">
      Active
    </span>
  ) : (
    <span className="px-2.5 py-[3px] text-[11px] rounded-md border border-gray-300 text-gray-600 bg-white">
      Inactive
    </span>
  );
}

function TypeBadge({ type }) {
  return (
    <span className="inline-block px-3 py-[3px] text-[11px] rounded-md bg-[#EEF2FF] text-[#4F46E5] border border-[#DDE3FF]">
      {type}
    </span>
  );
}

function AttemptBadge({ label, variant }) {
  const base = "px-3 py-[3px] text-[11px] rounded-md border bg-white";
  if (variant === "attempted") return <span className={`${base} border-[#4CAF50] text-[#2E7D32]`}>{label}</span>;
  if (variant === "not") return <span className={`${base} border-[#EF4444] text-[#B91C1C]`}>{label}</span>;
  return <span className={`${base} border-[#EAB308] text-[#B45309]`}>{label}</span>;
}

function ExamCard({ exam }) {
  return (
    <div className="
      bg-white dark:bg-[#0F1216]
      border border-gray-200 dark:border-gray-700
      rounded-2xl shadow-sm p-5
      flex flex-col justify-between
      min-h-[300px]
    ">
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <h2 className="text-[15px] font-semibold text-gray-900 dark:text-white leading-tight">
            {exam.name}
          </h2>
          <StatusBadge status={exam.status} />
        </div>

        <div className="flex gap-2 flex-wrap">
          {exam.attempted && <AttemptBadge label="Attempted" variant="attempted" />}
          {exam.notAttempted && <AttemptBadge label="Not Attempted" variant="not" />}
          {exam.missed && <AttemptBadge label="Missed" variant="missed" />}
        </div>

        <TypeBadge type={exam.type} />

        <p className="text-xs text-gray-700 dark:text-gray-300">
          User Status: <span className="text-green-600 dark:text-green-400">{exam.userStatus}</span>
        </p>

        <div className="flex gap-6 text-[13px] text-gray-700 dark:text-gray-300">
          <div className="flex items-center gap-1">
            <Clock size={15} /> {exam.duration} Min
          </div>
          <div className="flex items-center gap-1">
            <FileText size={15} /> {exam.questions} Question
          </div>
        </div>

        <div className="flex gap-6 text-[12px] text-gray-600 dark:text-gray-400">
          <span>Start date: {exam.startDate}</span>
          <span>Start date: {exam.examDate}</span>
        </div>

        <p className="text-[12px] text-gray-600 dark:text-gray-400">
          Deadline: {exam.deadline}
        </p>

        {exam.score && (
          <div className="mt-1">
            <p className="text-[12px] text-gray-700 dark:text-gray-300 mb-1">Your score :</p>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full">
              <div className="h-2 rounded-full bg-[#4F46E5]" style={{ width: `${exam.score}%` }} />
            </div>
          </div>
        )}
      </div>

      <div className="mt-4">

        {exam.button === "start" && (
          <button className="
            w-full h-10 bg-[#4F46E5] text-white rounded-md 
            text-sm font-medium flex items-center justify-center gap-2
          ">
            <Play size={16} /> Start Exam
          </button>
        )}

        {exam.button === "completed" && (
          <div className="flex justify-between items-center gap-6">
            <button className="
              h-9 px-6 bg-[#E5E7EB] rounded-md 
              text-gray-800 text-[13px] font-medium
            ">
              Completed
            </button>

            <button className="
              h-9 px-6 border border-[#4F46E5] text-[#4F46E5]
              dark:text-blue-300 rounded-md text-[13px] font-medium
              bg-white dark:bg-transparent
            ">
              View Result
            </button>
          </div>
        )}

        {exam.button === "missed" && (
          <div className="flex justify-between items-center">
            <button className="
              h-9 px-6 bg-[#E5E7EB] rounded-md 
              text-gray-800 text-[13px] font-medium
            ">
              Missed
            </button>
            <div className="w-24"></div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function MyExam() {
  const [filter1, setFilter1] = useState("All");
  const [filter2, setFilter2] = useState("");
  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);

  const [finalFilter, setFinalFilter] = useState({ sort: null, type: null, status: null });

  const applyFilter = () => {
    let data = [...originalExams];

    if (finalFilter.sort === "date-new")
      data.sort((a, b) => convertDate(b.deadline) - convertDate(a.deadline));

    if (finalFilter.sort === "date-old")
      data.sort((a, b) => convertDate(a.deadline) - convertDate(b.deadline));

    if (finalFilter.sort === "name-asc")
      data.sort((a, b) => a.name.localeCompare(b.name));

    if (finalFilter.sort === "name-desc")
      data.sort((a, b) => b.name.localeCompare(a.name));

    if (finalFilter.type)
      data = data.filter((e) => e.type === finalFilter.type);

    if (finalFilter.status)
      data = data.filter((e) => e.status === finalFilter.status);

    return data;
  };

  const finalList = applyFilter();

  return (
    <UserLayout>
      <div className="w-full min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-[#0B0F14]">
        <div className="max-w-6xl mx-auto space-y-6">

          <div className="pt-1 flex flex-col md:flex-row md:justify-between md:items-center">
            <div>
              <h1 className="text-[26px] font-semibold">Available Exams</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Take mock tests and organization exams
              </p>
            </div>

            <div className="flex gap-3 flex-col sm:flex-row">
              
              <div className="relative">
                <button
                  className="
                    px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md 
                    bg-white dark:bg-gray-800 text-sm min-w-[120px]
                    flex justify-between items-center
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
                  <div className="
                    absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 
                    border border-gray-300 dark:border-gray-700 rounded-md shadow-lg z-50
                  ">
                    {filter1Options.map((o) => (
                      <button
                        key={o}
                        onClick={() => {
                          setFilter1(o);
                          setFilter2("");
                          setFinalFilter({ sort: null, type: null, status: null });
                          setOpen1(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  disabled={filter2Options[filter1].length === 0}
                  className={`
                    px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm 
                    min-w-[120px] flex justify-between items-center 
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
                  <div className="
                    absolute right-0 mt-2 w-44 bg-white dark:bg-gray-800 
                    border border-gray-300 dark:border-gray-700 rounded-md shadow-lg z-50
                  ">
                    {filter2Options[filter1].map((item) => (
                      <button
                        key={item}
                        onClick={() => {
                          setFilter2(item);
                          if (filter1 === "Name")
                            setFinalFilter({ sort: item.includes("Asc") ? "name-asc" : "name-desc" });
                          if (filter1 === "Date")
                            setFinalFilter({ sort: item.includes("Asc") ? "date-old" : "date-new" });
                          if (filter1 === "Type") setFinalFilter({ type: item });
                          if (filter1 === "Status") setFinalFilter({ status: item });
                          setOpen2(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
            {finalList.map((exam) => (
              <ExamCard key={exam.id} exam={exam} />
            ))}
          </div>

        </div>
      </div>
    </UserLayout>
  );
}
