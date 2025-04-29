import React, { useState, useRef, useEffect, useContext } from "react";
import { FaRobot, FaPaperPlane } from "react-icons/fa";
import { SocketContext } from "../../provider/socketContext";
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ThemeContext } from "../../provider/themeContext";

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [text, setText] = useState('');
    const { socket } = useContext(SocketContext);
    const [isTyping, setIsTyping] = useState(false);
    const [messages, setMessages] = useState([
        { from: "bot", text: "Hello! How can I help you today?" },
    ]);
    const { darkTheme } = useContext(ThemeContext);
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();
    const { token } = useSelector((state) => state.auth);
    const isAuthenticated = token ? true : false;
    const { user } = useSelector((state) => state.profile);
    const userId = user?._id;

    const sendMessage = () => {
        if (!text.trim()) return;
        if (socket && userId) {
            socket.emit("user-message", { userId, data: text });
            setMessages(prev => [...prev, { from: "user", text }]);
            setIsTyping(true);
        }
        setText('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };

    useEffect(() => {
        if (!socket) return;

        const handleBotMessage = (msg) => {
            setIsTyping(false);
            setMessages(prev => [...prev, { from: "bot", text: msg }]);
        };

        socket.on("bot-message", handleBotMessage);

        return () => {
            socket.off("bot-message", handleBotMessage);
        };
    }, [socket]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    return (
        <div className={`fixed bottom-5 right-5 z-50 ${darkTheme ? 'text-white' : 'text-black'}`}>
            {/* Chat Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-3 rounded-full shadow-lg transition-all duration-300 ${darkTheme ? 'bg-blue-700 hover:bg-blue-800' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
            >
                <FaRobot size={24} />
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div
                    className={`mt-3 rounded-lg shadow-lg p-4 flex flex-col transition-all duration-300
                    ${darkTheme ? 'bg-richblack-800 text-white' : 'bg-white text-black'}
                    ${isMaximized ? 'w-[90vw] h-[90vh]' : 'w-80 h-96'}`}
                >
                    {/* Header */}
                    <div className={`flex justify-between items-center mb-2 ${darkTheme ? 'text-white' : 'text-black'}`}>
                        <h2 className="text-lg font-semibold">Ask the Bot</h2>
                        <div className="space-x-2 text-sm">
                            <button
                                onClick={() => setIsMaximized(!isMaximized)}
                                className="hover:scale-110"
                                title={isMaximized ? "Minimize" : "Maximize"}
                            >
                                {isMaximized ? "🗕" : "🗖"}
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="hover:text-red-600"
                                title="Close"
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className={`flex-1 overflow-y-auto space-y-2 border p-2 rounded ${darkTheme ? 'bg-richblack-700' : 'bg-slate-100'}`}>
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`text-sm max-w-[75%] px-3 py-2 rounded-lg whitespace-pre-wrap ${msg.from === 'user'
                                    ? (darkTheme ? 'bg-blue-700 text-white self-end ml-auto' : 'bg-blue-600 text-white self-end ml-auto')
                                    : (darkTheme ? 'bg-richblack-600 text-white self-start' : 'bg-gray-300 text-black self-start')
                                    }`}
                            >
                                <ReactMarkdown
                                    components={{
                                        a: ({ node, ...props }) => (
                                            <a
                                                {...props}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="underline text-blue-700 dark:text-blue-400"
                                            />
                                        )
                                    }}
                                >
                                    {msg.text}
                                </ReactMarkdown>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex space-x-1 px-3 py-2 rounded-lg max-w-[75%] self-start bg-gray-200 dark:bg-richblack-600">
                                <span className="typing-dot w-2 h-2 rounded-full bg-gray-600 dark:bg-white"></span>
                                <span className="typing-dot w-2 h-2 rounded-full bg-gray-600 dark:bg-white"></span>
                                <span className="typing-dot w-2 h-2 rounded-full bg-gray-600 dark:bg-white"></span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Section */}
                    <div className="mt-2 flex items-center">
                        {isAuthenticated ? (
                            <>
                                <input
                                    type="text"
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder="Type your question..."
                                    className={`w-full p-2 border rounded text-sm ${darkTheme ? 'bg-richblack-700 text-white' : 'bg-slate-100 text-black'}`}
                                />
                                <button
                                    onClick={sendMessage}
                                    className={`ml-2 p-2 rounded-full ${darkTheme ? 'bg-blue-700 text-white hover:bg-blue-800' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                                    title="Send Message"
                                >
                                    <FaPaperPlane size={20} />
                                </button>
                            </>
                        ) : (
                            <div className="flex justify-center items-center text-center bg-gray-300 p-2 rounded">
                                <p>Please log in to send a message.</p>
                                <button
                                    onClick={() => navigate("/login")} // Redirect to login/signup page
                                    className={`ml-2 ${darkTheme ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'} px-4 py-2 rounded-full shadow hover:bg-blue-700 transition-all duration-300`}
                                >
                                    Login / Signup
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
