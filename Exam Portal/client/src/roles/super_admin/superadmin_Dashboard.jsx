
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Users,
  CheckCircle,
  X,
  UserCheck,
  User,
  BarChart2,
  Clock,
  RefreshCcw,
} from "lucide-react";

export default function Superadmin_Dashboard() {
  const API_BASE = "http://localhost:5000/superadmin/dashboard";

  const [activeTool, setActiveTool] = useState("impersonate");
  const [showImpersonateModal, setShowImpersonateModal] = useState(false);
  const [showOrgModal, setShowOrgModal] = useState(false);

  const [impersonateForm, setImpersonateForm] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  const [orgForm, setOrgForm] = useState({
    fullName: "",
    description: "",
  });

  const [summary, setSummary] = useState({
    totalClients: 0,
    activeSubscribers: 0,
    totalUsers: 0,
    totalRevenue: "$0",
    uptime: "0%",
    renewalRate: "0%",
  });

  const [clientsData, setClientsData] = useState([]);

  const fetchSummary = async () => {
    try {
      const res = await axios.get(`${API_BASE}/summary`);
      setSummary(res.data.data);
    } catch (err) {
      console.error("Dashboard summary error:", err);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await axios.get(`${API_BASE}/clients`);
      setClientsData(res.data.data);
    } catch (err) {
      console.error("Clients loading error:", err);
    }
  };

  useEffect(() => {
    fetchSummary();
    fetchClients();
  }, []);

  const getStatusColor = (status) => {
    if (status === "Active")
      return "bg-green-100 text-green-700 dark:bg-[#14341c] dark:text-green-300";
    if (status === "Trial")
      return "bg-yellow-100 text-yellow-700 dark:bg-[#3b2f12] dark:text-yellow-300";
    return "bg-red-100 text-red-700 dark:bg-[#3b1717] dark:text-red-300";
  };

  const handleToolClick = (key) => {
    setActiveTool(key);

    if (key === "impersonate") {
      setShowImpersonateModal(true);
    } else if (key === "roles") {
      setShowOrgModal(true);
    }
  };

  const handleSaveImpersonate = async () => {
    try {
      await axios.put(`${API_BASE}/impersonate-admin/1`, {
        fullName: impersonateForm.fullName,
        email: impersonateForm.email,
        phone: impersonateForm.phone,
      });
      setShowImpersonateModal(false);
      fetchSummary();
      fetchClients();
    } catch (err) {
      console.error("Failed to save impersonate:", err);
      alert("Failed to save impersonate admin");
    }
  };

  const handleSaveOrg = async () => {
    try {
      await axios.put(`${API_BASE}/organization/update/1`, {
        fullName: orgForm.fullName,
        description: orgForm.description,
      });
      setShowOrgModal(false);
      fetchClients();
    } catch (err) {
      console.error("Failed to save org:", err);
      alert("Failed to update organization");
    }
  };

  const summaryCards = [
    {
      icon: <Users size={28} className="text-[#4f6df5]" />,
      value: summary.totalClients,
      label: "Total Clients",
      sub: "+8% from last month",
    },
    {
      icon: <UserCheck size={28} className="text-[#4f6df5]" />,
      value: summary.activeSubscribers,
      label: "Active Subscribers",
      sub: "+8% from last month",
    },
    {
      icon: <User size={28} className="text-[#4f6df5]" />,
      value: summary.totalUsers,
      label: "Total Users",
      sub: "+10% from last month",
    },
    {
      icon: <BarChart2 size={28} className="text-[#4f6df5]" />,
      value: summary.totalRevenue,
      label: "Total Revenue",
      sub: "Target $6M annually",
    },
    {
      icon: <Clock size={28} className="text-[#4f6df5]" />,
      value: summary.uptime,
      label: "Website Uptime",
      sub: "No down time this month",
    },
    {
      icon: <RefreshCcw size={28} className="text-[#4f6df5]" />,
      value: summary.renewalRate,
      label: "Subscription Renewal Rate",
      sub: "Improved by 2% this quarter",
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

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mt-6">
        {summaryCards.map((item, index) => (
          <div
            key={index}
            className="
              bg-white dark:bg-[#1f2125]
              rounded-2xl shadow-sm p-5 sm:p-6
              border border-[#e5e7eb] dark:border-[#2a2c31]
            "
          >
            <div className="flex items-center gap-4">
              <div
                className="
                  w-12 h-12 sm:w-14 sm:h-14 rounded-xl
                  bg-[#eef2ff] dark:bg-[#272a35]
                  flex items-center justify-center flex-shrink-0
                "
              >
                {item.icon}
              </div>

              <div className="min-w-0">
                <h2 className="text-2xl sm:text-3xl font-bold truncate">
                  {item.value}
                </h2>
                <p className="text-gray-600 dark:text-[#9da3ae] text-xs sm:text-sm">
                  {item.label}
                </p>
              </div>
            </div>

            <div className="border-b my-4 border-[#eceff5] dark:border-[#2a2c31]" />

            <p className="text-gray-500 dark:text-[#9da3ae] text-xs sm:text-sm">
              {item.sub}
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
          <h2 className="text-lg sm:text-xl font-semibold mb-4">
            Admin Tools
          </h2>

          {[
            { key: "impersonate", label: "Impersonate Admin" },
            { key: "roles", label: "Manage Roles & Permissions" },
            { key: "settings", label: "Platform Settings" },
          ].map((btn) => (
            <button
              key={btn.key}
              onClick={() => handleToolClick(btn.key)}
              className={`w-full py-2.5 rounded-lg font-medium mb-3 text-xs sm:text-sm transition ${
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
          <h2 className="text-lg sm:text-xl font-semibold mb-6">
            Website & Subscription Overview
          </h2>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <p className="text-[15px] sm:text-[17px] font-semibold">
              Website Status:
            </p>
            <div className="inline-flex items-center gap-2 bg-[#eef2ff] dark:bg-[#272a35] px-3 py-1.5 rounded-full text-xs sm:text-sm">
              <CheckCircle size={16} className="text-[#4f6df5]" />
              Operational
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <p className="text-[15px] sm:text-[17px] font-semibold">
              Subscription System:
            </p>
            <div className="inline-flex items-center gap-2 bg-[#e6fbe7] dark:bg-[#1d3523] px-3 py-1.5 rounded-full text-xs sm:text-sm">
              <CheckCircle
                size={16}
                className="text-green-600 dark:text-green-300"
              />
              Active
            </div>
          </div>

          <p className="text-gray-600 dark:text-[#9da3ae] text-sm sm:text-[15px]">
            All core systems are running smoothly. No critical issues detected.
          </p>
        </div>
      </div>

      <div
        className="
          bg-white dark:bg-[#1f2125]
          rounded-2xl shadow-sm p-4 sm:p-6 mt-10
          border border-[#e5e7eb] dark:border-[#2a2c31]
          w-full
        "
      >
        <div className="mb-4">
          <h2 className="text-lg sm:text-xl font-semibold">All Clients</h2>
          <p className="text-gray-600 dark:text-[#9da3ae] text-xs sm:text-sm">
            Manage and monitor all client organizations
          </p>
        </div>

        {/* MOBILE HEADINGS BAR */}
        <div className="sm:hidden mt-3 overflow-x-auto">
          <div className="min-w-[640px] bg-[#e8edff] dark:bg-[#23262b] text-[#4f6df5] text-xs font-semibold flex">
            <div className="py-2 px-4 w-1/6">Organization</div>
            <div className="py-2 px-4 w-1/6">Subscription Plan</div>
            <div className="py-2 px-4 w-1/6">Users</div>
            <div className="py-2 px-4 w-1/6">Exam</div>
            <div className="py-2 px-4 w-1/6">Revenue</div>
            <div className="py-2 px-4 w-1/6">Status</div>
          </div>
        </div>

        <div className="hidden sm:block mt-3 overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-[#e8edff] dark:bg-[#23262b] text-[#4f6df5]">
                <th className="py-3 px-4">Organization</th>
                <th className="py-3 px-4">Subscription Plan</th>
                <th className="py-3 px-4">Users</th>
                <th className="py-3 px-4">Exam</th>
                <th className="py-3 px-4">Revenue</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>

            <tbody>
              {clientsData.map((c, i) => (
                <tr key={i} className="border-b dark:border-[#2a2c31]">
                  <td className="py-4 px-4">{c.organization}</td>
                  <td className="py-4 px-4">{c.subscriptionPlan}</td>
                  <td className="py-4 px-4">{c.users}</td>
                  <td className="py-4 px-4">{c.exam}</td>
                  <td className="py-4 px-4">{c.revenue}</td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        c.status
                      )}`}
                    >
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="sm:hidden grid gap-3 mt-4">
          {clientsData.map((c, i) => (
            <div
              key={i}
              className="border rounded-xl p-3 bg-white dark:bg-[#1f2125]"
            >
              <div className="flex justify-between mb-2">
                <h3 className="font-semibold text-sm">{c.organization}</h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] ${getStatusColor(
                    c.status
                  )}`}
                >
                  {c.status}
                </span>
              </div>

              <p className="text-[11px] mb-2">
                Plan:{" "}
                <span className="font-medium">{c.subscriptionPlan}</span>
              </p>

              <div className="grid grid-cols-3 gap-2 text-[11px]">
                <div>
                  <p className="text-gray-500">Users</p>
                  <p className="font-semibold">{c.users}</p>
                </div>
                <div>
                  <p className="text-gray-500">Exams</p>
                  <p className="font-semibold">{c.exam}</p>
                </div>
                <div>
                  <p className="text-gray-500">Revenue</p>
                  <p className="font-semibold">{c.revenue}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showImpersonateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-3">
          <div
            className="
              bg-white dark:bg-[#1f2125]
              text-black dark:text-white
              rounded-2xl w-full max-w-[520px] p-6 relative
              border border-gray-200 dark:border-[#2a2c31]
            "
          >
            <h2 className="text-lg sm:text-xl font-semibold text-[#4f6df5] dark:text-[#8095ff]">
              Impersonate Admin
            </h2>

            <X
              size={22}
              className="absolute top-4 right-4 cursor-pointer text-gray-700 dark:text-gray-300"
              onClick={() => setShowImpersonateModal(false)}
            />

            <div className="mt-5">
              <label className="block text-gray-600 dark:text-gray-300 text-sm">
                Full Name
              </label>
              <input
                type="text"
                className="
                  w-full border p-3 rounded-lg mt-2 text-sm
                  bg-white dark:bg-[#272a35]
                  border-gray-300 dark:border-[#34363c]
                  text-black dark:text-white
                "
                value={impersonateForm.fullName}
                onChange={(e) =>
                  setImpersonateForm({
                    ...impersonateForm,
                    fullName: e.target.value,
                  })
                }
              />

              <label className="block mt-4 text-gray-600 dark:text-gray-300 text-sm">
                Email
              </label>
              <input
                type="email"
                className="
                  w-full border p-3 rounded-lg mt-2 text-sm
                  bg-white dark:bg-[#272a35]
                  border-gray-300 dark:border-[#34363c]
                  text-black dark:text-white
                "
                value={impersonateForm.email}
                onChange={(e) =>
                  setImpersonateForm({
                    ...impersonateForm,
                    email: e.target.value,
                  })
                }
              />

              <label className="block mt-4 text-gray-600 dark:text-gray-300 text-sm">
                Phone
              </label>
              <input
                type="text"
                className="
                  w-full border p-3 rounded-lg mt-2 text-sm
                  bg-white dark:bg-[#272a35]
                  border-gray-300 dark:border-[#34363c]
                  text-black dark:text-white
                "
                value={impersonateForm.phone}
                onChange={(e) =>
                  setImpersonateForm({
                    ...impersonateForm,
                    phone: e.target.value,
                  })
                }
              />

              <button
                onClick={handleSaveImpersonate}
                className="block mx-auto mt-6 bg-[#4f6df5] text-white py-2.5 px-8 rounded-lg text-sm sm:text-base"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showOrgModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-3">
          <div
            className="
              bg-white dark:bg-[#1f2125]
              text-black dark:text-white
              rounded-2xl w-full max-w-[520px] p-6 relative
              border border-gray-200 dark:border-[#2a2c31]
            "
          >
            <h2 className="text-lg sm:text-xl font-semibold text-[#4f6df5] dark:text-[#8095ff]">
              Manage Organizations
            </h2>

            <X
              size={22}
              className="absolute top-4 right-4 cursor-pointer text-gray-700 dark:text-gray-300"
              onClick={() => setShowOrgModal(false)}
            />

            <div className="mt-5">
              <label className="block text-gray-600 dark:text-gray-300 text-sm">
                Full Name
              </label>
              <input
                type="text"
                className="
                  w-full border p-3 rounded-lg mt-2 text-sm
                  bg-white dark:bg-[#272a35]
                  border-gray-300 dark:border-[#34363c]
                  text-black dark:text-white
                "
                value={orgForm.fullName}
                onChange={(e) =>
                  setOrgForm({ ...orgForm, fullName: e.target.value })
                }
              />

              <label className="block mt-4 text-gray-600 dark:text-gray-300 text-sm">
                Description
              </label>
              <textarea
                className="
                  w-full border p-3 rounded-lg mt-2 h-28 text-sm
                  bg-white dark:bg-[#272a35]
                  border-gray-300 dark:border-[#34363c]
                  text-black dark:text-white
                "
                value={orgForm.description}
                onChange={(e) =>
                  setOrgForm({ ...orgForm, description: e.target.value })
                }
              />

              <button
                onClick={handleSaveOrg}
                className="block mx-auto mt-6 bg-[#4f6df5] text-white py-2.5 px-8 rounded-lg text-sm sm:text-base"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
