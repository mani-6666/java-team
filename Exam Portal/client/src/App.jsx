import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import Userlogin from "./pages/Userlogin";
import Mainlogin from "./pages/Mainlogin";

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
              <Route path="/" element={<Dashboard />} />
              <Route path="/register" element={<Register />} />
              <Route path="/userlogin" element={<Userlogin />} />
              <Route path="/mainlogin" element={<Mainlogin />} />
            </Routes>
          </div>

        </div>
      </div>
    </Router>
  );
}
