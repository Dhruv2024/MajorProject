import React, { useContext, useEffect, useState } from 'react';
import { FaImage } from "react-icons/fa6";
import { IoSend } from "react-icons/io5";
import { ThemeContext } from '../../../provider/themeContext';
import { SocketContext } from '../../../provider/socketContext';
import { useSelector } from 'react-redux';

const AnswerInput = ({ expandedQuestion, setAnswers }) => {
    const [text, setText] = useState('');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    const { darkTheme } = useContext(ThemeContext);
    const { socket } = useContext(SocketContext);
    const { user } = useSelector((state) => state.profile);

    useEffect(() => {
        if (expandedQuestion?._id) {
            socket.emit("joinAnswerRoom", expandedQuestion._id);
        }
    }, [socket, expandedQuestion?._id]);

    const handleTextChange = (e) => setText(e.target.value);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        } else {
            setImage(null);
            setPreview(null);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!text.trim() && !image) {
            // Optionally, show a message to the user that they need to enter text or an image
            return;
        }
        setLoading(true);

        // const formData = new FormData();
        // formData.append("questionDetails", expandedQuestion._id);
        // if (image) formData.append("image", image);
        // formData.append("text", text);
        // formData.append("userDetails", user._id);
        const data = {
            questionDetails: expandedQuestion._id,
            image: image,
            text: text,
            userDetails: user._id,
        }
        socket.emit("answeredQuestion", data);
    };

    useEffect(() => {
        if (socket) {
            const handleAnswerList = (data) => {
                setAnswers((prevAnswers) => [...prevAnswers, data]);
                setText('');
                setImage(null);
                setPreview(null);
                setLoading(false);
            };

            socket.on('new-answer-list', handleAnswerList);
            return () => socket.off('new-answer-list', handleAnswerList);
        }
    }, [socket, setAnswers]);

    return (
        <div className="bg-white rounded-b-lg shadow-md p-4">
            {loading && (
                <div className="absolute inset-0 bg-gray-200 bg-opacity-75 flex items-center justify-center z-10 rounded-b-lg">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500 border-opacity-75"></div>
                </div>
            )}
            <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
                <textarea
                    id="text"
                    value={text}
                    onChange={handleTextChange}
                    placeholder="Enter your answer here..."
                    rows="3"
                    className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${loading ? 'cursor-not-allowed bg-gray-100' : 'bg-white text-gray-800'}`}
                    disabled={loading}
                />
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <input
                            type="file"
                            id="image"
                            accept="image/*"
                            onChange={handleImageChange}
                            disabled={loading}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <label
                            htmlFor="image"
                            className={`inline-flex items-center justify-center px-3 py-2 rounded-md text-gray-600 border border-gray-300 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${loading ? 'cursor-not-allowed opacity-50' : ''}`}
                        >
                            <FaImage className="mr-2" />
                            <span>Attach Image</span>
                        </label>
                    </div>
                    <button
                        type="submit"
                        disabled={loading || (!text.trim() && !image)}
                        className={`inline-flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors font-semibold ${loading || (!text.trim() && !image) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <IoSend className="mr-2" />
                        <span>Submit Answer</span>
                    </button>
                </div>

                {preview && (
                    <div className="mt-4">
                        <h4 className="text-gray-700 font-semibold mb-2">Image Preview:</h4>
                        <img src={preview} alt="Preview" className="w-full max-h-60 object-contain rounded-md shadow-md" />
                    </div>
                )}
            </form>
        </div>
    );
};

export default AnswerInput;