const getResponseJson  = require("../utils/responseHelper");
const db = require("../config/db");

class MemberController{
    static async getAllBooks(req,res){
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const title = req.query.title;
        const author = req.query.author;
        const category = req.query.category;
        const user_id = req.query.user_id;

        const limit = 10;
        const offset = (page - 1) * limit;

        if (!user_id) {  
            return getResponseJson(res, 400, "Please try again.");
        }

        if(user_id!='')
        {
            let query = "SELECT * FROM books WHERE available_copies > 0 and is_active = 1";
            let params = []

            if(title){
                query+="AND title LIKE ?";
                params.push(`%${title}%`);
            }
            if (author) {
                query += " AND author LIKE ?";
                params.push(`%${author}%`);
            }
            if (category) {
                query += " AND category LIKE ?";
                params.push(`%${category}%`);
            }
            query += " LIMIT ? OFFSET ?";
            params.push(limit, offset);

            const [books] = await db.query(query,params);

            if(books.length == 0){
                return getResponseJson(res,400,"No books available");
            }

            const [totalCountResult] = await db.query(
                "SELECT COUNT(*) as ttl FROM books WHERE available_copies > 0 and is_active = 1");
            const ttl_books = totalCountResult[0].ttl;
            const totalPages = Math.ceil(ttl_books / limit);

            return getResponseJson(res, 200, "Available books", {
                page,
                limit,
                ttl_books,
                totalPages,
                books,
            });
        }
        else
        {
            return getResponseJson(res,500,"Please try again");
        }      
    }

    static async searchBooks(req,res){
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const title = req.query.title;
        const author = req.query.author;
        const category = req.query.category;
        const user_id = req.query.user_id;

        const limit = 10;
        const offset = (page - 1) * limit;

        if (!user_id) {  
            return getResponseJson(res, 400, "Please try again.");
        }

        if(user_id!='')
        {
            let query = "SELECT * FROM books WHERE available_copies > 0 and is_active = 1";
            let params = []

            if (title) {
                query += " AND title LIKE ?";
                params.push(`%${title}%`);
            }
        
            if (author) {
                query += " AND author LIKE ?";
                params.push(`%${author}%`);
            }
        
            if (category) {
                query += " AND category LIKE ?";
                params.push(`%${category}%`);
            }

            query += " LIMIT ? OFFSET ?";
            params.push(limit, offset);

            const [books] = await db.query(query, params);
            if(books.length == 0){
                return getResponseJson(res,400,"No books available");
            }

            let countQuery = "SELECT COUNT(*) as total FROM books WHERE available_copies > 0 and is_active = 1";
            let countParams = [...params.slice(0, -2)];
            const [totalCountResult] = await db.query(countQuery, countParams);
            const totalBooks = totalCountResult[0].total;
            const totalPages = Math.ceil(totalBooks / limit);
    
            return getResponseJson(res, 200, "Search results", {
            page,
            limit,
            totalBooks,
            totalPages,
            books,
            });
        }
        else
        {
            return getResponseJson(res,500,"Please try again");
        }
    }
}

module.exports = MemberController;