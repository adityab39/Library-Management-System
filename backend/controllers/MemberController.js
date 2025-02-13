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
            let query = "SELECT * FROM books WHERE available_copies > 0 and is_active = 1 and id NOT IN (SELECT book_id FROM borrowed_books WHERE user_id = ? AND returned_at IS NULL)";
            let params = [user_id];

            if(title){
                query+="AND title LIKE ?";
                params.push(`%${title}%`);
            }

            if (author) {
                const authorArray = author.split(",");
                const findInSetConditions = authorArray.map(() => `FIND_IN_SET(?, author)`).join(" OR ");
            
                query += ` AND (${findInSetConditions})`;
                params.push(...authorArray);
            }

            if (category) {
                const categoryArray = category.split(",");
                const findInSetConditions = categoryArray.map(() => `   (?, category)`).join(" OR ");

                query += ` AND (${findInSetConditions})`;
                params.push(...categoryArray);
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
                params.push(`${title}%`);
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
        const user_id = req.user.id;
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

            const [fineResult] = await db.query(
                "SELECT SUM(fine) AS total_fine FROM borrowed_books WHERE user_id = ? AND fine > 0 AND paid = FALSE",
                [user_id]
            );
    
            const totalFine = fineResult[0].total_fine || 0;
    
            if (totalFine > 0) {
                return getResponseJson(res, 400, `You have an unpaid fine of $${totalFine}. Please pay before borrowing.`);
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

    static async returnBook(req,res){
        const user_id = req.user.id;
        const book_id = req.body.book_id;
        const borrowed_id = req.body.borrowed_id;

        if (!user_id || !book_id) {
            return getResponseJson(res, 400, "Please try again.");
        }

        if(user_id!='' && book_id!='')
        {
            const [borrowed] = await db.query(
                "SELECT due_date FROM borrowed_books WHERE user_id = ? AND book_id = ? AND id = ? AND returned_at IS NULL",
                [user_id, book_id, borrowed_id]
            );
            
            if (borrowed.length === 0) {
                return getResponseJson(res, 400, "You have not borrowed this book.");
            }

            const dueDate = new Date(borrowed[0].due_date);
            const returnDate = new Date();
            let fine = 0;

            if (returnDate > dueDate) {
                const daysLate = Math.ceil((returnDate - dueDate) / (1000 * 60 * 60 * 24));
                fine = daysLate * 2; 
            }

            await db.query(
                "UPDATE borrowed_books SET returned_at = NOW(), fine = ?, paid = ?, modified_time = NOW() WHERE user_id = ? AND book_id = ? AND id = ?",
                [fine, fine === 0, user_id, book_id, borrowed_id]
            );

            await db.query("UPDATE books SET available_copies = available_copies + 1 WHERE id = ?", [book_id]);

            return getResponseJson(res, 200, `Book returned successfully. ${fine > 0 ? `Fine: $${fine}` : ''}`);
        }
        else
        {
            return getResponseJson(res, 400, "Please try again.");
        }

    }

    static async getBorrowedbooks(req,res)
    {
        const user_id = req.user?.id;
        const [books] = await db.query(`
            SELECT 
                bb.id as borrowed_id,
                b.id AS book_id, 
                b.title, 
                b.author, 
                bb.due_date, 
                bb.fine 
             FROM borrowed_books bb
             JOIN books b ON bb.book_id = b.id
             WHERE bb.user_id = ? AND bb.returned_at IS NULL`,[user_id]);
        
            
        if(books.length == 0){
            return getResponseJson(res,200,"You have no borrowed books");
        }

        return getResponseJson(res,200,"Borrowed books retrieved successfully.",books);
    }

    static async borrowingHistory(req,res){
        const user_id = req.user.id;

        if(!user_id){
            return getResponseJson(res,500,"Please try again.");
        }

        const [history] = await db.query(`
            SELECT 
                b.id AS book_id, 
                b.title, 
                b.author, 
                DATE_FORMAT(bb.borrowed_at,"%m-%d-%Y") AS borrowed_date, 
                DATE_FORMAT(bb.due_date,"%m-%d-%Y") AS due_date, 
                IF(bb.returned_at IS NOT NULL, DATE_FORMAT(bb.returned_at,"%m-%d-%Y"), "") AS returned_date, 
                bb.fine 
             FROM borrowed_books bb
             JOIN books b ON bb.book_id = b.id
             WHERE bb.user_id = ?
             ORDER BY bb.borrowed_at DESC `,[user_id]);
        
        if(history.length == 0){
            return getResponseJson(res,400,"No borrowing history");
        }

        return getResponseJson(res,200,"Borrowing history retrieved successfully.",history);
    }

    static async reviewBook(req,res){
        const book_id = req.body.book_id;
        const rating = req.body.rating;
        const user_id = req.user.id;

        const [borrowed] = await db.query(
            "SELECT id FROM book_reviews WHERE user_id = ? AND book_id = ?",
            [user_id, book_id]
        );
        
        if (borrowed.length > 0) {
            return getResponseJson(res, 400, "You have already given a rating for this book.");
        }

        await db.query(
            "INSERT INTO book_reviews (user_id, book_id, rating) VALUES (?, ?, ?)",
            [user_id, book_id, rating]
        );

        return getResponseJson(res, 200, "Rating submitted successfully.");
    }

    static async getCategories(req,res){
        const [categories] = await db.query("SELECT DISTINCT category FROM books");

        if(categories.length == 0){
            return getResponseJson(res,400,"No categories available");
        }

        return getResponseJson(res,200,"Categories retrieved successfully.",categories);
    }

    static async getAuthors(req,res){
        const [authors] = await db.query("SELECT DISTINCT author FROM books");

        if(authors.length == 0){
            return getResponseJson(res,400,"No authors available");
        }

        return getResponseJson(res,200,"Authors retrieved successfully.",authors);
    }
}

module.exports = MemberController;