import { useState, useEffect } from "react";
import { Search, Bell, Settings, User, Menu } from "lucide-react";

export default function Navbar({ onMenuClick }) {
  const [isDark, setIsDark] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b dark:border-gray-800 flex items-center justify-between px-4 sm:px-8 gap-4">
      
      {/* MOBILE MENU BUTTON */}
      <button
        className="md:hidden p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800"
        onClick={onMenuClick}
      >
        <Menu size={20} />
      </button>

      {/* SEARCH */}
      <div className="hidden sm:flex items-center gap-2 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-1 bg-[#F4F6F8] dark:bg-gray-800 flex-1">
        <Search size={16} className="text-gray-500 dark:text-gray-400" />
        <input
          type="search"
          placeholder="Search exams..."
          className="bg-transparent w-full text-sm outline-none dark:text-white"
        />
      </div>

      {/* RIGHT ICONS */}
      <div className="flex items-center gap-4 sm:gap-6">

        {/* TOGGLE BUTTON */}
        <div
          onClick={() => setIsDark(!isDark)}
          className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all ${
            isDark ? "bg-blue-600" : "bg-gray-300"
          }`}
        >
          <div
            className={`w-5 h-5 bg-white rounded-full shadow transform transition-all ${
              isDark ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </div>

        <Bell size={18} className="cursor-pointer text-gray-600 dark:text-gray-300" />

        <Settings
          size={18}
          className="hidden sm:block cursor-pointer text-gray-600 dark:text-gray-300"
        />

        <div className="p-1 rounded-full border border-gray-300 dark:border-gray-700">
          <User size={20} className="text-gray-600 dark:text-gray-300" />
        </div>
      </div>
    </header>
  );
}
