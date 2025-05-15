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
import { toast } from "react-hot-toast";

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
                toast.success("Question asked successfully!");
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
            toast.success("Question asked successfully!");
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

    const containerClass = `max-w-screen-md mx-auto p-6 rounded-lg mt-10 ${darkTheme ? "bg-gray-900 text-white shadow-md" : "bg-white text-gray-800 shadow-md"}`;
    const headingClass = `text-2xl font-semibold text-center mb-6 ${darkTheme ? "text-gray-300" : "text-gray-800"}`;
    const textareaClass = `w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 ${darkTheme ? "border-gray-700 bg-gray-800 text-white" : "border-gray-300 bg-white text-gray-800"}`;
    const uploadLabelClass = `inline-flex items-center px-4 py-2 rounded-md cursor-pointer hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 ${darkTheme ? "bg-blue-700 text-gray-100" : "bg-blue-500 text-white"}`;
    const previewOverlayClass = `absolute top-0 right-0 -mt-1 -mr-1 rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 ${darkTheme ? "bg-gray-600 text-gray-300" : "bg-gray-300 text-gray-700"}`;
    const submitButtonClass = `w-full py-2.5 rounded-md font-semibold ${darkTheme ? "text-white bg-green-700 hover:bg-green-800 focus:ring-green-900" : "text-black bg-green-500 hover:bg-green-600 focus:ring-green-400"} transition-colors ${loading ? "cursor-not-allowed bg-green-400" : ""}`;
    const similarQuestionsContainerClass = `mt-6 p-4 border rounded-md ${darkTheme ? "border-gray-700 bg-gray-800 text-white" : "border-gray-200 bg-gray-50 text-gray-700"}`;
    const similarQuestionsHeadingClass = `font-semibold text-lg mb-3 ${darkTheme ? "text-gray-300" : "text-gray-700"}`;
    const similarQuestionItemClass = `cursor-pointer hover:underline ${darkTheme ? "text-blue-400" : "text-blue-600"}`;
    const askAnywayButtonClass = `mt-4 w-full py-2 rounded-md font-semibold ${darkTheme ? "text-gray-100 bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-400" : "text-gray-800 bg-yellow-400 hover:bg-yellow-500 focus:ring-yellow-300"} transition-colors ${loading ? "cursor-not-allowed bg-yellow-300" : ""}`;
    const tabButtonActiveClass = `px-4 py-2 rounded-t-md font-medium ${darkTheme ? "bg-blue-700 text-gray-100" : "bg-blue-500 text-white"}`;
    const tabButtonInactiveClass = `px-4 py-2 rounded-t-md font-medium ${darkTheme ? "bg-gray-800 text-gray-400 hover:bg-gray-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`;
    const filterButtonActiveClass = `px-4 py-2 rounded-md font-medium ${darkTheme ? "bg-caribbeangreen-300 text-white" : "bg-caribbeangreen-100 text-white"}`;
    const filterButtonInactiveClass = `px-4 py-2 rounded-md font-medium ${darkTheme ? "bg-gray-700 text-gray-400 hover:bg-gray-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`;
    const allQuestionsContainerClass = `p-4 rounded-md ${darkTheme ? "bg-gray-800" : "bg-gray-50"}`;
    const yourQuestionsContainerClass = `p-4 rounded-md ${darkTheme ? "bg-gray-800" : "bg-gray-50"}`;
    const questionItemClass = `py-3 px-4 mb-2 rounded-md shadow-sm cursor-pointer hover:bg-gray-100 transition-colors flex items-center justify-between ${darkTheme ? "bg-gray-700 text-white hover:bg-gray-600" : "bg-white text-gray-800"}`;
    const questionTextClass = `font-medium ${darkTheme ? "text-gray-300" : "text-gray-800"}`;
    const questionMetaClass = `text-sm ${darkTheme ? "text-gray-400" : "text-gray-500"}`;
    const expandedViewOverlayClass = `fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center backdrop-blur-sm z-50`;
    const expandedViewContainerClass = `relative rounded-lg w-[80vw] max-h-[90vh] overflow-y-auto ${darkTheme ? "bg-gray-800 text-white" : "bg-white text-gray-800"} shadow-lg`;
    const closeButtonClass = `absolute top-2 right-2 text-gray-500 hover:text-gray-700 focus:outline-none`;
    const messageContainerClass = `mt-4 p-3 rounded-md text-center`;
    const successMessageClass = `text-green-600 font-semibold`;
    const errorMessageClass = `text-red-600 font-semibold`;

    return (
        <div className={containerClass}>
            <h2 className={headingClass}>Ask a Question</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <textarea
                    className={textareaClass}
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
                        className={uploadLabelClass}
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
                                className={previewOverlayClass}
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
                        className={submitButtonClass}
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
                <div className={similarQuestionsContainerClass}>
                    <h3 className={similarQuestionsHeadingClass}>Similar Questions Found:</h3>
                    <ul className="list-disc pl-5">
                        {similarQuestions.map((q, index) => (
                            <li key={index} className={similarQuestionItemClass} onClick={() => handleQuestionClick(q.questionDetails)}>
                                {q.text}
                            </li>
                        ))}
                    </ul>
                    <button
                        onClick={confirmAskQuestion}
                        className={askAnywayButtonClass}
                        disabled={loading}
                    >
                        {loading ? "Submitting..." : "Ask Anyway"}
                    </button>
                </div>
            )}

            <div className="mt-8 flex justify-start gap-2 border-b">
                <button
                    onClick={() => setActiveTab('all')}
                    className={activeTab === 'all' ? tabButtonActiveClass : tabButtonInactiveClass}
                >
                    All Questions
                </button>
                <button
                    onClick={() => setActiveTab('user')}
                    className={activeTab === 'user' ? tabButtonActiveClass : tabButtonInactiveClass}
                >
                    Your Questions
                </button>
            </div>

            <div className="mt-4">
                {activeTab === 'all' && (
                    <div className={allQuestionsContainerClass}>
                        <div className="flex justify-start gap-2 mb-4">
                            <button
                                onClick={() => setAllQuestionFilter('all')}
                                className={allQuestionFilter === 'all' ? filterButtonActiveClass : filterButtonInactiveClass}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setAllQuestionFilter('unsolved')}
                                className={allQuestionFilter === 'unsolved' ? filterButtonActiveClass : filterButtonInactiveClass}
                            >
                                Unsolved
                            </button>
                            <button
                                onClick={() => setAllQuestionFilter('solved')}
                                className={allQuestionFilter === 'solved' ? filterButtonActiveClass : filterButtonInactiveClass}
                            >
                                Solved
                            </button>
                        </div>

                        <h3 className={similarQuestionsHeadingClass}>All Questions:</h3>
                        <ul className="list-none pl-0">
                            {filterAllQuestions().map((q, index) => (
                                <li
                                    key={index}
                                    className={questionItemClass}
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
                                        <p className={questionTextClass}>{q.text}</p>
                                    </div>
                                    <div className={questionMetaClass}>
                                        <div>Asked By: {q.askedBy?.firstName}</div>
                                        <div>{formatDate(q.createdAt)}</div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {activeTab === 'user' && (
                    <div className={yourQuestionsContainerClass}>
                        <h3 className={similarQuestionsHeadingClass}>Your Questions:</h3>
                        <ul className="list-none pl-0">
                            {questions.user?.map((q, index) => (
                                <li
                                    key={index}
                                    className={questionItemClass}
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
                                        <p className={questionTextClass}>{q.text}</p>
                                    </div>
                                    <div className={questionMetaClass}>
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
                <div className={expandedViewOverlayClass}>
                    <div className={expandedViewContainerClass}>
                        <button
                            onClick={closeExpandedView}
                            className={closeButtonClass}
                        >
                            <IoCloseSharp className="text-2xl" />
                        </button>
                        <div className="p-6">
                            <QuestionBar expandedQuestion={expandedQuestion} answers={answers} />
                        </div>
                        <div className="p-6 border-t">
                            <AnswerInput expandedQuestion={expandedQuestion} setAnswers={setAnswers} />
                        </div>
                    </div>
                </div>
            )}

            {message && (
                <div className={messageContainerClass}>
                    {message.includes("successfully") ? (
                        <p className={successMessageClass}>{message}</p>
                    ) : (
                        <p className={errorMessageClass}>{message}</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default AskQuestion;