import React, { useState } from "react";
import { Users, Activity, CheckCircle } from "lucide-react";

export default function Superadmin_Dashboard() {
  const [activeTool, setActiveTool] = useState("impersonate");

  const clientsData = [
    {
      org: "Tech University",
      plan: "Enterprise",
      users: "2,500",
      exam: "145",
      rev: "$25,000/mo",
      status: "Active",
      color: "green",
    },
    {
      org: "Business School",
      plan: "Professional",
      users: "1,500",
      exam: "89",
      rev: "$12,000/mo",
      status: "Trial",
      color: "yellow",
    },
    {
      org: "Medical Institute",
      plan: "Enterprise",
      users: "3,000",
      exam: "112",
      rev: "$18,000/mo",
      status: "Active",
      color: "green",
    },
    {
      org: "Engineering College",
      plan: "Basic",
      users: "2,200",
      exam: "56",
      rev: "$9,500/mo",
      status: "Inactive",
      color: "red",
    },
  ];

  return (
    <div
      className="
        w-full 
        px-4 sm:px-6 pb-6 
        text-[#1a1f36] dark:text-[#e6e6e6]
        bg-[#f5f6fa] dark:bg-[#181a1e]
        overflow-x-hidden
      "
    >
 
      <h1 className="text-2xl sm:text-3xl font-bold">
        Welcome, <span className="text-[#4f6df5]">Super Admin</span>
      </h1>

      <p className="text-gray-600 dark:text-[#9da3ae] mt-1 text-sm sm:text-base">
        Here’s an overview of your platform’s key metrics and performance.
      </p>

    
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mt-5 sm:mt-6">
        {[
          {
            icon: <Users size={26} className="text-[#4f6df5]" />,
            title: "2,500",
            label: "Total Clients",
          },
          {
            icon: <Activity size={26} className="text-[#4f6df5]" />,
            title: "1,245",
            label: "User Activity Count",
          },
          {
            icon: <CheckCircle size={26} className="text-[#4f6df5]" />,
            title: "82",
            label: "Active Subscriptions",
          },
        ].map((item, index) => (
          <div
            key={index}
            className="
              bg-white dark:bg-[#1f2125]
              rounded-2xl shadow-sm p-4 sm:p-6
              border border-[#e5e7eb] dark:border-[#2a2c31]
            "
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div
                className="
                  w-12 h-12 sm:w-14 sm:h-14 rounded-xl
                  bg-[#eef2ff] dark:bg-[#272a35]
                  flex items-center justify-center
                "
              >
                {item.icon}
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-bold">{item.title}</h2>
                <p className="text-gray-600 dark:text-[#9da3ae] text-xs sm:text-sm">
                  {item.label}
                </p>
              </div>
            </div>

            <div className="border-b my-3 sm:my-4 border-[#eceff5] dark:border-[#2a2c31]"></div>

            <p className="text-gray-500 dark:text-[#9da3ae] text-xs sm:text-sm">
              {index === 0 && "+8% from last month"}
              {index === 1 && "Active users this week"}
              {index === 2 && "Clients with active plans"}
            </p>
          </div>
        ))}
      </div>

  
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
   
        <div
          className="
            bg-white dark:bg-[#1f2125]
            rounded-2xl shadow-sm p-4 sm:p-6
            border border-[#e5e7eb] dark:border-[#2a2c31]
          "
        >
          <h2 className="text-lg font-semibold mb-3 sm:mb-4">Admin Tools</h2>

          {[
            { key: "impersonate", label: "Impersonate Admin" },
            { key: "roles", label: "Manage Roles & Permissions" },
            { key: "settings", label: "Platform Settings" },
          ].map((btn) => (
            <button
              key={btn.key}
              onClick={() => setActiveTool(btn.key)}
              className={`w-full py-2.5 rounded-lg font-medium mb-2.5 sm:mb-3 text-sm sm:text-base transition ${
                activeTool === btn.key
                  ? "bg-[#4f6df5] text-white"
                  : "bg-white dark:bg-[#272a35] border border-gray-300 dark:border-[#34363c] text-gray-700 dark:text-[#c7c7c7] hover:bg-gray-50 dark:hover:bg-[#30333a]"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

     
        <div
          className="
            bg-white dark:bg-[#1f2125]
            rounded-2xl shadow-sm p-4 sm:p-6
            border border-[#e5e7eb] dark:border-[#2a2c31]
          "
        >
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">
            Website & Subscription Overview
          </h2>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2 sm:gap-0">
            <p className="text-[15px] sm:text-[17px] font-semibold">
              Website Status:
            </p>
            <div
              className="
                inline-flex items-center gap-2
                bg-[#eef2ff] dark:bg-[#272a35]
                border border-[#d9dfff] dark:border-[#333]
                text-[#1a1f36] dark:text-[#e6e6e6]
                px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm
              "
            >
              <CheckCircle size={16} className="text-[#4f6df5]" />
              Operational
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2 sm:gap-0">
            <p className="text-[15px] sm:text-[17px] font-semibold">
              Subscription System:
            </p>
            <div
              className="
                inline-flex items-center gap-2
                bg-[#e6fbe7] dark:bg-[#1d3523]
                border border-[#c8f5cc] dark:border-[#2f4d34]
                text-green-700 dark:text-green-300
                px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm
              "
            >
              <CheckCircle
                size={16}
                className="text-green-600 dark:text-green-300"
              />
              Active
            </div>
          </div>

          <p className="text-gray-600 dark:text-[#9da3ae] leading-relaxed text-[13px] sm:text-[15px]">
            All core systems are running smoothly. No critical issues detected.
          </p>
        </div>
      </div>

      <div
        className="
          bg-white dark:bg-[#1f2125]
          rounded-2xl shadow-sm p-4 sm:p-6 mt-8 sm:mt-10
          border border-[#e5e7eb] dark:border-[#2a2c31]
          w-full max-w-full
        "
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold">All Clients</h2>
            <p className="text-gray-600 dark:text-[#9da3ae] text-xs sm:text-sm">
              Manage and monitor all client organizations
            </p>
          </div>

          <button
            className="
              bg-[#4f6df5] text-white
              px-4 sm:px-5 py-2
              rounded-lg
              text-xs sm:text-sm font-medium
              shadow-md hover:bg-[#3f58d4]
              transition self-start sm:self-auto
            "
          >
            Add New Clients
          </button>
        </div>


        <div className="mt-3 sm:mt-4 hidden sm:block">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-[#e8edff] dark:bg-[#23262b] text-[#4f6df5] dark:text-[#b5c6ff]">
                <th className="py-2.5 sm:py-3 px-2 sm:px-4 font-semibold">
                  Organization
                </th>
                <th className="py-2.5 sm:py-3 px-2 sm:px-4 font-semibold">
                  Subscription Plan
                </th>
                <th className="py-2.5 sm:py-3 px-2 sm:px-4 font-semibold">
                  Users
                </th>
                <th className="py-2.5 sm:py-3 px-2 sm:px-4 font-semibold">
                  Exam
                </th>
                <th className="py-2.5 sm:py-3 px-2 sm:px-4 font-semibold">
                  Revenue
                </th>
                <th className="py-2.5 sm:py-3 px-2 sm:px-4 font-semibold">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="text-gray-700 dark:text-[#d1d1d1]">
              {clientsData.map((r, i) => (
                <tr key={i} className="border-b dark:border-[#2a2c31]">
                  <td className="py-3 sm:py-4 px-2 sm:px-4">
                    <span className="break-words">{r.org}</span>
                  </td>
                  <td className="py-3 sm:py-4 px-2 sm:px-4">
                    <span className="break-words">{r.plan}</span>
                  </td>
                  <td className="py-3 sm:py-4 px-2 sm:px-4">{r.users}</td>
                  <td className="py-3 sm:py-4 px-2 sm:px-4">{r.exam}</td>
                  <td className="py-3 sm:py-4 px-2 sm:px-4">
                    <span className="break-words">{r.rev}</span>
                  </td>
                  <td className="py-3 sm:py-4 px-2 sm:px-4">
                    <span
                      className={`px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-sm font-medium ${
                        r.color === "green"
                          ? "bg-green-100 dark:bg-[#14341c] text-green-700 dark:text-green-300"
                          : r.color === "yellow"
                          ? "bg-yellow-100 dark:bg-[#3b2f12] text-yellow-700 dark:text-yellow-300"
                          : "bg-red-100 dark:bg-[#3b1717] text-red-700 dark:text-red-300"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      
        <div className="mt-3 grid gap-3 sm:hidden">
          {clientsData.map((r, i) => (
            <div
              key={i}
              className="
                border border-[#e5e7eb] dark:border-[#2a2c31]
                rounded-xl p-3 bg-white dark:bg-[#1f2125]
              "
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <h3 className="font-semibold text-sm break-words">
                  {r.org}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                    r.color === "green"
                      ? "bg-green-100 dark:bg-[#14341c] text-green-700 dark:text-green-300"
                      : r.color === "yellow"
                      ? "bg-yellow-100 dark:bg-[#3b2f12] text-yellow-700 dark:text-yellow-300"
                      : "bg-red-100 dark:bg-[#3b1717] text-red-700 dark:text-red-300"
                  }`}
                >
                  {r.status}
                </span>
              </div>

              <p className="text-[11px] text-gray-600 dark:text-[#9da3ae] mb-2">
                Plan: <span className="font-medium">{r.plan}</span>
              </p>

              <div className="grid grid-cols-3 gap-2 text-[11px]">
                <div>
                  <p className="text-gray-500 dark:text-[#9da3ae]">Users</p>
                  <p className="font-semibold">{r.users}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-[#9da3ae]">Exams</p>
                  <p className="font-semibold">{r.exam}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-[#9da3ae]">Revenue</p>
                  <p className="font-semibold break-words">{r.rev}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
