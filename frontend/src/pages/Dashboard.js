import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/logout"); // Redirect to Logout component
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold">Welcome to Dashboard</h1>
      <button 
        onClick={handleLogout} 
        className="mt-4 bg-red-600 text-white px-6 py-2 rounded-md">
        Logout
      </button>
    </div>
  );
}

export default Dashboard;