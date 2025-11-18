import React from "react";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";

export default function StudyMaterials() {
  const materials = [
    { title: "Mathematics Guide", category: "Mathematics", type: "PDF", size: "2.5 MB", downloads: 456, date: "2024-10-15" },
    { title: "Physics Notes", category: "Physics", type: "PDF", size: "3.5 MB", downloads: 380, date: "2024-10-10" },
    { title: "Chemistry Lab Manual", category: "Chemistry", type: "PDF", size: "2.5 MB", downloads: 520, date: "2024-10-20" },
    { title: "Programming Basics", category: "CS", type: "Video", size: "30 MB", downloads: 300, date: "2024-10-25" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <main className="p-8">
          <h1 className="text-3xl font-bold mb-2">Study Materials</h1>
          <p className="text-gray-500 mb-6">Upload and manage study resources</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 rounded-2xl shadow border border-gray-100">
              <p className="text-sm text-gray-500">Total Materials</p>
              <p className="text-2xl font-bold mt-2">127</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow border border-gray-100">
              <p className="text-sm text-gray-500">Total Downloads</p>
              <p className="text-2xl font-bold mt-2">2,456</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow border border-gray-100">
              <p className="text-sm text-gray-500">PDFs</p>
              <p className="text-2xl font-bold mt-2">98</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow border border-gray-100">
              <p className="text-sm text-gray-500">Videos</p>
              <p className="text-2xl font-bold mt-2">29</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">All Materials</h3>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">Upload Materials</button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 text-gray-600">
                  <tr>
                    <th className="py-3 px-4 text-left">Title</th>
                    <th className="py-3 px-4">Categories</th>
                    <th className="py-3 px-4">Types</th>
                    <th className="py-3 px-4">Size</th>
                    <th className="py-3 px-4">Downloads</th>
                    <th className="py-3 px-4">Upload Date</th>
                    <th className="py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map((m,i)=>(
                    <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">{m.title}</td>
                      <td className="py-3 px-4 text-center">{m.category}</td>
                      <td className="py-3 px-4 text-center">{m.type}</td>
                      <td className="py-3 px-4 text-center">{m.size}</td>
                      <td className="py-3 px-4 text-center">{m.downloads}</td>
                      <td className="py-3 px-4 text-center">{m.date}</td>
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
