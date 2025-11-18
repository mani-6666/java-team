import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";     // or userSidebar
import Navbar from "./components/Navbar";       // or userNavbar

import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import Userlogin from "./pages/Userlogin";
import Mainlogin from "./pages/Mainlogin";
import Logout from "./pages/Logout";

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="flex h-screen dark:bg-[#0D1117] bg-gray-50 overflow-hidden">

        {/* SIDEBAR + BACKDROP */}
        <>
          <Sidebar isOpen={isSidebarOpen} />

          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
        </>

        {/* MAIN CONTENT */}
        <div className="flex flex-1 flex-col overflow-hidden md:pl-64">

          {/* NAVBAR */}
          <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

          {/* PAGE ROUTES */}
          <main className="flex-1 overflow-y-auto p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/register" element={<Register />} />
              <Route path="/userlogin" element={<Userlogin />} />
              <Route path="/mainlogin" element={<Mainlogin />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
