import { useState } from "react";
import { useNavigate } from "react-router-dom";

function MemberDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("books");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="flex h-screen">

      <div className="w-1/4 bg-purple-700 text-white p-6 flex flex-col space-y-6">
        <h2 className="text-2xl font-bold">Library System</h2>
        <button 
          className={`p-3 text-left ${activeTab === "books" ? "bg-white text-purple-700" : "text-white"}`} 
          onClick={() => setActiveTab("books")}>📚 Books</button>
        <button 
          className={`p-3 text-left ${activeTab === "borrowed" ? "bg-white text-purple-700" : "text-white"}`} 
          onClick={() => setActiveTab("borrowed")}>📖 Borrowed Books</button>
      </div>

      <div className="w-3/4 p-6 bg-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-purple-700">{activeTab === "books" ? "All Books" : "Borrowed Books"}</h2>
          <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-md">Logout</button>
        </div>

        {activeTab === "books" ? (
          <div className="bg-white p-4 shadow-md rounded-md"></div>
        ) : (
          <div className="bg-white p-4 shadow-md rounded-md"></div>
        )}
      </div>
    </div>
  );
}

export default MemberDashboard;
