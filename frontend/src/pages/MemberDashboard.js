import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FiUpload, FiX } from "react-icons/fi";

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
        const menuRef = useRef(null);
        const categoryRef = useRef(null);
        const authorRef = useRef(null);
        const [showEditModal, setShowEditModal] = useState(false);
        const [bookToEdit, setBookToEdit] = useState(null);
        const [members, setMembers] = useState([]);
        const [adminBorrowedBooks, setAdminBorrowedBooks] = useState([]);
        const [currentPageBorBooks, setCurrPage] = useState(1);
        const [ttlPages, setTTlPages] = useState(1);

        const [newBook, setNewBook] = useState({
            title: "",
            author: "",
            category: "",
            description: "",
            totalCopies: "",
            availableCopies: "",
            publicationYear: "",
            isbn: "",
            language: "",
            coverImage: null,
        });

        const handleTabChange = (tab) => {
            setActiveTab(tab);
            localStorage.setItem("activeTab", tab);
            if (tab === "books") {
                fetchBooks(userId);
            } else if (tab === "borrowed") {
                fetchBorrowedBooks();
            }else if (tab === "history") {
                fetchBorrowedHistory();
            }else if (tab === "members") {
                fetchMembers(1);
            }else if (tab === "adminBorrowed") { 
                fetchAllBorrowedBooks(1);
            }
        };

        const handleInputChange = (e) => {
            setNewBook({ ...newBook, [e.target.name]: e.target.value });

        };

        const handleFileChange = (event) => {
            const file = event.target.files[0];
            setNewBook((prevBook) => ({ ...prevBook, coverImage: file }));
        };

        // useEffect(() => {
        //     const handleClickOutside = (event) => {
        //         if (menuRef.current && !menuRef.current.contains(event.target)) {
        //             setMenuOpen(null); // Close menu if clicked outside
        //         }
        //         if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        //             setShowCategoryDropdown(false); // Close category dropdown
        //         }
        //         if (authorRef.current && !authorRef.current.contains(event.target)) {
        //             setShowAuthorDropdown(false); // Close author dropdown
        //         }
        //     };
        
        //     document.addEventListener("mousedown", handleClickOutside);
        //     return () => {
        //         document.removeEventListener("mousedown", handleClickOutside);
        //     };
        // }, []);


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

        useEffect(() => {
            if (activeTab === "members") {
                fetchMembers(1);
            }
        }, [activeTab]);

        useEffect(() => {
            if (activeTab === "adminBorrowed") {
                fetchAllBorrowedBooks(1);
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
            setMenuOpen(null); 
            setShowCategoryDropdown(false); 
            setShowAuthorDropdown(false); 
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
                fetchBorrowedBooks();
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

        const fetchMembers = async (page = 1) => {
            try {
                const token = localStorage.getItem("token");
        
                const response = await axios.get(
                    `http://localhost:3000/api/admin/members?page=${page}&limit=10`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
        
                if (response.status === 200) {
                    if (response.data.data.members.length === 0) {
                        setMembers([]);
                        return;
                    }
                    setMembers(response.data.data.members);
                } else {
                    toast.error(response.data.message || "Failed to load members.");
                }
            } catch (error) {
                console.error("Error fetching members:", error);
                if (
                    error.response &&
                    error.response.data &&
                    error.response.data.message === "No members found."
                ) {
                    setMembers([]);
                    return;
                }
                toast.error("Failed to load members.");
            }
        };


        const openAddBookModal = () => {
            setMenuOpen(null); 
            setShowCategoryDropdown(false);
            setShowAuthorDropdown(false); 
            setShowAddBookModal(true);
        };

        const closeAddBookModal = () => setShowAddBookModal(false);

        const toggleMenu = (bookId) => {
            setMenuOpen(menuOpen === bookId ? null : bookId);
        };
        
        const editBook = (book) => {
            if (!book) {
                console.error("❌ No book passed to edit!");
                return;
            }
        
            console.log("📗 Editing book:", book);  
            setBookToEdit(book);   
            setShowEditModal(true); 
        };
        
        const deleteBook = async (bookId) => {
            const token = localStorage.getItem("token");
        
            if (!window.confirm("Are you sure you want to delete this book?")) {
                return; 
            }
        
            try {
                const response = await axios.post(
                    "http://localhost:3000/api/admin/delete-book",
                    { bookId }, 
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
        
                if (response.status === 200) {
                    toast.success("Book deleted successfully!");
                    fetchBooks(userId);
                } else {
                    toast.error(response.data.message || "Failed to delete book.");
                }
            } catch (error) {
                console.error("Error deleting book:", error);
                toast.error(error.response?.data?.message || "Failed to delete book.");
            }
        };


        const addBook = async () => {
            const token = localStorage.getItem("token");
        
            if (!token) {
                alert("Unauthorized! Please log in again.");
                return;
            }
        
            if (!newBook.title || !newBook.author || !newBook.category || !newBook.publicationYear ||
                !newBook.isbn || !newBook.language || !newBook.totalCopies || !newBook.availableCopies ||
                !newBook.description || !newBook.coverImage) {
                toast.error("All fields, including the cover image, are required!", { position: "top-right" });
                return;
            }
        
            const formData = new FormData();
            formData.append("title", newBook.title);
            formData.append("author", newBook.author);
            formData.append("category", newBook.category);
            formData.append("publication_year", newBook.publicationYear);
            formData.append("isbn", newBook.isbn);
            formData.append("language", newBook.language);
            formData.append("total_copies", newBook.totalCopies);
            formData.append("available_copies", newBook.availableCopies);
            formData.append("description", newBook.description);
            
            if (newBook.coverImage instanceof File) {
                formData.append("cover_image", newBook.coverImage);
            } else {
                toast.error("Please upload a valid image file!", { position: "top-right" });
                return;
            }
        
            console.log("Sending FormData:", formData.get("cover_image"));
        
            try {
                const response = await axios.post("http://localhost:3000/api/admin/add-book", formData, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "multipart/form-data"
                    }
                });
        
                if (response.status === 200) {
                    toast.success("Book added successfully!", { position: "top-right" });
                    setNewBook({
                        title: "",
                        author: "",
                        category: "",
                        description: "",
                        totalCopies: "",
                        availableCopies: "",
                        publicationYear: "",
                        isbn: "",
                        language: "",
                        coverImage: null,
                    });

                    fetchBooks(); 
                    setShowAddBookModal(false); 
                }
            } catch (error) {
                console.error("Error adding book:", error);
                if (error.response) {
                    const { status, data } = error.response;
        
                    if (status === 500) {
                        toast.error("Error adding book", { position: "top-right" });
                    } 
                    else if (status === 400) {
                        toast.error(data.message || "Invalid request", { position: "top-right" });
                    } 
                    else {
                        toast.error("Failed to add book", { position: "top-right" });
                    }
                } else {
                    toast.error("Network error. Please try again.", { position: "top-right" });
                }
            }
        };

        const updateBookDetails = async (updatedBook) => {
            const token = localStorage.getItem("token");
        
            const formData = new FormData();
            formData.append("title", updatedBook.title);
            formData.append("author", updatedBook.author);
            formData.append("category", updatedBook.category);
            formData.append("publication_year", updatedBook.publication_year);
            formData.append("isbn", updatedBook.isbn);
            formData.append("language", updatedBook.language);
            formData.append("total_copies", updatedBook.total_copies);
            formData.append("available_copies", updatedBook.available_copies);
            formData.append("description", updatedBook.description);
        
            if (updatedBook.coverImage instanceof File) {
                formData.append("cover_image", updatedBook.coverImage);
                console.log("📁 New image selected:", updatedBook.coverImage.name);
            } else {
                console.log("🔴 No new image selected. Keeping existing image.");
            }
        
            console.log("📦 Sending FormData:", [...formData.entries()]);
        
            try {
                const response = await axios.put(
                    `http://localhost:3000/api/admin/update-book/${updatedBook.id}`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
                );
        
                if (response.status === 200) {
                    toast.success("Book updated successfully!");
                    fetchBooks(userId);
                    setTimeout(() => {
                        setBooks((prevBooks) =>
                            prevBooks.map((b) =>
                                b.id === updatedBook.id
                                    ? { ...b, cover_image: `${updatedBook.cover_image}?t=${new Date().getTime()}` }
                                    : b
                            )
                        );
                    }, 1500); 
                    
                    setShowEditModal(false); 
                } else {
                    toast.error(response.data.message || "Failed to update book.");
                }
            } catch (error) {
                console.error("❌ Error updating book:", error);
                toast.error(error.response?.data?.message || "Failed to update book.");
            }
        };

        const handleDeleteMember = async (memberId) => {
            if (!window.confirm("Are you sure you want to delete this member?")) return;
          
            try {
              const token = localStorage.getItem("token");
          
              const response = await axios.post(
                "http://localhost:3000/api/admin/delete-member",
                { memberId },
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
          
              if (response.status === 200) {        
                toast.success("Member deleted successfully!");
                fetchMembers(1); 
              } else {
                toast.error(response.data.message || "Failed to delete member.");
              }
            } catch (error) {
              console.error("Error deleting member:", error);
              toast.error("Failed to delete member.");
            }
        };

        const fetchAllBorrowedBooks = async (page = 1) => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(
                    `http://localhost:3000/api/admin/borrowed-books?page=${page}&limit=10`, 
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setTTlPages(response.data.data.totalPages); 
                setCurrPage(page); 
                setAdminBorrowedBooks(response.data.data.borrowedBooks || []);
            } catch (error) {
                console.error("Error fetching all borrowed books:", error);
            }
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
                        My Books
                    </button>

                    {roleId === 20 && (
                    <button
                            className={`block p-3 rounded ${activeTab === "adminBorrowed" ? "bg-purple-100 text-purple-700" : "text-gray-700 hover:bg-purple-100"}`}
                            onClick={() => handleTabChange("adminBorrowed")}
                        >
                            Borrowed Books
                        </button>
                    )}

                    <button
                        className={`block p-3 rounded ${activeTab === "history" ? "bg-purple-100 text-purple-700" : "text-gray-700 hover:bg-purple-100"}`}
                        onClick={() => handleTabChange("history")}
                    >
                        Borrowed History
                    </button>
                    {roleId === 20 && (
                    <button
                        className={`block p-3 rounded ${activeTab === "members" ? "bg-purple-100 text-purple-700" : "text-gray-700 hover:bg-purple-100"}`}
                        onClick={() => handleTabChange("members")}
                    >
                        Members
                    </button>
                    )}
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

                        {showAddBookModal && (
                                    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                                        <div className="bg-white p-6 rounded-lg shadow-lg w-[500px] relative animate-fadeIn">
                                            
                                            {/* Close Button */}
                                            <button 
                                                className="absolute top-3 right-3 text-gray-500 hover:text-red-600"
                                                onClick={closeAddBookModal}
                                            >
                                                <FiX size={24} />
                                            </button>

                                            <h2 className="text-2xl font-semibold mb-4 text-center">📚 Add New Book</h2>

                                            {/* Floating Input Fields */}
                                            <div className="grid grid-cols-2 gap-4">
                                            {/* Title */}
                                            <div>
                                                <input 
                                                    type="text" 
                                                    name="title" 
                                                    value={newBook.title} 
                                                    onChange={handleInputChange}
                                                    className="w-full p-3 border rounded-lg focus:ring focus:ring-purple-300"
                                                    placeholder="Title" 
                                                />
                                            </div>

                                            {/* Author */}
                                            <div>
                                                <input 
                                                    type="text" 
                                                    name="author" 
                                                    value={newBook.author} 
                                                    onChange={handleInputChange}
                                                    className="w-full p-3 border rounded-lg focus:ring focus:ring-purple-300"
                                                    placeholder="Author" 
                                                />
                                            </div>

                                            {/* Category */}
                                            <div className="col-span-2">
                                                <input 
                                                    type="text" 
                                                    name="category" 
                                                    value={newBook.category} 
                                                    onChange={handleInputChange}
                                                    className="w-full p-3 border rounded-lg focus:ring focus:ring-purple-300"
                                                    placeholder="Category" 
                                                />
                                            </div>

                                            {/* Description */}
                                            <div className="col-span-2">
                                                <textarea 
                                                    name="description" 
                                                    value={newBook.description} 
                                                    onChange={handleInputChange}
                                                    className="w-full p-3 border rounded-lg focus:ring focus:ring-purple-300"
                                                    placeholder="Description" 
                                                />
                                            </div>

                                            {/* Total Copies */}
                                            <div>
                                                <input 
                                                    type="number" 
                                                    name="totalCopies" 
                                                    value={newBook.totalCopies} 
                                                    onChange={handleInputChange}
                                                    className="w-full p-3 border rounded-lg focus:ring focus:ring-purple-300"
                                                    placeholder="Total Copies"
                                                    min="0" 
                                                />
                                            </div>

                                            {/* Available Copies */}
                                            <div>
                                                <input 
                                                    type="number" 
                                                    name="availableCopies" 
                                                    value={newBook.availableCopies} 
                                                    onChange={handleInputChange}
                                                    className="w-full p-3 border rounded-lg focus:ring focus:ring-purple-300"
                                                    placeholder="Available Copies"
                                                    min="0"
                                                />
                                            </div>

                                            {/* Publication Year */}
                                            <div>
                                                <input 
                                                    type="number" 
                                                    name="publicationYear" 
                                                    value={newBook.publicationYear} 
                                                    onChange={handleInputChange}
                                                    className="w-full p-3 border rounded-lg focus:ring focus:ring-purple-300"
                                                    placeholder="Publication Year" 
                                                    min="1800"
                                                    max={new Date().getFullYear()}
                                                />
                                            </div>

                                            {/* ISBN */}
                                            <div>
                                                <input 
                                                    type="text" 
                                                    name="isbn" 
                                                    value={newBook.isbn} 
                                                    onChange={handleInputChange}
                                                    className="w-full p-3 border rounded-lg focus:ring focus:ring-purple-300"
                                                    placeholder="ISBN" 
                                                />
                                            </div>

                                            {/* Language */}
                                            <div className="col-span-2">
                                                <input 
                                                    type="text" 
                                                    name="language" 
                                                    value={newBook.language} 
                                                    onChange={handleInputChange}
                                                    className="w-full p-3 border rounded-lg focus:ring focus:ring-purple-300"
                                                    placeholder="Language" 
                                                />
                                            </div>
                                        </div>

                                            {/* File Upload */}
                                            <div className="mb-4">
                                                <label className="block mb-2 text-gray-700">Cover Image</label>
                                                <div className="border-dashed border-2 border-gray-300 p-4 rounded-lg text-center">
                                                    <input type="file" name="coverImage" accept="image/*" onChange={handleFileChange}
                                                        className="hidden" id="fileUpload" />
                                                    <label htmlFor="fileUpload" className="cursor-pointer text-purple-600 flex items-center justify-center">
                                                        <FiUpload size={20} className="mr-2" />
                                                        {newBook.coverImage ? newBook.coverImage.name : "Upload Cover Image"}
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Buttons */}
                                            <div className="flex justify-between mt-4">
                                                <button className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                                                    onClick={closeAddBookModal}>
                                                    Cancel
                                                </button>
                                                <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                                                    onClick={addBook}>
                                                    Add Book
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                        <div className="flex gap-4">
                        <div className="relative" ref={categoryRef} >
                        <button 
                            className="px-4 py-2 border rounded-md text-gray-700 bg-white"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowCategoryDropdown(!showCategoryDropdown);
                                setShowAuthorDropdown(false); 
                                setMenuOpen(null); 
                            }} 
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

                        <div className="relative" ref={authorRef} >
                            <button 
                                className="px-4 py-2 border rounded-md text-gray-700 bg-white"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowAuthorDropdown(!showAuthorDropdown);
                                    setShowCategoryDropdown(false); 
                                    setMenuOpen(null); 
                                }} 
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
                                        <div className="absolute top-2 right-2 menu-container" ref={menuRef}>
                                            {/* Three Dots Button */}
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowCategoryDropdown(false); 
                                                    setShowAuthorDropdown(false);
                                                    setMenuOpen(menuOpen === book.id ? null : book.id);
                                                }} 
                                                className="text-gray-700 hover:text-gray-900 text-2xl p-1 rounded-full focus:outline-none"
                                            >
                                                <BsThreeDotsVertical />
                                            </button>

                                            {/* Dropdown Menu */}
                                            {menuOpen === book.id && (
                                                <div className="absolute right-0 mt-2 w-32 bg-white border rounded-md shadow-md z-50">
                                                    <button 
                                                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setShowCategoryDropdown(false); 
                                                            setShowAuthorDropdown(false);
                                                            editBook(book);
                                                            setMenuOpen(null); 
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
                        <h2 className="text-1.5xl font-semibold mb-4">My Books</h2>
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
                {activeTab === "adminBorrowed" && roleId === 20  && (
                    <div className="ml-64 flex-1 p-6">
                        <div className="p-6 bg-white shadow-md rounded-lg mx-6 mt-20">
                            <h2 className="text-1.5xl font-semibold mb-4">Borrowed Books</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full bg-white border border-gray-200 shadow-md rounded-lg">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="px-4 py-2 border text-sm text-center">Title</th>
                                            <th className="px-4 py-2 border text-sm text-center">Author</th>
                                            <th className="px-4 py-2 border text-sm text-center">Borrower</th>
                                            <th className="px-4 py-2 border text-sm text-center">Due Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {adminBorrowedBooks.length > 0 ? (
                                            adminBorrowedBooks.map((book) => (
                                                <tr key={book.borrowed_id} className="text-center">
                                                    <td className="px-4 py-2 border">{book.title}</td>
                                                    <td className="px-4 py-2 border">{book.author}</td>
                                                    <td className="px-4 py-2 border">{book.member_name}</td>
                                                    <td className="px-4 py-2 border">{new Date(book.due_date).toLocaleDateString()}</td>
                                                    <td className={`px-4 py-2 border font-semibold 
                                                    ${book.status === "Returned" ? "text-green-600" : "text-red-600"}`}>
                                                    {book.status}
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
                             {/* Pagination Controls */}
                            <div className="flex justify-center items-center space-x-2 mt-6">
                                <button
                                    className={`px-4 py-2 border rounded-md ${
                                        currentPageBorBooks === 1 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-white text-gray-700 hover:bg-gray-200"
                                    }`}
                                    onClick={() => fetchAllBorrowedBooks(currentPageBorBooks - 1)}
                                    disabled={currentPageBorBooks === 1}
                                >
                                    &lt; Prev
                                </button>

                                {[...Array(ttlPages)].map((_, index) => (
                                    <button
                                        key={index + 1}
                                        className={`px-4 py-2 border rounded-md ${
                                            currentPageBorBooks === index + 1 ? "bg-purple-500 text-white font-bold" : "bg-white text-gray-700 hover:bg-gray-200"
                                        }`}
                                        onClick={() => fetchAllBorrowedBooks(index + 1)}
                                    >
                                        {index + 1}
                                    </button>
                                ))}

                                <button
                                    className={`px-4 py-2 border rounded-md ${
                                        currentPageBorBooks === ttlPages ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-white text-gray-700 hover:bg-gray-200"
                                    }`}
                                    onClick={() => fetchAllBorrowedBooks(currentPageBorBooks + 1)}
                                    disabled={currentPageBorBooks === ttlPages}
                                >
                                    Next &gt;
                                </button>
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
                {activeTab === "members" && roleId === 20 && (
                    <div className="ml-64 flex-1 p-6">
                        <div className="p-6 bg-white shadow-md rounded-lg mx-6 mt-20">
                        <h2 className="text-1.5xl font-semibold mb-4">Members List</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full bg-white border border-gray-200 shadow-md rounded-lg">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="px-4 py-2 border text-left">Name</th>
                                        <th className="px-4 py-2 border text-left">Email</th>
                                        <th className="px-4 py-2 border text-left">Mobile</th>
                                        <th className="px-4 py-2 border text-left">Role</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {members.length > 0 ? (
                                        members.map((member) => (
                                            <tr key={member.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-2 border">{member.name}</td>
                                                <td className="px-4 py-2 border">{member.email}</td>
                                                <td className="px-4 py-2 border">{member.mobile}</td>
                                                <td className="px-4 py-2 border">{member.role}</td>
                                                <td className="px-4 py-2 border text-center">
                                                <button
                                                className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-700"
                                                onClick={() => handleDeleteMember(member.id)}
                                                >
                                                Delete
                                                </button>
                                            </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="text-center text-gray-500 py-4">No members found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        </div>

                        {/* Pagination */}
                        <div className="flex justify-center items-center space-x-2 mt-6">
                            <button className={`px-4 py-2 border rounded-md ${currentPage === 1 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-white text-gray-700 hover:bg-gray-200"}`} onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
                                &lt; Prev
                            </button>
                            {[...Array(totalPages)].map((_, index) => (
                                <button key={index + 1} className={`px-4 py-2 border rounded-md ${currentPage === index + 1 ? "bg-purple-500 text-white font-bold" : "bg-white text-gray-700 hover:bg-gray-200"}`} onClick={() => setCurrentPage(index + 1)}>
                                    {index + 1}
                                </button>
                            ))}
                            <button className={`px-4 py-2 border rounded-md ${currentPage === totalPages ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-white text-gray-700 hover:bg-gray-200"}`} onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
                                Next &gt;
                            </button>
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
                {showEditModal && bookToEdit && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                        <div className="bg-white p-8 rounded-lg shadow-lg w-[800px] relative flex">
                            
                            {/* Close Button */}
                            <button 
                                className="absolute top-3 right-3 text-gray-500 hover:text-red-600"
                                onClick={() => setShowEditModal(false)}
                            >
                                ❌
                            </button>

                            {/* Left Side - Book Cover Image */}
                            <div className="w-1/3 flex flex-col items-center">
                                <img 
                                    src={bookToEdit.cover_image || "/default-book-cover.jpg"} 
                                    alt="Book Cover"
                                    className="w-full h-auto rounded-lg shadow-md object-cover"
                                />
                                
                                {/* Admins Can Change the Image */}
                            </div>

                            {/* Right Side - Book Details Form */}
                            <div className="w-2/3 pl-6 flex flex-col">
                                <h2 className="text-2xl font-semibold mb-4">✏️ Edit Book Details</h2>

                                <div className="grid grid-cols-2 gap-4">
                                    <input 
                                        type="text" 
                                        name="title" 
                                        value={bookToEdit.title} 
                                        onChange={(e) => setBookToEdit({ ...bookToEdit, title: e.target.value })}
                                        className="w-full p-2 border rounded-lg"
                                        placeholder="Title"
                                    />

                                    <input 
                                        type="text" 
                                        name="author" 
                                        value={bookToEdit.author} 
                                        onChange={(e) => setBookToEdit({ ...bookToEdit, author: e.target.value })}
                                        className="w-full p-2 border rounded-lg"
                                        placeholder="Author"
                                    />

                                    <input 
                                        type="text" 
                                        name="category" 
                                        value={bookToEdit.category} 
                                        onChange={(e) => setBookToEdit({ ...bookToEdit, category: e.target.value })}
                                        className="w-full p-2 border rounded-lg"
                                        placeholder="Category"
                                    />

                                    <input 
                                        type="number" 
                                        name="totalCopies" 
                                        value={bookToEdit.total_copies} 
                                        min="0"
                                        onChange={(e) => setBookToEdit({ ...bookToEdit, total_copies: e.target.value })}
                                        className="w-full p-2 border rounded-lg"
                                        placeholder="Total Copies"
                                    />

                                    <input 
                                        type="number" 
                                        name="availableCopies" 
                                        value={bookToEdit.available_copies} 
                                        min="0"
                                        onChange={(e) => setBookToEdit({ ...bookToEdit, available_copies: e.target.value })}
                                        className="w-full p-2 border rounded-lg"
                                        placeholder="Available Copies"
                                    />

                                    <input 
                                        type="number" 
                                        name="publicationYear" 
                                        value={bookToEdit.publication_year} 
                                        onChange={(e) => setBookToEdit({ ...bookToEdit, publication_year: e.target.value })}
                                        className="w-full p-2 border rounded-lg"
                                        placeholder="Publication Year"
                                    />

                                    <input 
                                        type="text" 
                                        name="isbn" 
                                        value={bookToEdit.isbn} 
                                        onChange={(e) => setBookToEdit({ ...bookToEdit, isbn: e.target.value })}
                                        className="w-full p-2 border rounded-lg"
                                        placeholder="ISBN"
                                    />

                                    <input 
                                        type="text" 
                                        name="language" 
                                        value={bookToEdit.language} 
                                        onChange={(e) => setBookToEdit({ ...bookToEdit, language: e.target.value })}
                                        className="w-full p-2 border rounded-lg"
                                        placeholder="Language"
                                    />
                                    <div className="col-span-2">
                                    <label className="block text-gray-700 mb-2">Update Cover Image:</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            if (e.target.files.length > 0) {
                                                const selectedFile = e.target.files[0];
                                                setBookToEdit((prev) => ({
                                                    ...prev,
                                                    coverImage: selectedFile, 
                                                }));
                                                console.log("📁 File selected:", selectedFile.name);
                                            }
                                        }}
                                        className="w-full p-2 border rounded-lg"
                                    />
                                </div>
                                </div>

                                {/* Buttons */}
                                <div className="mt-6 flex justify-end gap-4">
                                    <button 
                                        className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                                        onClick={() => setShowEditModal(false)}
                                    >
                                        Cancel
                                    </button>

                                    <button 
                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                        onClick={() => updateBookDetails(bookToEdit)}
                                    >
                                        Update
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
            )}
        </div>
    );
}

export default MemberDashboard;