// src/components/AdminHeader.jsx
import React, { useEffect, useRef, useState } from "react";
import {
  Bell,
  Settings,
  User,
  X,
  Mail,
  Phone,
  Eye,
  EyeOff,
  Check,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

export default function AdminHeader() {
  const [theme, setTheme] = useState("light");
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [openNotification, setOpenNotification] = useState(false);

  const [notifications, setNotifications] = useState([]);

  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState({
    name: "Admin User",
    email: "admin@exammarkpro.com",
    phone: "+91 9876543210",
  });
  const [tempProfile, setTempProfile] = useState({ ...profile });

  const [passwords, setPasswords] = useState({
    current: "",
    newPass: "",
    confirmPass: "",
  });

  const [showPass, setShowPass] = useState({
    current: false,
    newPass: false,
    confirmPass: false,
  });

  const notifRef = useRef();

  // Load theme + notifications
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");

    const savedNotif = JSON.parse(localStorage.getItem("notifications") || "[]");
    setNotifications(savedNotif);
  }, []);

  // Close notification popup when clicking outside
  useEffect(() => {
    function closeDropdown(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setOpenNotification(false);
      }
    }
    window.addEventListener("click", closeDropdown);
    return () => window.removeEventListener("click", closeDropdown);
  }, []);

  // Theme Toggle
  const toggleTheme = () => {
    const t = theme === "light" ? "dark" : "light";
    setTheme(t);
    localStorage.setItem("theme", t);
    document.documentElement.classList.toggle("dark", t === "dark");
  };

  // ---------------- NOTIFICATIONS ----------------
  const saveNotifications = (list) => {
    setNotifications(list);
    localStorage.setItem("notifications", JSON.stringify(list));
  };

  const pushNotification = (msg, type = "info") => {
    const n = {
      id: Date.now(),
      message: msg,
      time: new Date().toISOString(),
      read: false,
      type,
    };
    saveNotifications([n, ...notifications]);
  };

  const markAllRead = () => {
    saveNotifications(notifications.map((n) => ({ ...n, read: true })));
    toast.success("All notifications marked read");
  };

  const clearAll = () => {
    if (!confirm("Clear all notifications?")) return;
    saveNotifications([]);
    toast.success("Notifications cleared");
  };

  const toggleRead = (id) => {
    saveNotifications(
      notifications.map((n) =>
        n.id === id ? { ...n, read: !n.read } : n
      )
    );
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // ---------------- PROFILE SAVING ----------------
  const checkStrength = (pass) => {
    const rules = [
      /[A-Z]/.test(pass),
      /[a-z]/.test(pass),
      /[0-9]/.test(pass),
      /[^A-Za-z0-9]/.test(pass),
      pass.length >= 8,
    ];
    return rules.filter(Boolean).length;
  };

  const handleSaveProfile = () => {
    const { current, newPass, confirmPass } = passwords;

    if (!tempProfile.name || !tempProfile.email || !tempProfile.phone) {
      toast.error("All fields are required!");
      return;
    }

    // Track changes
    let updatedFields = [];

    if (tempProfile.name !== profile.name) updatedFields.push("Name");
    if (tempProfile.email !== profile.email) updatedFields.push("Email");
    if (tempProfile.phone !== profile.phone) updatedFields.push("Phone Number");

    // Password update
    let passwordChanged = false;

    if (current || newPass || confirmPass) {
      if (!current || !newPass || !confirmPass) {
        toast.error("Fill all password fields");
        return;
      }
      if (newPass === current) {
        toast.error("New password cannot match current password");
        return;
      }
      if (newPass !== confirmPass) {
        toast.error("Passwords do not match");
        return;
      }
      if (checkStrength(newPass) < 5) {
        toast.error("Weak password");
        return;
      }

      passwordChanged = true;
      updatedFields.push("Password");
    }

    // Update profile
    setProfile({ ...tempProfile });
    setPasswords({ current: "", newPass: "", confirmPass: "" });
    setEditMode(false);

    // Add field-specific notifications
    updatedFields.forEach((field) =>
      pushNotification(`${field} updated successfully`, "success")
    );

    toast.success("Changes saved");
  };

  const formatTime = (iso) => new Date(iso).toLocaleString();

  // ---------------- UI ----------------
  return (
    <>
      {/* HEADER */}
      <header className="w-full bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3 flex justify-between items-center sticky top-0 z-30">
        <div></div>

        <div className="flex items-center gap-3">

          {/* THEME */}
          <div
            onClick={toggleTheme}
            className="w-11 h-5 bg-gray-300 dark:bg-gray-700 rounded-full p-1 flex items-center cursor-pointer"
          >
            <div
              className={`bg-white dark:bg-gray-200 w-4 h-4 rounded-full shadow transform transition ${
                theme === "dark" ? "translate-x-6" : ""
              }`}
            />
          </div>

          {/* NOTIFICATIONS */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setOpenNotification((p) => !p)}
              className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"
            >
              <Bell size={20} className="text-gray-700 dark:text-gray-300" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] px-1.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* NOTIFICATION DROPDOWN */}
            {openNotification && (
              <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-3 z-50">

                <div className="flex justify-between items-center mb-3">
                  <p className="font-semibold">Notifications</p>

                  <div className="flex gap-2">
                    <button
                      onClick={markAllRead}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Mark all read
                    </button>

                    <button
                      onClick={clearAll}
                      className="text-xs text-red-600 dark:text-red-400 hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2">
                  {notifications.length === 0 && (
                    <p className="text-gray-500 text-sm">No notifications</p>
                  )}

                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`flex items-start gap-2 p-2 rounded-lg ${
                        n.read
                          ? "bg-white dark:bg-gray-800"
                          : "bg-gray-100 dark:bg-gray-700"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 flex items-center justify-center rounded-full ${
                          n.type === "success"
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        <Check size={16} />
                      </div>

                      <div className="flex-1">
                        <p
                          className={`text-sm ${
                            n.read ? "text-gray-700" : "font-semibold"
                          }`}
                        >
                          {n.message}
                        </p>
                        <p className="text-xs text-gray-500">{formatTime(n.time)}</p>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <button
                          onClick={() => toggleRead(n.id)}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {n.read ? "Unread" : "Read"}
                        </button>

                        <button
                          onClick={() =>
                            saveNotifications(notifications.filter((x) => x.id !== n.id))
                          }
                          className="text-red-600 dark:text-red-400 hover:underline"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}
          </div>

          <Settings size={20} className="text-gray-700 dark:text-gray-300" />

          {/* PROFILE BUTTON */}
          <button
            onClick={() => {
              setOpenProfileModal(true);
              setEditMode(false);
              setTempProfile({ ...profile });
            }}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"
          >
            <User size={20} className="text-gray-700 dark:text-gray-300" />
          </button>
        </div>
      </header>

      {/* PROFILE MODAL */}
      {openProfileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[999] backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-[90%] max-w-lg max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setOpenProfileModal(false)}
              className="absolute top-3 right-3 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
            >
              <X size={20} />
            </button>

            {!editMode ? (
              <>
                <h2 className="text-xl font-semibold mb-4">Profile Details</h2>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-700 p-3 rounded-xl">
                    <User className="text-blue-500" />
                    <div>
                      <p className="font-semibold">{profile.name}</p>
                      <p className="text-xs text-gray-500">Name</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-700 p-3 rounded-xl">
                    <Mail className="text-blue-500" />
                    <div>
                      <p className="font-semibold">{profile.email}</p>
                      <p className="text-xs text-gray-500">Email</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-700 p-3 rounded-xl">
                    <Phone className="text-blue-500" />
                    <div>
                      <p className="font-semibold">{profile.phone}</p>
                      <p className="text-xs text-gray-500">Phone</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setEditMode(true)}
                  className="mt-5 w-full bg-blue-600 text-white py-2 rounded-xl"
                >
                  Edit Profile
                </button>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>

                {/* NAME */}
                <label className="text-sm">Name</label>
                <input
                  value={tempProfile.name}
                  onChange={(e) =>
                    setTempProfile({ ...tempProfile, name: e.target.value })
                  }
                  className="w-full bg-gray-100 dark:bg-gray-700 p-3 rounded-xl mb-3"
                />

                {/* EMAIL */}
                <label className="text-sm">Email</label>
                <input
                  value={tempProfile.email}
                  onChange={(e) =>
                    setTempProfile({ ...tempProfile, email: e.target.value })
                  }
                  className="w-full bg-gray-100 dark:bg-gray-700 p-3 rounded-xl mb-3"
                />

                {/* PHONE */}
                <label className="text-sm">Phone</label>
                <input
                  value={tempProfile.phone}
                  onChange={(e) =>
                    setTempProfile({ ...tempProfile, phone: e.target.value })
                  }
                  className="w-full bg-gray-100 dark:bg-gray-700 p-3 rounded-xl mb-3"
                />

                {/* PASSWORD FIELDS */}
                {["current", "newPass", "confirmPass"].map((field) => (
                  <div key={field} className="mb-3">
                    <label className="text-sm">
                      {field === "current"
                        ? "Current Password"
                        : field === "newPass"
                        ? "New Password"
                        : "Confirm Password"}
                    </label>

                    <div className="relative">
                      <input
                        type={showPass[field] ? "text" : "password"}
                        value={passwords[field]}
                        onChange={(e) =>
                          setPasswords({ ...passwords, [field]: e.target.value })
                        }
                        className="w-full bg-gray-100 dark:bg-gray-700 p-3 rounded-xl pr-10"
                      />

                      <button
                        type="button"
                        className="absolute right-3 top-3"
                        onClick={() =>
                          setShowPass({ ...showPass, [field]: !showPass[field] })
                        }
                      >
                        {showPass[field] ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {field === "newPass" && passwords.newPass && (
                      <div className="flex gap-1 mt-2">
                        {[1, 2, 3, 4, 5].map((lvl) => (
                          <div
                            key={lvl}
                            className={`h-2 flex-1 rounded ${
                              checkStrength(passwords.newPass) >= lvl
                                ? "bg-green-500"
                                : "bg-gray-300 dark:bg-gray-600"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* SAVE BUTTONS */}
                <div className="flex gap-3 mt-5">
                  <button
                    onClick={() => setEditMode(false)}
                    className="w-1/2 bg-gray-200 dark:bg-gray-700 py-2 rounded-xl"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleSaveProfile}
                    className="w-1/2 bg-blue-600 text-white py-2 rounded-xl"
                  >
                    Save
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
