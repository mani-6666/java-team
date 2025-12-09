
// import React, { useState, useEffect } from "react";
// import { Link, useLocation } from "react-router-dom";
// import {
//   Bell,
//   Settings,
//   LayoutDashboard,
//   FileText,
//   ClipboardList,
//   BarChart2,
//   MessageCircle,
//   LogOut,
// } from "lucide-react";

// import InvProfile from "../Pages/InvProfile";

// export default function InvLayout({ children }) {
//   const location = useLocation();

//   // ⭐ Load dark mode from localStorage
//   const [darkMode, setDarkMode] = useState(() => {
//     return localStorage.getItem("darkMode") === "true";
//   });

//   const [showProfile, setShowProfile] = useState(false);

//   // ⭐ Save dark mode to localStorage whenever it changes
//   useEffect(() => {
//     localStorage.setItem("darkMode", darkMode);
//   }, [darkMode]);

//   // Active link helper
//   const active = (path) =>
//     location.pathname === path
//       ? "bg-[#E8EEFF] text-blue-600"
//       : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2f3237]";

//   return (
//     // ⭐ Global Dark Mode Wrapper (works across routes + refresh)
//     <div className={darkMode ? "dark" : ""}>
//       <div
//         className={`h-screen flex flex-col transition-all duration-300 
//           bg-gray-50 dark:bg-[#1b1c1f] text-gray-900 dark:text-gray-100`}
//       >
//         {/* NAVBAR */}
//         <header
//           className={`h-16 w-full px-8 flex items-center justify-between border-b transition-all duration-300 
//           bg-white dark:bg-[#202226] border-gray-200 dark:border-gray-700`}
//         >
//           <div className="flex items-center gap-2 select-none">
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               width="28"
//               height="28"
//               fill="#5A67F2"
//               viewBox="0 0 24 24"
//             >
//               <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zm0 13L5.74 12.4 4 13.5 12 18l8-4.5-1.74-1.1L12 16z" />
//             </svg>

//             <span className="text-2xl font-semibold text-[#5A67F2]">
//               ExamMarkPro
//             </span>
//           </div>

//           <div className="flex items-center gap-6">

//             {/* Dark mode toggle */}
//             <label className="relative inline-flex items-center cursor-pointer">
//               <input
//                 type="checkbox"
//                 className="sr-only peer"
//                 checked={darkMode}
//                 onChange={() => setDarkMode(!darkMode)}
//               />
//               <div
//                 className={`w-12 h-6 rounded-full transition-all duration-300 
//                 ${darkMode ? "bg-blue-600" : "bg-gray-300"}`}
//               ></div>

//               <span className="absolute top-[3px] left-[3px] w-5 h-5 bg-white rounded-full transition-all peer-checked:translate-x-6"></span>
//             </label>

//             {/* Notifications */}
//             <div className="relative cursor-pointer">
//               <Bell size={22} className="text-gray-700 dark:text-gray-300" />
//               <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
//             </div>

//             <Settings size={22} className="text-gray-700 dark:text-gray-300" />

//             {/* Profile */}
//             <img
//               src="https://img.freepik.com/premium-photo/software-engineer-digital-avatar-generative-ai_934475-8997.jpg?w=1480"
//               className="w-10 h-10 rounded-full border cursor-pointer"
//               onClick={() => setShowProfile(true)}
//             />
//           </div>
//         </header>

//         {/* BODY */}
//         <div className="flex flex-1 overflow-hidden">

//           {/* SIDEBAR */}
//           <aside
//             className={`relative w-64 pt-6 px-4 border-r transition-all duration-300
//             bg-[#F6F7FB] dark:bg-[#23272A] border-gray-200 dark:border-gray-700`}
//           >
//             <nav className="flex flex-col gap-2">
//               <Link
//                 to="/invigilatordashboard"
//                 className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${active(
//                   "/invigilatordashboard"
//                 )}`}
//               >
//                 <LayoutDashboard size={18} />
//                 Dashboard
//               </Link>

//               <Link
//                 to="/submission"
//                 className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${active(
//                   "/submission"
//                 )}`}
//               >
//                 <FileText size={18} />
//                 Submission
//               </Link>

//               <Link
//                 to="/gradingqueue"
//                 className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${active(
//                   "/gradingqueue"
//                 )}`}
//               >
//                 <ClipboardList size={18} />
//                 Grading Queue
//               </Link>

//               <Link
//                 to="/analytics"
//                 className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${active(
//                   "/analytics"
//                 )}`}
//               >
//                 <BarChart2 size={18} />
//                 Analytics
//               </Link>

//               <Link
//                 to="/chatbox"
//                 className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${active(
//                   "/chatbox"
//                 )}`}
//               >
//                 <MessageCircle size={18} />
//                 Chatbox
//               </Link>
//             </nav>

//             {/* LOGOUT */}
//             <div className="absolute bottom-6 left-4">
//               <button
//                 className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-[#2f3237]"
//               >
//                 <LogOut size={18} />
//                 Logout
//               </button>
//             </div>
//           </aside>

//           {/* MAIN CONTENT */}
//           <main
//             className={`flex-1 overflow-auto p-10 transition-all duration-300 
//             bg-gray-50 dark:bg-[#1e2023]`}
//           >
//             {children}
//           </main>
//         </div>

//         {/* PROFILE MODAL */}
//         {showProfile && <InvProfile onClose={() => setShowProfile(false)} />}
//       </div>
//     </div>
//   );
// }






import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Bell,
  LayoutDashboard,
  FileText,
  ClipboardList,
  BarChart2,
  MessageCircle,
  LogOut,
} from "lucide-react";

import InvProfile from "../Pages/InvProfile";

export default function InvLayout({ children }) {
  const location = useLocation();

  // ⭐ Load dark mode from localStorage
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  const [showProfile, setShowProfile] = useState(false);

  // ⭐ Save dark mode to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  // Active link helper
  const active = (path) =>
    location.pathname === path
      ? "bg-[#E8EEFF] text-blue-600"
      : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2f3237]";

  return (
    <div className={darkMode ? "dark" : ""}>
      <div
        className={`h-screen flex flex-col transition-all duration-300 
          bg-gray-50 dark:bg-[#1b1c1f] text-gray-900 dark:text-gray-100`}
      >
        {/* NAVBAR */}
        <header
          className={`h-16 w-full px-8 flex items-center justify-between border-b transition-all duration-300 
          bg-white dark:bg-[#202226] border-gray-200 dark:border-gray-700`}
        >
          <div className="flex items-center gap-2 select-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              fill="#5A67F2"
              viewBox="0 0 24 24"
            >
              <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zm0 13L5.74 12.4 4 13.5 12 18l8-4.5-1.74-1.1L12 16z" />
            </svg>

            <span className="text-2xl font-semibold text-[#5A67F2]">
              ExamMarkPro
            </span>
          </div>

          <div className="flex items-center gap-6">

            {/* Dark mode toggle */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
              />
              <div
                className={`w-12 h-6 rounded-full transition-all duration-300 
                ${darkMode ? "bg-blue-600" : "bg-gray-300"}`}
              ></div>

              <span className="absolute top-[3px] left-[3px] w-5 h-5 bg-white rounded-full transition-all peer-checked:translate-x-6"></span>
            </label>

            {/* Notifications */}
            <div className="relative cursor-pointer">
              <Bell size={22} className="text-gray-700 dark:text-gray-300" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </div>

            {/* Profile */}
            <img
              src="https://img.freepik.com/premium-photo/software-engineer-digital-avatar-generative-ai_934475-8997.jpg?w=1480"
              className="w-10 h-10 rounded-full border cursor-pointer"
              onClick={() => setShowProfile(true)}
            />
          </div>
        </header>

        {/* BODY */}
        <div className="flex flex-1 overflow-hidden">

          {/* SIDEBAR */}
          <aside
            className={`relative w-64 pt-6 px-4 border-r transition-all duration-300
            bg-[#F6F7FB] dark:bg-[#23272A] border-gray-200 dark:border-gray-700`}
          >
            <nav className="flex flex-col gap-2">
              <Link
                to="/invigilatordashboard"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${active(
                  "/invigilatordashboard"
                )}`}
              >
                <LayoutDashboard size={18} />
                Dashboard
              </Link>

              <Link
                to="/submission"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${active(
                  "/submission"
                )}`}
              >
                <FileText size={18} />
                Submission
              </Link>

              <Link
                to="/gradingqueue"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${active(
                  "/gradingqueue"
                )}`}
              >
                <ClipboardList size={18} />
                Grading Queue
              </Link>

              <Link
                to="/analytics"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${active(
                  "/analytics"
                )}`}
              >
                <BarChart2 size={18} />
                Analytics
              </Link>

              <Link
                to="/chatbox"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${active(
                  "/chatbox"
                )}`}
              >
                <MessageCircle size={18} />
                Chatbox
              </Link>
            </nav>

            {/* LOGOUT */}
            <div className="absolute bottom-6 left-4">
              <button
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-[#2f3237]">
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <main
            className={`flex-1 overflow-auto p-10 transition-all duration-300 
            bg-gray-50 dark:bg-[#1e2023]`}
          >
            {children}
          </main>
        </div>

        {/* PROFILE MODAL */}
        {showProfile && <InvProfile onClose={() => setShowProfile(false)} />}
      </div>
    </div>
  );
}
