import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { formatDate } from "../services/formatDate";
import QuestionBar from "../components/core/Question";
import AnswerInput from "../components/core/Question/AnswerInput";
import { ThemeContext } from "../provider/themeContext";
import { IoCloseSharp } from "react-icons/io5";
import { FaPaperclip, FaTimes } from "react-icons/fa";
import { Oval } from "react-loader-spinner";

const AskQuestion = () => {
    const [text, setText] = useState("");
    const BASE_URL = import.meta.env.VITE_BASE_URL;
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [similarQuestions, setSimilarQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [questions, setQuestions] = useState({ all: [], user: [] });
    const [activeTab, setActiveTab] = useState('all');
    const [allQuestionFilter, setAllQuestionFilter] = useState('all'); // 'all', 'unsolved', 'solved'
    const [expandedQuestion, setExpandedQuestion] = useState(null);
    const { courseId } = useParams();
    const { token } = useSelector((state) => state.auth);
    const { email } = useSelector((state) => state.profile.user);
    const [answers, setAnswers] = useState([]);
    const { darkTheme } = useContext(ThemeContext);

    useEffect(() => {
        async function fetchAllQuestions() {
            try {
                const res = await axios.post(
                    `${BASE_URL}/questions/fetchQuestions`,
                    { courseId },
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const allQuestions = res.data.questions;
                const userQuestions = allQuestions.filter(q => q.askedBy?.email === email);
                setQuestions({ all: allQuestions, user: userQuestions });
            } catch (error) {
                console.error("Error fetching questions:", error);
                setMessage("No Question available");
            }
        }
        fetchAllQuestions();
    }, [courseId, token, email, BASE_URL]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        setSimilarQuestions([]);

        const formData = new FormData();
        formData.append("text", text);
        formData.append("courseId", courseId);
        if (image) formData.append("question", image);

        try {
            const res = await axios.post(`${BASE_URL}/questions/askQuestion`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.data.similarQuestions?.length > 0) {
                setSimilarQuestions(res.data.similarQuestions);
            } else {
                setText("");
                setImage(null);
                setPreview(null);
            }
        } catch (err) {
            console.error("Error asking question:", err);
            setMessage("Error asking question.");
        } finally {
            setLoading(false);
        }
    };

    const confirmAskQuestion = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("text", text);
            formData.append("courseId", courseId);
            if (image) formData.append("question", image);

            await axios.post(`${BASE_URL}/questions/askQuestionAgain`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });
            setSimilarQuestions([]);
            setText("");
            setImage(null);
            setPreview(null);
            setMessage("Question asked successfully!");
            async function fetchAllQuestions() {
                try {
                    const res = await axios.post(
                        `${BASE_URL}/questions/fetchQuestions`,
                        { courseId },
                        {
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );
                    const allQuestions = res.data.questions;
                    const userQuestions = allQuestions.filter(q => q.askedBy?.email === email);
                    setQuestions({ all: allQuestions, user: userQuestions });
                } catch (error) {
                    console.error("Error fetching questions:", error);
                    setMessage("Failed to fetch questions.");
                }
            }
            fetchAllQuestions();
        } catch (err) {
            console.error("Error asking question again:", err);
            setMessage("Error asking question.");
        } finally {
            setLoading(false);
        }
    };

    const handleQuestionClick = (question) => {
        setExpandedQuestion(question);
        setAnswers(question?.answeredBy || []);
    };

    const closeExpandedView = () => {
        setExpandedQuestion(null);
    };

    const filterAllQuestions = () => {
        let filteredQuestions = [...questions.all];

        if (allQuestionFilter === 'unsolved') {
            filteredQuestions = filteredQuestions.filter(q => q.answeredBy.length === 0);
        } else if (allQuestionFilter === 'solved') {
            filteredQuestions = filteredQuestions.filter(q => q.answeredBy.length > 0);
        }

        return filteredQuestions;
    };

    return (
        <div className="max-w-screen-md mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
            <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">Ask a Question</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <textarea
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                    placeholder="Type your question here..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={4}
                    required
                ></textarea>

                <div className="flex items-center gap-3">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="upload"
                    />
                    <label
                        htmlFor="upload"
                        className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        <FaPaperclip className="mr-2" />
                        Upload Image
                    </label>
                    {preview && (
                        <div className="relative">
                            <img src={preview} alt="Preview" className="w-20 h-20 rounded-md object-cover" />
                            <button
                                type="button"
                                onClick={() => { setImage(null); setPreview(null); }}
                                className="absolute top-0 right-0 -mt-1 -mr-1 bg-gray-300 text-gray-700 rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                            >
                                <FaTimes size={10} />
                            </button>
                        </div>
                    )}
                </div>

                {
                    similarQuestions.length === 0 &&
                    <button
                        type="submit"
                        className={`w-full py-2.5 rounded-md font-semibold ${darkTheme ? "text-white" : "text-black"} ${loading ? "bg-green-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors"
                            }`}
                        disabled={loading}
                    >
                        {loading ? (
                            <div className="flex justify-center items-center">
                                <Oval color="#fff" height={20} width={20} ariaLabel="loading-indicator" />
                                <span className="ml-2">Processing...</span>
                            </div>
                        ) : (
                            "Submit Question"
                        )}
                    </button>
                }
            </form>

            {similarQuestions.length > 0 && (
                <div className="mt-6 p-4 border border-gray-200 rounded-md bg-gray-50">
                    <h3 className="font-semibold text-lg text-gray-700 mb-3">Similar Questions Found:</h3>
                    <ul className="list-disc pl-5 text-blue-600">
                        {similarQuestions.map((q, index) => (
                            <li key={index} className="cursor-pointer hover:underline" onClick={() => handleQuestionClick(q.questionDetails)}>
                                {q.text}
                            </li>
                        ))}
                    </ul>
                    <button
                        onClick={confirmAskQuestion}
                        className={`mt-4 w-full py-2 rounded-md font-semibold text-gray-800 ${loading ? "bg-yellow-300 cursor-not-allowed" : "bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-300 transition-colors"
                            }`}
                        disabled={loading}
                    >
                        {loading ? "Submitting..." : "Ask Anyway"}
                    </button>
                </div>
            )}

            <div className="mt-8 flex justify-start gap-2 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('all')}
                    className={`px-4 py-2 rounded-t-md font-medium ${activeTab === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    All Questions
                </button>
                <button
                    onClick={() => setActiveTab('user')}
                    className={`px-4 py-2 rounded-t-md font-medium ${activeTab === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    Your Questions
                </button>
            </div>

            <div className="mt-4">
                {activeTab === 'all' && (
                    <div className="p-4 bg-gray-50 rounded-md">
                        <div className="flex justify-start gap-2 mb-4">
                            <button
                                onClick={() => setAllQuestionFilter('all')}
                                className={`px-4 py-2 rounded-md font-medium ${allQuestionFilter === 'all' ? 'bg-caribbeangreen-100 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setAllQuestionFilter('unsolved')}
                                className={`px-4 py-2 rounded-md font-medium ${allQuestionFilter === 'unsolved' ? 'bg-caribbeangreen-100 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                            >
                                Unsolved
                            </button>
                            <button
                                onClick={() => setAllQuestionFilter('solved')}
                                className={`px-4 py-2 rounded-md font-medium ${allQuestionFilter === 'solved' ? 'bg-caribbeangreen-100 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                            >
                                Solved
                            </button>
                        </div>

                        <h3 className="font-semibold text-lg text-gray-700 mb-3">All Questions:</h3>
                        <ul className="list-none pl-0">
                            {filterAllQuestions().map((q, index) => (
                                <li
                                    key={index}
                                    className="py-3 px-4 mb-2 rounded-md bg-white shadow-sm cursor-pointer hover:bg-gray-100 transition-colors flex items-center justify-between"
                                    onClick={() => handleQuestionClick(q)}
                                >
                                    <div className="flex items-center">
                                        {q.imageUrl && (
                                            <img
                                                src={q.imageUrl}
                                                alt="Question Image"
                                                className="w-16 h-16 rounded-md object-cover mr-3"
                                            />
                                        )}
                                        <p className="font-medium text-gray-800">{q.text}</p>
                                    </div>
                                    <div className="text-gray-500 text-sm">
                                        <div>Asked By: {q.askedBy?.firstName}</div>
                                        <div>{formatDate(q.createdAt)}</div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {activeTab === 'user' && (
                    <div className="p-4 bg-gray-50 rounded-md">
                        <h3 className="font-semibold text-lg text-gray-700 mb-3">Your Questions:</h3>
                        <ul className="list-none pl-0">
                            {questions.user?.map((q, index) => (
                                <li
                                    key={index}
                                    className="py-3 px-4 mb-2 rounded-md bg-white shadow-sm cursor-pointer hover:bg-gray-100 transition-colors flex items-center justify-between"
                                    onClick={() => handleQuestionClick(q)}
                                >
                                    <div className="flex items-center">
                                        {q.imageUrl && (
                                            <img
                                                src={q.imageUrl}
                                                alt="Question Image"
                                                className="w-16 h-16 rounded-md object-cover mr-3"
                                            />
                                        )}
                                        <p className="font-medium text-gray-800">{q.text}</p>
                                    </div>
                                    <div className="text-gray-500 text-sm">
                                        <div>Asked By: {q.askedBy?.firstName}</div>
                                        <div>{formatDate(q.createdAt)}</div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {expandedQuestion && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center backdrop-blur-sm z-50">
                    <div className={`relative rounded-lg w-[80vw] max-h-[90vh] overflow-y-auto ${darkTheme ? "bg-gray-800 text-white" : "bg-white text-gray-800"} shadow-lg`}>
                        <button
                            onClick={closeExpandedView}
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                        >
                            <IoCloseSharp className="text-2xl" />
                        </button>
                        <div className="p-6">
                            <QuestionBar expandedQuestion={expandedQuestion} answers={answers} />
                        </div>
                        <div className="p-6 border-t border-gray-200">
                            <AnswerInput expandedQuestion={expandedQuestion} setAnswers={setAnswers} />
                        </div>
                    </div>
                </div>
            )}

            {message && (
                <div className="mt-4 p-3 rounded-md text-center">
                    {message.includes("successfully") ? (
                        <p className="text-green-600 font-semibold">{message}</p>
                    ) : (
                        <p className="text-red-600 font-semibold">{message}</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default AskQuestion;