import { useNavigate } from "react-router-dom";  // Correct import for navigation 
import axios from "axios"; 
import { useState } from "react"; 

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:3000/api/auth/login", {
        email,
        password,
      });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        navigate("/dashboard");
      } else {
        alert("Invalid credentials");
      }
    } catch (error) {
      alert("Login failed");
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left Section */}
      <div className="w-1/2 flex flex-col justify-center items-center bg-purple-700 text-white p-10">
        <h1 className="text-4xl font-bold">Library Management System</h1>
        <p className="mt-2">Login to access your account</p>

        <form onSubmit={handleLogin} className="w-3/4 mt-6">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 rounded-md mb-3 text-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 rounded-md mb-3 text-black"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex justify-between items-center text-sm">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" /> Remember Me
            </label>
            <a href="#" className="underline">Forgot Password?</a>
          </div>
          <button type="submit" className="w-full mt-4 bg-white text-purple-700 p-3 rounded-md font-bold">
            LOGIN
          </button>
        </form>

        <p className="mt-4 text-sm">
          Don't have an account? <a href="#" className="underline">Sign Up</a>
        </p>
      </div>

      {/* Right Section */}
      <div className="w-1/2 flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: "url('https://source.unsplash.com/800x600/?library')" }}>
        <div className="bg-white p-4 rounded-full shadow-lg">
          <img src="/logo.png" alt="Library Logo" className="w-32 h-32" />
        </div>
      </div>
    </div>
  );
}

export default Login;