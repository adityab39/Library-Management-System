import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import axios from "axios";

function Signup() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        mobile: "",
        password: "",
        confirmPassword: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = async (e) => {
        e.preventDefault();

        const { name, email, mobile, password, confirmPassword } = formData;

        // Email Validation
        const isEmailValid = /\S+@\S+\.\S+/.test(email);
        // Mobile Number Validation (10-digit)
        const isMobileValid = /^[0-9]{10}$/.test(mobile);

        if (!isEmailValid) {
            alert("Please enter a valid email.");
            return;
        }

        if (!isMobileValid) {
            alert("Please enter a valid 10-digit mobile number.");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        try {
            const response = await axios.post("http://localhost:3000/api/auth/register", {
                name,
                email,
                mobile,
                password
            });

            alert(response.data.message);
            navigate("/login");
        } catch (err) {
            alert(err.response?.data?.message || "Registration failed.");
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                
                {/* Logo */}
                <div className="flex justify-center mb-4">
                    <img src="/logo.png" alt="Library Logo" className="h-12" />
                </div>

                {/* Title */}
                <h2 className="text-center text-2xl font-bold text-gray-900">
                    Sign Up for Library Management
                </h2>

                <form onSubmit={handleSignup} className="mt-6">
                    
                    {/* Name Input */}
                    <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded mb-4"
                    />

                    {/* Email Input */}
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded mb-4"
                    />

                    {/* Mobile Number Input */}
                    <input
                        type="text" 
                        name="mobile" 
                        placeholder="Mobile Number" 
                        value={formData.mobile}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded mb-4"
                    />

                    {/* Password Input */}
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded mb-4"
                    />

                    {/* Confirm Password Input */}
                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded mb-4"
                    />

                    {/* Signup Button */}
                    <button type="submit" className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700">
                        Sign Up
                    </button>
                </form>

                {/* Login Redirect */}
                <p className="text-center mt-4 text-gray-600">
                    Already have an account?{" "}
                    <Link to="/login" className="text-purple-600 font-semibold">
                        Log In
                    </Link>
                </p>

                {/* Privacy Policy */}
                <p className="text-center text-sm text-gray-500 mt-4">
                    By signing up, you agree to our{" "}
                    <span className="text-purple-600 font-semibold cursor-default">Privacy Policy</span> and{" "}
                    <span className="text-purple-600 font-semibold cursor-default">Terms of Service</span>.
                </p>
            </div>
        </div>
    );
}

export default Signup;