import React, { useContext, useState } from 'react';
import { formatDate } from '../../../services/formatDate';
import { FaUserCircle, FaCalendarAlt, FaImage, FaTimes } from 'react-icons/fa';
import { ThemeContext } from '../../../provider/themeContext';

const QuestionBar = ({ expandedQuestion, answers }) => {
    const [fullScreenImage, setFullScreenImage] = useState(null);
    const { darkTheme } = useContext(ThemeContext);

    const handleImageClick = (imageUrl) => {
        setFullScreenImage(imageUrl);
    };

    const handleCloseFullScreen = () => {
        setFullScreenImage(null);
    };

    const questionTextStyle = `font-semibold text-xl mb-2 ${darkTheme ? 'text-gray-300' : 'text-gray-800'}`;
    const metaTextStyle = `flex items-center text-sm mb-1 ${darkTheme ? 'text-gray-400' : 'text-gray-600'}`;
    const answersHeadingStyle = `text-xl font-semibold mb-3 ${darkTheme ? 'text-gray-300' : 'text-gray-800'}`;
    const answerContainerStyle = `p-4 rounded-md shadow-sm ${darkTheme ? 'bg-gray-800' : 'bg-gray-50'}`;
    const answerMetaTextStyle = `flex items-center text-sm mb-2 ${darkTheme ? 'text-gray-400' : 'text-gray-700'}`;
    const answerTextStyle = `mt-2 ${darkTheme ? 'text-gray-300' : 'text-gray-800'}`;
    const noAnswersTextStyle = `text-gray-600 ${darkTheme ? 'text-richblack-50' : ''}`;
    const fullScreenOverlayStyle = `fixed w-full h-full top-0 left-0 bg-black bg-opacity-80 flex justify-center items-center z-50 cursor-pointer`;
    const closeButtonStyle = `absolute top-4 right-4 text-gray-300 hover:text-white focus:outline-none`;
    const separatorStyle = `mb-4 ${darkTheme ? 'border-gray-700' : 'border-gray-300'}`;
    const imageContainerStyle = `relative w-1/4 rounded-md overflow-hidden shadow-md cursor-pointer`;
    const imageOverlayStyle = `absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300`;

    return (
        <div className="p-6">
            {/* Question Section */}
            <div className="mb-6 border-b pb-4 ">
                <h3 className={questionTextStyle}>
                    {expandedQuestion?.text}
                </h3>
                <div className={metaTextStyle}>
                    <FaUserCircle className="mr-2" />
                    <span>{expandedQuestion?.askedBy?.firstName}</span>
                </div>
                <div className={metaTextStyle}>
                    <FaCalendarAlt className="mr-2" />
                    <span>{formatDate(expandedQuestion?.createdAt)}</span>
                </div>
                {expandedQuestion?.imageUrl && (
                    <div className="mt-4">
                        <div className={imageContainerStyle} onClick={() => handleImageClick(expandedQuestion.imageUrl)}>
                            <img
                                src={expandedQuestion.imageUrl}
                                alt="Question Image"
                                className="w-full h-auto object-cover aspect-square"
                            />
                            <div className={imageOverlayStyle}>
                                <FaImage className="text-white text-xl" />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Answers Section */}
            <div>
                <h2 className={answersHeadingStyle}>Answers</h2>
                <hr className={separatorStyle} />
                {answers && answers.length > 0 ? (
                    <div className="space-y-6">
                        {answers.map((answer, index) => (
                            <div key={index} className={answerContainerStyle}>
                                <div className={answerMetaTextStyle}>
                                    <FaUserCircle className="mr-2" />
                                    <span>Answered By {answer?.userDetails?.firstName}</span>
                                    <FaCalendarAlt className="ml-4 mr-2" />
                                    <span>{formatDate(answer?.createdAt)}</span>
                                </div>
                                {answer?.image && (
                                    <div className="mt-2">
                                        <div className={imageContainerStyle} onClick={() => handleImageClick(answer.image)}>
                                            <img
                                                src={answer.image}
                                                alt="Answer Image"
                                                className="w-full h-auto object-cover aspect-square"
                                            />
                                            <div className={imageOverlayStyle}>
                                                <FaImage className="text-white text-xl" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <p className={answerTextStyle}>{answer?.text}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className={noAnswersTextStyle}>No answers yet.</p>
                )}
            </div>

            {/* Full-screen Modal for the clicked image */}
            {fullScreenImage && (
                <div
                    className={fullScreenOverlayStyle}
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
                        className={closeButtonStyle}
                    >
                        <FaTimes className="text-3xl" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default QuestionBar;