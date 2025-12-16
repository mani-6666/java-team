import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  Menu,
  LayoutDashboard,
  FileText,
  BookOpen,
  BarChart2,
  MessageCircle,
  Trophy,
  LogOut,
  GraduationCap,
  X,
  Pencil,
} from "lucide-react";

function ProfileField({ label, value, editable, onChange }) {
  return (
    <div className="flex flex-col w-full">
      <label className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={!editable}
        className={`w-full px-3 py-2.5 rounded-md text-sm outline-none ${
          editable
            ? "bg-white border border-[#6B76FF] focus:ring-2 focus:ring-[#6B76FF] dark:bg-gray-800 dark:border-[#6B76FF]"
            : "bg-gray-100 border border-gray-300 dark:bg-gray-800 dark:border-gray-700 cursor-not-allowed"
        } text-gray-900 dark:text-white`}
      />
    </div>
  );
}

export default function UserLayout({ children }) {
  const [isDark, setIsDark] = useState(() => localStorage.getItem("theme") === "dark");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const navigate = useNavigate();

  const location = useLocation();
  const fileInputRef = useRef(null);

  useEffect(() => {
    const html = document.documentElement;
    if (isDark) html.classList.add("dark");
    else html.classList.remove("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  const notifications = [
    {
      id: 1,
      title: "Security Update: Token Management",
      message: "Secure your integration with the new token management system.",
      time: "Today at 9:42 AM",
      unread: true,
      action: true,
    },
    {
      id: 2,
      title: "New Dashboard Feature",
      message: "Try out the redesigned analytics dashboard!",
      time: "Yesterday",
      unread: false,
      action: true,
    },
    {
      id: 3,
      title: "Backup Complete",
      message: "Your exam data backup has been completed.",
      time: "2 days ago",
      unread: false,
      action: true,
    },
  ];

  const menu = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/user/dashboard" },
    { label: "My Exam", icon: FileText, path: "/user/exams" },
    { label: "Study Materials", icon: BookOpen, path: "/user/study-materials" },
    { label: "Analytics", icon: BarChart2, path: "/user/analytics" },
    { label: "Achievements", icon: Trophy, path: "/user/achievements" },
    { label: "Chatbox", icon: MessageCircle, path: "/user/chatbox" },
  ];

  const [profile, setProfile] = useState({
    fullName: "Sofiya Dawson",
    email: "sofiya.daw@example.com",
    phone: "+91 1234567890",
    orgName: "Tech University",
    orgId: "Tech001",
    gender: "Female",
    age: "19",
    avatar:
      "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&w=200&h=200",
  });

  const [draft, setDraft] = useState(profile);

  const openProfile = () => {
    setDraft(profile);
    setIsEditingProfile(false);
    setIsProfileOpen(true);
  };

  const saveProfile = () => {
    setProfile(draft);
    setIsEditingProfile(false);
  };

  const handleLogout = ()=>{
    sessionStorage.clear()
    navigate('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-[#0D1117]">

      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-white dark:bg-gray-900 border-r dark:border-gray-800 shadow-lg transition-transform duration-300 flex flex-col ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-64 md:translate-x-0"
        }`}
      >
        <div className="flex items-center gap-2 h-16 px-6 border-b dark:border-gray-800">
          <GraduationCap size={22} className="text-[#3641EC]" />
          <span className="text-lg font-semibold text-[#3641EC]">ExamMarkPro</span>
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
                    ? "bg-blue-50 text-[#3641EC] dark:bg-blue-900/30 dark:text-blue-200 font-semibold"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Icon size={18} /> {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-4 mt-auto mb-2">
          <button className="flex items-center gap-3 w-full text-sm px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={handleLogout}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/20 z-30 md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <div className="flex flex-col flex-1 overflow-hidden md:pl-64">
        <header className="h-16 bg-white dark:bg-gray-900 border-b dark:border-gray-800 px-4 sm:px-8 flex items-center justify-between">
          <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800">
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-4 sm:gap-6 ml-auto">
            <div
              onClick={() => setIsDark(!isDark)}
              className={`w-11 h-6 p-1 rounded-full flex items-center cursor-pointer transition ${
                isDark ? "bg-[#3641EC]" : "bg-gray-300"
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transform transition ${
                isDark ? "translate-x-5" : "translate-x-0"
              }`} />
            </div>

            <button onClick={() => setIsNotificationsOpen(true)} className="relative">
              <Bell size={18} className="text-gray-700 dark:text-gray-300" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-600 rounded-full"></span>
            </button>

            <button
              className="w-9 h-9 rounded-full overflow-hidden border border-gray-300 dark:border-gray-700"
              onClick={openProfile}
            >
              <img src={profile.avatar} className="w-full h-full object-cover" alt="profile" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>

      {isNotificationsOpen && (
        <div className="fixed right-6 top-10 z-50 w-[360px] max-h-[85vh] bg-white dark:bg-[#0B1222] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 overflow-y-auto">

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Notifications</h2>
            <button onClick={() => setIsNotificationsOpen(false)}>
              <X size={22} className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          <div className="flex justify-between items-center mb-6 text-sm">
            <span className="text-[#3641EC] font-semibold cursor-pointer">Marked as Read</span>
            <span className="text-[#3641EC] font-semibold cursor-pointer">Clear All</span>
          </div>

          <div className="space-y-8">
            {notifications.map((n) => (
              <div key={n.id} className="relative">

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <Bell size={20} className="text-[#3641EC]" />
                  </div>

                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">{n.title}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{n.message}</p>

                    {n.action && (
                      <button className="mt-4 px-5 py-2 rounded-md bg-[#3641EC] text-white text-sm font-medium">
                        Verify now
                      </button>
                    )}

                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-3">{n.time}</p>
                  </div>
                </div>

                {n.unread && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#3641EC]"></span>}
              </div>
            ))}
          </div>

        </div>
      )}

      {isProfileOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">

          <div className="bg-white dark:bg-[#0B1222] rounded-2xl w-full max-w-xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">

            <div className="flex justify-end">
              <button onClick={() => setIsProfileOpen(false)}>
                <X size={24} className="text-gray-700 dark:text-gray-300" />
              </button>
            </div>

            <h2 className="text-xl font-semibold text-center text-gray-900 dark:text-white mb-6">User Profile</h2>

            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              const url = URL.createObjectURL(f);
              setDraft((p) => ({ ...p, avatar: url }));
            }} />

            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                <img src={draft.avatar} className="w-28 h-28 rounded-full object-cover" alt="avatar" />
                <button className="absolute bottom-1 right-1 bg-[#3641EC] p-1 rounded-full" onClick={() => fileInputRef.current.click()}>
                  <Pencil size={14} className="text-white" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <ProfileField label="Full Name" value={draft.fullName} editable={isEditingProfile} onChange={(v) => setDraft((p) => ({ ...p, fullName: v }))} />
              <ProfileField label="Email" value={draft.email} editable={isEditingProfile} onChange={(v) => setDraft((p) => ({ ...p, email: v }))} />
              <ProfileField label="Phone" value={draft.phone} editable={isEditingProfile} onChange={(v) => setDraft((p) => ({ ...p, phone: v }))} />
              <ProfileField label="Organization" value={draft.orgName} editable={isEditingProfile} onChange={(v) => setDraft((p) => ({ ...p, orgName: v }))} />
              <ProfileField label="Organization ID" value={draft.orgId} editable={isEditingProfile} onChange={(v) => setDraft((p) => ({ ...p, orgId: v }))} />

              <div className="flex gap-4">
                <ProfileField label="Gender" value={draft.gender} editable={isEditingProfile} onChange={(v) => setDraft((p) => ({ ...p, gender: v }))} />
                <ProfileField label="Age" value={draft.age} editable={isEditingProfile} onChange={(v) => setDraft((p) => ({ ...p, age: v }))} />
              </div>
            </div>

            <div className="flex justify-center gap-6 mt-8">
              <button className="px-8 py-2.5 border border-[#3641EC] text-[#3641EC] rounded-md" onClick={() => setIsEditingProfile(true)}>Edit</button>
              <button className="px-8 py-2.5 bg-[#3641EC] text-white rounded-md" onClick={saveProfile}>Save</button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
