import React, { useEffect, useState, useRef } from "react";
import { NavLink } from "react-router-dom";
import NotificationDropdown from "../common_files/NotificationDropdown";
import { io } from "socket.io-client";
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  BarChart2,
  DollarSign,
  MessageCircle,
  Menu,
  X,
  LogOut,
  Bell,
  ChevronDown,
  Users,
} from "lucide-react";

export function Superadmin_Navbar() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [openNotif, setOpenNotif] = useState(false);
  const notifRef = useRef(null);

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem("notifications_superadmin");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(
      "notifications_superadmin",
      JSON.stringify(notifications)
    );
  }, [notifications]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setOpenNotif(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (theme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || socketRef.current) return;

    socketRef.current = io("http://localhost:5000", {
      auth: { token },
      transports: ["websocket"],
    });

    socketRef.current.on("notification", (data) => {
      if (!data?.title || !data?.desc) return;
      setNotifications((prev) => [
        { ...data, read: data.read ?? false },
        ...prev,
      ]);
    });

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);

  return (
    <div className="w-full h-16 fixed md:static top-0 left-0 z-[50] bg-white dark:bg-[#1a1a1a] border-b dark:border-gray-700 flex items-center justify-end px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={theme === "dark"}
            onChange={() =>
              setTheme(theme === "light" ? "dark" : "light")
            }
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-checked:bg-[#4f6df5] rounded-full"></div>
          <div className="absolute w-5 h-5 bg-white rounded-full top-0.5 left-0.5 peer-checked:translate-x-5 transition-transform"></div>
        </label>

        <div ref={notifRef} className="relative">
          <button onClick={() => setOpenNotif(!openNotif)}>
            <Bell size={22} className="text-black dark:text-white" />
          </button>
          <span className="absolute -top-2 -right-2 bg-red-600 text-white w-5 h-5 rounded-full text-[10px] flex items-center justify-center">
            {notifications.filter((n) => !n.read).length}
          </span>

          {openNotif && (
            <NotificationDropdown
              notifications={notifications}
              setNotifications={setNotifications}
            />
          )}
        </div>

        <img
          src="https://i.pravatar.cc/300"
          alt="profile"
          className="w-9 h-9 rounded-full"
        />
      </div>
    </div>
  );
}

export function Superadmin_Sidebar() {
  const [open, setOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(true);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-4 left-4 z-[60] bg-white dark:bg-[#222] p-2 rounded-lg shadow"
      >
        <Menu size={24} className="text-[#4f6df5]" />
      </button>

      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-white dark:bg-[#111] border-r dark:border-gray-700 px-6 py-6 z-[70] transform transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          <div className="md:hidden flex justify-end mb-4">
            <button
              onClick={() => setOpen(false)}
              className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
            >
              <X size={22} className="text-[#4f6df5]" />
            </button>
          </div>

          <div className="text-[22px] flex items-center gap-2 font-semibold text-[#4f6df5] mb-8">
            <span className="text-3xl">🎓</span>
            <span>ExamMarkPro</span>
          </div>

          <div className="flex flex-col gap-2 text-[15px]">
            <NavLink to="/" className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg ${
                isActive ? "bg-[#E8EDFF] text-[#4f6df5]" : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`
            }>
              <LayoutDashboard size={20} /> Dashboard
            </NavLink>

            <NavLink to="/clients" className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg ${
                isActive ? "bg-[#E8EDFF] text-[#4f6df5]" : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`
            }>
              <Building2 size={20} /> Client Management
            </NavLink>

            <NavLink to="/subscriptions" className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg ${
                isActive ? "bg-[#E8EDFF] text-[#4f6df5]" : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`
            }>
              <CreditCard size={20} /> Subscription
            </NavLink>

            <button
              onClick={() => setAnalyticsOpen(!analyticsOpen)}
              className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <span className="flex items-center gap-3">
                <BarChart2 size={20} /> Analytics
              </span>
              <ChevronDown
                size={18}
                className={`${analyticsOpen ? "rotate-180" : ""} transition`}
              />
            </button>

           {analyticsOpen && (
  <div className="ml-10 flex flex-col gap-1">
    <NavLink
      to="/revenue"
      className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      <DollarSign size={18} /> Revenue
    </NavLink>

    <NavLink
      to="/users"
      className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      <Users size={18} /> Users
    </NavLink>
  </div>
)}


            <NavLink to="/chatbox" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <MessageCircle size={20} /> Chatbox
            </NavLink>
          </div>

          <div className="mt-auto pt-6 border-t dark:border-gray-700">
            <button className="flex items-center gap-2 hover:text-red-600">
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </aside>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 z-[60] md:hidden"
        />
      )}
    </>
  );
}

export default function Superadmin_Layout({ children }) {
  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-[#050505]">
      <Superadmin_Sidebar />
      <div className="flex flex-col md:ml-64">
        <Superadmin_Navbar />
        <main className="pt-20 p-4 sm:p-6 w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
