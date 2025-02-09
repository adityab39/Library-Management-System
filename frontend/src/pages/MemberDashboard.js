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
          const response = await axios.get(apiUrl);
          setBooks(response.data.books || []);
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
                <table className="w-full border-collapse border border-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                    <th className="border p-3 text-left">Book Title</th>
                    <th className="border p-3 text-left">Author</th>
                    <th className="border p-3 text-left">Category</th>
                    <th className="border p-3 text-left">Availability</th>
                    </tr>
                </thead>
                <tbody>
                    {books.length > 0 ? (
                    books.map((book) => (
                        <tr key={book.id}>
                        <td className="border p-3">{book.title}</td>
                        <td className="border p-3">{book.author}</td>
                        <td className="border p-3">{book.category}</td>
                        <td className={`border p-3 ${book.available ? "text-green-500" : "text-red-500"}`}>
                            {book.available ? "Available" : "Not Available"}
                        </td>
                        </tr>
                    ))
                    ) : (
                    <tr>
                        <td colSpan="4" className="text-center border p-4 text-gray-500">
                        No books available
                        </td>
                    </tr>
                    )}
                </tbody>
                </table>
            </div>
            )}
        </div>
        </div>
    );
}

export default MemberDashboard;