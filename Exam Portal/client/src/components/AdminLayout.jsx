import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  GraduationCap,
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
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL + "/api/admin";

export default function AdminLayout({ children }) {
  const { pathname } = useLocation();

  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [openNotif, setOpenNotif] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const notifRef = useRef(null);

  const [profileOpen, setProfileOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [loadedProfile, setLoadedProfile] = useState(null);

  const [profileForm, setProfileForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    gender: "",
    age: "",
    address: "",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(`${API_BASE}/profile`);
        if (!res.ok) throw new Error(res.statusText);

        const data = await res.json();
        if (!data.success) throw new Error(data.message);

        const p = data.profile;
        setLoadedProfile(p);

        setProfileForm({
          full_name: p.full_name || "",
          email: p.email || "",
          phone: p.phone || "",
          gender: p.gender || "",
          age: p.age || "",
          address: p.address || "",
          currentPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        });
      } catch (err) {
        if (import.meta.env.DEV) console.error("Profile fetch error:", err);
      }
    }
    fetchProfile();
  }, []);

  async function saveProfileToServer(form) {
    try {
      const payload = {
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        gender: form.gender,
        age: form.age,
        address: form.address,
      };

      if (form.newPassword) payload.password = form.newPassword;

      const res = await fetch(`${API_BASE}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(res.statusText);

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      return data.profile;
    } catch (err) {
      if (import.meta.env.DEV) console.error("Save profile error:", err);
      return null;
    }
  }

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("admin_notifications") || "[]");
    setNotifications(saved);
  }, []);

  const saveNotifications = (arr) => {
    setNotifications(arr);
    localStorage.setItem("admin_notifications", JSON.stringify(arr));
  };

  const addNotification = ({ message, type = "info" }) => {
    const n = {
      id: Date.now() + Math.random(),
      type,
      message,
      read: false,
      time: new Date().toISOString(),
    };
    saveNotifications([n, ...notifications]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markToggle = (id) =>
    saveNotifications(
      notifications.map((n) =>
        n.id === id ? { ...n, read: !n.read } : n
      )
    );

  const deleteNotif = (id) =>
    saveNotifications(notifications.filter((n) => n.id !== id));

  const markAllRead = () =>
    saveNotifications(notifications.map((n) => ({ ...n, read: true })));

  const clearAll = () => saveNotifications([]);

  useEffect(() => {
    const root = document.documentElement;
    theme === "dark" ? root.classList.add("dark") : root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setOpenNotif(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openProfile = () => {
    setProfileForm({
      full_name: loadedProfile?.full_name || "",
      email: loadedProfile?.email || "",
      phone: loadedProfile?.phone || "",
      gender: loadedProfile?.gender || "",
      age: loadedProfile?.age || "",
      address: loadedProfile?.address || "",
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
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((p) => ({ ...p, [name]: value }));
  };

  const handleSaveProfile = async () => {
    if (!profileForm.full_name.trim()) {
      addNotification({ message: "Name cannot be empty", type: "error" });
      return;
    }
    if (!profileForm.email.includes("@")) {
      addNotification({ message: "Enter valid email", type: "error" });
      return;
    }
    if (profileForm.phone.length < 10) {
      addNotification({ message: "Phone number too short", type: "error" });
      return;
    }

    const wantsPassword =
      profileForm.currentPassword ||
      profileForm.newPassword ||
      profileForm.confirmNewPassword;

    if (wantsPassword) {
      if (profileForm.newPassword !== profileForm.confirmNewPassword) {
        addNotification({ message: "Passwords do not match", type: "error" });
        return;
      }
    }

    const ok = await saveProfileToServer(profileForm);
    if (!ok) {
      addNotification({ message: "Failed to update profile", type: "error" });
      return;
    }

    addNotification({ message: "Profile updated successfully", type: "info" });
    setLoadedProfile(profileForm);
    setEditMode(false);
  };

  const menuItems = [
    { id: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { id: "/admin/exams", label: "Exam Menu", icon: <FileText size={20} /> },
    { id: "/admin/exam-management", label: "Exam Management", icon: <Users size={20} /> },
    { id: "/admin/users", label: "User Management", icon: <Users size={20} /> },
    { id: "/admin/materials", label: "Study Materials", icon: <BookOpen size={20} /> },
    { id: "/admin/analytics", label: "Analytics & Reports", icon: <BarChart2 size={20} /> },
    { id: "/admin/chat", label: "Chatbox", icon: <MessageSquare size={20} /> },
  ];

  return (
    <div className={`min-h-screen flex overflow-hidden ${theme === "dark" ? "dark bg-[#020202] text-white" : "bg-gray-100"}`}>
      <div
        className={`fixed top-0 left-0 h-screen w-64 bg-white/70 dark:bg-[#0a0a0a]/70 backdrop-blur-xl 
        border-r dark:border-gray-800 shadow px-6 py-6 z-40 transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="md:hidden flex justify-end mb-4">
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
          >
            <X size={22} className="text-[#4f6df5]" />
          </button>
        </div>

        <div className="text-[23px] font-bold text-[#4f6df5] mb-9 flex items-center gap-2">
          <GraduationCap size={26} />
          ExamMarkPro
        </div>

        <div className="flex flex-col gap-3">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              to={item.id}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-[15px]
              ${
                pathname === item.id
                  ? "bg-[#E8EDFF] dark:bg-[#1a2447] text-[#4f6df5]"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-gray-800/60"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </div>

        <div className="mt-auto pt-6 border-t dark:border-gray-700">
          <button className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-red-600">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 md:hidden z-30"
        />
      )}


      <div className="flex-1 flex flex-col md:ml-64 overflow-y-auto dark:bg-[#050505]">
    
        <div className="h-16 px-4 bg-white/80 dark:bg-[#0d0d0d]/80 backdrop-blur-xl 
          border-b dark:border-gray-800 shadow flex items-center justify-between sticky top-0 z-40">

          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 bg-gray-200 dark:bg-gray-800 rounded-lg"
          >
            <Menu size={24} className="text-[#4f6df5]" />
          </button>

          <div />

          <div className="flex items-center gap-6">
   
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={theme === "dark"}
                onChange={() => setTheme(theme === "light" ? "dark" : "light")}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-gray-300 dark:bg-gray-600 peer-checked:bg-[#4f6df5] rounded-full" />
              <div className="absolute w-5 h-5 bg-white rounded-full left-0.5 top-0.5 transition-all peer-checked:translate-x-6" />
            </label>
            <div ref={notifRef} className="relative">
              <button
                onClick={() => setOpenNotif((p) => !p)}
                className="relative hover:scale-110"
              >
                <Bell size={22} />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {openNotif && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-[#0e0f10] 
                  rounded-xl shadow-xl border dark:border-gray-800 p-4 max-h-[60vh] overflow-y-auto">

                  <div className="flex justify-between mb-2">
                    <h2 className="font-semibold">Notifications</h2>
                    <div className="flex gap-3">
                      <button onClick={markAllRead} className="text-sm text-blue-600">
                        Mark all
                      </button>
                      <button onClick={clearAll} className="text-sm text-red-600">
                        Clear
                      </button>
                    </div>
                  </div>

                  {notifications.length === 0 ? (
                    <p className="text-center text-sm text-gray-500">No notifications</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 rounded-xl border mb-2 flex gap-3 ${
                          n.read
                            ? "bg-white/40 dark:bg-[#222]/40"
                            : "bg-[#eef2ff] dark:bg-[#182132]"
                        }`}
                      >
                        <Bell size={18} className="text-[#4f6df5]" />

                        <div className="flex-1">
                          <p className={n.read ? "" : "font-semibold"}>
                            {n.message}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(n.time).toLocaleString()}
                          </p>
                        </div>

                        <div className="flex flex-col gap-1">
                          <button
                            className="text-xs text-blue-600"
                            onClick={() => markToggle(n.id)}
                          >
                            {n.read ? "Unread" : "Read"}
                          </button>
                          <button
                            className="text-xs text-red-600"
                            onClick={() => deleteNotif(n.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

          
            <img
              src="https://i.pravatar.cc/300"
              onClick={openProfile}
              className="w-10 h-10 rounded-full cursor-pointer hover:scale-110 transition shadow"
              alt="profile"
            />
          </div>
        </div>

        <main className="p-4 sm:p-6">{children}</main>
      </div>

      {profileOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999]">
          <div className="bg-white dark:bg-[#1a1a1a] w-[90%] max-w-lg rounded-2xl shadow-xl p-6 relative max-h-[90vh] overflow-y-auto">

            <button
              onClick={closeProfile}
              className="absolute right-4 top-4 p-2 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-full"
            >
              <X size={22} />
            </button>

            <h2 className="text-2xl font-semibold text-center mb-5">
              Admin Profile
            </h2>

            <div className="flex justify-center mb-6">
              <img
                src="https://i.pravatar.cc/300"
                className="w-28 h-28 rounded-full border-4 border-[#4f6df5]"
              />
            </div>

            <div className="flex flex-col gap-4">
              {["full_name", "email", "phone", "gender", "age"].map((field) => (
                <div key={field}>
                  <label className="text-sm capitalize">
                    {field.replace("_", " ")}
                  </label>
                  <input
                    name={field}
                    disabled={!editMode}
                    value={profileForm[field]}
                    onChange={handleProfileChange}
                    className={`w-full mt-1 p-2 rounded-lg outline-none transition ${
                      editMode
                        ? "bg-gray-100 dark:bg-gray-700 border border-blue-500"
                        : "bg-gray-200 dark:bg-[#2a2a2a] opacity-70"
                    }`}
                  />
                </div>
              ))}

              <div>
                <label className="text-sm">Address</label>
                <textarea
                  name="address"
                  disabled={!editMode}
                  value={profileForm.address}
                  onChange={handleProfileChange}
                  className={`w-full mt-1 p-2 rounded-lg outline-none transition ${
                    editMode
                      ? "bg-gray-100 dark:bg-gray-700 border border-blue-500"
                      : "bg-gray-200 dark:bg-[#2a2a2a] opacity-70"
                  }`}
                />
              </div>

              {editMode && (
                <>
                  <div>
                    <label className="text-sm">Current Password</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={profileForm.currentPassword}
                      onChange={handleProfileChange}
                      className="w-full mt-1 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-sm">New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={profileForm.newPassword}
                      onChange={handleProfileChange}
                      className="w-full mt-1 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-sm">Confirm Password</label>
                    <input
                      type="password"
                      name="confirmNewPassword"
                      value={profileForm.confirmNewPassword}
                      onChange={handleProfileChange}
                      className="w-full mt-1 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-blue-500"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={() => {
                  if (editMode) {
                    setProfileForm({
                      full_name: loadedProfile?.full_name || "",
                      email: loadedProfile?.email || "",
                      phone: loadedProfile?.phone || "",
                      gender: loadedProfile?.gender || "",
                      age: loadedProfile?.age || "",
                      address: loadedProfile?.address || "",
                      currentPassword: "",
                      newPassword: "",
                      confirmNewPassword: "",
                    });
                  }
                  setEditMode(!editMode);
                }}
                className="px-8 py-2 rounded-lg border border-[#4f6df5] text-[#4f6df5]"
              >
                {editMode ? "Cancel" : "Edit"}
              </button>

              {editMode && (
                <button
                  onClick={handleSaveProfile}
                  className="px-8 py-2 rounded-lg bg-[#4f6df5] text-white hover:bg-[#3d54d1]"
                >
                  Save
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
