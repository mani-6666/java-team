
import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminLayout from "../../components/AdminLayout";
import { Search, Eye, Trash2 } from "lucide-react";

const API = "http://localhost:5000/admin/users";

export default function AdminUserManagement() {
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [users, setUsers] = useState([]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const loadUsers = async () => {
    try {
      const res = await axios.get(API);
      setUsers(res.data.users);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const getStatusColor = (s) => {
    if (s === "active") return "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200";
    if (s === "schedule") return "bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200";
    if (s === "completed") return "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200";
    return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200";
  };

  const filteredUsers = users
    .filter(
      (u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    )
    .filter((u) => (filterRole === "All" ? true : u.role === filterRole.toLowerCase()));

  return (
    <AdminLayout>
      <div className="p-4 dark:bg-gray-900 min-h-screen dark:text-white">
<h1 className="text-3xl font-semibold tracking-wide dark:text-white">
  User Management
</h1>
<p className="text-base text-gray-600 dark:text-gray-300 mt-2">
  Manage users in your organization efficiently
</p>

        {/* SEARCH SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4">
          <div className="relative w-full max-w-2xl">
            <input
              type="text"
              placeholder="Search by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-5 py-3 rounded-lg border dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
            <Search className="absolute right-4 top-4 text-gray-500 dark:text-gray-300" size={18} />
          </div>

          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          >
            <option>All</option>
            <option>Student</option>
            <option>Invigilator</option>
            <option>Admin</option>
          </select>
        </div>

        {/* TABLE */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">

            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr className="dark:text-white">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Enroll Date</th>
                <th className="py-3 px-4">Exam Attempted</th>
                <th className="py-3 px-4">Avg Score</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id} className="border-t dark:border-gray-700 dark:text-white">

                  <td className="py-3 px-4">{u.name}</td>
                  <td className="py-3 px-4">{u.email}</td>
                  <td className="py-3 px-4">{u.role}</td>

                  <td className="py-3 px-4">
                    {u.enrollDate ? u.enrollDate.slice(0, 10) : "—"}
                  </td>

                  <td className="py-3 px-4 text-center">
                    {u.examAttempted ?? 0}
                  </td>

                  <td className="py-3 px-4 text-center">
                    {u.avgScore ? `${u.avgScore}%` : "0%"}
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${getStatusColor(u.status)}`}
                    >
                      {u.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 flex gap-4">
                    <Eye
                      size={18}
                      className="cursor-pointer dark:text-white"
                      onClick={() => {
                        setSelectedUser(u);
                        setShowViewModal(true);
                      }}
                    />

                    <Trash2
                      size={18}
                      className="text-red-500 cursor-pointer"
                      onClick={() => {
                        setUserToDelete(u);
                        setShowDeleteModal(true);
                      }}
                    />
                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md dark:text-white">
            <h2 className="text-lg font-bold">Delete User</h2>
            <p className="mb-6">Are you sure you want to delete {userToDelete?.name}?</p>

            <div className="flex justify-end gap-4">
              <button className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {showViewModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md dark:text-white">
            <h2 className="text-lg font-bold">User Details</h2>

            <p><strong>Name:</strong> {selectedUser?.name}</p>
            <p><strong>Email:</strong> {selectedUser?.email}</p>
            <p><strong>Phone:</strong> {selectedUser?.phone}</p>
            <p><strong>Age:</strong> {selectedUser?.age}</p>
            <p><strong>Gender:</strong> {selectedUser?.gender}</p>

            <div className="flex justify-end mt-4">
              <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={() => setShowViewModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
