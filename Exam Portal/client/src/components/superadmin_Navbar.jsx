import React, { useEffect, useState, useRef } from "react";
import { Bell, Settings } from "lucide-react";

export default function Navbar() {
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
    theme === "dark" ? root.classList.add("dark") : root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div
      className="
      w-full h-16 
      bg-white dark:bg-[#1a1a1a] 
      border-b dark:border-gray-700 
      flex items-center justify-between 
      px-6 relative
    "
    >
      <div></div>

      <div className="flex items-center gap-6">

      
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={theme === "dark"}
            onChange={() => setTheme(theme === "light" ? "dark" : "light")}
            className="sr-only peer"
          />
          <div
            className="
            w-12 h-6 
            bg-gray-300 dark:bg-gray-600 
            peer-checked:bg-[#4f6df5] 
            rounded-full transition
          "
          ></div>
          <div
            className="
            absolute w-5 h-5 bg-white rounded-full top-0.5 left-0.5 
            transition-transform peer-checked:translate-x-6
          "
          ></div>
        </label>

    
        <div ref={notifRef} className="relative">
          <button onClick={() => setOpenNotif(!openNotif)}>
            <Bell size={24} className="text-black dark:text-white" />
            <span className="absolute -top-2 -right-2 bg-red-600 text-white w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-semibold shadow">
              4
            </span>
          </button>

     
          {openNotif && (
            <div
              className="
              absolute right-0 mt-4 w-96 
              bg-white dark:bg-[#1f2125]
              shadow-lg rounded-2xl p-5 border 
              border-gray-200 dark:border-[#2a2c31]
              z-50
            "
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-black dark:text-white">
                  Notifications
                </h2>

                <button className="text-[#4f6df5] text-sm font-medium hover:underline">
                  Clear All
                </button>
              </div>

       
              {[
                {
                  title: "Security Update: Token Management",
                  msg: "Secure your integration with the new token management system to safeguard your API keys.",
                },
                {
                  title: "Security Update: Token Management",
                  msg: "Secure your integration with the new token management system to safeguard your API keys.",
                },
                {
                  title: "Security Update: Token Management",
                  msg: "Secure your integration with the new token management system to safeguard your API keys.",
                },
              ].map((item, index) => (
                <div key={index} className="mb-5 pb-4 border-b border-gray-200 dark:border-[#2a2c31]">
                  <div className="flex items-start gap-3">
                    <div
                      className="
                      w-10 h-10 rounded-full bg-[#eef2ff] dark:bg-[#272a35]
                      flex items-center justify-center
                    "
                    >
                      <Bell size={18} className="text-[#4f6df5]" />
                    </div>

                    <div>
                      <h3 className="font-semibold text-[15px]">{item.title}</h3>
                      <p className="text-gray-600 dark:text-[#9da3ae] text-sm leading-snug">
                        {item.msg}
                      </p>

                      <button
                        className="
                        mt-3 bg-[#4f6df5] text-white 
                        px-4 py-1.5 rounded-lg text-sm font-medium
                        shadow hover:bg-[#3f58d4] transition
                      "
                      >
                        Verify now
                      </button>

                      <p className="text-gray-500 dark:text-[#9da3ae] text-xs mt-2">
                        Today at 9:42 AM
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

    
        <Settings size={22} className="text-black dark:text-white" />

   
        <img
          src="https://i.pravatar.cc/300"
          alt="profile"
          className="w-10 h-10 rounded-full object-cover"
        />
      </div>
    </div>
  );
}
