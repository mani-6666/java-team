import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  FileText,
  Users,
  BookOpen,
  BarChart2,
  MessageSquare,
  LogOut,
  Menu,
  X,
} from "lucide-react";

export default function AdminSidebar() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  const nav = (to, Icon, label) => {
    const active = pathname === to;

    return (
      <Link
        to={to}
        onClick={() => setOpen(false)}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300
          ${
            active
              ? "bg-blue-600 text-white shadow-md scale-[1.02]"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-white"
          }
        `}
      >
        <Icon size={18} />
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <>
      {/* MOBILE TOP BAR */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-extrabold text-blue-700 dark:text-blue-400">
          Exam<span className="text-teal-500">Mark</span>Pro
        </h1>

        <button onClick={() => setOpen(true)} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
          <Menu size={26} className="text-gray-800 dark:text-gray-200" />
        </button>
      </div>

      {/* BACKDROP */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 md:hidden"
        ></div>
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed md:static top-0 left-0 h-full w-64 
          bg-white dark:bg-gray-900 
          p-6 border-r border-gray-200 dark:border-gray-700 
          flex flex-col shadow-lg z-50 
          transform transition-transform duration-300
          ${
            open
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }
        `}
      >
        {/* Close (Mobile) */}
        <div className="md:hidden flex justify-end mb-4">
          <button
            onClick={() => setOpen(false)}
            className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <X size={24} className="text-gray-800 dark:text-gray-200" />
          </button>
        </div>

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-blue-700 dark:text-blue-400 tracking-wide">
            Exam<span className="text-teal-500">Mark</span>Pro
          </h1>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Admin Dashboard</p>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {nav("/admin/dashboard", Home, "Dashboard")}
          {nav("/admin/exams", FileText, "Exam Management")}
          {nav("/admin/users", Users, "User Management")}
          {nav("/admin/materials", BookOpen, "Study Materials")}
          {nav("/admin/analytics", BarChart2, "Analytics & Reports")}
          {nav("/admin/chat", MessageSquare, "Chatbox")}
        </nav>

        {/* Footer */}
        <div className="mt-auto pt-8 text-center text-xs text-gray-400 dark:text-gray-500 border-t border-gray-200 dark:border-gray-700">
          <Link
            to="/admin/logout"
            className="flex items-center justify-center gap-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            <LogOut size={16} />
            Logout
          </Link>

          <div className="mt-3">© {new Date().getFullYear()} ExamMarkPro</div>
        </div>
      </aside>
    </>
  );
}
