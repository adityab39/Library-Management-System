
# Library Management System

## Overview

The **Library Management System** is a web-based application designed to manage books, users, and borrowing activities efficiently. The system provides different functionalities for **members** and **administrators**.

## 📽️ Demo Videos

Watch the feature demonstrations:

### 🔹 User Registration
[![User Registration](demos/user_registration.png)](demos/user_registration.mov)

### 🔹 Admin Functionality
[![Admin Functionality](demos/admin_functionality.png)](demos/admin_functionality.mov)

### 🔹 Member Functionality
[![Member Functionality](demos/member_functionality.png)](demos/member_functionality.mov)

### 🔹 Forgot Password
[![Forgot Password](demos/forgot_password.png)](demos/forgot_password.mov)

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
