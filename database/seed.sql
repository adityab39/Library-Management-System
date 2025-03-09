
-- Drop existing tables if they exist
DROP TABLE IF EXISTS borrowed_books, book_reviews, books, users, role;

-- Create roles table

CREATE TABLE `role` (
  `id` int(10) NOT NULL,
  `role_id` int(10) NOT NULL,
  `role_name` varchar(200) NOT NULL,
  `created_time` timestamp NOT NULL DEFAULT current_timestamp()
);

-- Insert roles (Admin and Member)

INSERT INTO `role` (`id`, `role_id`, `role_name`) VALUES
(1, 2, 'Member'),
(2, 20, 'Admin');

-- Create users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    mobile VARCHAR(15) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    is_active TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    otp_code VARCHAR(6) NULL,
    otp_expiry TIMESTAMP NULL,
    otp_verified TINYINT DEFAULT 0,
    FOREIGN KEY (role_id) REFERENCES role(id)
);

-- Insert sample users (Admin and Member)
INSERT INTO users (name, email, mobile, password, role_id) VALUES 
('Admin User', 'admin@example.com', '1234567890', 'hashed_password_admin', 20),
('Member User', 'member@example.com', '0987654321', 'hashed_password_member', 2);

-- Create books table
CREATE TABLE books (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    total_copies INT NOT NULL,
    available_copies INT NOT NULL,
    publication_year INT NOT NULL,
    isbn VARCHAR(50) UNIQUE NOT NULL,
    language VARCHAR(50) NOT NULL,
    cover_image VARCHAR(255) NULL
);

-- Insert sample books
INSERT INTO `books` (`id`, `title`, `author`, `category`, `description`, `total_copies`, `available_copies`, `publication_year`, `isbn`, `language`, `cover_image`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Harry Potter and the Sorcerer\'s Stone', 'J.K. Rowling', 'Fantasy', 'First book in the Harry Potter series.', 10, 4, '1997', '978-0439708180', 'English', 'http://localhost:3000/uploads/books/Harry_Potter_and_the_Sorcerer_s_Stone.jpg', 1, '2025-02-02 05:54:05', '2025-03-09 01:21:29'),
(2, 'Harry Potter and the of Secrets', 'J.K. Rowling', 'Fantasy', 'Second book in the Harry Potter series.', 10, 10, '1998', '978-0439064873', 'English', 'http://localhost:3000/uploads/books/Harry_Potter_and_the_of_Secrets.jpg', 1, '2025-02-02 05:54:05', '2025-03-09 00:58:10'),
(3, 'The Hobbit', 'J.R.R. Tolkien', 'Fantasy', 'A prelude to The Lord of the Rings.', 8, 4, '1937', '978-0547928227', 'English', 'http://localhost:3000/uploads/books/The_Hobbit.jpg', 1, '2025-02-02 05:54:05', '2025-02-13 22:08:30'),
(4, 'The Lord of the Rings', 'J.R.R. Tolkien', 'Fantasy', 'A fantasy epic trilogy.', 12, 6, '1954', '978-0544003415', 'English', 'http://localhost:3000/uploads/books/The_Lord_of_the_Rings.jpg', 1, '2025-02-02 05:54:05', '2025-02-10 20:23:40'),
(5, 'A Game of Thrones', 'George R.R. Martin', 'Fantasy', 'First book in A Song of Ice and Fire series.', 15, 7, '1996', '978-0553103540', 'English', 'http://localhost:3000/uploads/books/A_Game_of_Thrones.jpg', 1, '2025-02-02 05:54:05', '2025-02-10 20:23:40'),
(6, 'The Catcher in the Rye', 'J.D. Salinger', 'Classic', 'A coming-of-age story.', 10, 5, '1951', '978-0316769488', 'English', 'http://localhost:3000/uploads/books/The_Catcher_in_the_Rye.jpg', 1, '2025-02-02 05:54:05', '2025-02-10 20:23:40'),
(7, 'To Kill a Mockingbird', 'Harper Lee', 'Classic', 'A novel about racial injustice.', 12, 5, '1960', '978-0061120084', 'English', 'http://localhost:3000/uploads/books/To_Kill_a_Mockingbird.jpg', 1, '2025-02-02 05:54:05', '2025-02-10 20:23:40'),
(8, '1984', 'George Orwell', 'Dystopian', 'A novel about a totalitarian future.', 14, 8, '1949', '978-0451524935', 'English', 'http://localhost:3000/uploads/books/1984.jpg', 1, '2025-02-02 05:54:05', '2025-02-10 20:23:40'),
(9, 'Brave New World', 'Aldous Huxley', 'Dystopian', 'A novel about a utopian dystopia.', 10, 6, '1932', '978-0060850524', 'English', 'http://localhost:3000/uploads/books/Brave_New_World.jpg', 1, '2025-02-02 05:54:05', '2025-02-10 20:23:40'),
(10, 'Fahrenheit 451', 'Ray Bradbury', 'Dystopian', 'A novel about censorship.', 10, 3, '1953', '978-1451673319', 'English', 'http://localhost:3000/uploads/books/Fahrenheit_451.jpg', 1, '2025-02-02 05:54:05', '2025-02-12 04:18:16'),
(11, 'The Great Gatsby', 'F. Scott Fitzgerald', 'Classic Fiction', 'A novel about censorship.', 15, 10, '1925', '978-0743273565', 'English', 'uploads/books/The_Great_Gatsby.jpg', 0, '2025-02-07 19:53:11', '2025-03-02 02:55:42'),
(12, 'The Subtle Art of Not Giving a F*ck', 'Mark Manson', 'Classic', NULL, 10, 10, '2016', '978-0743273561', 'English', 'uploads/books/The_Subtle_Art_of_Not_Giving_a_F_ck.jpg', 1, '2025-02-15 04:39:38', '2025-02-15 04:39:38'),
(22, 'Atomic Habits', 'James Clear', 'Self Help', 'Atomic Habits provides practical strategies to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results.', 21, 21, '2018', '978-0735211292', 'English', 'http://localhost:3000/uploads/books/Atomic_Habits.jpg', 1, '2025-02-18 15:23:43', '2025-02-18 15:23:43');
-- Insert more books as needed


-- Create book_reviews table
CREATE TABLE book_reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    book_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (book_id) REFERENCES books(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);


-- Create borrowed_books table
CREATE TABLE borrowed_books (
    id INT PRIMARY KEY AUTO_INCREMENT,
    book_id INT NOT NULL,
    user_id INT NOT NULL,
    borrowed_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP NOT NULL,
    returned_at TIMESTAMP NULL,
    fine DECIMAL(5,2) DEFAULT 0.00,
    status ENUM('Pending', 'Returned') DEFAULT 'Pending',
    FOREIGN KEY (book_id) REFERENCES books(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);


