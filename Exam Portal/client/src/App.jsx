import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import Userlogin from "./pages/Userlogin";
import Mainlogin from "./pages/Mainlogin";
import Logout from "./pages/Logout";

export default function App() {
  return (
    <Router>
      <div className="flex w-full min-h-screen bg-[#f4f6fb] dark:bg-[#181a1e]">

        {/* Sidebar */}
        <Sidebar />

        {/* Main Layout */}
        <div className="flex-1 ml-64 flex flex-col">

          {/* Navbar */}
          <Navbar />

          {/* Page Content */}
          <div className="p-6">
            <Routes>

              {/* Default Redirect */}
              <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

              {/* Admin Pages */}
              <Route path="/admin/dashboard" element={<Dashboard />} />
              <Route path="/admin/logout" element={<Logout />} />

              {/* Auth Pages */}
              <Route path="/register" element={<Register />} />
              <Route path="/userlogin" element={<Userlogin />} />
              <Route path="/mainlogin" element={<Mainlogin />} />

              {/* 404 Page */}
              <Route path="*" element={<div className="p-10">404 - Page not found</div>} />

            </Routes>
          </div>

        </div>
      </div>
    </Router>
  );
}
