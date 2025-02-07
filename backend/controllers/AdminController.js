const express = require("express");
const db = require("../config/db");
const getResponseJson = require("../utils/responseHelper");
 

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


        const [existingBook] = await db.query("SELECT id FROM books WHERE isbn = ?", [isbn]);
        if (existingBook.length > 0) {
            return getResponseJson(res, 400, "A book with this ISBN already exists.");
        }


        let cover_image = null;
        if (req.file) {
            cover_image = `uploads/books/${req.file.filename}`;
        }

        await db.query(
            "INSERT INTO books (title, author, category, publication_year, isbn, language, total_copies, available_copies, cover_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [title, author, category, publication_year, isbn, language, total_copies, available_copies, cover_image]
        );
        
        return getResponseJson(res, 200, "Book added successfully.", { title, cover_image });

    }

    static async updateBook(req,res){

        const {bookId} = req.params;

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
            if (book[0].cover_image) {
                fs.unlink(book[0].cover_image, (err) => {
                    if (err) console.error("Error deleting old image:", err);
                });
            }
    
            updateCoverImageQuery = ", cover_image = ?";
            updateCoverImageParams.push(newCoverImagePath);
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
            bb.paid 
        FROM borrowed_books bb
        JOIN books b ON bb.book_id = b.id
        JOIN users u ON bb.user_id = u.id`;

        let params = [];
        if (status === "returned") {
            query += " WHERE bb.returned_at IS NOT NULL";
        } else if (status === "pending") {
            query += " WHERE bb.returned_at IS NULL";
        }

        query += " LIMIT ? OFFSET ?";
        params.push(limit, offset);

        const [borrowedBooks] = await db.query(query, params);

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

    static async restoreBook(req, res){
        const bookId = req.body.bookId;
        if (!bookId) {
            return getResponseJson(res, 400, "Book ID is required.");
        }

        const [already_active] = await db.query("SELECT id FROM books WHERE id = ? and is_active = 1");

        if(already_active.length > 0){
            return getResponseJson(res, 400, "Book is already active.");
        }

        const [book] = await db.query("SELECT id FROM books WHERE id = ?", [bookId]);
        if (book.length === 0) {
            return getResponseJson(res, 404, "Book not found.");
        }

        await db.query("UPDATE books SET is_active = 1 WHERE id = ?", [bookId]);

        return getResponseJson(res, 200, "Book restored successfully.");
    }
}

module.exports = AdminController;





