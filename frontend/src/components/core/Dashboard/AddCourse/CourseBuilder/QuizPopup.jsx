import { useState } from "react";

const QuizPopup = ({ data, isOpen, onClose }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    const handleNext = () => {
        if (currentQuestionIndex < data.quiz.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    // Format the start and end time
    const formatTime = (time) => {
        const date = new Date(time);
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    };

    // Get the correct answer option for the current question
    const getCorrectOption = (question) => {
        const correctAnswerIndex = parseInt(question.correctAnswer) - 1;
        return question.options[correctAnswerIndex]?.option;
    };

    // Check if there's an image URL for the question
    const renderImage = (question) => {
        if (question.isImage && question.imageUrl) {
            return <img src={question.imageUrl} alt="Question image" className="w-full h-auto mb-4 rounded-lg" />;
        }
        return null;
    };

    return (
        isOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                <div className="bg-white p-8 rounded-lg w-full max-w-4xl shadow-xl overflow-auto max-h-[90vh]">
                    <h2 className="text-3xl font-bold mb-6">{data.quiz.title}</h2>
                    <div className="text-gray-600 mb-6">
                        <p><strong>Start Time:</strong> {formatTime(data.quiz.startTime)}</p>
                        <p><strong>End Time:</strong> {formatTime(data.quiz.endTime)}</p>
                    </div>

                    <div className="mb-6">
                        <p className="text-xl mb-4" style={{ whiteSpace: 'pre-line' }}>{data.quiz.questions[currentQuestionIndex].question}</p>

                        {/* Render Image if available */}
                        {renderImage(data.quiz.questions[currentQuestionIndex])}
                    </div>

                    {/* Display Options */}
                    <ul className="space-y-4 mb-6">
                        {data.quiz.questions[currentQuestionIndex].options.map((option, index) => {
                            const isChecked = (parseInt(data.quiz.questions[currentQuestionIndex].correctAnswer) - 1) === index;
                            return (
                                <li key={index} className="flex items-center space-x-4">
                                    <input
                                        type="radio"
                                        id={`option${index}`}
                                        name="answer"
                                        className="h-5 w-5"
                                        checked={isChecked}
                                        disabled
                                    />
                                    <label htmlFor={`option${index}`} className="text-lg">{option.option}</label>
                                </li>
                            );
                        })}
                    </ul>

                    {/* Modal Footer with Navigation Buttons */}
                    <div className="flex justify-between items-center mb-6">
                        <button
                            onClick={handlePrevious}
                            disabled={currentQuestionIndex === 0}
                            className="bg-pure-greys-400 text-white px-6 py-3 rounded-md disabled:bg-gray-200 transition duration-300 hover:bg-pure-greys-500"
                        >
                            Previous
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={currentQuestionIndex === data.quiz.questions.length - 1}
                            className="bg-blue-500 text-white px-6 py-3 rounded-md disabled:bg-blue-300 transition duration-300 hover:bg-blue-600"
                        >
                            Next
                        </button>
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="w-full bg-blue-100 text-white py-3 rounded-md hover:bg-blue-400 transition duration-300"
                    >
                        Close
                    </button>
                </div>
            </div>
        )
    );
};

export default QuizPopup;
