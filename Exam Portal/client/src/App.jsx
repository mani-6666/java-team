import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <div className="flex w-full min-h-screen bg-[#f4f6fb] dark:bg-[#181a1e]">

      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">

        <Navbar />
        <div className="p-6">
          
          <Dashboard />
        </div>
      </div>
    </div>
  );
}

export default App;
