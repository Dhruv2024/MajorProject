import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { formatDate } from "../services/formatDate";

const AskQuestion = () => {
    const [text, setText] = useState("");
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [similarQuestions, setSimilarQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [questions, setQuestions] = useState([]);
    const [activeTab, setActiveTab] = useState('all');
    const [expandedQuestion, setExpandedQuestion] = useState(null); // To store the clicked question details
    const { courseId } = useParams();
    const { token } = useSelector((state) => state.auth);
    const { email } = useSelector((state) => state.profile.user);

    useEffect(() => {
        async function fetchAllQuestions() {
            const res = await axios.post("http://localhost:8000/api/v1/questions/fetchQuestions", { courseId }, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });
            const allQuestions = res.data.questions;

            const userQuestions = allQuestions.filter(q => q.askedBy.email === email);
            setQuestions({ all: allQuestions, user: userQuestions });
        }
        fetchAllQuestions();
    }, [courseId, token, email]);
    console.log(questions)
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file)); // Show image preview
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
            const res = await axios.post("http://localhost:8000/api/v1/questions/askQuestion", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.data.similarQuestions?.length > 0) {
                setSimilarQuestions(res.data.similarQuestions);
                setMessage("Similar questions found. Do you still want to ask?");
            } else {
                setMessage("Question asked successfully!");
                setText("");
                setImage(null);
                setPreview(null);
            }
        } catch (err) {
            console.error(err);
            setMessage("Error asking question.");
        } finally {
            setLoading(false);
        }
    };

    const confirmAskQuestion = async () => {
        setLoading(true);
        try {
            const res = await axios.post("http://localhost:5000/api/questions/ask", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setMessage("Question asked successfully!");
            setSimilarQuestions([]);
            setText("");
            setImage(null);
            setPreview(null);
        } catch (err) {
            console.error(err);
            setMessage("Error asking question.");
        } finally {
            setLoading(false);
        }
    };

    const handleQuestionClick = (question) => {
        // Set the clicked question as expanded to show its details
        setExpandedQuestion(question);
    };

    const closeExpandedView = () => {
        setExpandedQuestion(null); // Close the expanded view
    };

    return (
        <div className="max-w-screen mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
            <h2 className="text-2xl font-bold text-center mb-4">Ask a Question</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Type your question here..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    required
                ></textarea>

                <div className="flex items-center gap-4">
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="upload" />
                    <label htmlFor="upload" className="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer">
                        Upload Image
                    </label>
                    {preview && <img src={preview} alt="Preview" className="w-16 h-16 rounded-lg object-cover" />}
                </div>

                <button
                    type="submit"
                    className="w-full bg-green-500 text-blue-200 py-2 rounded-lg hover:bg-green-600 transition font-semibold"
                    disabled={loading}
                >
                    {loading ? "Processing..." : "Submit Question"}
                </button>
            </form>

            {similarQuestions.length > 0 && (
                <div className="mt-6 p-4 border border-gray-300 rounded-lg">
                    <h3 className="font-semibold mb-2">Similar Questions Found:</h3>
                    <ul className="list-disc pl-5">
                        {similarQuestions.map((q, index) => (
                            <li key={index} className="text-blue-600">{q.text}</li>
                        ))}
                    </ul>
                    <button
                        onClick={confirmAskQuestion}
                        className="mt-3 w-full bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition"
                        disabled={loading}
                    >
                        {loading ? "Submitting..." : "Ask Anyway"}
                    </button>
                </div>
            )}

            <div className="mt-6 flex justify-between">
                <button
                    onClick={() => setActiveTab('all')}
                    className={`px-4 py-2 rounded-lg ${activeTab === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                    All Questions
                </button>
                <button
                    onClick={() => setActiveTab('user')}
                    className={`px-4 py-2 rounded-lg ${activeTab === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                    Your Questions
                </button>
            </div>

            {activeTab === 'all' && (
                <div className="mt-6 p-4 border border-gray-300 rounded-lg">
                    <h3 className="font-semibold mb-2">All Questions:</h3>
                    <ul className="list-none pl-5">
                        {questions.all?.map((q, index) => (
                            <li
                                key={index}
                                className="h-[20vh] text-gray-800 mb-2 cursor-pointer hover:text-blue-600 flex items-center bg-blue-5 justify-between"
                                onClick={() => handleQuestionClick(q)} // Handle click event
                            >
                                <div className="flex items-center pl-3">
                                    {q.imageUrl && (
                                        <img src={q.imageUrl} alt="Question Image" className=" w-28 h-28 rounded-lg object-cover mt-2 mr-3" />
                                    )}
                                    <p className="font-semibold">{q.text}</p>
                                </div>
                                <div className="pr-4 text-richblack-300">
                                    <div>Asked By: {q.askedBy?.firstName}</div>
                                    <div>{formatDate(q.createdAt)}</div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )
            }

            {
                activeTab === 'user' && (
                    <div className="mt-6 p-4 border border-gray-300 rounded-lg">
                        <h3 className="font-semibold mb-2">All Questions:</h3>
                        <ul className="list-none pl-5">
                            {questions.user?.map((q, index) => (
                                <li
                                    key={index}
                                    className="h-[20vh] text-gray-800 mb-2 cursor-pointer hover:text-blue-600 flex items-center bg-blue-5"
                                    onClick={() => handleQuestionClick(q)} // Handle click event
                                >
                                    <div className="flex items-center pl-3">
                                        {q.imageUrl && (
                                            <img src={q.imageUrl} alt="Question Image" className=" w-28 h-28 rounded-lg object-cover mt-2 mr-3" />
                                        )}
                                        <p className="font-semibold">{q.text}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )
            }

            {/* Expanded Question View */}
            {
                expandedQuestion && (
                    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
                        <div className="bg-white p-6 rounded-lg max-w-lg w-full">
                            <button onClick={closeExpandedView} className="text-red-500 font-bold text-lg">X</button>
                            <h3 className="font-semibold text-xl mt-4">{expandedQuestion.text}</h3>
                            {expandedQuestion.imageUrl && (
                                <img src={expandedQuestion.imageUrl} alt="Question Image" className="w-full mt-4 rounded-lg" />
                            )}
                            <p className="mt-4">{expandedQuestion.imageText}</p>
                        </div>
                    </div>
                )
            }

            {message && <p className="mt-4 text-center text-gray-700">{message}</p>}
        </div >
    );
};

export default AskQuestion;
