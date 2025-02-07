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

}

module.exports = AdminController;





