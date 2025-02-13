import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function OtpVerification() {
    const navigate = useNavigate();
    const [otp, setOtp] = useState("");
    const email = localStorage.getItem("resetEmail"); 

    const handleVerifyOtp = async () => {
        try {
            const response = await axios.post("http://localhost:3000/api/auth/validate-otp", { email, otp });

            alert(response.data.message);
            navigate("/reset-password"); 
        } catch (error) {
            alert(error.response?.data?.message || "Invalid OTP. Please try again.");
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                
                {/* Title */}
                <h2 className="text-center text-2xl font-bold text-gray-900">
                    OTP Verification
                </h2>

                {/* Instruction */}
                <p className="text-center text-gray-600 mt-2">
                    Enter the OTP sent to <strong>{email}</strong>
                </p>

                {/* OTP Input */}
                <input
                    type="text"
                    name="otp"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    className="w-full p-3 border border-gray-300 rounded mb-4 mt-4 text-center"
                />

                {/* Verify OTP Button */}
                <button
                    onClick={handleVerifyOtp}
                    className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700"
                >
                    Verify OTP
                </button>
            </div>
        </div>
    );
}

export default OtpVerification;