# Library Management System

## Overview

The **Library Management System** is a web-based application designed to manage books, users, and borrowing activities efficiently. The system provides different functionalities for **members** and **administrators**.

### General Requirements
- **Node.js** (Latest LTS version recommended) – [Download here](https://nodejs.org/)
- **NPM** (Comes with Node.js) 
- **Git** (Version control system) – [Download here](https://git-scm.com/)
- **MySQL** 


## Features

### Member Features
- **Search Books** – Search books by title.
- **Filter by Category and Author** – Narrow down book selection using filters.
- **Borrow Books** – Borrow books and view currently borrowed books.
- **Return Books** – Return borrowed books to the library.
- **Submit Ratings** – Rate books after borrowing them.
- **View Borrowing History** – Track past borrowing history.

### Admin Features
- **Perform all Member Actions** – Admins can search, filter, borrow, return, and rate books.
- **Add Books** – Add new books to the library collection.
- **Edit Books** – Modify book details such as title, author, category, and availability.
- **Delete Books** – Remove books from the collection.
- **View Borrowed Books** – Track which members have borrowed books, including their status (Pending/Returned).
- **Manage Members** – View and delete member accounts if necessary.

## Technologies Used

### Frontend
- **React.js** – Frontend framework.
- **HTML5, CSS3** – For structuring and styling.
- **Tailwind CSS / Bootstrap** – UI styling and layout.

### Backend
- **Node.js** – Backend runtime.
- **Express.js** – Web framework for API handling.
- **MySQL**  – Used for data storage.

### Authentication & Security
- **JWT (JSON Web Tokens)** – Secure authentication mechanism.
- **bcrypt.js** – Used for password hashing.

## Installation and Setup

To run this project locally, follow these steps:

### 1. Clone the Repository

```bash
git clone https://github.com/adityab39/library-management-system.git
cd library-management-system
