import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

import {
  Eye,
  ChevronDown,
  X,
  Search as SearchIcon,
  Plus,
} from "lucide-react";

const API_BASE = "http://localhost:5000/superadmin";

export default function Superadmin_ClientManagement() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [subFilter, setSubFilter] = useState("");
  const [openFilter, setOpenFilter] = useState(false);
  const [openSubFilter, setOpenSubFilter] = useState(null);
  const [sortOrder, setSortOrder] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [infoModal, setInfoModal] = useState(null);

  const filterRef = useRef(null);
  const menuRef = useRef(null);

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchClients = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${API_BASE}/clients`, {
        params: {
          search,
          status: filterStatus !== "All" ? subFilter : "",
          sort: sortOrder,
          page: 1,
          limit: 100,
        },
      });

      let data = res.data.data || [];

      if (sortOrder === "asc") {
        data = [...data].sort((a, b) =>
          a.organizationname.localeCompare(b.organizationname)
        );
      } else if (sortOrder === "desc") {
        data = [...data].sort((a, b) =>
          b.organizationname.localeCompare(a.organizationname)
        );
      }

      setClients(data);
    } catch (err) {
      console.error("Failed to load clients:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [search, filterStatus, subFilter, sortOrder]);

  useEffect(() => {
    function handleClick(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setOpenFilter(false);
        setOpenSubFilter(null);
      }

      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const superadmin_clientManagement_save = async (e) => {
    e.preventDefault();

    const form = new FormData(e.target);
    const data = {
      organizationName: form.get("orgName"),
      organizationId:
        editData?.organizationid ||
        "ORG" + Math.floor(1000 + Math.random() * 9000),
      subscription: editData?.subscription || "Basic",
      contactPerson: form.get("fullName"),
      email: form.get("email"),
      status: form.get("status") || "Active",
      phone: form.get("phone"),
      city: form.get("city"),
      state: form.get("state"),
      zip: form.get("zip"),
    };

    try {
      if (editData) {
        await axios.put(`${API_BASE}/clients/${editData.id}`, data);
      } else {
        await axios.post(`${API_BASE}/clients`, data);
      }

      fetchClients();
      setModalOpen(false);
      setEditData(null);
    } catch (err) {
      alert(err.response?.data?.message || "Error while saving");
    }
  };

  const superadmin_clientManagement_delete = async (id) => {
    try {
      await axios.delete(`${API_BASE}/clients/${id}`);
      fetchClients();
    } catch (err) {
      alert("Failed to delete client");
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-xl text-center font-semibold">
        Loading clients...
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 w-full">
      <div className="w-full bg-white dark:bg-[#181a1e] rounded-xl shadow-lg border border-gray-200 dark:border-[#2b2e33] p-4 sm:p-6">

  
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 w-full">
          <div className="relative w-full sm:max-w-lg">
            <SearchIcon
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              placeholder="Search by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-300 dark:border-[#2b2e33] bg-white dark:bg-[#202328] text-black dark:text-white"
            />
          </div>

 
          <div className="relative w-full sm:w-auto" ref={filterRef}>
            <button
              className="flex items-center justify-between gap-2 bg-white dark:bg-[#202328] border border-gray-300 dark:border-[#2b2e33] rounded-lg px-3 py-2 shadow-sm w-full sm:w-auto text-black dark:text-white"
              onClick={() => setOpenFilter((s) => !s)}
            >
              {filterStatus === "All"
                ? "All"
                : filterStatus === "Subscription"
                ? `Subscription (${subFilter})`
                : `Name (${sortOrder})`}
              <ChevronDown size={16} />
            </button>

            {openFilter && (
              <div className="absolute right-0 mt-2 w-48 sm:w-52 bg-white dark:bg-[#1f2227] border border-gray-300 dark:border-[#2b2e33] rounded-lg shadow-lg z-[999]">

              
                <div
                  className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#2c2f36] cursor-pointer text-black dark:text-white"
                  onClick={() => {
                    setFilterStatus("All");
                    setSubFilter("");
                    setSortOrder("");
                    setOpenFilter(false);
                  }}
                >
                  All
                </div>

                {/* Subscription */}
                <div>
                  <div
                    className="px-4 py-2 flex justify-between cursor-pointer hover:bg-gray-100 dark:hover:bg-[#2c2f36] text-black dark:text-white"
                    onClick={() =>
                      setOpenSubFilter(
                        openSubFilter === "Subscription" ? null : "Subscription"
                      )
                    }
                  >
                    Subscription <ChevronDown size={14} />
                  </div>

                  {openSubFilter === "Subscription" && (
                    <div className="bg-gray-50 dark:bg-[#262931]">
                      {["Active", "Inactive", "Trial"].map((s) => (
                        <div
                          key={s}
                          className="px-4 py-2 hover:bg-gray-200 dark:hover:bg-[#30333a] cursor-pointer text-black dark:text-white"
                          onClick={() => {
                            setFilterStatus("Subscription");
                            setSubFilter(s);
                            setOpenFilter(false);
                          }}
                        >
                          {s}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Name */}
                <div>
                  <div
                    className="px-4 py-2 flex justify-between cursor-pointer hover:bg-gray-100 dark:hover:bg-[#2c2f36] text-black dark:text-white"
                    onClick={() =>
                      setOpenSubFilter(openSubFilter === "Name" ? null : "Name")
                    }
                  >
                    Name <ChevronDown size={14} />
                  </div>

                  {openSubFilter === "Name" && (
                    <div className="bg-gray-50 dark:bg-[#262931]">
                      <div
                        className="px-4 py-2 hover:bg-gray-200 dark:hover:bg-[#30333a] cursor-pointer text-black dark:text-white"
                        onClick={() => {
                          setFilterStatus("Name");
                          setSortOrder("asc");
                          setOpenFilter(false);
                        }}
                      >
                        Ascending (A → Z)
                      </div>

                      <div
                        className="px-4 py-2 hover:bg-gray-200 dark:hover:bg-[#30333a] cursor-pointer text-black dark:text-white"
                        onClick={() => {
                          setFilterStatus("Name");
                          setSortOrder("desc");
                          setOpenFilter(false);
                        }}
                      >
                        Descending (Z → A)
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
          <h3 className="text-lg font-semibold text-black dark:text-white">
            Client Management
          </h3>

          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 w-full sm:w-auto justify-center"
            onClick={() => {
              setEditData(null);
              setModalOpen(true);
            }}
          >
            <Plus size={14} /> Add New Client
          </button>
        </div>

        {/* TABLE */}
        <div className="hidden md:block w-full overflow-x-auto">
          <table className="w-full table-auto text-black dark:text-white text-xs">
            <thead>
              <tr className="bg-[#eef3ff] dark:bg-[#1c1f24] text-left">
                <th className="py-2 px-2">Organization Name</th>
                <th className="py-2 px-2">Organization ID</th>
                <th className="py-2 px-2">Subscription</th>
                <th className="py-2 px-2">Contact Person</th>
                <th className="py-2 px-2">Contact Email</th>
                <th className="py-2 px-2">Status</th>
                <th className="py-2 px-2">Actions</th>
              </tr>
            </thead>

            <tbody ref={menuRef}>
              {clients.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-gray-300 dark:border-[#2b2e33] hover:bg-gray-50 dark:hover:bg-[#232529]"
                >
                  <td className="py-2 px-2">{c.organizationname}</td>
                  <td className="py-2 px-2">{c.organizationid}</td>
                  <td className="py-2 px-2">{c.subscription}</td>
                  <td className="py-2 px-2">{c.contactperson}</td>
                  <td className="py-2 px-2">{c.email}</td>

                  <td className="py-2 px-2">
                    <span
                      className={`px-2 py-1 text-[10px] rounded-full ${
                        c.status === "Active"
                          ? "bg-green-100 dark:bg-green-900 text-green-700"
                          : c.status === "Trial"
                          ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-700"
                          : "bg-red-100 dark:bg-red-900 text-red-700"
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>

                  <td className="py-2 px-2 relative">
                    <button
                      className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-[#2d3037]"
                      onClick={() =>
                        setOpenMenuId((prev) => (prev === c.id ? null : c.id))
                      }
                    >
                      <Eye size={14} />
                    </button>

                    {openMenuId === c.id && (
                      <div className="absolute right-0 top-8 w-28 bg-white dark:bg-[#202328] shadow-md border border-gray-200 dark:border-[#2b2e33] rounded-md z-[999] text-xs">
                        <div
                          className="px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-[#2d3037] cursor-pointer text-black dark:text-white"
                          onClick={() => {
                            setEditData(c);
                            setModalOpen(true);
                            setOpenMenuId(null);
                          }}
                        >
                          Edit
                        </div>

                        <div
                          className="px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-[#2d3037] cursor-pointer text-red-600 dark:text-red-300"
                          onClick={() =>
                            superadmin_clientManagement_delete(c.id)
                          }
                        >
                          Delete
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARDS */}
        <div className="block md:hidden space-y-4 mt-4">
          {clients.map((c) => (
            <div
              key={c.id}
              className="p-4 rounded-xl bg-[#f7f8ff] dark:bg-[#1c1f24] border dark:border-[#2b2e33] shadow"
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold text-black dark:text-white">
                  {c.organizationname}
                </h2>

                <span
                  className={`px-3 py-1 text-xs rounded-full ${
                    c.status === "Active"
                      ? "bg-green-100 dark:bg-green-900 text-green-300"
                      : c.status === "Trial"
                      ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-300"
                      : "bg-red-100 dark:bg-red-900 text-red-300"
                  }`}
                >
                  {c.status}
                </span>
              </div>

              <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                Plan: <span className="font-medium">{c.subscription}</span>
              </p>

              <div className="mt-3 flex justify-end gap-3 text-sm">
                <button
                  className="text-blue-600 dark:text-blue-400"
                  onClick={() => {
                    setEditData(c);
                    setModalOpen(true);
                  }}
                >
                  Edit
                </button>

                <button
                  className="text-red-600 dark:text-red-400"
                  onClick={() => superadmin_clientManagement_delete(c.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000] px-4 sm:px-6">
          <div className="bg-white dark:bg-[#1c1f24] w-full max-w-3xl sm:max-w-4xl p-4 sm:p-6 rounded-2xl shadow-xl relative max-h-[92vh] overflow-y-auto">

            <button
              className="absolute top-4 right-4 p-2 rounded-full text-black dark:text-white hover:bg-gray-100 dark:hover:bg-[#2d3037]"
              onClick={() => {
                setModalOpen(false);
                setEditData(null);
              }}
            >
              <X size={20} strokeWidth={2} />
            </button>

            <h3 className="text-2xl font-semibold text-[#4f6df5] mb-6">
              {editData ? "Edit Client" : "Add New Client"}
            </h3>

            <form
              onSubmit={superadmin_clientManagement_save}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6"
            >

              {[
                { name: "fullName", label: "Full Name", val: "contactperson", req: true },
                { name: "email", label: "Contact Email", val: "email", req: true },
                { name: "orgName", label: "Organization Name", val: "organizationname", req: true },
                { name: "phone", label: "Phone", val: "phone" },
                { name: "city", label: "City", val: "city" },
                { name: "state", label: "State", val: "state" },
                { name: "zip", label: "Zip Code", val: "zip" }
              ].map((f, i) => (
                <div key={i}>
                  <label className="text-sm font-medium dark:text-white">{f.label}</label>
                  <input
                    name={f.name}
                    required={f.req}
                    defaultValue={editData?.[f.val]}
                    className="
                      w-full mt-1 p-3 rounded-lg border 
                      bg-gray-100 text-black placeholder-gray-500
                      dark:bg-[#2a2d33] dark:text-white dark:placeholder-gray-400 
                      dark:border-[#3a3d44]
                      focus:ring-2 focus:ring-blue-600 focus:border-blue-600
                    "
                  />
                </div>
              ))}

              <div>
                <label className="text-sm font-medium dark:text-white">Status</label>
                <select
                  name="status"
                  defaultValue={editData?.status || "Active"}
                  className="
                    w-full mt-1 p-3 rounded-lg border 
                    bg-gray-100 text-black
                    dark:bg-[#2a2d33] dark:text-white dark:border-[#3a3d44]
                    focus:ring-2 focus:ring-blue-600 focus:border-blue-600
                  "
                >
                  <option value="Active">Active</option>
                  <option value="Trial">Trial</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="col-span-1 sm:col-span-2 flex justify-center">
                <button
                  type="submit"
                  className="px-10 py-3 bg-blue-600 text-white rounded-lg text-lg"
                >
                  Save
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
