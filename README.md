# Library Management System

## Overview

The **Library Management System** is a web-based application designed to manage books, users, and borrowing activities efficiently. The system provides different functionalities for **members** and **administrators**.

## General Requirements
- **Node.js** (Latest LTS version recommended) – [Download here](https://nodejs.org/)
- **NPM** (Comes with Node.js) 
- **Git** (Version control system) – [Download here](https://git-scm.com/)
- **MySQL** – Relational database for storing books, users, and transactions.
- **Mail Service** – SMTP configuration for sending OTPs.

## Features

### Member Features
- **Search Books** – Search books by title.
- **Filter by Category and Author** – Narrow down book selection using filters.
- **Borrow Books** – Borrow books and view currently borrowed books.
- **Return Books** – Return borrowed books to the library.
- **Submit Ratings** – Rate books after borrowing them.
- **View Borrowing History** – Track past borrowing history.
- **Forgot Password with OTP** – Reset password using email-based OTP authentication.

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
- **Nodemailer** – Used for sending OTP for password reset.

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/adityab39/library-management-system.git
cd library-management-system
```

### 2. Setup the Backend (Server)
Navigate to the server folder:

```bash
cd backend
```

#### Install dependencies
```bash
npm install
```

#### Configure Environment Variables
Create a `.env` file in the backend directory and add the following:

```plaintext
DATABASE_HOST=localhost
DATABASE_USER=root
DATABASE_PASSWORD=yourpassword
DATABASE_NAME=library_db
EMAIL_USER=your email@gmail.com
EMAIL_PASS=your password (Google App Passwords)
JWT_SECRET=your_jwt_secret
```

#### Setup Database
Run migrations and seed the database:
```bash
npm run setup-db
```

#### Start the Server
```bash
npm run dev
```
This will start the server at `http://localhost:3000` by default.

### 3. Setup the Frontend (Client)
Navigate to the frontend folder:

```bash
cd ../frontend
```

#### Install dependencies
```bash
npm install
```

#### Start the Client
```bash
npm start
```
This will start the client at `http://localhost:3001` by default.


## Troubleshooting

### Common Issues & Fixes

#### 1. **Port Already in Use**
```bash
Error: Port 3000 is already in use
```
**Solution:**
Change the port in the `.env` file or use a different one.

#### 2. **Database Connection Error**
```bash
Error: Access denied for user 'root'@'localhost'
```
**Solution:**
Check your MySQL credentials in `.env` and ensure MySQL is running.

#### 3. **Nodemailer Not Sending OTP Emails**
```bash
Error: Authentication failed
```
**Solution:**
- Enable **Less Secure Apps** in your email settings.
- Use an app-specific password if using Gmail.

---
