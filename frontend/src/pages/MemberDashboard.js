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

    const fetchBooks = async (userId) => {
        if (!userId) return;
    
        try {
            const apiUrl = `http://localhost:3000/api/member/books?user_id=${userId}`;
            const response = await axios.get(apiUrl, {
                headers: {
                    'Cache-Control': 'no-cache'
                }
            });
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
                    <h1 className="text-xl font-semibold ml-5">Library System</h1>
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
                        <h2 className="text-2xl font-semibold mb-4">All Books</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {books.length > 0 ? (
                                books.map((book) => (
                                    <div key={book.id} className="bg-white p-4 rounded-lg shadow-md transition transform hover:scale-105">
                                        <img src={book.coverImage} alt={book.title} className="w-full h-48 object-cover rounded-t-lg" />
                                        <div className="p-4">
                                            <h3 className="font-bold text-lg">{book.title}</h3>
                                            <p className="text-gray-700">Author: {book.author}</p>
                                            <p className="text-gray-700">Category: {book.category}</p>
                                            <button className="mt-4 bg-purple-500 text-white py-2 px-4 rounded-lg w-full">Check Out</button>
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