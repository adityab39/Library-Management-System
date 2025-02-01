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
        const email = req.body.email;
        const mobile = req.body.mobile;
        const password = req.body.password;

        if(password == ""){
            return getResponseJson(res,400,"Please Enter Password");
        }

        if(email!= "" && mobile!="" && password!=""){
            let query, params;

            if (email) {
                query = "SELECT * FROM users WHERE email = ?";
                params = [email];
              } else if (mobile) {
                query = "SELECT * FROM users WHERE mobile = ?";
                params = [mobile];
              } else {
                return getResponseJson(res, 400, "Please enter email or mobile to login");
            }

            const [rows] = await db.query(query, params);
            if(rows.length == 0){
                return getResponseJson(res, 400, "User not registered. Please register first");
            }
            const user = rows[0];
            const isValidPassword = await bcrypt.compare(password,user.password);
            if(!isValidPassword){
                return getResponseJson(res,400,"Invalid credentials");
            }
            return getResponseJson(res, 200, "Login successfull", { userId: user.id });

        }else
        {
            return getResponseJson(res,500,"Server Error");
        }
    }

    static async logout(req,res){

    }
}

module.exports = AuthController;