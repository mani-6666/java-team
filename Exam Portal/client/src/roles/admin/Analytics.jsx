import React from "react";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";

export default function Analytics() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <main className="p-8">
          <h1 className="text-3xl font-bold mb-2">Analytics & Reports</h1>
          <p className="text-gray-500 mb-6">Detailed analytics and insights</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-6 rounded-2xl shadow border border-gray-100">
              <h4 className="font-semibold mb-2">User Engagement</h4>
              <p className="text-sm text-gray-600">Daily Active Users: 892</p>
              <p className="text-sm text-gray-600">Monthly Active Users: 1,245</p>
              <p className="text-sm text-gray-600">Engagement Rate: 71.6%</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow border border-gray-100">
              <h4 className="font-semibold mb-2">Exam Statistics</h4>
              <p className="text-sm text-gray-600">Total Exam Created: 48</p>
              <p className="text-sm text-gray-600">Total Attempts: 824</p>
              <p className="text-sm text-gray-600">Average Score: 79%</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow border border-gray-100">
              <h4 className="font-semibold mb-2">Content Metrics</h4>
              <p className="text-sm text-gray-600">Total Materials: 127</p>
              <p className="text-sm text-gray-600">Total Downloads: 2,456</p>
              <p className="text-sm text-gray-600">Most Popular Category: Math</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow border border-gray-100 min-h-[300px]">
              <h4 className="font-semibold mb-4">Exam Performance by Subject</h4>
              <div className="w-full h-56 bg-gradient-to-b from-white to-green-50 rounded-lg border border-gray-100" />
            </div>
            <div className="bg-white p-6 rounded-2xl shadow border border-gray-100 min-h-[300px]">
              <h4 className="font-semibold mb-4">Exam Performance (Bar)</h4>
              <div className="w-full h-56 bg-gradient-to-b from-white to-blue-50 rounded-lg border border-gray-100" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
