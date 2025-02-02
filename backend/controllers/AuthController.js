const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const getResponseJson = require("../utils/responseHelper");

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
}

module.exports = AuthController;