import React, { useEffect, useState, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  DollarSign,
  MessageCircle,
  Menu,
  X,
  LogOut,
  Bell,
  Settings,
} from "lucide-react";


export function Superadmin_Navbar() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [openNotif, setOpenNotif] = useState(false);
  const notifRef = useRef(null);


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
    const root = document.documentElement;
    theme === "dark"
      ? root.classList.add("dark")
      : root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div
      className="
      w-full h-16 fixed md:static top-0 left-0 z-[50]
      bg-white dark:bg-[#1a1a1a] border-b dark:border-gray-700 
      flex items-center justify-between 
      px-3 sm:px-6
    "
    >
      <div className="flex items-center gap-2">
     
      </div>

      <div className="flex items-center gap-3 sm:gap-6">

      
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

       
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setOpenNotif(!openNotif)}
            className="relative flex items-center justify-center"
          >
            <Bell size={22} className="text-black dark:text-white" />
            <span
              className="absolute -top-2 -right-2 bg-red-600 text-white 
              w-4 h-4 sm:w-5 sm:h-5 rounded-full text-[10px] sm:text-[11px] 
              flex items-center justify-center font-semibold shadow"
            >
              4
            </span>
          </button>

        
          {openNotif && (
            <div
            className="
              absolute top-12 -right-9
              w-[94vw] sm:w-[420px] 
              max-w-[94vw] sm:max-w-[420px]
              bg-white dark:bg-[#1f2125]
              shadow-xl border border-gray-200 dark:border-[#2a2c31]
              rounded-xl p-4 sm:p-6
              z-[999] animate-slideLeft
              overflow-hidden
            "
          >

       
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="text-[18px] sm:text-[20px] font-semibold text-black dark:text-white">
                    Notifications
                  </h2>
                  <p className="text-[12px] sm:text-[13px] text-gray-500 dark:text-[#9da3ae] mt-1">
                    Recent activity and system updates
                  </p>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  <button className="text-xs sm:text-sm text-slate-500 dark:text-[#9da3ae] hover:underline">
                    Marked as Read
                  </button>
                  <button className="text-xs sm:text-sm text-[#4f6df5] font-medium hover:underline">
                    Clear All
                  </button>
                </div>
              </div>

          
            <div
              className="
                flex flex-col gap-5 pb-3 
                max-h-[70vh] overflow-y-auto 
                pr-2
              "
            >

                {[1, 2, 3].map((_, idx) => (
                  <div
                    key={idx}
                    className="
                      flex items-start gap-3 sm:gap-4 
                      pb-4 border-b border-gray-100 dark:border-[#2a2c31]
                    "
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#eef2ff] dark:bg-[#272a35] flex items-center justify-center flex-shrink-0">
                      <Bell size={18} className="text-[#4f6df5]" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-semibold text-[14px] sm:text-[15px] text-black dark:text-white leading-tight">
                          Security Update: Token Management
                        </h3>
                        <span className="text-[11px] sm:text-[12px] text-gray-400 dark:text-[#9da3ae]">
                          Today
                        </span>
                      </div>

                      <p className="text-gray-600 dark:text-[#9da3ae] text-[13px] sm:text-[14px] mt-1 leading-[1.35]">
                        Secure your integration with the new token management system.
                      </p>

                      <div className="mt-3 flex items-center gap-2 sm:gap-3">
                        <button className="bg-[#4f6df5] text-white px-3 sm:px-4 py-[5px] sm:py-[6px] rounded-md text-[13px] sm:text-[14px] font-medium shadow hover:bg-[#3f58d4] transition">
                          Verify now
                        </button>
                        <span className="text-[11px] sm:text-[12px] text-gray-400 dark:text-[#9da3ae]">
                          9:42 AM
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                <button className="w-full text-left text-sm text-[#4f6df5] font-medium hover:underline mt-2">
                  View detailed system logs
                </button>
              </div>
            </div>
          )}
        </div>

     
        <button className="hidden sm:inline-flex">
          <Settings size={20} className="text-black dark:text-white" />
        </button>

        <img
          src="https://i.pravatar.cc/300"
          alt="profile"
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
        />
      </div>
    </div>
  );
}


export function Superadmin_Sidebar() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  const menuItems = [
    { id: "/", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { id: "/clients", label: "Client Management", icon: <Building2 size={20} /> },
    { id: "/subscriptions", label: "Subscription", icon: <CreditCard size={20} /> },
    { id: "/revenue", label: "Analytics", icon: <DollarSign size={20} /> },
    { id: "/chatbox", label: "Chatbox", icon: <MessageCircle size={20} /> },
  ];

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
        className={`
          fixed top-0 left-0 h-screen w-64 
          bg-white dark:bg-[#111] border-r dark:border-gray-700 
          px-6 py-6 z-50
          transition-transform duration-300 
          ${open ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0
        `}
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

         
          <div className="text-[20px] sm:text-[22px] flex items-center gap-2 font-semibold text-[#4f6df5] mb-8">
            <span className="text-2xl sm:text-3xl">🎓</span>
            <span className="truncate">ExamMarkPro</span>
          </div>

          <div className="flex flex-col gap-2 sm:gap-3">
            {menuItems.map((item) => (
              <NavLink
                key={item.id}
                to={item.id}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 sm:px-4 py-3 rounded-lg text-[14px] sm:text-[15px] transition ${
                    isActive
                      ? "bg-[#E8EDFF] dark:bg-[#1d2b4f] text-[#4f6df5]"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`
                }
              >
                {item.icon}
                <span className="truncate">{item.label}</span>
              </NavLink>
            ))}
          </div>

      
          <div className="mt-auto pt-6 border-t border-gray-200 dark:border-gray-700">
            <button className="flex items-center gap-2 text-[15px] text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition">
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

 
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/30 md:hidden z-40"
        ></div>
      )}
    </>
  );
}


export default function Superadmin_Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505]">
      <Superadmin_Sidebar />

      <div className="md:ml-64 flex flex-col">
        <Superadmin_Navbar />
        <main className="pt-20 md:pt-0 p-3 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
