import React, { useState, useRef, useEffect } from "react";
import {
  Eye,
  ChevronDown,
  X,
  Search as SearchIcon,
  Plus,
} from "lucide-react";

export default function superadmin_ClientManagement() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [subFilter, setSubFilter] = useState("");
  const [openFilter, setOpenFilter] = useState(false);
  const [openSubFilter, setOpenSubFilter] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  const [infoModal, setInfoModal] = useState(null);

  const filterRef = useRef(null);
  const menuRef = useRef(null);

  const [clients, setClients] = useState([
    {
      id: 1,
      orgName: "Tech University",
      orgId: "ORG2041",
      subscription: "Pro Plan",
      contactPerson: "Anil Sharma",
      contactEmail: "anil123@gmail.com",
      status: "Active",
      created: "2024-10-10",
    },
    {
      id: 2,
      orgName: "Business School",
      orgId: "ORG1159",
      subscription: "Basic",
      contactPerson: "Ritu Singh",
      contactEmail: "ritu123@gmail.com",
      status: "Trial",
      created: "2024-09-20",
    },
    {
      id: 3,
      orgName: "Medical Institute",
      orgId: "ORG9823",
      subscription: "Trial",
      contactPerson: "Rahul Jain",
      contactEmail: "rahul12@gmail.com",
      status: "Active",
      created: "2024-08-12",
    },
    {
      id: 4,
      orgName: "Engineering College",
      orgId: "ORG7621",
      subscription: "Enterprise",
      contactPerson: "Shalini Rao",
      contactEmail: "shlin12@gmail.co",
      status: "Inactive",
      created: "2024-07-01",
    },
  ]);

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

  let filteredClients = clients.filter((c) => {
    const q = search.trim().toLowerCase();

    const matchesSearch =
      q === "" ||
      c.contactPerson.toLowerCase().includes(q) ||
      c.contactEmail.toLowerCase().includes(q);

    let matchesStatus = true;

    if (filterStatus === "Subscription") {
      if (subFilter === "active") matchesStatus = c.status === "Active";
      if (subFilter === "inactive") matchesStatus = c.status === "Inactive";
      if (subFilter === "trial") matchesStatus = c.status === "Trial";
    }

    return matchesSearch && matchesStatus;
  });

  if (subFilter === "name-asc") {
    filteredClients.sort((a, b) => a.orgName.localeCompare(b.orgName));
  }

  if (subFilter === "name-desc") {
    filteredClients.sort((a, b) => b.orgName.localeCompare(a.orgName));
  }

  if (subFilter === "date-new") {
    filteredClients.sort((a, b) => new Date(b.created) - new Date(a.created));
  }

  if (subFilter === "date-old") {
    filteredClients.sort((a, b) => new Date(a.created) - new Date(b.created));
  }

  const superadmin_clientManagement_save = (e) => {
    e.preventDefault();
    const form = new FormData(e.target);

    const data = {
      id: editData ? editData.id : Date.now(),

    
      orgName: form.get("orgName"),
      contactPerson: form.get("contactPerson"),
      contactEmail: form.get("contactEmail"),
      status: form.get("status"),

   
      orgId: editData ? editData.orgId : form.get("orgId"),
      subscription: editData ? editData.subscription : form.get("subscription"),
      created: editData ? editData.created : new Date().toISOString().slice(0, 10),
    };

    if (editData) {
      setClients((prev) => prev.map((p) => (p.id === editData.id ? data : p)));
    } else {
      setClients((prev) => [...prev, data]);
    }

    setModalOpen(false);
    setEditData(null);
  };

  const superadmin_clientManagement_delete = (id) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="p-6 text-[#1a1f36] dark:text-[#e6e6e6]">

    
      <div className="flex items-start justify-between mb-6 gap-4">
        
     
        <div className="flex items-center gap-2 w-full max-w-lg">
          <div className="relative w-full">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <SearchIcon size={16} />
            </div>
            <input
              className="
                w-full pl-10 pr-4 py-2.5 rounded-full 
                border border-gray-200 dark:border-[#2a2c31]
                bg-white dark:bg-[#1f2125]
                text-[#1a1f36] dark:text-[#e6e6e6]
                focus:ring-blue-400
              "
              placeholder="Search by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="relative" ref={filterRef}>
          <button
            className="
              flex items-center gap-2 
              bg-white dark:bg-[#1f2125]
              border border-gray-200 dark:border-[#2a2c31]
              rounded-lg px-3 py-2 shadow-sm
            "
            onClick={() => setOpenFilter((s) => !s)}
          >
            <span className="text-sm">{filterStatus}</span>
            <ChevronDown size={16} />
          </button>

         
          {openFilter && (
            <div
              className="
                absolute right-0 mt-2 w-48 
                bg-white dark:bg-[#1f2125]
                border border-gray-200 dark:border-[#2a2c31]
                rounded-lg shadow-lg z-30
              "
            >
              {["All", "Name", "Date", "Subscription"].map((opt) => (
                <div key={opt}>
                  <div
                    onClick={() => {
                      if (opt === "All") {
                        setFilterStatus("All");
                        setSubFilter("");
                        setOpenFilter(false);
                        return;
                      }
                      setFilterStatus(opt);
                      setOpenSubFilter(openSubFilter === opt ? null : opt);
                    }}
                    className="
                      px-4 py-2 hover:bg-gray-50 dark:hover:bg-[#292b31] 
                      cursor-pointer text-sm flex justify-between items-center
                    "
                  >
                    {opt}
                    {(opt === "Name" ||
                      opt === "Date" ||
                      opt === "Subscription") && <ChevronDown size={14} />}
                  </div>

              
                  {openSubFilter === opt && (
                    <div
                      className="
                        bg-gray-50 dark:bg-[#272a35] 
                        border-t dark:border-[#2a2c31]
                      "
                    >
            
                      {opt === "Name" && (
                        <>
                          <div
                            className={`px-4 py-2 text-sm cursor-pointer 
                              hover:bg-gray-100 dark:hover:bg-[#30333a]
                              ${
                                subFilter === "name-asc"
                                  ? "text-blue-600 font-semibold bg-blue-50 dark:bg-[#1a2a45] border-l-4 border-blue-500"
                                  : "border-l-4 border-transparent"
                              }
                            `}
                            onClick={() => {
                              setSubFilter("name-asc");
                              setOpenFilter(false);
                            }}
                          >
                            {subFilter === "name-asc" && "✔"} Ascending (A → Z)
                          </div>

                          <div
                            className={`px-4 py-2 text-sm cursor-pointer 
                              hover:bg-gray-100 dark:hover:bg-[#30333a]
                              ${
                                subFilter === "name-desc"
                                  ? "text-blue-600 font-semibold bg-blue-50 dark:bg-[#1a2a45] border-l-4 border-blue-500"
                                  : "border-l-4 border-transparent"
                              }
                            `}
                            onClick={() => {
                              setSubFilter("name-desc");
                              setOpenFilter(false);
                            }}
                          >
                            {subFilter === "name-desc" && "✔"} Descending (Z → A)
                          </div>
                        </>
                      )}

                 
                      {opt === "Date" && (
                        <>
                          <div
                            className={`px-4 py-2 text-sm cursor-pointer 
                              hover:bg-gray-100 dark:hover:bg-[#30333a]
                              ${
                                subFilter === "date-new"
                                  ? "text-blue-600 font-semibold bg-blue-50 dark:bg-[#1a2a45] border-l-4 border-blue-500"
                                  : "border-l-4 border-transparent"
                              }
                            `}
                            onClick={() => {
                              setSubFilter("date-new");
                              setOpenFilter(false);
                            }}
                          >
                            {subFilter === "date-new" && "✔"} Newest First
                          </div>

                          <div
                            className={`px-4 py-2 text-sm cursor-pointer 
                              hover:bg-gray-100 dark:hover:bg-[#30333a]
                              ${
                                subFilter === "date-old"
                                  ? "text-blue-600 font-semibold bg-blue-50 dark:bg-[#1a2a45] border-l-4 border-blue-500"
                                  : "border-l-4 border-transparent"
                              }
                            `}
                            onClick={() => {
                              setSubFilter("date-old");
                              setOpenFilter(false);
                            }}
                          >
                            {subFilter === "date-old" && "✔"} Oldest First
                          </div>
                        </>
                      )}

                   
                      {opt === "Subscription" && (
                        <>
                          <div
                            className={`px-4 py-2 text-sm cursor-pointer 
                              hover:bg-gray-100 dark:hover:bg-[#30333a]
                              ${
                                subFilter === "active"
                                  ? "text-blue-600 font-semibold bg-blue-50 dark:bg-[#1a2a45] border-l-4 border-blue-500"
                                  : "border-l-4 border-transparent"
                              }
                            `}
                            onClick={() => {
                              setSubFilter("active");
                              setOpenFilter(false);
                            }}
                          >
                            {subFilter === "active" && "✔"} Active
                          </div>

                          <div
                            className={`px-4 py-2 text-sm cursor-pointer 
                              hover:bg-gray-100 dark:hover:bg-[#30333a]
                              ${
                                subFilter === "inactive"
                                  ? "text-blue-600 font-semibold bg-blue-50 dark:bg-[#1a2a45] border-l-4 border-blue-500"
                                  : "border-l-4 border-transparent"
                              }
                            `}
                            onClick={() => {
                              setSubFilter("inactive");
                              setOpenFilter(false);
                            }}
                          >
                            {subFilter === "inactive" && "✔"} Inactive
                          </div>

                          <div
                            className={`px-4 py-2 text-sm cursor-pointer 
                              hover:bg-gray-100 dark:hover:bg-[#30333a]
                              ${
                                subFilter === "trial"
                                  ? "text-blue-600 font-semibold bg-blue-50 dark:bg-[#1a2a45] border-l-4 border-blue-500"
                                  : "border-l-4 border-transparent"
                              }
                            `}
                            onClick={() => {
                              setSubFilter("trial");
                              setOpenFilter(false);
                            }}
                          >
                            {subFilter === "trial" && "✔"} Trial
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

   
      <div
        className="
          bg-white dark:bg-[#1f2125] 
          rounded-xl shadow-md 
          border border-gray-100 dark:border-[#2a2c31] 
          overflow-hidden
        "
      >
        <div className="flex items-start justify-between px-6 py-5">
          <div>
            <h3 className="text-lg font-semibold text-[#1f2d4d] dark:text-white">
              Client Management
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              All Clients in the system
            </p>
          </div>

          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 shadow-sm">
            <Plus size={14} /> Add New Clients
          </button>
        </div>

        <div className="p-4">
          <div className="w-full overflow-x-auto scrollbar-hide">
            <table className="min-w-full text-[#1a1f36] dark:text-[#e6e6e6]">
              <thead>
                <tr className="bg-[#eef3ff] dark:bg-[#23262b]">
                  <th className="py-3 px-6">Organization Name</th>
                  <th className="py-3 px-6">Organization ID</th>
                  <th className="py-3 px-6">Subscription</th>
                  <th className="py-3 px-6">Contact Person</th>
                  <th className="py-3 px-6">Contact Email</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Created Date</th>
                  <th className="py-3 px-6">Actions</th>
                </tr>
              </thead>

              <tbody ref={menuRef}>
                {filteredClients.map((c) => (
                  <tr
                    key={c.id}
                    className="
                      border-b border-gray-200 dark:border-[#2a2c31] 
                      hover:bg-gray-50 dark:hover:bg-[#272a35]
                    "
                  >
                    <td className="py-4 px-6">{c.orgName}</td>
                    <td className="py-4 px-6">{c.orgId}</td>
                    <td className="py-4 px-6">{c.subscription}</td>

                    <td
                      className="py-4 px-6 cursor-pointer hover:text-blue-600"
                      onClick={() => setInfoModal(c)}
                    >
                      {c.contactPerson}
                    </td>

                    <td className="py-4 px-6">{c.contactEmail}</td>

                    <td className="py-4 px-6">
                      <span
                        className={`
                          px-3 py-1 text-xs rounded-full
                          ${
                            c.status === "Active"
                              ? "bg-green-100 dark:bg-[#14341c] text-green-700 dark:text-green-300"
                              : c.status === "Trial"
                              ? "bg-yellow-100 dark:bg-[#3b2f12] text-yellow-700 dark:text-yellow-300"
                              : "bg-red-100 dark:bg-[#3b1717] text-red-700 dark:text-red-300"
                          }
                        `}
                      >
                        {c.status}
                      </span>
                    </td>

                    <td className="py-4 px-6">{c.created}</td>

                    <td className="py-4 px-6 relative">
                      <button
                        className="
                          p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#2a2c31]
                        "
                        onClick={() =>
                          setOpenMenuId((prev) => (prev === c.id ? null : c.id))
                        }
                      >
                        <Eye size={18} />
                      </button>

                      {openMenuId === c.id && (
                        <div
                          className="
                            absolute right-8 top-10 w-36 
                            bg-white dark:bg-[#1f2125] 
                            shadow-md border border-gray-200 dark:border-[#2a2c31] 
                            rounded-md z-50
                          "
                        >
                          <div
                            className="
                              px-4 py-2 hover:bg-gray-50 dark:hover:bg-[#292b31] 
                              cursor-pointer
                            "
                            onClick={() => {
                              setEditData(c);
                              setModalOpen(true);
                              setOpenMenuId(null);
                            }}
                          >
                            Edit
                          </div>

                          <div
                            className="
                              px-4 py-2 hover:bg-gray-50 dark:hover:bg-[#292b31] 
                              text-red-600 cursor-pointer
                            "
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

                {filteredClients.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      No matching clients found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

  
      <div className="mt-6 flex justify-center gap-2">
        <button className="px-3 py-1 bg-gray-100 dark:bg-[#272a35] rounded-md">
          Prev
        </button>
        <button className="w-8 h-8 border rounded-full bg-blue-600 text-white">
          1
        </button>
        <button className="w-8 h-8 border rounded-full dark:border-[#2a2c31]">
          2
        </button>
        <button className="w-8 h-8 border rounded-full dark:border-[#2a2c31]">
          3
        </button>
        <span className="px-2">...</span>
        <button className="w-8 h-8 border rounded-full dark:border-[#2a2c31]">
          10
        </button>
        <button className="px-3 py-1 bg-gray-100 dark:bg-[#272a35] rounded-md">
          Next
        </button>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div
            className="
              bg-white dark:bg-[#1f2125] 
              text-[#1a1f36] dark:text-[#e6e6e6]
              rounded-lg w-[420px] p-6 relative shadow-lg 
              border dark:border-[#2a2c31]
            "
          >
            <button
              className="
                absolute top-3 right-3 p-1 rounded-md 
                hover:bg-gray-100 dark:hover:bg-[#272a35]
              "
              onClick={() => {
                setModalOpen(false);
                setEditData(null);
              }}
            >
              <X />
            </button>

            <h3 className="text-lg font-semibold mb-3">
              {editData ? "Edit Client" : "Add New Client"}
            </h3>

            <form
              onSubmit={superadmin_clientManagement_save}
              className="space-y-3"
            >
         
              {editData ? (
                <>
                  <input
                    name="orgName"
                    defaultValue={editData.orgName}
                    placeholder="Organization Name"
                    className="
                      w-full border dark:border-[#2a2c31] 
                      bg-white dark:bg-[#272a35] 
                      px-3 py-2 rounded-md
                    "
                    required
                  />

                  <input
                    name="contactPerson"
                    defaultValue={editData.contactPerson}
                    placeholder="Contact Person"
                    className="
                      w-full border dark:border-[#2a2c31] 
                      bg-white dark:bg-[#272a35] 
                      px-3 py-2 rounded-md
                    "
                    required
                  />

                  <input
                    name="contactEmail"
                    defaultValue={editData.contactEmail}
                    placeholder="Contact Email"
                    className="
                      w-full border dark:border-[#2a2c31] 
                      bg-white dark:bg-[#272a35] 
                      px-3 py-2 rounded-md
                    "
                    required
                  />

                  <select
                    name="status"
                    defaultValue={editData.status}
                    className="
                      w-full border dark:border-[#2a2c31] 
                      bg-white dark:bg-[#272a35] 
                      px-3 py-2 rounded-md
                    "
                  >
                    <option>Active</option>
                    <option>Trial</option>
                    <option>Inactive</option>
                  </select>
                </>
              ) : (
                <>
        
                  <input
                    name="orgName"
                    placeholder="Organization Name"
                    className="w-full border dark:border-[#2a2c31] bg-white dark:bg-[#272a35] px-3 py-2 rounded-md"
                    required
                  />
                  <input
                    name="orgId"
                    placeholder="Organization ID"
                    className="w-full border dark:border-[#2a2c31] bg-white dark:bg-[#272a35] px-3 py-2 rounded-md"
                    required
                  />
                  <input
                    name="subscription"
                    placeholder="Subscription"
                    className="w-full border dark:border-[#2a2c31] bg-white dark:bg-[#272a35] px-3 py-2 rounded-md"
                    required
                  />

                  <input
                    name="contactPerson"
                    placeholder="Contact Person"
                    className="w-full border dark:border-[#2a2c31] bg-white dark:bg-[#272a35] px-3 py-2 rounded-md"
                    required
                  />

                  <input
                    name="contactEmail"
                    placeholder="Contact Email"
                    className="w-full border dark:border-[#2a2c31] bg-white dark:bg-[#272a35] px-3 py-2 rounded-md"
                    required
                  />

                  <select
                    name="status"
                    className="w-full border dark:border-[#2a2c31] bg-white dark:bg-[#272a35] px-3 py-2 rounded-md"
                  >
                    <option>Active</option>
                    <option>Trial</option>
                    <option>Inactive</option>
                  </select>
                </>
              )}

              <div className="flex gap-2 mt-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-md"
                >
                  Save
                </button>
                <button
                  type="button"
                  className="
                    flex-1 border dark:border-[#2a2c31] 
                    rounded-md py-2 dark:bg-[#272a35]
                  "
                  onClick={() => {
                    setModalOpen(false);
                    setEditData(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

  
      {infoModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div
            className="
              bg-white dark:bg-[#1f2125] 
              text-[#1a1f36] dark:text-[#e6e6e6]
              rounded-2xl w-[340px] p-6 shadow-xl relative 
              border dark:border-[#2a2c31]
            "
          >
            <button
              className="
                absolute top-3 right-3 p-1 rounded-md 
                hover:bg-gray-100 dark:hover:bg-[#272a35]
              "
              onClick={() => setInfoModal(null)}
            >
              <X />
            </button>

            <h3 className="text-lg font-semibold mb-4">Information</h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Total Number of Exams</span>
                <span className="text-blue-600 dark:text-blue-400 font-medium">
                  20
                </span>
              </div>

              <div className="flex justify-between">
                <span>Total Admins</span>
                <span className="text-blue-600 dark:text-blue-400 font-medium">
                  4
                </span>
              </div>

              <div className="flex justify-between">
                <span>Total Invigilator</span>
                <span className="text-blue-600 dark:text-blue-400 font-medium">
                  6
                </span>
              </div>

              <div className="flex justify-between">
                <span>Total Students</span>
                <span className="text-blue-600 dark:text-blue-400 font-medium">
                  200
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
