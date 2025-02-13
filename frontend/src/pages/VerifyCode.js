import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

function VerifyCode() {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Retrieve email from navigation state or localStorage
    const userEmail = location.state?.email || localStorage.getItem("resetEmail") || "";

    // Mask Email for Privacy (Show first 2 letters & domain)
    const maskedEmail = userEmail
        ? `${userEmail.slice(0, 2)}*****@${userEmail.split("@")[1]}`
        : "your email";  // Default if no email is found

    const [verificationCode, setVerificationCode] = useState("");
    const [resendTimer, setResendTimer] = useState(60);

    const handleVerify = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:3000/api/auth/validate-otp", {
                email: userEmail, 
                verificationCode
            });

            alert(response.data.message);
            navigate("/reset-password");
        } catch (err) {
            alert(err.response?.data?.message || "Invalid verification code.");
        }
    };

    const handleResendCode = async () => {
        if (resendTimer > 0) return;

        try {
            await axios.post("http://localhost:3000/api/auth/resend-code", { email: userEmail });
            setResendTimer(60);
        } catch (err) {
            alert("Error resending code.");
        }
    };

    // Countdown Timer
    useEffect(() => {
        if (resendTimer > 0) {
            const interval = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [resendTimer]);

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                
                <h2 className="text-center text-2xl font-bold text-gray-900">
                    Reset Password
                </h2>

                <p className="text-center text-gray-600 mt-2">
                    Verification code sent to <strong>{maskedEmail}</strong>.
                </p>

                <form onSubmit={handleVerify} className="mt-6">
                    <input
                        type="text"
                        name="verificationCode"
                        placeholder="Enter Verification Code"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        required
                        className="w-full p-3 border border-gray-300 rounded mb-4 text-center"
                    />

                    <button 
                        type="submit"
                        className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition duration-200"
                    >
                        Verify Code
                    </button>
                </form>

                <p 
                    className={`text-center mt-4 ${resendTimer === 0 ? "text-purple-600 cursor-pointer hover:text-purple-800" : "text-gray-400"}`}
                    onClick={handleResendCode}
                >
                    {resendTimer === 0 ? "Resend Verification Code" : `Resend Verification Code in ${resendTimer}s`}
                </p>

                <p className="text-center mt-4 text-gray-600">
                    <span 
                        className="text-purple-600 font-semibold cursor-pointer hover:text-purple-800"
                        onClick={() => navigate("/login")}
                    >
                        Log in
                    </span>
                </p>
            </div>
        </div>
    );
}

export default VerifyCode;