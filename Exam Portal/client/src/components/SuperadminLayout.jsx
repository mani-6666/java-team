import React, { useEffect, useState, useRef } from "react";
import { NavLink } from "react-router-dom";
import NotificationDropdown from "../common_files/NotificationDropdown";

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


function AdminProfile({ onClose, profile, setProfile }) {
  const [isEdit, setIsEdit] = useState(false);
  const [temp, setTemp] = useState(profile);

  useEffect(() => {
    setTemp(profile);
  }, [profile]);

  const handleSave = () => {
    setProfile(temp);
    setIsEdit(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999]">
      <div className="bg-white dark:bg-[#1a1a1a] w-[90%] max-w-lg rounded-2xl shadow-xl p-6 relative text-black dark:text-white transition max-h-[90vh] overflow-y-auto">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
        >
          <X size={22} className="text-gray-700 dark:text-gray-300" />
        </button>

      
        <h2 className="text-2xl font-semibold text-center my-3">
          User Profile
        </h2>

    
        <div className="flex justify-center mb-6">
          <img
            src="https://i.pravatar.cc/300"
            alt="profile"
            className="w-28 h-28 rounded-full object-cover border-4 border-[#4f6df5]"
          />
        </div>

    
        <div className="flex flex-col gap-4">

          <div>
            <label className="text-sm">Full Name</label>
            <input
              disabled={!isEdit}
              value={temp.name}
              onChange={(e) => setTemp({ ...temp, name: e.target.value })}
              className="w-full mt-1 p-2 rounded-lg bg-gray-100 dark:bg-[#242424]"
            />
          </div>

          <div>
            <label className="text-sm">Email</label>
            <input
              disabled={!isEdit}
              value={temp.email}
              onChange={(e) => setTemp({ ...temp, email: e.target.value })}
              className="w-full mt-1 p-2 rounded-lg bg-gray-100 dark:bg-[#242424]"
            />
          </div>

          <div>
            <label className="text-sm">Phone</label>
            <input
              disabled={!isEdit}
              value={temp.phone}
              onChange={(e) => setTemp({ ...temp, phone: e.target.value })}
              className="w-full mt-1 p-2 rounded-lg bg-gray-100 dark:bg-[#242424]"
            />
          </div>

          <div>
            <label className="text-sm">Gender</label>
            <input
              disabled={!isEdit}
              value={temp.gender || "Male"}
              onChange={(e) => setTemp({ ...temp, gender: e.target.value })}
              className="w-full mt-1 p-2 rounded-lg bg-gray-100 dark:bg-[#242424]"
            />
          </div>

          <div>
            <label className="text-sm">Age</label>
            <input
              disabled={!isEdit}
              value={temp.age}
              onChange={(e) => setTemp({ ...temp, age: e.target.value })}
              className="w-full mt-1 p-2 rounded-lg bg-gray-100 dark:bg-[#242424]"
            />
          </div>
        </div>

       
        <div className="flex justify-center gap-4 mt-6 pb-2">
          <button
            onClick={() => {
              if (isEdit) setTemp(profile);
              setIsEdit(!isEdit);
            }}
            className="px-8 py-2 rounded-lg border border-[#4f6df5] text-[#4f6df5] hover:bg-[#e8edff]"
          >
            {isEdit ? "Cancel" : "Edit"}
          </button>

          <button
            onClick={handleSave}
            disabled={!isEdit}
            className={`px-8 py-2 rounded-lg bg-[#4f6df5] text-white ${
              !isEdit && "opacity-50 cursor-not-allowed"
            }`}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}


export function Superadmin_Navbar({ setOpenProfile }) {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [openNotif, setOpenNotif] = useState(false);
  const notifRef = useRef(null);

  const [notifications, setNotifications] = useState([
    {
      title: "Security Update: Token Management",
      desc: "Secure your integration with the new token management system to safeguard your API keys.",
      time: "Today at 9:42 AM",
      read: false,
      cta: "Verify now",
    },
    {
      title: "Security Update: Token Management",
      desc: "Secure your integration with the new token management system to safeguard your API keys.",
      time: "Today at 9:42 AM",
      read: false,
    },
    {
      title: "Security Update: Token Management",
      desc: "Secure your integration with the new token management system to safeguard your API keys.",
      time: "Today at 9:42 AM",
      read: false,
      cta: "Verify now",
    },
  ]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setOpenNotif(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    theme === "dark"
      ? document.documentElement.classList.add("dark")
      : document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div className="w-full h-16 fixed md:static top-0 left-0 z-[50] bg-white dark:bg-[#1a1a1a] border-b dark:border-gray-700 flex items-center justify-between px-3 sm:px-6">

      <div></div>

      <div className="flex items-center gap-3 sm:gap-6">

        {/* THEME SWITCH */}
        <label className="relative inline-flex items-center cursor-pointer scale-90 sm:scale-100">
          <input
            type="checkbox"
            checked={theme === "dark"}
            onChange={() => setTheme(theme === "light" ? "dark" : "light")}
            className="sr-only peer"
          />
          <div className="w-10 h-5 sm:w-12 sm:h-6 bg-gray-300 dark:bg-gray-600 peer-checked:bg-[#4f6df5] rounded-full transition"></div>
          <div className="absolute w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full top-0.5 left-0.5 transition-transform peer-checked:translate-x-5 sm:peer-checked:translate-x-6"></div>
        </label>

        {/* NOTIFICATION BUTTON */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setOpenNotif(!openNotif)}
            className="relative flex items-center justify-center"
          >
            <Bell size={22} className="text-black dark:text-white" />
            <span className="absolute -top-2 -right-2 bg-red-600 text-white w-5 h-5 rounded-full text-[10px] flex items-center justify-center">
              {notifications.filter((n) => !n.read).length}
            </span>
          </button>

          {openNotif && (
            <NotificationDropdown
              notifications={notifications}
              setNotifications={setNotifications}
            />
          )}
        </div>

        {/* PROFILE IMAGE */}
        <img
          src="https://i.pravatar.cc/300"
          alt="profile"
          className="w-10 h-10 rounded-full cursor-pointer"
          onClick={() => setOpenProfile(true)}
        />
      </div>
    </div>
  );
}


export function Superadmin_Sidebar() {
  const [open, setOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(true);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`md:hidden fixed top-4 left-4 z-[60] bg-white dark:bg-[#222] p-2 rounded-lg shadow ${
          open ? "hidden" : "inline-flex"
        }`}
      >
        <Menu size={24} className="text-[#4f6df5]" />
      </button>

      <div
        className={`fixed top-0 left-0 h-screen w-64 bg-white dark:bg-[#111] border-r dark:border-gray-700 px-6 py-6 z-50 transition-transform duration-300 ${
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
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg ${
                  isActive
                    ? "bg-[#E8EDFF] text-[#4f6df5]"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`
              }
            >
              <LayoutDashboard size={20} /> Dashboard
            </NavLink>

            <NavLink
              to="/clients"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg ${
                  isActive
                    ? "bg-[#E8EDFF] text-[#4f6df5]"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`
              }
            >
              <Building2 size={20} /> Client Management
            </NavLink>

            <NavLink
              to="/subscriptions"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg ${
                  isActive
                    ? "bg-[#E8EDFF] text-[#4f6df5]"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`
              }
            >
              <CreditCard size={20} /> Subscription
            </NavLink>

            <button
              onClick={() => setAnalyticsOpen(!analyticsOpen)}
              className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
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
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-md ${
                      isActive
                        ? "bg-[#E8EDFF] text-[#4f6df5]"
                        : "dark:text-gray-200 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`
                  }
                >
                  <DollarSign size={18} /> Revenue
                </NavLink>

                <NavLink
                  to="/users"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-md ${
                      isActive
                        ? "bg-[#E8EDFF] text-[#4f6df5]"
                        : "dark:text-gray-200 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`
                  }
                >
                  <Users size={18} /> Users
                </NavLink>
              </div>
            )}

            <NavLink
              to="/chatbox"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg ${
                  isActive
                    ? "bg-[#E8EDFF] text-[#4f6df5]"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`
              }
            >
              <MessageCircle size={20} /> Chatbox
            </NavLink>
          </div>

          <div className="mt-auto pt-6 border-t dark:border-gray-700">
            <button className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-red-600 transition">
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/30 md:hidden z-40"
        />
      )}
    </>
  );
}


export default function Superadmin_Layout({ children }) {
  const [openProfile, setOpenProfile] = useState(false);

  const [profile, setProfile] = useState({
    name: "Sarah Johnson",
    email: "sara.joh@example.com",
    phone: "+91 1234567890",
    age: "35",
    gender: "Male",
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] flex">
      <Superadmin_Sidebar />

      <div className="md:ml-64 flex-1 flex flex-col">
        <Superadmin_Navbar setOpenProfile={setOpenProfile} />

        <main className="pt-20 p-4 sm:p-6">{children}</main>

        {openProfile && (
          <AdminProfile
            profile={profile}
            setProfile={setProfile}
            onClose={() => setOpenProfile(false)}
          />
        )}
      </div>
    </div>
  );
}
