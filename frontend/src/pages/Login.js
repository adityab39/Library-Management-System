import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    let errors = {};
    if (!username) errors.username = "Mobile Number or Email Address is required";
    if (!password) errors.password = "Password is required";
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
  
    try {
      const response = await axios.post("http://localhost:3000/api/auth/login", {
        username,
        password,
      });
  
      if (response.data.message === "Login successfull") { 
        const { token, user } = response.data.data; 
        const userData = response.data.data.user;
        if (token) {
          localStorage.setItem("token", token);
          localStorage.setItem("role_id", user.role_id); 
          localStorage.setItem("user", JSON.stringify(userData));
        }
  
        if (user.role_id === 2) {
          navigate("/member-dashboard"); 
        } else {
          navigate("/dashboard"); 
        }
      } else {
        alert("Invalid credentials");
      }
    } catch (error) {
      alert("Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <div className="flex justify-center mb-4">
          <img src="/logo.png" alt="Library Logo" className="w-20 h-20" />
        </div>

        <h2 className="text-center text-xl font-bold text-gray-900 mb-4">
          Log in to Library Management
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Your Mobile/Email"
              className={`w-full p-3 border rounded-md text-gray-900 ${
                errors.username ? "border-red-500" : "border-gray-300"
              }`}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className={`w-full p-3 border rounded-md text-gray-900 pr-10 ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-3 top-4 text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
            </button>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          <button type="submit" className="w-full p-3 bg-purple-700 text-white rounded-md font-bold">
            🔒 Log in
          </button>
        </form>

        <div className="text-center mt-4">
          <a href="#" className="text-sm text-purple-600 hover:underline">
            Forgot Password?
          </a>
        </div>

        <div className="text-center mt-2">
          <p className="text-sm text-gray-700">
            Don't have an account?{" "}
            <a href="/signup" className="text-purple-700 font-semibold hover:underline">
              Sign Up
            </a>
          </p>
        </div>

        <p className="text-center text-xs text-gray-500 mt-4">
          By logging in, you agree to our{" "}
          <a href="#" className="font-bold text-purple-700">Privacy Policy</a> and{" "}
          <a href="#" className="font-bold text-purple-700">Terms of Service</a>.
        </p>
      </div>
    </div>
  );
}

export default Login;