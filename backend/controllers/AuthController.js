const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

class AuthController{
    static async register(req,res){
        const name = req.body.name;
        const password = req.body.password;
        const mobile = req.body.mobile;
        const email = req.body.email;

        
        if(name != "" && password != "" && email != "" && mobile != "")
        {
            const rows = await db.query("SELECT * FROM users WHERE (email = ? OR mobile = ?)",[email,mobile]);

            if(rows[0].length > 0){
                return res.status(400).json({message: "User already exists. Please Login"});
            }
            else
            {
                const hashedPassword = await bcrypt.hash(password, 10);
                await db.query("INSERT INTO USERS (name,email,mobile,password,role) VALUES (?,?,?,?,?)",[name,email,mobile,hashedPassword,"member"]);

            }
        }else
        {
            return res.status(500).json({message: "Server Error"});
        }
        return res.status(200).json({message:"User registered successfully"});
    }

    static async login(req,res){

    }

    static async logout(req,res){

    }
}

module.exports = AuthController;