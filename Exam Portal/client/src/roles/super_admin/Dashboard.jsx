import React, { useState } from "react";
import { Users, Activity, CheckCircle } from "lucide-react";

export default function Dashboard() {
  const [activeTool, setActiveTool] = useState("impersonate");

  return (
    <div
      className="
      w-full 
      px-6 pb-6 
      text-[#1a1f36] dark:text-[#e6e6e6]
      bg-[#f5f6fa] dark:bg-[#181a1e]
    "
    >
    
      <h1 className="text-3xl font-bold">
        Welcome, <span className="text-[#4f6df5]">Super Admin</span>
      </h1>

      <p className="text-gray-600 dark:text-[#9da3ae] mt-1">
        Here’s an overview of your platform’s key metrics and performance.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {[
          {
            icon: <Users size={30} className="text-[#4f6df5]" />,
            title: "2,500",
            label: "Total Clients",
          },
          {
            icon: <Activity size={30} className="text-[#4f6df5]" />,
            title: "1,245",
            label: "User Activity Count",
          },
          {
            icon: <CheckCircle size={30} className="text-[#4f6df5]" />,
            title: "82",
            label: "Active Subscriptions",
          },
        ].map((item, index) => (
          <div
            key={index}
            className="
              bg-white dark:bg-[#1f2125]
              rounded-2xl shadow-sm p-6
              border border-[#e5e7eb] dark:border-[#2a2c31]
            "
          >
            <div className="flex items-center gap-4">
              <div
                className="
                w-14 h-14 rounded-xl
                bg-[#eef2ff] dark:bg-[#272a35]
                flex items-center justify-center
              "
              >
                {item.icon}
              </div>

              <div>
                <h2 className="text-3xl font-bold">{item.title}</h2>
                <p className="text-gray-600 dark:text-[#9da3ae] text-sm">
                  {item.label}
                </p>
              </div>
            </div>

            <div className="border-b my-4 border-[#eceff5] dark:border-[#2a2c31]"></div>

            <p className="text-gray-500 dark:text-[#9da3ae] text-sm">
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
          rounded-2xl shadow-sm p-6
          border border-[#e5e7eb] dark:border-[#2a2c31]
        "
        >
          <h2 className="text-lg font-semibold mb-4">Admin Tools</h2>

          {[
            { key: "impersonate", label: "Impersonate Admin" },
            { key: "roles", label: "Manage Roles & Permissions" },
            { key: "settings", label: "Platform Settings" },
          ].map((btn) => (
            <button
              key={btn.key}
              onClick={() => setActiveTool(btn.key)}
              className={`w-full py-2.5 rounded-lg font-medium mb-3 transition ${
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
          rounded-2xl shadow-sm p-6
          border border-[#e5e7eb] dark:border-[#2a2c31]
        "
        >
          <h2 className="text-2xl font-semibold mb-6">
            Website & Subscription Overview
          </h2>

          <div className="flex items-center justify-between mb-6">
            <p className="text-[17px] font-semibold">Website Status:</p>
            <div
              className="
              flex items-center gap-2
              bg-[#eef2ff] dark:bg-[#272a35]
              border border-[#d9dfff] dark:border-[#333]
              text-[#1a1f36] dark:text-[#e6e6e6]
              px-4 py-1.5 rounded-full text-sm
            "
            >
              <CheckCircle size={16} className="text-[#4f6df5]" />
              Operational
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <p className="text-[17px] font-semibold">Subscription System:</p>
            <div
              className="
              flex items-center gap-2
              bg-[#e6fbe7] dark:bg-[#1d3523]
              border border-[#c8f5cc] dark:border-[#2f4d34]
              text-green-700 dark:text-green-300
              px-4 py-1.5 rounded-full text-sm
            "
            >
              <CheckCircle size={16} className="text-green-600 dark:text-green-300" />
              Active
            </div>
          </div>

          <p className="text-gray-600 dark:text-[#9da3ae] leading-relaxed text-[15px]">
            All core systems are running smoothly. No critical issues detected.
          </p>
        </div>
      </div>

      <div
        className="
        bg-white dark:bg-[#1f2125]
        rounded-2xl shadow-sm p-6 mt-10
        border border-[#e5e7eb] dark:border-[#2a2c31]
      "
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">All Clients</h2>
            <p className="text-gray-600 dark:text-[#9da3ae] text-sm">
              Manage and monitor all client organizations
            </p>
          </div>

         
          <button
            className="
              bg-[#4f6df5] text-white
              px-5 py-2.5
              rounded-lg
              text-sm font-medium
              shadow-md hover:bg-[#3f58d4]
              transition
            "
          >
            Add New Clients
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#e8edff] dark:bg-[#23262b] text-[#4f6df5] dark:text-[#b5c6ff]">
                <th className="py-3 px-4 text-sm font-semibold">Organization</th>
                <th className="py-3 px-4 text-sm font-semibold">Subscription Plan</th>
                <th className="py-3 px-4 text-sm font-semibold">Users</th>
                <th className="py-3 px-4 text-sm font-semibold">Exam</th>
                <th className="py-3 px-4 text-sm font-semibold">Revenue</th>
                <th className="py-3 px-4 text-sm font-semibold">Status</th>
              </tr>
            </thead>

            <tbody className="text-gray-700 dark:text-[#d1d1d1]">
              {[
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
              ].map((r, i) => (
                <tr key={i} className="border-b dark:border-[#2a2c31]">
                  <td className="py-4 px-4">{r.org}</td>
                  <td className="py-4 px-4">{r.plan}</td>
                  <td className="py-4 px-4">{r.users}</td>
                  <td className="py-4 px-4">{r.exam}</td>
                  <td className="py-4 px-4">{r.rev}</td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
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
      </div>
    </div>
  );
}
