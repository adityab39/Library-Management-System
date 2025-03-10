const express = require("express");
const db = require("../config/db");
const getResponseJson = require("../utils/responseHelper");
const sendMail = require("../config/email");

class AdminController{
    static async addBook(req,res){

        const title = req.body.title;
        const author = req.body.author;
        const category = req.body.category;
        const description = req.body.description;
        const total_copies = req.body.total_copies;
        const available_copies = req.body.available_copies;
        const publication_year = req.body.publication_year;
        const isbn = req.body.isbn;
        const language = req.body.language;


        if (!title || !author || !category || !total_copies || !available_copies || !publication_year || !isbn || !language || !description) {
            return getResponseJson(res, 400, "All fields are required.");
        }


        const [existingBook] = await db.query("SELECT id FROM books WHERE isbn = ? and is_active = 1", [isbn]);
        if (existingBook.length > 0) {
            return getResponseJson(res, 400, "A book with this ISBN already exists.");
        }


        let cover_image = null;
        if (req.file) {
            cover_image = `http://localhost:3000/uploads/books/${req.file.filename}`;
        }

        await db.query(
            "INSERT INTO books (title, author, category, publication_year, isbn, language, total_copies, available_copies, description, cover_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [title, author, category, publication_year, isbn, language, total_copies, available_copies, description, cover_image]
        );
        
        return getResponseJson(res, 200, "Book added successfully.", { title, cover_image });

    }

    static async updateBook(req,res){

        const {bookId} = req.params;

        const title = req.body.title;
        const author = req.body.author;
        const category = req.body.category;
        const description = req.body.description;
        const publication_year = Number(req.body.publication_year) || 0;
        const total_copies = Number(req.body.total_copies) || 0;
        const available_copies = Number(req.body.available_copies) || 0;
        const isbn = req.body.isbn;
        const language = req.body.language;

        if (available_copies > total_copies) {
            return getResponseJson(res, 400, "Available copies cannot be more than total copies.");
        }

        if (!title || !author || !category || !total_copies || !available_copies || !publication_year || !isbn || !language || !description) {
            return getResponseJson(res, 400, "All fields are required.");
        }

        const [book] = await db.query("SELECT id FROM books WHERE id = ?", [bookId]);

        if(book.length === 0){
            return getResponseJson(res, 404, "Book not found.");
        }

        const [isbnCheck] = await db.query("SELECT id FROM books WHERE isbn = ? AND id != ?", [isbn, bookId]);
        if(isbnCheck.length > 0){
            return getResponseJson(res, 400, "A book with this ISBN already exists.");
        }

        let updateCoverImageQuery = "";
        let updateCoverImageParams = [];
        let newCoverImagePath = book[0].cover_image; 


        if (req.file) {
            newCoverImagePath = `uploads/books/${req.file.filename}`;
            const fullImageUrl = `http://localhost:3000/${newCoverImagePath}`;
            if (book[0].cover_image) {
                fs.unlink(book[0].cover_image, (err) => {
                    if (err) console.error("Error deleting old image:", err);
                });
            }
    
            updateCoverImageQuery = ", cover_image = ?";
            updateCoverImageParams.push(fullImageUrl);
        }

        await db.query(
            `UPDATE books SET title = ?, author = ?, category = ?, publication_year = ?, isbn = ?, language = ?, total_copies = ?, description = ?, available_copies = ? ${updateCoverImageQuery} WHERE id = ?`,
            [title, author, category, publication_year, isbn, language, total_copies, description, available_copies, ...updateCoverImageParams, bookId]
        );

        return getResponseJson(res, 200, "Book updated successfully.", {
            bookId,
            title,
            cover_image: updateCoverImageParams.length > 0 ? `http://localhost:3000/${newCoverImagePath}` : book[0].cover_image
        });
    }

    static async deleteBook(req,res){
        const bookId = req.body.bookId;
        if (!bookId) {
            return getResponseJson(res, 400, "Book ID is required.");
        }

        const [book] = await db.query("SELECT id, cover_image FROM books WHERE id = ?", [bookId]);
        if (book.length === 0) {
            return getResponseJson(res, 404, "Book not found.");
        }

        await db.query("UPDATE books SET is_active = 0 WHERE id = ?", [bookId]);
        return getResponseJson(res, 200, "Book deleted successfully.");
    }

    static async getBooks(req, res){
        const { page = 1, status } = req.query; 
        const limit = 10;
        const offset = (page - 1) * limit;

        let query = "SELECT * FROM books";
        let params = [];

        if (status !== undefined) {
            query += " WHERE is_active = ?";
            params.push(status);
        }

        query += " LIMIT ? OFFSET ?";
        params.push(limit, offset);

        const [books] = await db.query(query, params);

        if (books.length === 0) {
            return getResponseJson(res, 404, "No books found.");
        }
        
        const formattedBooks = books.map(book => ({
            ...book,
            cover_image: book.cover_image ? `http://localhost:3000/${book.cover_image}` : null
        }));

        const [countResult] = await db.query("SELECT COUNT(*) as total FROM books");
        const totalBooks = countResult[0].total;
        const totalPages = Math.ceil(totalBooks / limit);

        return getResponseJson(res, 200, "Books retrieved successfully.", {
            page,
            limit,
            totalBooks,
            totalPages,
            books: formattedBooks
        });

    }

    static async getBorrowedBooks(req,res){
        const { page = 1, status } = req.query; 
        const limit = 10;
        const offset = (page - 1) * limit;

        let query = `
        SELECT 
            b.id AS book_id, 
            b.title, 
            b.author, 
            u.id AS user_id, 
            u.name AS member_name, 
            u.email, 
            bb.id AS borrowed_id,
            bb.due_date, 
            bb.returned_at, 
            bb.fine, 
            bb.paid,
            IF(bb.returned_at IS NULL, 'Pending', 'Returned') AS status 
        FROM borrowed_books bb
        JOIN books b ON bb.book_id = b.id
        JOIN users u ON bb.user_id = u.id`;

        let params = [];
        query += " LIMIT ? OFFSET ?";
        params.push(limit, offset);

        const [borrowedBooks] = await db.query(query,params );

        if (borrowedBooks.length === 0) {
            return getResponseJson(res, 404, "No borrowed books found.");
        }

        const [countResult] = await db.query("SELECT COUNT(*) as total FROM borrowed_books");
        const totalBorrowed = countResult[0].total;
        const totalPages = Math.ceil(totalBorrowed / limit);

        return getResponseJson(res, 200, "Borrowed books retrieved successfully.", {
            page,
            limit,
            totalBorrowed,
            totalPages,
            borrowedBooks
        });
    }


    static async getAllMembers(req, res) {
        const { page = 1, limit = 10 } = req.query; 
        const offset = (page - 1) * limit;
    
        const [members] = await db.query(
            "SELECT id, name, email, mobile, 'Member' as role, created_at FROM users WHERE role_id = '2' and is_active = 1 LIMIT ? OFFSET ?",
            [parseInt(limit), parseInt(offset)]
        );
    
        const [countResult] = await db.query(
            "SELECT COUNT(*) as total FROM users WHERE role_id = '2' and is_active = 1"
        );
        const totalMembers = countResult[0].total;
        const totalPages = Math.ceil(totalMembers / limit);
    
        return getResponseJson(res, 200, "Members retrieved successfully.", {
            page,
            limit,
            totalMembers,
            totalPages,
            members: members.length > 0 ? members : [] 
        });
    }

    static async deleteMember(req,res){
        const user_id = req.body.memberId;

        if(!user_id){
            return getResponseJson(res,400,"Please try again");
        }

        const [check_user] = await db.query("SELECT id FROM users WHERE id=?",[user_id]);
        if(check_user.length == 0){
            return getResponseJson(res,400,"Member not found.");
        }

        await db.query(`UPDATE users
                        SET is_active = 0
                        WHERE id = ?`,[user_id]);
        
        return getResponseJson(res,200,"Member deactivated successfully");
    }

    static async getLibraryStats(req, res) {
        try {
            const [totalBooksResult] = await db.query("SELECT COUNT(*) as totalBooks FROM books");
            const totalBooks = totalBooksResult[0].totalBooks;
    
            const [borrowedBooksResult] = await db.query("SELECT COUNT(*) as borrowedBooks FROM borrowed_books WHERE returned_at IS NULL");
            const borrowedBooks = borrowedBooksResult[0].borrowedBooks;
    
            const [activeMembersResult] = await db.query("SELECT COUNT(*) as activeMembers FROM users WHERE role = 'member' AND is_active = 1");
            const activeMembers = activeMembersResult[0].activeMembers;
    
            const [deactivatedMembersResult] = await db.query("SELECT COUNT(*) as deactivatedMembers FROM users WHERE role = 'member' AND is_active = 0");
            const deactivatedMembers = deactivatedMembersResult[0].deactivatedMembers;
    
            return getResponseJson(res, 200, "Library stats retrieved successfully.", {
                totalBooks,
                borrowedBooks,
                activeMembers,
                deactivatedMembers
            });
    
        } catch (error) {
            return getResponseJson(res, 500, "Error fetching library stats.", error);
        }
    }

    static async sendDueBookNotifications(req, res) {
        try {
            const [dueUsers] = await db.query(
                `SELECT u.id AS user_id, u.email, u.name, b.title, bb.due_date 
                FROM borrowed_books bb
                JOIN books b ON bb.book_id = b.id
                JOIN users u ON bb.user_id = u.id
                WHERE bb.returned_at IS NULL 
                AND bb.due_date = DATE_ADD(CURDATE(), INTERVAL 1 DAY)`
            );

            if (dueUsers.length === 0) {
                return getResponseJson(res, 200, "No due book notifications.");
            }

            for (const user of dueUsers) {
                const subject = "Library Reminder: Book Due Tomorrow!";
                const text = `Dear ${user.name},\n\n` +
                            `Reminder: The book **"${user.title}"** is due tomorrow (${user.due_date}). ` +
                            `Please return it on time to avoid late fees.\n\n` +
                            `Thank you!\nLibrary Management System`;

                await sendMail(user.email, subject, text);
            }

            return getResponseJson(res, 200, "Due book notification emails sent.");

        } catch (error) {
            return getResponseJson(res, 500, "Error sending due book notifications.", error);
        }
    }

}

module.exports = AdminController;





