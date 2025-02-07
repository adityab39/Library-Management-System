const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const crypto = require("crypto");
const twilio = require("twilio");
const nodemailer = require("nodemailer");
const getResponseJson = require("../utils/responseHelper");


const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

class AuthController{
    static async register(req,res){
        const name = req.body.name;
        const password = req.body.password;
        const mobile = req.body.mobile;
        const email = req.body.email;

        
        if(name != "" && password != "" && email != "" && mobile != "")
        {
            const rows = await db.query(
                "SELECT * FROM users WHERE (email = ? OR mobile = ?)",[email,mobile]);

            if(rows[0].length > 0){
                return getResponseJson(res,400,"User already exists. Please login.");
            }
            else
            {
                const hashedPassword = await bcrypt.hash(password, 10);
                await db.query(
                    "INSERT INTO USERS (name,email,mobile,password,role) VALUES (?,?,?,?,?)",[name,email,mobile,hashedPassword,"member"]);

            }
        }else
        {
            return getResponseJson(res,500,"Server Error");
        }
        return getResponseJson(res,200,"User Registered Successfully");
    }

    static async login(req,res){
        const email = req.body.email?.trim(); 
        const password = req.body.password;

        if(password == ""){
            return getResponseJson(res,400,"Please Enter Password");
        }

        if(email!= "" && password!=""){
            const [rows] = await db.query(
                "SELECT * FROM users WHERE (email = ? or mobile = ?)",[email,email]);

            if(rows.length == 0){
                return getResponseJson(res, 400, "User not registered. Please register first");
            }
            const user = rows[0];
            const isValidPassword = await bcrypt.compare(password,user.password);
            if(!isValidPassword){
                return getResponseJson(res,400,"Invalid credentials");
            }
            const token = jwt.sign(
                { id: user.id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: "1h" }
              );
            return getResponseJson(res, 200, "Login successfull", { token, user });

        }else
        {
            return getResponseJson(res,500,"Server Error");
        }
    }

    static async logout(req,res){
        return getResponseJson(res, 200, "Logout successful.");
    }

    static async forgotPassword(req,res){
        const { email } = req.body;

        const [user] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
        
        if (user.length === 0) {
            return getResponseJson(res, 400, "User not found.");
        }

        const userId = user[0].id;

        const otp = crypto.randomInt(100000, 999999);

        await db.query(
            "UPDATE users SET otp_code = ?, otp_expiry = DATE_ADD(NOW(), INTERVAL 10 MINUTE) WHERE id = ?",
            [otp, userId]
        );

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Password Reset OTP",
            text: `Your OTP for password reset is: ${otp}. This OTP is valid for 10 minutes.`,
        });

        return getResponseJson(res, 200, "OTP sent to your email.");

    }

    static async validateOTP(req, res) {
        try {
            const { email, otp } = req.body;
    
            if (!email || !otp) {
                return getResponseJson(res, 400, "Email and OTP are required.");
            }
    
            const [user] = await db.query(
                "SELECT id, otp_code, otp_expiry FROM users WHERE email = ?",
                [email]
            );
    
            if (user.length === 0) {
                return getResponseJson(res, 400, "User not found.");
            }
    
            const storedOTP = user[0].otp_code;
            const expiryTime = new Date(user[0].otp_expiry);
            const currentTime = new Date();
    
            if (currentTime > expiryTime) {
                return getResponseJson(res, 400, "OTP has expired. Please request a new one.");
            }
    
            if (otp != storedOTP) {
                return getResponseJson(res, 400, "Invalid OTP. Please try again.");
            }
    
            await db.query("UPDATE users SET otp_verified = 1 WHERE email = ?", [email]);
    
            return getResponseJson(res, 200, "OTP verified successfully. You can now reset your password.");
    
        } catch (error) {
            return getResponseJson(res, 500, "Error verifying OTP.", error);
        }
    }


    static async resetPassword(req, res) {
        try {
            const { email, newPassword } = req.body;

            if (!email || !newPassword) {
                return getResponseJson(res, 400, "Email and new password are required.");
            }

            const [user] = await db.query(
                "SELECT id, otp_verified FROM users WHERE email = ?",
                [email]
            );

            if (user.length === 0) {
                return getResponseJson(res, 400, "User not found.");
            }

            if (!user[0].otp_verified) {
                return getResponseJson(res, 400, "OTP verification required before resetting password.");
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);

            await db.query(
                "UPDATE users SET password = ?, otp_code = NULL, otp_expiry = NULL, otp_verified = 0 WHERE id = ?",
                [hashedPassword, user[0].id]
            );

            return getResponseJson(res, 200, "Password reset successfully.");

        } catch (error) {
            return getResponseJson(res, 500, "Error resetting password.", error);
        }
    }

}

module.exports = AuthController;