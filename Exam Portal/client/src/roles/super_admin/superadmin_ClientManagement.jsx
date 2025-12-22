import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Eye, ChevronDown, X, Plus, Edit, Trash2, Search } from "lucide-react";

const API_BASE = "http://localhost:5000/superadmin/client-managment";

export default function Superadmin_ClientManagement() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [subFilter, setSubFilter] = useState("");
  const [openFilter, setOpenFilter] = useState(false);
  const [openSubFilter, setOpenSubFilter] = useState(null);

  const [sortOrder, setSortOrder] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editOrg, setEditOrg] = useState(null);

  const [statusMenuOrg, setStatusMenuOrg] = useState(null);
  const [infoModal, setInfoModal] = useState(null);

  const [orgUsers, setOrgUsers] = useState([{ email: "", role: "Admin", fullName: "" }]);

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 4;

  const filterRef = useRef(null);
  const menuRef = useRef(null);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}`);
      let data = res.data.data || [];

      data = data.map((d) => ({
        name: d.name ?? d.organizationname ?? "",
        org_id: d.org_id ?? d.organizationid ?? d.organizationid?.toString(),
        subscription: d.subscription ?? d.plan_name ?? d.subscription,
        contact_person: d.contact_person ?? d.contactperson ?? d.contact_person,
        contact_email:
          d.contact_email ??
          d.contact_email ??
          d.contact_email ??
          d.contactemail ??
          d.contact_email,
        description: d.description ?? "",
        status: (d.status ?? "active").toLowerCase(),
        raw: d,
      }));

      setClients(data);
    } catch (err) {
      console.error("Failed to load organizations:", err);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    function handleClick(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setOpenFilter(false);
        setOpenSubFilter(null);
      }
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setStatusMenuOrg(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const getFilteredSorted = () => {
    let data = [...clients];

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (c) =>
          (c.name || "").toLowerCase().includes(q) ||
          (c.contact_email || "").toLowerCase().includes(q)
      );
    }

    if (filterStatus === "Subscription" && subFilter) {
      data = data.filter(
        (c) =>
          (c.subscription || "none").toLowerCase() ===
          subFilter.toLowerCase()
      );
    }

    if (filterStatus === "Name" && sortOrder) {
      data.sort((a, b) =>
        sortOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name)
      );
    }

    return data;
  };

  const filteredData = getFilteredSorted();

  useEffect(() => {
    const newTotal = Math.max(1, Math.ceil(filteredData.length / perPage));
    if (currentPage > newTotal) setCurrentPage(newTotal);
  }, [
    search,
    filterStatus,
    subFilter,
    sortOrder,
    clients,
    filteredData.length,
    currentPage,
    perPage,
  ]);

  const totalFilteredPages = Math.max(1, Math.ceil(filteredData.length / perPage));

  const pageItems = () => {
    const pages = [];
    const maxShow = 5;
    if (totalFilteredPages <= maxShow) {
      for (let i = 1; i <= totalFilteredPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalFilteredPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalFilteredPages - 2) pages.push("...");
      pages.push(totalFilteredPages);
    }
    return pages;
  };

  const updateOrgStatus = async (org, newStatus) => {
    try {
      await axios.put(`${API_BASE}/${org.org_id}`, {
        organizationName: org.name,
        description: org.description || "",
        status: newStatus.toLowerCase(),
      });

      await fetchClients();
      setStatusMenuOrg(null);
    } catch (err) {
      console.error("Update status failed", err);
      alert("Failed to update status");
    }
  };

  const deleteOrganization = async (orgId) => {
    if (!window.confirm("Are you sure you want to delete this organization?")) return;
    try {
      await axios.delete(`${API_BASE}/${orgId}`);
      await fetchClients();
    } catch (err) {
      console.error(err);
      alert("Failed to delete organization");
    }
  };

  const openInfo = async (org) => {
    try {
      const res = await axios.get(`${API_BASE}/${org.org_id}/info`);
      setInfoModal(res.data.data);
    } catch (err) {
      console.error("Failed to load info", err);
      alert("Failed to load information");
    }
  };

  const saveOrganization = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const orgName = form.get("organizationName");
    const description = form.get("description") || "";

    try {
      if (editOrg) {
        await axios.put(`${API_BASE}/${editOrg.org_id}`, {
          organizationName: orgName,
          description,
          status: editOrg.status || "active",
        });
      } else {
        if (!orgUsers[0] || !orgUsers[0].email || !orgUsers[0].fullName) {
          alert("Please provide contact person name and email for the first user.");
          return;
        }

        const payload = {
          organizationName: orgName,
          description,
          email: orgUsers[0].email,
          role: orgUsers[0].role,
          fullName: orgUsers[0].fullName,
        };

        const res = await axios.post(`${API_BASE}`, payload);

        const createdOrg = res.data.organization || res.data.data || res.data.organization;
        const orgId =
          createdOrg?.org_id ||
          createdOrg?.org_id ||
          createdOrg?.org_id ||
          res.data.organization?.org_id;

        if (orgId && orgUsers.length > 1) {
          for (let i = 1; i < orgUsers.length; i++) {
            const u = orgUsers[i];
            if (!u.email || !u.fullName) continue;
            try {
              await axios.post(`${API_BASE}/${orgId}/users`, {
                email: u.email,
                role: u.role,
                fullName: u.fullName,
              });
            } catch (err) {
              console.warn("Failed to add extra user", u.email, err);
            }
          }
        }
      }

      setModalOpen(false);
      setOrgUsers([{ email: "", role: "Admin", fullName: "" }]);
      setEditOrg(null);
      await fetchClients();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Error while saving organization";
      alert(msg);
    }
  };

  const addUserField = () => {
    setOrgUsers([...orgUsers, { email: "", role: "Admin", fullName: "" }]);
  };

  const removeUserField = (idx) => {
    setOrgUsers(orgUsers.filter((_, i) => i !== idx));
  };

  const updateUserField = (idx, key, val) => {
    const copy = [...orgUsers];
    copy[idx][key] = val;
    setOrgUsers(copy);
  };

  if (loading) {
    return <div className="p-6 text-center text-lg font-semibold">Loading organizations...</div>;
  }

  const pagedData = filteredData.slice((currentPage - 1) * perPage, currentPage * perPage);

  return (
    <div className="p-4 sm:p-6 w-full max-w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-300 bg-white text-gray-700 dark:bg-[#10131a] dark:border-gray-700 dark:text-gray-100 dark:placeholder:text-gray-500 text-sm sm:text-base"
            placeholder="Search organization"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="relative w-full sm:w-auto flex sm:block justify-end" ref={filterRef}>
          <button
            className="flex items-center justify-between sm:justify-center gap-2 bg-white dark:bg-[#10131a] border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2 shadow-sm text-gray-800 dark:text-gray-100 w-full sm:w-auto text-sm"
            onClick={() => setOpenFilter((s) => !s)}
          >
            <span className="truncate">
              {filterStatus === "All"
                ? "All"
                : filterStatus === "Subscription"
                ? `Subscription${subFilter ? ` (${subFilter})` : ""}`
                : `Name${sortOrder ? ` (${sortOrder})` : ""}`}
            </span>
            <ChevronDown size={16} className="flex-shrink-0" />
          </button>

          {openFilter && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-40 text-sm">
              <div
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer text-gray-800 dark:text-gray-100"
                onClick={() => {
                  setFilterStatus("All");
                  setSubFilter("");
                  setSortOrder("");
                  setOpenFilter(false);
                  setCurrentPage(1);
                }}
              >
                All
              </div>

              <div>
                <div
                  className="px-4 py-2 flex justify-between cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-100"
                  onClick={() =>
                    setOpenSubFilter((s) => (s === "Subscription" ? null : "Subscription"))
                  }
                >
                  Subscription <ChevronDown size={14} />
                </div>
                {openSubFilter === "Subscription" && (
                  <div className="bg-gray-50 dark:bg-[#020617]">
                    {["Active", "Inactive", "Trial"].map((s) => (
                      <div
                        key={s}
                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer text-gray-800 dark:text-gray-100"
                        onClick={() => {
                          setFilterStatus("Subscription");
                          setSubFilter(s);
                          setOpenFilter(false);
                          setCurrentPage(1);
                        }}
                      >
                        {s}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div
                  className="px-4 py-2 flex justify-between cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-100"
                  onClick={() => setOpenSubFilter((s) => (s === "Name" ? null : "Name"))}
                >
                  Name <ChevronDown size={14} />
                </div>

                {openSubFilter === "Name" && (
                  <div className="bg-gray-50 dark:bg-[#020617]">
                    <div
                      className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer text-gray-800 dark:text-gray-100"
                      onClick={() => {
                        setFilterStatus("Name");
                        setSortOrder("asc");
                        setOpenFilter(false);
                        setCurrentPage(1);
                      }}
                    >
                      Ascending (A → Z)
                    </div>
                    <div
                      className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer text-gray-800 dark:text-gray-100"
                      onClick={() => {
                        setFilterStatus("Name");
                        setSortOrder("desc");
                        setOpenFilter(false);
                        setCurrentPage(1);
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

      <div className="bg-white dark:bg-[#1f2933] rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
              Client Management
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">All Clients in the system</p>
          </div>

          <button
            className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm flex items-center gap-2 hover:bg-blue-700 transition w-full sm:w-auto justify-center"
            onClick={() => {
              setEditOrg(null);
              setOrgUsers([{ email: "", role: "Admin", fullName: "" }]);
              setModalOpen(true);
            }}
          >
            <Plus size={14} /> Add New Organization
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="bg-[#eef3ff] dark:bg-[#111827] text-blue-700 dark:text-blue-300">
                <th className="py-3 px-2 text-left">Organization Name</th>
                <th className="py-3 px-2 text-left">Organization ID</th>
                <th className="py-3 px-2 text-left">Subscription</th>
                <th className="py-3 px-2 text-left">Contact Person</th>
                <th className="py-3 px-2 text-left">Email</th>
                <th className="py-3 px-2 text-left">Status</th>
                <th className="py-3 px-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody ref={menuRef}>
              {pagedData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-gray-500 dark:text-gray-400">
                    No organizations found.
                  </td>
                </tr>
              ) : (
                pagedData.map((org) => (
                  <tr
                    key={org.org_id}
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#020617]"
                  >
                    <td className="px-2 py-3 text-gray-800 dark:text-gray-100">{org.name}</td>
                    <td className="px-2 py-3 text-gray-800 dark:text-gray-100">{org.org_id}</td>
                    <td className="px-2 py-3 text-gray-800 dark:text-gray-100">{org.subscription || "None"}</td>
                    <td className="px-2 py-3 text-gray-800 dark:text-gray-100">{org.contact_person}</td>
                    <td className="px-2 py-3 text-gray-800 dark:text-gray-100 break-all">{org.contact_email}</td>

                    <td className="px-2 py-3">
                      <span
                        className={`px-3 py-1 text-[11px] sm:text-xs rounded-full ${
                          org.status === "active"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                            : "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300"
                        }`}
                      >
                        {org.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-2 py-3">
                      <div className="flex items-center gap-2 relative">
                        <button
                          className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-100"
                          onClick={() => openInfo(org)}
                          title="View Information"
                        >
                          <Eye size={16} />
                        </button>

                        <div className="relative">
                          <button
                            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-100"
                            onClick={() => setStatusMenuOrg((prev) => (prev === org.org_id ? null : org.org_id))}
                            title="Change status"
                          >
                            <Edit size={16} />
                          </button>

                          {statusMenuOrg === org.org_id && (
                            <div className="absolute right-0 top-8 w-28 bg-white dark:bg-[#020617] border border-gray-200 dark:border-gray-700 rounded-md shadow-md z-40 text-xs sm:text-sm">
                              <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-100">
                                <Edit size={14} />
                              </div>
                              <div
                                className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer text-gray-800 dark:text-gray-100"
                                onClick={() => updateOrgStatus(org, "Active")}
                              >
                                Active
                              </div>
                              <div
                                className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer text-gray-800 dark:text-gray-100"
                                onClick={() => updateOrgStatus(org, "Inactive")}
                              >
                                Inactive
                              </div>
                            </div>
                          )}
                        </div>

                        <button
                          className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-red-600 dark:text-red-400"
                          onClick={() => deleteOrganization(org.org_id)}
                          title="Delete organization"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-center mt-6 gap-2">
          <button
            className={`px-3 py-2 rounded-md text-xs sm:text-sm ${
              currentPage === 1
                ? "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600"
                : "bg-white dark:bg-[#020617] border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-100"
            }`}
            onClick={() => currentPage > 1 && setCurrentPage((p) => p - 1)}
            disabled={currentPage === 1}
          >
            Prev
          </button>

          {pageItems().map((p, idx) =>
            p === "..." ? (
              <span key={`dot-${idx}`} className="px-2 py-1 text-gray-400 dark:text-gray-500">
                ...
              </span>
            ) : (
              <button
                key={p}
                className={`px-3 py-2 rounded-full text-xs sm:text-sm ${
                  currentPage === p
                    ? "bg-blue-600 text-white"
                    : "bg-white dark:bg-[#020617] border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-100"
                }`}
                onClick={() => setCurrentPage(p)}
              >
                {p}
              </button>
            )
          )}

          <button
            className={`px-3 py-2 rounded-md text-xs sm:text-sm ${
              currentPage === totalFilteredPages
                ? "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600"
                : "bg-white dark:bg-[#020617] border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-100"
            }`}
            onClick={() => currentPage < totalFilteredPages && setCurrentPage((p) => p + 1)}
            disabled={currentPage === totalFilteredPages}
          >
            Next
          </button>
        </div>
      </div>

      {infoModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999] px-3">
          <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 w-full max-w-sm relative shadow-2xl">
            <button
              className="absolute right-4 top-4 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white"
              onClick={() => setInfoModal(null)}
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-semibold text-[#4f6df5] mb-4 text-center">Information</h3>

            <div className="space-y-3 text-sm text-gray-800 dark:text-gray-100">
              <div className="flex justify-between">
                <p>Total Number of Exams</p>
                <span>{infoModal.totals?.totalExams ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <p>Total Admins</p>
                <span>{infoModal.totals?.totalAdmins ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <p>Total Invigilator</p>
                <span>{infoModal.totals?.totalInvigilators ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <p>Total Students</p>
                <span>{infoModal.totals?.totalStudents ?? 0}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 z-[999] flex items-center justify-center overflow-y-auto">
          <div className="w-full max-w-xl mx-4 my-10">
            <div className="relative bg-white dark:bg-[#111827] rounded-3xl shadow-2xl">
              <button
                className="absolute right-5 top-5 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white"
                onClick={() => {
                  setModalOpen(false);
                  setEditOrg(null);
                }}
              >
                <X size={20} />
              </button>

              <div className="px-6 pt-6 pb-3">
                <h3 className="text-xl sm:text-2xl font-semibold text-[#4f6df5]">
                  {editOrg ? "Edit Organization" : "Add New Organization"}
                </h3>
              </div>

              <div className="px-6 pb-6">
                <form onSubmit={saveOrganization} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 dark:text-gray-100">
                      Organization Name
                    </label>
                    <input
                      name="organizationName"
                      defaultValue={editOrg?.name || ""}
                      placeholder="Tech University"
                      className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-[#020617] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/70 text-sm sm:text-base"
                      required
                    />
                  </div>

                  <div>
                    <textarea
                      name="description"
                      defaultValue={editOrg?.description || ""}
                      placeholder="Description"
                      className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 min-h-[80px] resize-none bg-white dark:bg-[#020617] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/70 text-sm sm:text-base"
                    />
                  </div>

                  {!editOrg && (
                    <>
                      <div className="hidden sm:grid sm:grid-cols-12 gap-3 text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">
                        <span className="sm:col-span-7">Email</span>
                        <span className="sm:col-span-4">Role</span>
                        <span className="sm:col-span-1 text-right" />
                      </div>

                      <div className="space-y-3 mb-10 sm:mb-4">
                        <div className="max-h-[40vh] overflow-y-auto pr-2">
                          {orgUsers.map((u, idx) => (
                            <div key={idx}>
                              <div className="sm:hidden">
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">
                                  Email
                                </label>
                                <input
                                  placeholder="tech.univer@example.com"
                                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 mb-3 bg-white dark:bg-[#020617] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/70 text-xs"
                                  value={u.email}
                                  onChange={(e) => updateUserField(idx, "email", e.target.value)}
                                  required={idx === 0}
                                />

                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">
                                  Role
                                </label>
                                <div className="flex items-center gap-2 mb-4">
                                  <select
                                    className="flex-1 max-w-[180px] border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-[#020617] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/70 text-xs"
                                    value={u.role}
                                    onChange={(e) => updateUserField(idx, "role", e.target.value)}
                                  >
                                    <option>Admin</option>
                                    <option>Invigilator</option>
                                  </select>

                                  <button
                                    type="button"
                                    onClick={addUserField}
                                    disabled={idx !== orgUsers.length - 1}
                                    className={`rounded-full border p-1 transition ${
                                      idx === orgUsers.length - 1
                                        ? "border-green-500 bg-green-500 text-white hover:bg-green-600"
                                        : "border-gray-300 bg-gray-200 text-gray-400 cursor-not-allowed"
                                    }`}
                                    title="Add more"
                                  >
                                    <Plus size={16} />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      idx === 0 && orgUsers.length === 1 ? updateUserField(0, "email", "") : removeUserField(idx)
                                    }
                                    className="rounded-full border border-red-500 bg-red-500 text-white p-1 hover:bg-red-600 transition"
                                    title={idx === 0 && orgUsers.length === 1 ? "Clear" : "Remove"}
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>

                              <div className="hidden sm:grid sm:grid-cols-12 gap-3 items-center">
                                <div className="sm:col-span-7">
                                  <input
                                    placeholder="tech.univer@example.com"
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-[#020617] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/70 text-sm"
                                    value={u.email}
                                    onChange={(e) => updateUserField(idx, "email", e.target.value)}
                                    required={idx === 0}
                                  />
                                </div>

                                <div className="sm:col-span-4">
                                  <select
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-[#020617] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/70 text-sm"
                                    value={u.role}
                                    onChange={(e) => updateUserField(idx, "role", e.target.value)}
                                  >
                                    <option>Admin</option>
                                    <option>Invigilator</option>
                                  </select>
                                </div>

                                <div className="sm:col-span-1 flex justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={addUserField}
                                    disabled={idx !== orgUsers.length - 1}
                                    className={`rounded-full border p-1 transition ${
                                      idx === orgUsers.length - 1
                                        ? "border-green-500 bg-green-500 text-white hover:bg-green-600"
                                        : "border-gray-300 bg-gray-200 text-gray-400 cursor-not-allowed"
                                    }`}
                                    title="Add more"
                                  >
                                    <Plus size={16} />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      idx === 0 && orgUsers.length === 1 ? updateUserField(0, "email", "") : removeUserField(idx)
                                    }
                                    className="rounded-full border border-red-500 bg-red-500 text-white p-1 hover:bg-red-600 transition"
                                    title={idx === 0 && orgUsers.length === 1 ? "Clear" : "Remove"}
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  <div className="pt-4 sm:pt-2">
                    <button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-full text-sm font-semibold shadow-sm transition"
                    >
                      {editOrg ? "Save" : "Create"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
