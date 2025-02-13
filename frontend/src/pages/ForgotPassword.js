import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");

    const handleResetPassword = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:3000/api/auth/forgot-password", { email });
            alert(response.data.message);
        } catch (err) {
            alert(err.response?.data?.message || "Failed to send reset link.");
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                {/* Title */}
                <h2 className="text-center text-2xl font-bold text-gray-900">
                    Reset Password
                </h2>
                
                {/* Form */}
                <form onSubmit={handleResetPassword} className="mt-6">
                    <input
                        type="email"
                        name="email"
                        placeholder="Please enter Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full p-3 border border-gray-300 rounded mb-4"
                    />
                    <button 
                        className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700"
                    >
                        Reset My Password
                    </button>
                </form>
                
                {/* Log In Link */}
                <p className="text-center text-sm text-gray-600 mt-6 cursor-pointer hover:underline" onClick={() => navigate("/login")}>Log in</p>
            </div>
        </div>
    );
}

export default ForgotPassword;
