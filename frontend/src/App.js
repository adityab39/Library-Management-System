import { HashRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MemberDashboard from "./pages/MemberDashboard"; 
import Logout from "./components/Logout"; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/member-dashboard" element={<MemberDashboard />} /> 
        <Route path="/logout" element={<Logout />} /> 
      </Routes>
    </Router>
  );
}

export default App;