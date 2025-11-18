import React from "react";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";

export default function Chatbox() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <main className="p-8">
          <h1 className="text-3xl font-bold mb-2">Chatbox</h1>
          <p className="text-gray-500 mb-6">Support and user messages</p>

          <div className="bg-white p-6 rounded-2xl shadow border border-gray-100 min-h-[400px] flex items-center justify-center text-gray-400">
            Chatbox coming soon — integrate your messaging service here.
          </div>
        </main>
      </div>
    </div>
  );
}
