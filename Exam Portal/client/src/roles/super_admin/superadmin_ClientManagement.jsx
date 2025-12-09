import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

import {
  Eye,
  ChevronDown,
  X,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";

const API_BASE = "http://localhost:5000/superadmin";

export default function Superadmin_ClientManagement() {
  // UI states
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All"); // All, Subscription, Name
  const [subFilter, setSubFilter] = useState("");
  const [openFilter, setOpenFilter] = useState(false);
  const [openSubFilter, setOpenSubFilter] = useState(null);

  const [sortOrder, setSortOrder] = useState(""); // asc / desc (when Name)
  const [modalOpen, setModalOpen] = useState(false);
  const [editOrg, setEditOrg] = useState(null); // used when opening edit modal (we keep edit modal for full edit if needed)

  const [statusMenuOrg, setStatusMenuOrg] = useState(null); // org_id for open small status menu per row
  const [infoModal, setInfoModal] = useState(null);

  // Add-org users UI
  const [orgUsers, setOrgUsers] = useState([{ email: "", role: "Admin", fullName: "" }]);

  // data
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 4; // rows per page — adjust to match Figma
  const totalPages = Math.max(1, Math.ceil(clients.length / perPage));

  const filterRef = useRef(null);
  const menuRef = useRef(null);

  /* -----------------------
     Fetch Organizations
     GET /superadmin
     ----------------------- */
  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}`);
      let data = res.data.data || [];

      // normalize keys if backend returns different names (we expect name, org_id, subscription, contact_person, contact_email)
      data = data.map((d) => ({
        name: d.name ?? d.organizationname ?? "",
        org_id: d.org_id ?? d.organizationid ?? d.organizationid?.toString(),
        subscription: d.subscription ?? d.plan_name ?? d.subscription,
        contact_person: d.contact_person ?? d.contactperson ?? d.contact_person,
        contact_email: d.contact_email ?? d.contact_email ?? d.contact_email ?? d.contactemail ?? d.contact_email,
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

  // initial load + filters watch
  useEffect(() => {
    fetchClients();
  }, []);

  /* -----------------------
     Click outside for dropdowns
     ----------------------- */
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

  /* -----------------------
     Derived: filtered + sorted list
     ----------------------- */
  const getFilteredSorted = () => {
    let data = [...clients];

    // search
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (c) =>
          (c.name || "").toLowerCase().includes(q) ||
          (c.contact_email || "").toLowerCase().includes(q)
      );
    }

    // subscription filter
    if (filterStatus === "Subscription" && subFilter) {
      data = data.filter((c) =>
        (c.subscription || "none").toLowerCase() === subFilter.toLowerCase()
      );
    }

    // name sorting if selected
    if (filterStatus === "Name" && sortOrder) {
      data.sort((a, b) =>
        sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
      );
    }

    return data;
  };

  const filteredData = getFilteredSorted();

  // update pagination if filtered length changes
  useEffect(() => {
    const newTotal = Math.max(1, Math.ceil(filteredData.length / perPage));
    if (currentPage > newTotal) setCurrentPage(newTotal);
  }, [search, filterStatus, subFilter, sortOrder, clients]); // eslint-disable-line

  /* -----------------------
     Pagination helpers
     ----------------------- */
  const totalFilteredPages = Math.max(1, Math.ceil(filteredData.length / perPage));
  const pageItems = () => {
    // produce an array of page numbers with ellipsis similar to Figma: show first 3, last 1 if many.
    const pages = [];
    const maxShow = 5;
    if (totalFilteredPages <= maxShow) {
      for (let i = 1; i <= totalFilteredPages; i++) pages.push(i);
    } else {
      // show current, neighbors, first, last
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

  /* -----------------------
     Update organization status (from small status menu)
     Uses PUT /superadmin/:orgId
     ----------------------- */
  const updateOrgStatus = async (org, newStatus) => {
    try {
      // Build payload using existing name/description and new status
      // Backend expects organizationName, description, status
      await axios.put(`${API_BASE}/${org.org_id}`, {
        organizationName: org.name,
        description: org.description || "",
        status: newStatus.toLowerCase(),
      });

      // refresh list
      await fetchClients();
      setStatusMenuOrg(null);
    } catch (err) {
      console.error("Update status failed", err);
      alert("Failed to update status");
    }
  };

  /* -----------------------
     Delete organization
     DELETE /superadmin/:orgId
     ----------------------- */
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

  /* -----------------------
     Open Info Popup
     GET /superadmin/:orgId/info
     ----------------------- */
  const openInfo = async (org) => {
    try {
      const res = await axios.get(`${API_BASE}/${org.org_id}/info`);
      setInfoModal(res.data.data);
    } catch (err) {
      console.error("Failed to load info", err);
      alert("Failed to load information");
    }
  };

  /* -----------------------
     Create Organization + users
     POST /superadmin  (create org + admin)
     then POST /superadmin/:orgId/users for extra users
     ----------------------- */
  const saveOrganization = async (e) => {
    e.preventDefault();
    // read form fields
    const form = new FormData(e.target);
    const orgName = form.get("organizationName");
    const description = form.get("description") || "";

    try {
      if (editOrg) {
        // full edit (if you later allow): update org
        await axios.put(`${API_BASE}/${editOrg.org_id}`, {
          organizationName: orgName,
          description,
          status: editOrg.status || "active",
        });
      } else {
        // create org with the first user as admin/contact
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

        // Backend returns organization + contactUser and loginPassword
        const createdOrg = res.data.organization || res.data.data || res.data.organization; // try variants
        const orgId = createdOrg?.org_id || createdOrg?.org_id || createdOrg?.org_id || res.data.organization?.org_id;

        // If user added more rows (beyond 1), call POST /superadmin/:orgId/users for each additional
        if (orgId && orgUsers.length > 1) {
          for (let i = 1; i < orgUsers.length; i++) {
            const u = orgUsers[i];
            // skip empty
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

      // close modal and reload
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

  /* -----------------------
     Add / Remove user rows in Add-org modal
     ----------------------- */
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

  /* -----------------------
     Render
     ----------------------- */
  if (loading) {
    return (
      <div className="p-6 text-center text-lg font-semibold">Loading organizations...</div>
    );
  }

  // slice for current page
  const pagedData = filteredData.slice((currentPage - 1) * perPage, currentPage * perPage);

  return (
    <div className="p-4 sm:p-6 w-full">
      {/* Top search + filter row (like Figma) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:max-w-lg">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            🔍
          </span>
          <input
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-300 bg-white text-gray-700"
            placeholder="Search organization"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="relative" ref={filterRef}>
          <button
            className="flex items-center gap-2 bg-white border rounded-xl px-4 py-2 shadow-sm"
            onClick={() => setOpenFilter((s) => !s)}
          >
            {filterStatus === "All"
              ? "All"
              : filterStatus === "Subscription"
              ? `Subscription${subFilter ? ` (${subFilter})` : ""}`
              : `Name${sortOrder ? ` (${sortOrder})` : ""}`}
            <ChevronDown size={16} />
          </button>

          {openFilter && (
            <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg z-50">
              <div
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
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

              {/* Subscription */}
              <div>
                <div
                  className="px-4 py-2 flex justify-between cursor-pointer hover:bg-gray-100"
                  onClick={() =>
                    setOpenSubFilter((s) => (s === "Subscription" ? null : "Subscription"))
                  }
                >
                  Subscription <ChevronDown size={14} />
                </div>
                {openSubFilter === "Subscription" && (
                  <div className="bg-gray-50">
                    {["Active", "Inactive", "Trial"].map((s) => (
                      <div
                        key={s}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
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

              {/* Name */}
              <div>
                <div
                  className="px-4 py-2 flex justify-between cursor-pointer hover:bg-gray-100"
                  onClick={() => setOpenSubFilter((s) => (s === "Name" ? null : "Name"))}
                >
                  Name <ChevronDown size={14} />
                </div>

                {openSubFilter === "Name" && (
                  <div className="bg-gray-50">
                    <div
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setFilterStatus("Name");
                        setSortOrder("asc");
                        setOpenFilter(false);
                      }}
                    >
                      Ascending (A → Z)
                    </div>
                    <div
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
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

      {/* Card container */}
      <div className="bg-white rounded-xl shadow-lg border p-4 sm:p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold">Client Management</h3>
            <p className="text-gray-500 text-sm">All Clients in the system</p>
          </div>

          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
            onClick={() => {
              setEditOrg(null);
              setOrgUsers([{ email: "", role: "Admin", fullName: "" }]);
              setModalOpen(true);
            }}
          >
            <Plus size={14} /> Add New Organization
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#eef3ff] text-blue-700">
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
                  <td colSpan={7} className="p-6 text-center text-gray-500">
                    No organizations found.
                  </td>
                </tr>
              ) : (
                pagedData.map((org) => (
                  <tr key={org.org_id} className="border-b hover:bg-gray-50">
                    <td className="px-2 py-3">{org.name}</td>
                    <td className="px-2 py-3">{org.org_id}</td>
                    <td className="px-2 py-3">{org.subscription || "None"}</td>
                    <td className="px-2 py-3">{org.contact_person}</td>
                    <td className="px-2 py-3">{org.contact_email}</td>

                    <td className="px-2 py-3">
                      <span
                        className={`px-3 py-1 text-xs rounded-full ${
                          org.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {org.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-2 py-3 flex items-center gap-3 relative">
                      {/* View */}
                      <button
                        className="p-1 rounded-md hover:bg-gray-100"
                        onClick={() => openInfo(org)}
                        title="View Information"
                      >
                        <Eye size={16} />
                      </button>

                      {/* Status edit small menu (pencil icon) */}
                      <div className="relative">
                        <button
                          className="p-1 rounded-md hover:bg-gray-100"
                          onClick={() =>
                            setStatusMenuOrg((prev) => (prev === org.org_id ? null : org.org_id))
                          }
                          title="Change status"
                        >
                          <Edit size={16} />
                        </button>

                        {statusMenuOrg === org.org_id && (
                          <div className="absolute right-0 top-8 w-28 bg-white border rounded-md shadow-md z-50 text-sm">
                            <div
                              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => updateOrgStatus(org, "Active")}
                            >
                              Active
                            </div>
                            <div
                              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => updateOrgStatus(org, "Inactive")}
                            >
                              Inactive
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Delete */}
                      <button
                        className="p-1 rounded-md hover:bg-gray-100 text-red-600"
                        onClick={() => deleteOrganization(org.org_id)}
                        title="Delete organization"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination (Figma-like) */}
        <div className="flex items-center justify-center mt-6 gap-2">
          <button
            className={`px-3 py-2 rounded-md ${currentPage === 1 ? "bg-gray-100 text-gray-400" : "bg-white border"}`}
            onClick={() => currentPage > 1 && setCurrentPage((p) => p - 1)}
            disabled={currentPage === 1}
          >
            Prev
          </button>

          {pageItems().map((p, idx) =>
            p === "..." ? (
              <span key={`dot-${idx}`} className="px-2 py-1 text-gray-400">...</span>
            ) : (
              <button
                key={p}
                className={`px-3 py-2 rounded-full ${currentPage === p ? "bg-blue-600 text-white" : "bg-white border"}`}
                onClick={() => setCurrentPage(p)}
              >
                {p}
              </button>
            )
          )}

          <button
            className={`px-3 py-2 rounded-md ${currentPage === totalFilteredPages ? "bg-gray-100 text-gray-400" : "bg-white border"}`}
            onClick={() => currentPage < totalFilteredPages && setCurrentPage((p) => p + 1)}
            disabled={currentPage === totalFilteredPages}
          >
            Next
          </button>
        </div>
      </div>

      {/* Info Modal (View) */}
      {infoModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-60">
          <div className="bg-white rounded-xl p-6 w-[360px] relative shadow-xl">
            <button
              className="absolute right-4 top-4"
              onClick={() => setInfoModal(null)}
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-semibold text-[#4f6df5] mb-4">Information</h3>

            <div className="space-y-3 text-sm">
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

      {/* Add / Edit Organization Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-60 p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-lg relative">
            <button
              className="absolute right-4 top-4"
              onClick={() => {
                setModalOpen(false);
                setEditOrg(null);
              }}
            >
              <X size={20} />
            </button>

            <h3 className="text-2xl font-semibold text-[#4f6df5] mb-4">
              {editOrg ? "Edit Organization" : "Add New Organization"}
            </h3>

            <form onSubmit={saveOrganization} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Organization Name</label>
                <input
                  name="organizationName"
                  defaultValue={editOrg?.name || ""}
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Description</label>
                <textarea
                  name="description"
                  defaultValue={editOrg?.description || ""}
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                />
              </div>

              {/* Contact person name (required for create) */}
              {!editOrg && (
                <div>
                  <label className="block text-sm font-medium">Contact Person Name</label>
                  <input
                    name="contactFullName"
                    placeholder="Full name"
                    className="w-full border rounded-lg px-3 py-2 mt-1"
                    value={orgUsers[0].fullName}
                    onChange={(e) => updateUserField(0, "fullName", e.target.value)}
                    required
                  />
                </div>
              )}

              {/* Email + Role rows */}
              {!editOrg && (
                <>
                  <div className="grid grid-cols-1 gap-3">
                    {orgUsers.map((u, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          placeholder="tech.univer@example.com"
                          className="border rounded-lg px-3 py-2 flex-1"
                          value={u.email}
                          onChange={(e) => updateUserField(idx, "email", e.target.value)}
                          required={idx === 0}
                        />

                        <select
                          className="border rounded-lg px-3 py-2"
                          value={u.role}
                          onChange={(e) => updateUserField(idx, "role", e.target.value)}
                        >
                          <option>Admin</option>
                          <option>Invigilator</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => (idx === 0 ? (updateUserField(0, "email", "") ) : removeUserField(idx))}
                          className="p-2"
                          title={idx === 0 ? "Clear" : "Remove"}
                        >
                          {idx === 0 ? "🔄" : <Trash2 size={16} />}
                        </button>
                      </div>
                    ))}
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={addUserField}
                      className="text-green-600 flex items-center gap-2"
                    >
                      <Plus size={14} /> Add more
                    </button>
                  </div>
                </>
              )}

              <div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-lg"
                >
                  {editOrg ? "Save" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
