import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import axios from "axios";

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

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        localStorage.setItem("activeTab", tab);
    };

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user && user.id) {
            setMemberName(user.name);
            setUserId(user.id);
        }
    }, []);

    useEffect(() => {
        if (userId && activeTab === "books") {
            fetchBooks(userId);
        }
    }, [userId, activeTab]);

    useEffect(() => {
        if (userId && activeTab === "books") {
            fetchBooks(userId);
            fetchCategories(userId);
            fetchAuthors(userId);
        }
    }, [userId, activeTab]);

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


    const fetchBooks = async (userId,categories = selectedCategories, authors = selectedAuthors) => {
        if (!userId) return;
    
        try {
            let apiUrl = `http://localhost:3000/api/member/books?user_id=${userId}`;
    
            if (categories.length > 0) {
                apiUrl += `&category=${categories.join(",")}`;
            }
            if (authors.length > 0) {
                apiUrl += `&author=${authors.join(",")}`;
            }
    
            const response = await axios.get(apiUrl);
            setBooks(response.data.data.books || []);
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
        let updatedCategories = selectedCategories || [];

        if (category === "All") {
            updatedCategories = setSelectedCategories(selectedCategories.length === categories.length ? [] : categories);
        } else {
            updatedCategories = updatedCategories.includes(category)
            ? updatedCategories.filter(c => c !== category) 
            : [...updatedCategories, category];
        }
        setSelectedCategories(updatedCategories);

        fetchBooks(userId, updatedCategories, selectedAuthors || []);
    };
    
    const handleAuthorChange = (author) => {
        setSelectedAuthors((prevSelectedAuthors) => {
            let updatedAuthors;
            
            if (author === "All") {
                updatedAuthors = prevSelectedAuthors.length === authors.length ? [] : [...authors];
            } else {
                updatedAuthors = prevSelectedAuthors.includes(author)
                    ? prevSelectedAuthors.filter(a => a !== author)
                    : [...prevSelectedAuthors, author];
            }
    
            fetchBooks(userId, selectedCategories, updatedAuthors); 
            return updatedAuthors; 
        });
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="flex flex-col w-64 bg-white shadow-md">
                <div className="h-16"></div> {/* Empty space for alignment */}
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
                </nav>
            </div>

            <div className="flex-1 flex flex-col">
                <header className="flex justify-between items-center bg-gradient-to-r from-purple-700 to-purple-400 text-white p-4 shadow w-full absolute left-0 top-0 h-16">
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
                        <div className="flex items-center gap-4 mb-4">
                        <div className="relative">
                        <button 
                            className="px-4 py-2 border rounded-md text-gray-700 bg-white"
                            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                        >
                            Filter by Category
                        </button>

                            {showCategoryDropdown && (
                                <div className="absolute left-0 top-full mt-2 w-56 bg-white border rounded-md shadow-lg z-50">
                                    <div className="p-2">
                                        <label className="flex items-center">
                                            <input 
                                                type="checkbox"
                                                checked={selectedCategories.length === categories.length}
                                                onChange={() => handleCategoryChange("All")}
                                                className="mr-2"
                                            />
                                            All
                                        </label>
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
                                Filter by Author
                            </button>

                            {showAuthorDropdown && (
                                <div className="absolute left-0 top-full mt-2 w-56 bg-white border rounded-md shadow-lg z-50">
                                    <div className="p-2">
                                        <label className="flex items-center">
                                            <input 
                                                type="checkbox"
                                                checked={selectedAuthors.length === authors.length}
                                                onChange={() => handleAuthorChange("All")}
                                                className="mr-2"
                                            />
                                            All
                                        </label>
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
                    
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {books.length > 0 ? (
                                books.map((book) => (
                                    <div 
                                    key={book.id} 
                                      className="bg-white p-4 rounded-lg shadow-md flex flex-col justify-between h-full  
             transform transition-transform duration-200 hover:scale-105 hover:shadow-lg"
                                    >
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
                                        <button className="mt-4 bg-purple-500 text-white py-2 px-4 rounded-lg w-full">
                                        Borrow
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
                    </div>
                )}
            </div>
        </div>
    );
}

export default MemberDashboard;