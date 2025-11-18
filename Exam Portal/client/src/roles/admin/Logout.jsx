import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    const t = setTimeout(() => navigate("/"), 800);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f0f9ff]">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[#014f86] mb-2">Logging out...</h1>
        <p className="text-gray-600">Redirecting to homepage</p>
      </div>
    </div>
  );
}
