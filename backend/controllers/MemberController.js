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

    static async borrowBook(req,res){
        const user_id = req.body.user_id;
        const book_id = req.body.book_id;

        if (!user_id || !book_id) {
            return getResponseJson(res, 400, "Please try again.");
        }

        if(user_id!='' && book_id!='')
        {
            const [borrowed_books] = await db.query(
                "SELECT COUNT(id) AS borrowed_count FROM borrowed_books WHERE user_id = ? and returned_at IS NULL",[user_id]);
            if(borrowed_books[0].borrowed_count >=5){
                return getResponseJson(res,400,"You cannot borrow more than 5 books.");
            }

            const [already_borrowed] = await db.query(
                "SELECT id FROM borrowed_books WHERE user_id = ? and book_id = ? and returned_at is NULL",[user_id,book_id]);
            
            if(already_borrowed.length > 0){
                return getResponseJson(res,400,"You have already borrowed this book.")
            }


            const [book] = await db.query(
                "SELECT id FROM books WHERE id = ? AND available_copies > 0",[book_id]);
            
            if(book.length === 0){
                return getResponseJson(res,400,"Book is not avaiable. You can reserve it.");
            }
            await db.query(
                "INSERT INTO borrowed_books (user_id, book_id, due_date) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 14 DAY))",
                [user_id, book_id]
            );

            await db.query("UPDATE books SET available_copies = available_copies - 1 WHERE id = ?", [book_id]);

            return getResponseJson(res, 200, "Book borrowed successfully.");
        }
    }
}

module.exports = MemberController;