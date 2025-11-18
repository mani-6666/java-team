import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  DollarSign,
  MessageCircle,
  Menu,
  X
} from "lucide-react";

export default function Sidebar() {
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
        className="md:hidden fixed top-4 left-4 z-50 bg-white dark:bg-[#222] p-2 rounded-lg shadow"
      >
        <Menu size={26} className="text-[#4f6df5]" />
      </button>


      <div
        className={`fixed top-0 left-0 h-screen w-64 bg-white dark:bg-[#111] 
        border-r dark:border-gray-700 px-6 py-6 z-40 transition-transform 
        ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
       
        <div className="md:hidden flex justify-end mb-4">
          <button
            onClick={() => setOpen(false)}
            className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
          >
            <X size={24} className="text-[#4f6df5]" />
          </button>
        </div>


        <div className="text-[22px] flex items-center gap-2 font-semibold text-[#4f6df5] mb-8">
          <span className="text-3xl">🎓</span>
          ExamMarkPro
        </div>

  
        <div className="flex flex-col gap-3">
          {menuItems.map((item) => {
            const active = pathname === item.id;

            return (
              <Link
                key={item.id}
                to={item.id}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-[15px] font-medium transition 
                  ${
                    active
                      ? "bg-[#E8EDFF] dark:bg-[#1d2b4f] text-[#4f6df5]"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

  
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/30 md:hidden z-30"
        ></div>
      )}
    </>
  );
}
