
# Library Management System

## Overview

The **Library Management System** is a web-based application designed to manage books, users, and borrowing activities efficiently. The system provides different functionalities for **members** and **administrators**.

## 📽️ Demo Videos

Watch the feature demonstrations:

### 🔹 User Registration
https://github.com/user-attachments/assets/6c424e96-7289-4f63-90aa-ae9e343cd219

### 🔹 Admin Functionality
https://github.com/user-attachments/assets/7eb80436-2745-448e-a2e3-cca784cec627

### 🔹 Member Functionality
https://github.com/user-attachments/assets/cd5437ae-2cf2-4d19-b7a8-c6a4e2c5e1ad

### 🔹 Forgot Password
https://github.com/user-attachments/assets/b7bd4ee1-5b2b-4c60-a553-2447c428c2c8

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
```

### 2. Install Dependencies (Once inside project directories)
Run:
```bash
npm install
```

### 3. Setup the Database
#### a. Create MySQL Database
Open MySQL and run:
```sql
CREATE DATABASE library_db;
```

#### b. Import Seed Data
Run the following command to populate the database with sample data:
```bash
mysql -u your_username -p library_db < database/seed.sql
```

### 4. Set Up Environment Variables
Create a `.env` file in the backend directory and add the following:
```env
EMAIL_USER=your email@gmail.com
EMAIL_PASS=your password(Google App Password)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=library_db
JWT_SECRET=your_jwt_secret_key
```

### 5. Start the Backend Server
Navigate to the backend directory and start the server:
```bash
cd backend
npm run dev
```
This command will start the server at `http://localhost:3000` by default.

### 6. Start the Frontend
Navigate to the frontend directory and start the React application:
```bash
cd frontend
npm start
```

Now, the application should be running at `http://localhost:3000`. If the backend was started first, ensure the frontend is running on a different port.
