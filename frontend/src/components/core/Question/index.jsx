import React, { useState } from 'react';
import { formatDate } from '../../../services/formatDate';
import { FaUserCircle, FaCalendarAlt, FaImage, FaTimes } from 'react-icons/fa';

const QuestionBar = ({ expandedQuestion, answers }) => {
    const [fullScreenImage, setFullScreenImage] = useState(null);

    const handleImageClick = (imageUrl) => {
        setFullScreenImage(imageUrl);
    };

    const handleCloseFullScreen = () => {
        setFullScreenImage(null);
    };

    return (
        <div className="p-6">
            {/* Question Section */}
            <div className="mb-6 border-b pb-4">
                <h3 className="font-semibold text-xl text-gray-800 mb-2">
                    {expandedQuestion?.text}
                </h3>
                <div className="flex items-center text-gray-600 text-sm mb-1">
                    <FaUserCircle className="mr-2" />
                    <span>{expandedQuestion?.askedBy?.firstName}</span>
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                    <FaCalendarAlt className="mr-2" />
                    <span>{formatDate(expandedQuestion?.createdAt)}</span>
                </div>
                {expandedQuestion?.imageUrl && (
                    <div className="mt-4">
                        <div className="relative w-1/4 rounded-md overflow-hidden shadow-md cursor-pointer" onClick={() => handleImageClick(expandedQuestion.imageUrl)}>
                            <img
                                src={expandedQuestion.imageUrl}
                                alt="Question Image"
                                className="w-full h-auto object-cover aspect-square"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                                <FaImage className="text-white text-xl" />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Answers Section */}
            <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">Answers</h2>
                <hr className="mb-4 border-gray-300" />
                {answers && answers.length > 0 ? (
                    <div className="space-y-6">
                        {answers.map((answer, index) => (
                            <div key={index} className="p-4 bg-gray-50 rounded-md shadow-sm">
                                <div className="flex items-center text-gray-700 text-sm mb-2">
                                    <FaUserCircle className="mr-2" />
                                    <span>Answered By {answer?.userDetails?.firstName}</span>
                                    <FaCalendarAlt className="ml-4 mr-2" />
                                    <span>{formatDate(answer?.createdAt)}</span>
                                </div>
                                {answer?.image && (
                                    <div className="mt-2">
                                        <div className="relative w-1/3 rounded-md overflow-hidden shadow-md cursor-pointer" onClick={() => handleImageClick(answer.image)}>
                                            <img
                                                src={answer.image}
                                                alt="Answer Image"
                                                className="w-full h-auto object-cover aspect-square"
                                            />
                                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                                                <FaImage className="text-white text-xl" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <p className="mt-2 text-gray-800">{answer?.text}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-600">No answers yet.</p>
                )}
            </div>

            {/* Full-screen Modal for the clicked image */}
            {fullScreenImage && (
                <div
                    className="fixed w-full h-full top-0 left-0 bg-black bg-opacity-80 flex justify-center items-center z-50 cursor-pointer"
                    onClick={handleCloseFullScreen}
                >
                    <img
                        src={fullScreenImage}
                        alt="Full Screen Image"
                        className="max-w-full max-h-full object-contain"
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the image
                    />
                    <button
                        onClick={handleCloseFullScreen}
                        className="absolute top-4 right-4 text-gray-300 hover:text-white focus:outline-none"
                    >
                        <FaTimes className="text-3xl" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default QuestionBar;