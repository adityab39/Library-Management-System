import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BsThreeDotsVertical } from "react-icons/bs";

    function MemberDashboard() {
        const navigate = useNavigate();
        const [showLogout, setShowLogout] = useState(false);
        const [memberName, setMemberName] = useState("Member");
        const [books, setBooks] = useState([]);
        const [userId, setUserId] = useState(null);
        const [activeTab, setActiveTab] = useState(localStorage.getItem("activeTab") || "books");
        const [searchQuery, setSearchQuery] = useState("");
        const [selectedCategory, setSelectedCategory] = useState("");
        const [selectedAuthor, setSelectedAuthor] = useState("");
        const [categories, setCategories] = useState([]); 
        const [authors, setAuthors] = useState([]);
        const [selectedCategories, setSelectedCategories] = useState([]);
        const [selectedAuthors, setSelectedAuthors] = useState([]);
        const [showAuthorDropdown, setShowAuthorDropdown] = useState(false); 
        const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
        const [borrowedBooks, setBorrowedBooks] = useState(new Set());
        const [selectedBook, setSelectedBook] = useState(null);
        const [showModal, setShowModal] = useState(false);
        const [userRating, setUserRating] = useState(0);
        const [borrowedBookList, setBorrowedBookList] = useState([]);
        const [borrowedHistory, setBorrowedHistory] = useState([]);
        const [currentPage, setCurrentPage] = useState(1);
        const [totalPages, setTotalPages] = useState(1);
        const [roleId, setRoleId] = useState(null);
        const [showAddBookModal, setShowAddBookModal] = useState(false);
        const [menuOpen, setMenuOpen] = useState(null);



        const handleTabChange = (tab) => {
            setActiveTab(tab);
            localStorage.setItem("activeTab", tab);
            if (tab === "books") {
                fetchBooks(userId);
            } else if (tab === "borrowed") {
                fetchBorrowedBooks();
            }else if (tab === "history") {
                fetchBorrowedHistory();
            }
        };

        useEffect(() => {
            const user = JSON.parse(localStorage.getItem("user"));
            if (user && user.id) {
                setMemberName(user.name);
                setUserId(user.id);
                setRoleId(user.role_id);
            }
        }, []);

        useEffect(() => {
            if (userId && activeTab === "books") {
                fetchBooks(userId, currentPage, 10, selectedCategories, selectedAuthors);
                fetchCategories(userId);
                fetchAuthors(userId);
            }
        }, [userId, activeTab, currentPage, selectedCategories, selectedAuthors]);

        useEffect(() => {
            if (userId && activeTab === "borrowed") {
                fetchBorrowedBooks();
            }
        }, [userId, activeTab]);

        useEffect(() => {
            if (activeTab === "history") {
                fetchBorrowedHistory();
            }
        }, [activeTab]);



        const searchBooks = async (query) => {
            if (!query.trim()) {
                fetchBooks(userId); 
                return;
            }
        
            try {
                let apiUrl = `http://localhost:3000/api/member/books/search?user_id=${userId}&title=${query}`;
                
                if (selectedCategory) {
                    apiUrl += `&category=${selectedCategory}`;
                }
                if (selectedAuthor) {
                    apiUrl += `&author=${selectedAuthor}`;
                }
                const response = await axios.get(apiUrl);
                setBooks(response.data.data.books || []);
            } catch (error) {
                console.error("Error searching books:", error);
            }
        };

        const fetchCategories = async (userId) => {
            try {
                const apiUrl = `http://localhost:3000/api/member/books/categories?user_id=${userId}`;
                const response = await axios.get(apiUrl);
                setCategories(response.data.data.map(item => item.category));
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };

        const fetchAuthors = async (userId) => {
            try {
                const apiUrl = `http://localhost:3000/api/member/books/authors?user_id=${userId}`;
                const response = await axios.get(apiUrl);
                setAuthors(response.data.data.map(a => a.author));
            } catch (error) {
                console.error("Error fetching authors:", error);
            }
        };


        const fetchBooks = async (userId,page = 1, limit = 10, categories = selectedCategories, authors = selectedAuthors) => {
            if (!userId) return;
        
            try {
                let apiUrl = `http://localhost:3000/api/member/books?user_id=${userId}&page=${page}&limit=${limit}`;
        
                if (categories.length > 0) {
                    apiUrl += `&category=${categories.join(",")}`;
                }

                if (authors.length > 0) {
                    apiUrl += `&author=${authors.join(",")}`;
                }
        
                console.log("Fetching Books with URL:", apiUrl);

                const response = await axios.get(apiUrl);
                setBooks(response.data.data.books || []);
                setTotalPages(response.data.data.totalPages);
            } catch (error) {
                console.error("Error fetching books:", error);
            }
        };

        const handleLogout = () => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/login");
        };

        const handleCategoryChange = (category) => {
            let updatedCategories = [...(selectedCategories || [])];
        
            if (updatedCategories.includes(category)) {
                updatedCategories = updatedCategories.filter(c => c !== category);
            } else {
                updatedCategories.push(category);
            }
        
            setSelectedCategories(updatedCategories);
            setCurrentPage(1);
        
            fetchBooks(userId, 1, 10, updatedCategories, selectedAuthors || []);
        };
        
        const handleAuthorChange = (author) => {
            setSelectedAuthors((prevSelectedAuthors) => {
                let updatedAuthors;
                
                updatedAuthors = prevSelectedAuthors.includes(author)
                    ? prevSelectedAuthors.filter(a => a !== author)
                    : [...prevSelectedAuthors, author];
                
                setCurrentPage(1); 
                fetchBooks(userId, 1, 10, selectedCategories, updatedAuthors); 
                return updatedAuthors; 
            });
        };

        const borrowBook = async (bookId) => {
            if (borrowedBooks.has(bookId)) return; 
        
            try {
                const apiUrl = `http://localhost:3000/api/member/books/borrow`;
                const response = await axios.post(apiUrl, { book_id: bookId }, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                });
        
                if (response.data.message === "Book borrowed successfully.") {
                    setBorrowedBooks(new Set([...borrowedBooks, bookId]));
                    toast.success("Book borrowed successfully!", { position: "top-right" });

                    fetchBooks(userId, selectedCategories, selectedAuthors);
                }
            } catch (error) {
                toast.error("Failed to borrow book", { position: "top-right" });
                console.error("Error borrowing book:", error);
            }
        };

        const openBookDetails = (book) => {
            setSelectedBook(book);
            setShowModal(true);
        };
        
        const closeBookDetails = () => {
            setShowModal(false);
            setSelectedBook(null);
        };

        const submitRating = async (rating) => {
            if (!selectedBook || !userId) return;
        
            const token = localStorage.getItem("token"); 
        
            try {
                const response = await axios.post(
                    "http://localhost:3000/api/member/books/review",
                    {
                        book_id: selectedBook.id,
                        rating: rating
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`, 
                            "Content-Type": "application/json"
                        }
                    }
                );
        
                // Check if status code is 200 (Success)
                if (response.status === 200) {
                    toast.success(response.data.message, { position: "top-right" });
                    setUserRating(rating);
                    fetchBooks(userId);

                    setTimeout(() => {
                        setShowModal(false);
                    }, 500); 

                } else {
                    toast.error("Failed to submit review", { position: "top-right" });
                }
        
            } catch (error) {
                console.error("Error submitting review:", error);
                
                // Display error message if available, otherwise show a generic error
                const errorMessage = error.response?.data?.message || "Failed to submit review";
                toast.error(errorMessage, { position: "top-right" });
            }
        };

        const fetchBorrowedBooks = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get("http://localhost:3000/api/member/books/borrowed", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                const books = response.data.data || [];  
                setBorrowedBookList(books);
                const borrowedBookIds = new Set(response.data.data.map(book => book.book_id));
                setBorrowedBooks(borrowedBookIds);
            } catch (error) {
                console.error("Error fetching borrowed books:", error);
            }
        };

        const returnBook = async (bookId,borrowedID) => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.post(
                    "http://localhost:3000/api/member/books/return",
                    { book_id: bookId, borrowed_id : borrowedID },
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );
        
                toast.success(response.data.message, { position: "top-right" });
                fetchBorrowedBooks(); // Refresh the table after returning the book
            } catch (error) {
                console.error("Error returning book:", error);
                toast.error("Failed to return book", { position: "top-right" });
            }
        };

        const fetchBorrowedHistory = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get("http://localhost:3000/api/member/books/history", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setBorrowedHistory(response.data.data || []);
            } catch (error) {
                console.error("Error fetching borrowing history:", error);
            }
        };


        const openAddBookModal = () => {
            setShowAddBookModal(true);
        };

        const toggleMenu = (bookId) => {
            setMenuOpen(menuOpen === bookId ? null : bookId);
        };
        
        const editBook = (book) => {
            console.log("Editing book:", book);
            // Open edit modal
        };
        
        const deleteBook = (bookId) => {
            console.log("Deleting book with ID:", bookId);
            // Call API to delete book
        };

    return (
        <div className="flex h-screen bg-gray-100">
            <ToastContainer />
            {/* Sidebar */}
            <div className="fixed left-0 top-0 h-screen w-64 bg-white shadow-md">
                <div className="h-20"></div> {/* Empty space for alignment */}
                <div className="mt-6 mb-6 flex justify-center w-full">
                    <img src="/logo.jpg" alt="Library Logo" className="w-32 h-32 object-contain" />
                </div>

                <nav className="p-5 space-y-4">
                    <button
                        className={`block p-3 rounded ${activeTab === "books" ? "bg-purple-100 text-purple-700" : "text-gray-700 hover:bg-purple-100"}`}
                        onClick={() => handleTabChange("books")}
                    >
                        Books
                    </button>
                    <button
                        className={`block p-3 rounded ${activeTab === "borrowed" ? "bg-purple-100 text-purple-700" : "text-gray-700 hover:bg-purple-100"}`}
                        onClick={() => handleTabChange("borrowed")}
                    >
                        Borrowed Books
                    </button>
                    <button
                        className={`block p-3 rounded ${activeTab === "history" ? "bg-purple-100 text-purple-700" : "text-gray-700 hover:bg-purple-100"}`}
                        onClick={() => handleTabChange("history")}
                    >
                        Borrowed History
                    </button>
                </nav>
            </div>

            <div className="flex-1 flex flex-col">
                <header className="fixed top-0 left-0 w-full bg-gradient-to-r from-purple-700 to-purple-400 text-white p-4 shadow-md z-50 flex justify-between items-center h-16">
                    <h1 className="text-xl font-semibold ml-5">Dashboard</h1>
                    <div className="relative mr-5">
                        <button
                            className="flex items-center space-x-2 text-white hover:text-gray-200"
                            onClick={() => setShowLogout(!showLogout)}
                        >
                            <span>{memberName}</span>
                            <FiLogOut size={20} />
                        </button>
                        {showLogout && (
                            <div className="absolute right-0 mt-2 w-32 bg-white shadow-md rounded-md">
                                <button className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100" onClick={handleLogout}>
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                {activeTab === "books" && (
                    <div className="ml-64 flex-1 p-6">
                    <div className="p-6 bg-white shadow-md rounded-lg mx-6 mt-20">
                        <input 
                            type="text" 
                            placeholder="Search books..." 
                            value={searchQuery} 
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                searchBooks(e.target.value);
                            }}
                            className="mb-4 p-2 border border-gray-300 rounded w-full"
                        />

                        <div className="flex items-center gap-4 mt-4 justify-between">
                        {roleId === 20 && (
                            <button 
                            className="px-4 py-2 border border-purple-600 text-purple-600 bg-white rounded-md hover:bg-purple-100 flex items-center justify-center gap-2 w-[140px] h-[44px]" 
                                onClick={() => openAddBookModal()}
                            >
                                <span className="text-lg font-bold">+</span> 
                                <span className="font-medium">Add Books</span>
                            </button>
                        )}

                        <div className="flex gap-4">
                        <div className="relative">
                        <button 
                            className="px-4 py-2 border rounded-md text-gray-700 bg-white"
                            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                        >
                            Categories
                        </button>

                            {showCategoryDropdown && (
                                <div className="absolute left-0 top-full mt-2 w-56 bg-white border rounded-md shadow-lg z-50">
                                    <div className="p-2">
                                    {categories.map(category => (
                                        <label key={category} className="flex items-center">
                                            <input 
                                                type="checkbox"
                                                checked={selectedCategories.includes(category)}
                                                onChange={() => handleCategoryChange(category)}
                                                className="mr-2"
                                            />
                                            {category}
                                        </label>
                                    ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="relative">
                            <button 
                                className="px-4 py-2 border rounded-md text-gray-700 bg-white"
                                onClick={() => setShowAuthorDropdown(!showAuthorDropdown)}
                            >
                                Authors
                            </button>

                            {showAuthorDropdown && (
                                <div className="absolute left-0 top-full mt-2 w-56 bg-white border rounded-md shadow-lg z-50">
                                    <div className="p-2">
                                        {authors.map(author => (
                                            <label key={author} className="flex items-center">
                                                <input 
                                                    type="checkbox"
                                                    checked={selectedAuthors.includes(author)}
                                                    onChange={() => handleAuthorChange(author)}
                                                    className="mr-2"
                                                />
                                                {author}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                    </div>
                    </div>

                    </div>
                    
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {books.length > 0 ? (
                                books.map((book) => (
                                    <div 
                                    key={book.id} 
                                    onClick={() => openBookDetails(book)}
                                    className="bg-white p-4 rounded-lg shadow-md flex flex-col justify-between h-full  
        transform transition-transform duration-200 hover:scale-105 hover:shadow-lg cursor-pointer"
                                    >
                                    {/* Admin Three Dots Menu */}

                                    {roleId === 20 && (
                                        <div className="absolute top-2 right-2">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleMenu(book.id);
                                                }} 
                                                className="text-gray-700 hover:text-gray-900 text-2xl p-1 rounded-full focus:outline-none"
                                            >
                                                <BsThreeDotsVertical />
                                            </button>
                                            {menuOpen === book.id && (
                                                <div className="absolute right-0 mt-2 w-32 bg-white border rounded-md shadow-md z-50">
                                                    <button 
                                                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            editBook(book);
                                                        }}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button 
                                                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteBook(book.id);
                                                        }}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <img 
                                        src={book.cover_image}
                                        alt={book.title} 
                                        crossOrigin="anonymous"
                                        className="w-full h-48 object-contain rounded-t-lg"  
                                        onError={(e) => { 
                                            e.target.src = "/default-book-cover.jpg"; 
                                        }}
                                    />
                                    <div className="p-4 flex flex-col flex-grow">
                                    <h2 className="font-bold text-lg">{book.title}</h2>
                                    <p className="text-gray-700">Author: {book.author}</p>
                                    <p className="text-gray-700">Category: {book.category}</p>

                                    <div className="flex items-center mt-auto">
                                    <button 
                                        className="mt-4 py-2 px-4 rounded-lg w-full bg-purple-500 text-white"
                                        onClick={(e) => {
                                            e.stopPropagation(); 
                                            borrowBook(book.id); 
                                        }}
                                    >
                                        Check Out
                                    </button>
                                    </div>
                                    </div>
                                </div>
                                ))
                            ) : (
                                <div className="text-center text-gray-500 col-span-full">
                                No books available
                                </div>
                            )}
                        </div>
                        <div className="flex justify-center items-center space-x-2 mt-6">
                        <button
                            className={`px-4 py-2 border rounded-md ${
                                currentPage === 1 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-white text-gray-700 hover:bg-gray-200"
                            }`}
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            &lt;
                        </button>
                        {[...Array(totalPages)].map((_, index) => (
                            <button
                                key={index + 1}
                                className={`px-4 py-2 border rounded-md ${
                                    currentPage === index + 1 ? "bg-purple-500 text-white font-bold" : "bg-white text-gray-700 hover:bg-gray-200"
                                }`}
                                onClick={() => setCurrentPage(index + 1)}
                            >
                                {index + 1}
                            </button>
                        ))}

                        <button
                            className={`px-4 py-2 border rounded-md ${
                                currentPage === totalPages ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-white text-gray-700 hover:bg-gray-200"
                            }`}
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            &gt;
                        </button>

                    </div>
                    </div>
                    </div>
                )}
                {activeTab === "borrowed" && (
                <div className="ml-64 flex-1 p-6">
                        <div className="p-6 bg-white shadow-md rounded-lg mx-6 mt-20">
                        <h2 className="text-1.5xl font-semibold mb-4">Borrowed Books</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full bg-white border border-gray-200 shadow-md rounded-lg">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="px-4 py-2 border text-sm text-center">Title</th>
                                        <th className="px-4 py-2 border text-sm text-center">Author</th>
                                        <th className="px-4 py-2 border text-sm text-center">Due Date</th>
                                        <th className="px-4 py-2 border text-sm text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {borrowedBookList.length > 0 ? (
                                        borrowedBookList.map((book) => (
                                            <tr key={book.book_id} className="text-center">
                                                <td className="px-4 py-2 border">{book.title}</td>
                                                <td className="px-4 py-2 border">{book.author}</td>
                                                <td className="px-4 py-2 border">{new Date(book.due_date).toLocaleDateString()}</td>
                                                <td className="px-4 py-2 border">
                                                    <button 
                                                        className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-700"
                                                        onClick={() => returnBook(book.book_id,book.borrowed_id)}
                                                    >
                                                        Return
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="text-center text-gray-500 py-4">
                                                No borrowed books found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                )}
                {activeTab === "history" && (
                    <div className="ml-64 flex-1 p-6">
                        <div className="p-6 bg-white shadow-md rounded-lg mx-6 mt-20">
                        <h2 className="text-1.5xl font-semibold mb-4">Borrowed History</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full bg-white border border-gray-200 shadow-md rounded-lg">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="px-4 py-2 border text-sm text-center">Title</th>
                                        <th className="px-4 py-2 border text-sm text-center">Borrowed Date</th>
                                        <th className="px-4 py-2 border text-sm text-center">Due Date</th>
                                        <th className="px-4 py-2 border text-sm text-center">Returned Date</th>
                                        <th className="px-4 py-2 border text-sm text-center">Fine</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {borrowedHistory.length > 0 ? (
                                        borrowedHistory.map((book) => (
                                            <tr key={book.book_id} className="text-center">
                                                <td className="px-4 py-2 border">{book.title}</td>
                                                <td className="px-4 py-2 border">{new Date(book.borrowed_date).toLocaleDateString()}</td>
                                                <td className="px-4 py-2 border">{new Date(book.due_date).toLocaleDateString()}</td>
                                                <td className="px-4 py-2 border">
                                                    {book.returned_date ? new Date(book.returned_date).toLocaleDateString() : "Not Returned"}
                                                </td>
                                                <td className="px-4 py-2 border">{book.fine}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="text-center text-gray-500 py-4">
                                                No borrowing history found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        </div>
                    </div>
                )}
            </div>
                {showModal && selectedBook && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
                    <div className="bg-white p-8 rounded-lg shadow-xl max-w-3xl w-full relative flex">
                        
                        <button 
                            className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-lg"
                            onClick={closeBookDetails}
                        >
                            ❌
                        </button>

                        <div className="w-1/3">
                            <img 
                                src={selectedBook.cover_image} 
                                className="w-full h-auto rounded-lg shadow-md object-cover"
                            />
                        </div>

                        {/* Right - Book Details */}
                        <div className="w-2/3 pl-6 flex flex-col justify-start items-start self-start">
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedBook.title}</h2>
                            <p className="text-gray-600"><strong>ISBN:</strong> {selectedBook.isbn}</p>
                            <p className="text-gray-600"><strong>Author:</strong> {selectedBook.author}</p>
                            <p className="text-gray-600"><strong>Category:</strong> {selectedBook.category}</p>
                            <p className="text-gray-400 mt-4">{selectedBook.description}</p>

                            {/* ⭐ Rating Section */}
                            <div className="flex flex-col mt-4">
                            <div className="flex items-center mt-4">
                            <strong className="mr-2 text-gray-700">Ratings:</strong>
                            {[...Array(5)].map((_, index) => (
                                <span 
                                    key={index} 
                                    className={`text-lg ${index < selectedBook.userRating ? 'text-yellow-500' : 'text-gray-400'} 
                                    ${selectedBook.userRating !== -1 ? 'cursor-default' : 'cursor-pointer'}`}
                                    onClick={() => {
                                        if (selectedBook.userRating === -1) {
                                            submitRating(index + 1);
                                        }
                                    }} 
                                >
                                    ★
                                </span>
                            ))}
                            </div>

                            {selectedBook.userRating !== -1 && (
                                <p className="text-gray-700 mt-2 font-semibold">You have rated this book</p>
                            )}
                        </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MemberDashboard;