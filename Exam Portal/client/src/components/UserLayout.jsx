import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Bell,
  Settings,
  User,
  Menu,
  LayoutDashboard,
  NotebookTabs,
  BookOpenText,
  BarChart2,
  MessageCircle,
  Trophy,
  LogOut,
  GraduationCap,
} from "lucide-react";

export default function UserLayout({ children }) {
  const [isDark, setIsDark] = useState(localStorage.getItem("theme") === "dark");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const menu = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { label: "My Exam", icon: NotebookTabs, path: "/exams" },
    { label: "Study Materials", icon: BookOpenText },
    { label: "Performance", icon: BarChart2 },
    { label: "Achievements", icon: Trophy },
    { label: "Chatbox", icon: MessageCircle },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-[#0D1117]">
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-gray-900 border-r dark:border-gray-800 flex flex-col shadow-lg transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-64 md:translate-x-0"
        }`}
      >
        <div className="flex items-center gap-2 h-16 px-6 border-b dark:border-gray-800">
          <GraduationCap size={22} className="text-blue-600" />
          <h1 className="text-lg font-semibold text-[#3641EC]">ExamMarkPro</h1>
        </div>

        <nav className="flex flex-col gap-1 px-4 mt-4 flex-1">
          {menu.map(({ label, icon: Icon, path }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={label}
                to={path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm transition ${
                  active
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 font-semibold"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-4">
          <button className="flex items-center gap-3 text-red-600 text-sm w-full px-3 py-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex flex-col flex-1 overflow-hidden md:pl-64">
        <header className="h-16 bg-white dark:bg-gray-900 border-b dark:border-gray-800 flex items-center justify-between px-4 sm:px-8">
          <button
            className="md:hidden p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-4 sm:gap-6 ml-auto">
            <div
              onClick={() => setIsDark(!isDark)}
              className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition ${
                isDark ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transform transition ${
                  isDark ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </div>

            <div className="relative cursor-pointer">
              <Bell size={18} className="text-gray-600 dark:text-gray-300" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-600 rounded-full"></span>
            </div>

            <Settings size={18} className="w-5 h-5 text-gray-600 dark:text-gray-300" />

            <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-300 dark:border-gray-700">
              <img
                src="https://i.pravatar.cc/150?img=32"
                alt="User"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
