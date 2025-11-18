import { useState } from "react";
import {
  LayoutDashboard,
  NotebookTabs,
  BookOpenText,
  TrendingUp,
  CalendarDays,
  MessageCircle,
  Trophy,
  UserRound,
  LogOut,
  GraduationCap
} from "lucide-react";

const menu = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Exam Management", icon: NotebookTabs },
  { label: "Study Materials", icon: BookOpenText },
  { label: "Performance", icon: TrendingUp },
  { label: "Exam Schedule", icon: CalendarDays },
  { label: "Chatbox", icon: MessageCircle },
  { label: "Achievements", icon: Trophy },
  { label: "My Profile", icon: UserRound },
];

export default function Sidebar({ isOpen }) {
  const [active, setActive] = useState("Dashboard");

  return (
    <aside
      className={`
        fixed top-0 left-0 h-full w-64 z-50
        bg-white dark:bg-gray-900 border-r dark:border-gray-800 flex flex-col
        transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-64 md:translate-x-0"}
      `}
    >
      {/* LOGO */}
      <div className="flex items-center gap-2 h-16 px-6 border-b dark:border-gray-800">
        <GraduationCap size={22} className="text-blue-600" />
        <h1 className="text-[18px] font-semibold text-[#3641EC]">ExamMarkPro</h1>
      </div>

      {/* MENU */}
      <nav className="flex flex-col gap-1 px-4 mt-4 flex-1">
        {menu.map(({ label, icon: Icon }) => (
          <button
            key={label}
            onClick={() => setActive(label)}
            className={`
              flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all
              ${
                active === label
                  ? "bg-blue-50 text-blue-600 font-medium dark:bg-blue-900/30 dark:text-blue-300"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }
            `}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </nav>

      {/* LOGOUT */}
      <button className="flex items-center gap-3 text-red-600 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/30 text-sm">
        <LogOut size={18} />
        Logout
      </button>
    </aside>
  );
}
