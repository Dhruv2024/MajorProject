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
            return;
        }
        setLoading(true);

        const data = {
            questionDetails: expandedQuestion._id,
            image: image,
            text: text,
            userDetails: user._id,
        };
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

    const inputBgClass = darkTheme ? 'bg-gray-800 text-gray-300 border-gray-700' : 'bg-white text-gray-800 border-gray-300';
    const inputFocusClass = 'focus:ring-blue-500 focus:border-blue-500';
    const disabledClass = 'cursor-not-allowed opacity-50 bg-gray-100';
    const labelBgClass = darkTheme ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200';
    const buttonBgClass = darkTheme ? 'bg-blue-700 text-white hover:bg-blue-600' : 'bg-blue-500 text-white hover:bg-blue-600';
    const previewTextStyle = darkTheme ? 'text-gray-300' : 'text-gray-700';
    const loadingOverlayClass = `absolute inset-0 ${darkTheme ? 'bg-gray-900 bg-opacity-75' : 'bg-gray-200 bg-opacity-75'} flex items-center justify-center z-10 rounded-b-lg`;
    const containerBgClass = darkTheme ? 'bg-gray-900' : 'bg-white';
    const attachButtonClass = `inline-flex items-center justify-center px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${loading ? 'cursor-not-allowed opacity-50' : ''} ${darkTheme
            ? 'text-gray-300 border-gray-600 bg-gray-700 hover:bg-gray-600'
            : 'text-gray-600 border-gray-300 bg-gray-100 hover:bg-gray-200'
        }`;

    return (
        <div className={`rounded-b-lg shadow-md p-4 ${containerBgClass}`}>
            {loading && (
                <div className={loadingOverlayClass}>
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
                    className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${inputFocusClass} ${inputBgClass} ${loading ? disabledClass : ''}`}
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
                            className={attachButtonClass}
                        >
                            <FaImage className="mr-2" />
                            <span>Attach Image</span>
                        </label>
                    </div>
                    <button
                        type="submit"
                        disabled={loading || (!text.trim() && !image)}
                        className={`inline-flex items-center justify-center px-4 py-2 ${buttonBgClass} text-white rounded-md focus:outline-none focus:ring-2 ${inputFocusClass} transition-colors font-semibold ${loading || (!text.trim() && !image) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <IoSend className="mr-2" />
                        <span>Submit Answer</span>
                    </button>
                </div>

                {preview && (
                    <div className="mt-4">
                        <h4 className={`${previewTextStyle} font-semibold mb-2`}>Image Preview:</h4>
                        <img src={preview} alt="Preview" className="w-full max-h-60 object-contain rounded-md shadow-md" />
                    </div>
                )}
            </form>
        </div>
    );
};

export default AnswerInput;