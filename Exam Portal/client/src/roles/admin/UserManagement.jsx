import React, { useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";

export default function UserManagement() {
  const [search, setSearch] = useState("");
  const users = [
    { id:1, name:"John Smith", email:"john.smith@example.com", role:"Student", joined:"2024-01-15", attempts:12, avg:"78%", status:"Active" },
    { id:2, name:"Emily Johnson", email:"emily.j@example.com", role:"Invigilator", joined:"2024-01-20", attempts:0, avg:"0%", status:"Schedule" },
    { id:3, name:"Michael Brown", email:"michael.b@example.com", role:"Student", joined:"2024-01-15", attempts:15, avg:"72%", status:"Completed" },
  ];

  const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <main className="p-8">
          <h1 className="text-3xl font-bold mb-2">User Management</h1>
          <p className="text-gray-500 mb-6">Manage users in your organization</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 rounded-2xl shadow border border-gray-100">
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-2xl font-bold mt-2">1,245</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow border border-gray-100">
              <p className="text-sm text-gray-500">Students</p>
              <p className="text-2xl font-bold mt-2">1,120</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow border border-gray-100">
              <p className="text-sm text-gray-500">Invigilators</p>
              <p className="text-2xl font-bold mt-2">125</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow border border-gray-100">
              <p className="text-sm text-gray-500">Active Users</p>
              <p className="text-2xl font-bold mt-2">1,189</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">All Users</h3>
              <div className="flex items-center gap-3">
                <input type="text" placeholder="Search users..." value={search} onChange={(e)=>setSearch(e.target.value)} className="px-3 py-2 border rounded-md"/>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">+ Add Users</button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 text-gray-600">
                  <tr>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Enroll Date</th>
                    <th className="py-3 px-4">Exam Attempted</th>
                    <th className="py-3 px-4">Avg score</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(u=>(
                    <tr key={u.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">{u.name}</td>
                      <td className="py-3 px-4">{u.email}</td>
                      <td className="py-3 px-4">{u.role}</td>
                      <td className="py-3 px-4">{u.joined ?? "2024-01-15"}</td>
                      <td className="py-3 px-4 text-center">{u.attempts}</td>
                      <td className="py-3 px-4 text-center">{u.avg}</td>
                      <td className="py-3 px-4 text-center"><span className={`px-3 py-1 rounded-full text-xs font-semibold ${u.status==="Active"?"bg-green-100 text-green-700":u.status==="Completed"?"bg-indigo-100 text-indigo-700":"bg-yellow-100 text-yellow-700"}`}>{u.status}</span></td>
                      <td className="py-3 px-4 text-center">👁️ ✎ 🗑️</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
