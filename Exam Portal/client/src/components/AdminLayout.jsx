import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";

import {
  LayoutDashboard,
  FileText,
  Users,
  BookOpen,
  BarChart2,
  MessageSquare,
  LogOut,
  Menu,
  X,
  Bell,
  Settings,
  Trash2,
  Check,
} from "lucide-react";

export default function AdminLayout({ children }) {
  const { pathname } = useLocation();

  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [openNotif, setOpenNotif] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);


  const [notifications, setNotifications] = useState([]);
  const notifRef = useRef(null);

  const [profileOpen, setProfileOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const defaultProfile = {
    name: "Admin",
    email: "admin@example.com",
    phone: "9124590865",
  };

  const [profileForm, setProfileForm] = useState({
    name: defaultProfile.name,
    email: defaultProfile.email,
    phone: defaultProfile.phone,
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [loadedProfile, setLoadedProfile] = useState(defaultProfile);

  
  useEffect(() => {
    const savedNotifs = JSON.parse(localStorage.getItem("admin_notifications") || "[]");
    setNotifications(Array.isArray(savedNotifs) ? savedNotifs : []);

    const savedProfile = JSON.parse(localStorage.getItem("admin_profile") || "null");
    if (savedProfile && typeof savedProfile === "object") {
      setLoadedProfile(savedProfile);
      setProfileForm((p) => ({ ...p, ...savedProfile }));
    } else {
      localStorage.setItem("admin_profile", JSON.stringify(defaultProfile));
      setLoadedProfile(defaultProfile);
      setProfileForm((p) => ({ ...p, ...defaultProfile }));
    }
  }, []);

 
  useEffect(() => {
    const root = document.documentElement;
    theme === "dark"
      ? root.classList.add("dark")
      : root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setOpenNotif(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const saveNotifications = (list) => {
    setNotifications(list);
    localStorage.setItem("admin_notifications", JSON.stringify(list));
  };

  const addNotification = ({ message, type = "info" }) => {
    const n = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      type,
      message,
      read: false,
      time: new Date().toISOString(),
    };
    saveNotifications([n, ...notifications]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const formatTime = (iso) => {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  const markToggle = (id) => {
    saveNotifications(
      notifications.map((n) =>
        n.id === id ? { ...n, read: !n.read } : n
      )
    );
  };

  const deleteNotif = (id) => {
    saveNotifications(notifications.filter((n) => n.id !== id));
  };

  const markAllRead = () => {
    saveNotifications(
      notifications.map((n) => ({ ...n, read: true }))
    );
  };

  const clearAll = () => {
    saveNotifications([]);
  };


  const openProfile = () => {
    setProfileForm({
      name: loadedProfile.name,
      email: loadedProfile.email,
      phone: loadedProfile.phone,
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    });
    setEditMode(false);
    setProfileOpen(true);
  };

  const closeProfile = () => {
    setProfileOpen(false);
    setEditMode(false);
    setProfileForm((p) => ({
      ...p,
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    }));
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((p) => ({ ...p, [name]: value }));
  };

  const validatePasswordStrength = (pwd) => {
    const lengthOK = pwd.length >= 8;
    const upperOK = /[A-Z]/.test(pwd);
    const lowerOK = /[a-z]/.test(pwd);
    const digitOK = /[0-9]/.test(pwd);
    const specialOK = /[!@#$%^&*()?_\-+=~`[\]{}|;:"',.<>/\\]/.test(pwd);
    return {
      ok: lengthOK && upperOK && lowerOK && digitOK && specialOK,
    };
  };

  const saveProfileChanges = () => {
    const changed = [];
    const newName = profileForm.name.trim();
    const newEmail = profileForm.email.trim();
    const newPhone = profileForm.phone.trim();

    if (newName !== loadedProfile.name) changed.push("name");
    if (newEmail !== loadedProfile.email) changed.push("email");
    if (newPhone !== loadedProfile.phone) changed.push("phone");

    const wantsPasswordChange =
      profileForm.currentPassword ||
      profileForm.newPassword ||
      profileForm.confirmNewPassword;

    if (wantsPasswordChange) {
      if (!profileForm.currentPassword) {
        addNotification({
          message: "Enter current password to change password",
          type: "error",
        });
        return;
      }
      if (profileForm.newPassword !== profileForm.confirmNewPassword) {
        addNotification({
          message: "Passwords do not match",
          type: "error",
        });
        return;
      }
      const strength = validatePasswordStrength(profileForm.newPassword);
      if (!strength.ok) {
        addNotification({
          message: "Weak password. Use uppercase, lowercase, number, special char.",
          type: "error",
        });
        return;
      }
      changed.push("password");
    }

    if (changed.length === 0) {
      addNotification({ message: "No changes detected", type: "info" });
      setEditMode(false);
      return;
    }

    const updatedProfile = { name: newName, email: newEmail, phone: newPhone };
    localStorage.setItem("admin_profile", JSON.stringify(updatedProfile));
    setLoadedProfile(updatedProfile);

    changed.forEach((f) =>
      addNotification({ message: `${f} updated`, type: "info" })
    );

    setEditMode(false);
    setProfileOpen(false);
  };

  const menuItems = [
    { id: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { id: "/admin/exams", label: "Exam Menu", icon: <FileText size={20} /> },
    { id: "/admin/users", label: "User Management", icon: <Users size={20} /> },
    { id: "/admin/materials", label: "Study Materials", icon: <BookOpen size={20} /> },
    { id: "/admin/analytics", label: "Analytics & Reports", icon: <BarChart2 size={20} /> },
    { id: "/admin/chat", label: "Chatbox", icon: <MessageSquare size={20} /> },
  ];

  return (
    <div
      className={`min-h-screen flex overflow-hidden transition-all duration-300
      ${theme === "dark" ? "dark bg-[#020202] text-white" : "bg-gray-100 text-black"}`}
    >
    
      <div
        className={`
          fixed top-0 left-0 h-screen w-64 backdrop-blur-xl
          bg-white/70 dark:bg-[#0a0a0a]/70 border-r border-white/30 dark:border-gray-800
          shadow-[0_8px_30px_rgb(0,0,0,0.12)] 
          px-6 py-6 z-40 transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
    
        <div className="md:hidden flex justify-end mb-4">
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg shadow hover:scale-105 transition"
          >
            <X size={22} className="text-[#4f6df5]" />
          </button>
        </div>

       
        <div className="text-[23px] font-bold text-[#4f6df5] mb-9 tracking-wide flex items-center gap-2">
          <span className="drop-shadow">ExamMarkPro</span>
        </div>

      
        <div className="flex flex-col gap-3">
          {menuItems.map((item) => {
            const active = pathname === item.id;
            return (
              <Link
                key={item.id}
                to={item.id}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-[15px] font-medium group transition-all
                  ${
                    active
                      ? "bg-[#E8EDFF] dark:bg-[#1a2447] text-[#4f6df5] shadow-inner"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-gray-800/60"
                  }
                `}
              >
                <div className="group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <span className="text-gray-800 dark:text-gray-200">{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="mt-auto pt-6 border-t border-gray-300/60 dark:border-gray-700/60">
          <button
            className="flex items-center gap-2 text-[15px] font-medium text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>

   
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs md:hidden z-30"
        />
      )}

      <div className="flex-1 flex flex-col md:ml-64 overflow-y-auto dark:bg-[#050505] transition-all">

        <div
          className="
            w-full h-16 px-4 sm:px-6 flex items-center justify-between
            bg-white/80 dark:bg-[#0d0d0d]/80 backdrop-blur-xl 
            border-b border-gray-200 dark:border-gray-800
            shadow-[0_4px_20px_rgb(0,0,0,0.08)]
            sticky top-0 z-40
          "
        >
      
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded-lg bg-gray-200 dark:bg-gray-800 hover:scale-105 transition"
          >
            <Menu size={24} className="text-[#4f6df5]" />
          </button>

          <div />

          <div className="flex items-center gap-5 sm:gap-7">

       
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={theme === "dark"}
                onChange={() =>
                  setTheme(theme === "light" ? "dark" : "light")
                }
                className="sr-only peer"
              />
              <div className="
                w-12 h-6 bg-gray-300 dark:bg-gray-600 peer-checked:bg-[#4f6df5]
                rounded-full transition-all
              " />
              <div className="
                absolute w-5 h-5 bg-white rounded-full top-0.5 left-0.5
                transition-all peer-checked:translate-x-6 shadow
              " />
            </label>

          
            <div ref={notifRef} className="relative">
              <button
                onClick={() => setOpenNotif((p) => !p)}
                className="relative flex items-center justify-center hover:scale-110 transition"
              >
                <Bell size={22} className="text-black dark:text-white" />

                {unreadCount > 0 && (
                  <span
                    className="
                      absolute -top-2 -right-2 bg-red-600 text-white w-4 h-4
                      rounded-full text-[10px] flex items-center justify-center shadow
                    "
                  >
                    {unreadCount}
                  </span>
                )}
              </button>

              {openNotif && (
                <div
                  className="
                    absolute right-0 mt-3 w-80 sm:w-96 max-h-[60vh] overflow-y-auto
                    bg-white/90 dark:bg-[#0e0f10]/90 backdrop-blur-xl
                    shadow-2xl rounded-2xl p-4 border border-gray-200 dark:border-[#2b2b2b]
                    animate-fadeIn z-50
                  "
                >
                  {/* DROPDOWN HEADER */}
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-black dark:text-white">
                      Notifications
                    </h2>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={markAllRead}
                        className="text-sm text-[#4f6df5] hover:underline hover:scale-105 transition"
                      >
                        Mark all read
                      </button>
                      <button
                        onClick={clearAll}
                        className="text-sm text-red-600 hover:underline hover:scale-105 transition"
                      >
                        Clear all
                      </button>
                    </div>
                  </div>

                
                  {notifications.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-300 py-4 text-center">
                      No notifications
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`
                            flex items-start gap-3 p-3 rounded-xl border transition-all
                            ${n.read ? "bg-white/40 dark:bg-[#111]/40 border-transparent" : "bg-[#eef2ff]/70 dark:bg-[#182132]/70 border-[#4f6df5]/20 shadow"}
                          `}
                        >
                        
                          <div className="
                              w-10 h-10 rounded-full bg-[#ebf0ff] dark:bg-[#1d2437]
                              flex items-center justify-center shrink-0 shadow-inner
                            ">
                            <Bell size={18} className="text-[#4f6df5]" />
                          </div>

                          {/* CONTENT */}
                          <div className="flex-1">
                            <p className={`text-sm ${!n.read ? "font-semibold" : ""} text-black dark:text-white`}>
                              {n.message}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {formatTime(n.time)}
                            </p>
                          </div>

                      
                          <div className="flex flex-col items-end gap-2">
                            <button
                              onClick={() => markToggle(n.id)}
                              className="text-xs text-[#4f6df5] hover:underline hover:scale-105 transition"
                            >
                              {n.read ? "Unread" : "Read"}
                            </button>

                            <button
                              onClick={() => deleteNotif(n.id)}
                              className="text-xs text-red-600 hover:underline hover:scale-105 transition"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

        
            <button className="hidden sm:block hover:scale-110 transition">
              <Settings size={20} className="text-black dark:text-white" />
            </button>

            <img
              src="https://i.pravatar.cc/300"
              alt="profile"
              onClick={openProfile}
              className="
                w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover shadow-lg cursor-pointer
                hover:scale-110 transition
              "
            />
          </div>
        </div>

      
        <main className="p-4 sm:p-6">{children}</main>
      </div>


      {profileOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[999] p-4 animate-fadeIn">
          <div
            className="
              w-full max-w-lg bg-white dark:bg-[#0e0e0e]
              rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800
              overflow-hidden animate-scaleIn
            "
          >
       
            <div
              className="
                px-6 py-4 flex items-center justify-between
                border-b border-gray-200 dark:border-gray-700
                bg-white/60 dark:bg-white/5 backdrop-blur-xl
              "
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Profile
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Manage your account details
                </p>
              </div>

              <button
                onClick={closeProfile}
                className="p-2 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-800/50 transition"
              >
                <X size={18} className="text-gray-700 dark:text-gray-200" />
              </button>
            </div>

   
            <div className="px-6 py-5">
           
              {!editMode && (
                <div className="space-y-5">
                  <div>
                    <label className="text-xs text-gray-500">Full Name</label>
                    <div className="mt-1 text-sm text-gray-900 dark:text-white font-medium bg-gray-100/50 dark:bg-gray-800/50 p-2 rounded-lg">
                      {loadedProfile.name}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500">Email</label>
                    <div className="mt-1 text-sm text-gray-900 dark:text-white font-medium bg-gray-100/50 dark:bg-gray-800/50 p-2 rounded-lg">
                      {loadedProfile.email}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500">Phone</label>
                    <div className="mt-1 text-sm text-gray-900 dark:text-white font-medium bg-gray-100/50 dark:bg-gray-800/50 p-2 rounded-lg">
                      {loadedProfile.phone}
                    </div>
                  </div>

                  <div className="flex justify-end pt-3">
                    <button
                      onClick={() => {
                        setProfileForm({
                          ...profileForm,
                          name: loadedProfile.name,
                          email: loadedProfile.email,
                          phone: loadedProfile.phone,
                        });
                        setEditMode(true);
                      }}
                      className="
                        px-5 py-2 bg-[#4f6df5] text-white rounded-lg 
                        hover:bg-[#3e55d6] shadow-md hover:shadow-lg transition
                      "
                    >
                      Edit
                    </button>
                  </div>
                </div>
              )}

              {editMode && (
                <div className="space-y-5">
                  <div>
                    <label className="text-xs text-gray-500">Full Name</label>
                    <input
                      name="name"
                      value={profileForm.name}
                      onChange={handleProfileChange}
                      className="
                        mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                        bg-white dark:bg-[#0f1113]
                        text-sm text-gray-900 dark:text-white
                        shadow-sm focus:ring-2 focus:ring-[#4f6df5]
                      "
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-500">Email</label>
                    <input
                      name="email"
                      value={profileForm.email}
                      onChange={handleProfileChange}
                      className="
                        mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                        bg-white dark:bg-[#0f1113]
                        text-sm shadow-sm text-gray-900 dark:text-white
                        focus:ring-2 focus:ring-[#4f6df5]
                      "
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-500">Phone</label>
                    <input
                      name="phone"
                      value={profileForm.phone}
                      onChange={handleProfileChange}
                      className="
                        mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                        bg-white dark:bg-[#0f1113]
                        text-sm shadow-sm text-gray-900 dark:text-white
                        focus:ring-2 focus:ring-[#4f6df5]
                      "
                    />
                  </div>

                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      Change Password
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Leave blank to keep current password
                    </p>

                    <div className="mt-3 space-y-4">
                      <div>
                        <label className="text-xs text-gray-500">
                          Current Password
                        </label>
                        <input
                          type="password"
                          name="currentPassword"
                          value={profileForm.currentPassword}
                          onChange={handleProfileChange}
                          className="
                            mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                            bg-white dark:bg-[#0f1113] shadow-sm
                            text-sm text-gray-900 dark:text-white
                            focus:ring-2 focus:ring-[#4f6df5]
                          "
                        />
                      </div>

                      <div>
                        <label className="text-xs text-gray-500">
                          New Password
                        </label>
                        <input
                          type="password"
                          name="newPassword"
                          value={profileForm.newPassword}
                          onChange={handleProfileChange}
                          className="
                            mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                            bg-white dark:bg-[#0f1113] shadow-sm
                            text-sm text-gray-900 dark:text-white
                            focus:ring-2 focus:ring-[#4f6df5]
                          "
                        />
                      </div>

                      <div>
                        <label className="text-xs text-gray-500">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          name="confirmNewPassword"
                          value={profileForm.confirmNewPassword}
                          onChange={handleProfileChange}
                          className="
                            mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                            bg-white dark:bg-[#0f1113] shadow-sm
                            text-sm text-gray-900 dark:text-white
                            focus:ring-2 focus:ring-[#4f6df5]
                          "
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      onClick={() => {
                        setEditMode(false);
                      }}
                      className="
                        px-5 py-2 rounded-lg bg-gray-200 dark:bg-gray-700
                        text-sm text-gray-800 dark:text-gray-200
                        hover:bg-gray-300 dark:hover:bg-gray-600 transition
                      "
                    >
                      Cancel
                    </button>

                    <button
                      onClick={saveProfileChanges}
                      className="
                        px-6 py-2 rounded-lg bg-[#4f6df5] text-white
                        hover:bg-[#3e55d6] shadow-md hover:shadow-lg
                        transition text-sm
                      "
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
