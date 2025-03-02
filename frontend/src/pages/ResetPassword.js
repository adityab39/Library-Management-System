import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

function ResetPassword() {
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const email = localStorage.getItem("resetEmail"); // Retrieve email from local storage

    const handleResetPassword = async () => {
        if (!email) {
            toast.error("Email not found. Please request a password reset again.", { position: "bottom-right" });
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match!", { position: "bottom-right" });
            return;
        }

        try {
            const response = await axios.post("http://localhost:3000/api/auth/reset-password", {
                email,
                newPassword
            });

            // toast.success(response.data.message, { position: "bottom-right" });
            localStorage.removeItem("resetEmail"); // Clear stored email after successful reset
            navigate("/login");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to reset password.", { position: "bottom-right" });
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                
                {/* Title */}
                <h2 className="text-center text-2xl font-bold text-gray-900 mb-6">
                    Reset Password
                </h2>

                {/* Password Input */}
                <div className="relative mb-4">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded"
                    />
                    <span
                        className="absolute inset-y-0 right-4 flex items-center cursor-pointer text-gray-400"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
                    </span>
                </div>

                {/* Confirm Password Input */}
                <div className="relative mb-6">
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded"
                    />
                    <span
                        className="absolute inset-y-0 right-4 flex items-center cursor-pointer text-gray-400"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                        {showConfirmPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
                    </span>
                </div>

                {/* Change Password Button */}
                <button 
                    className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700"
                    onClick={handleResetPassword}
                >
                    Change Password
                </button>

                {/* Log in Option */}
                <p className="text-center mt-4 text-gray-600">
                    <span 
                        className="text-purple-600 font-semibold cursor-pointer"
                        onClick={() => navigate("/login")}
                    >
                        Log in
                    </span>
                </p>
            </div>
        </div>
    );
}

export default ResetPassword;