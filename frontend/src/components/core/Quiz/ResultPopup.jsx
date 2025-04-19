import React from 'react';
import { Pie } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import { format } from 'date-fns';
import { MdCheckCircle, MdCancel } from 'react-icons/md';

const QuizResultPopup = ({ result, onClose }) => {
    console.log(result);
    if (!result) return null;

    const correctPercentage = (result.score / result.totalQuestions) * 100;
    const incorrectPercentage = 100 - correctPercentage;

    const chartData = {
        labels: ['Correct', 'Incorrect'],
        datasets: [
            {
                data: [correctPercentage, incorrectPercentage],
                backgroundColor: ['#4CAF50', '#F44336'],
                hoverBackgroundColor: ['#66BB6A', '#EF5350'],
            },
        ],
    };

    const chartOptions = {
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (context) {
                        let label = context.label || '';
                        if (context.parsed !== null) {
                            label += `: ${context.parsed.toFixed(2)}%`;
                        }
                        return label;
                    },
                },
            },
            legend: { position: 'bottom' },
            title: {
                display: true,
                text: 'Quiz Performance',
                font: { size: 18 },
            },
        },
        maintainAspectRatio: false,
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto">
            <div className="bg-white text-black p-6 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto relative">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
                >
                    ✕
                </button>

                <h2 className="text-3xl font-bold text-center mb-2">
                    {result.quizTitle} - Quiz Result
                </h2>
                <p className="text-sm text-center text-gray-500 mb-6">
                    Submitted at: {format(new Date(result.submittedAt), 'PPP hh:mm a zzzz')}
                </p>

                <div className="flex flex-col md:flex-row items-center justify-around mb-8">
                    <div className="text-center mb-4 md:mb-0">
                        <div className="text-4xl font-extrabold text-green-600">
                            {result.score} / {result.totalQuestions}
                        </div>
                        <p className="text-gray-600 mt-1">Your Score</p>
                    </div>
                    <div className="w-64 h-64 relative">
                        <Pie data={chartData} options={chartOptions} />
                    </div>
                </div>

                <h3 className="text-2xl font-semibold mb-4">Detailed Answers:</h3>
                <ul className="space-y-6">
                    {result.detailedAnswers.map((answer, index) => (
                        <li key={answer.questionId} className="bg-gray-50 p-5 rounded-xl border">
                            <p className="font-semibold text-lg mb-2">
                                Question {index + 1}: {answer.questionText}
                            </p>

                            {answer.isImage && answer.imageUrl && (
                                <img
                                    src={answer.imageUrl}
                                    alt={`Question ${index + 1}`}
                                    className="max-w-full h-auto rounded-md mb-4"
                                />
                            )}

                            <div className="space-y-2">
                                {answer.options.map((opt, i) => {
                                    const correctIndex = parseInt(answer.correctOption, 10) - 1;
                                    const selectedIndex = parseInt(answer.selectedAnswer, 10) - 1;

                                    const isCorrect = i === correctIndex;
                                    const isUserSelected = i === selectedIndex;

                                    let optionClass = 'p-3 rounded-md border text-sm flex items-center';

                                    if (isCorrect) {
                                        optionClass += ' bg-green-100 border-green-400 text-green-700 font-semibold';
                                    } else if (isUserSelected && !isCorrect) {
                                        optionClass += ' bg-red-100 border-red-400 text-red-700 font-semibold';
                                    } else {
                                        optionClass += ' bg-white border-gray-300 text-gray-700';
                                    }

                                    return (
                                        <div key={opt._id || i} className={optionClass}>
                                            {opt.isImage ? (
                                                <img src={opt.option} alt={`Option ${i + 1}`} className="h-16 w-auto" />
                                            ) : (
                                                <span>{opt.option}</span>
                                            )}
                                            {isCorrect && <MdCheckCircle className="ml-2 text-green-600" />}
                                            {isUserSelected && !isCorrect && <MdCancel className="ml-2 text-red-600" />}
                                        </div>
                                    );
                                })}

                            </div>

                            <div className="mt-2 text-sm italic text-gray-600">
                                {answer.selectedAnswer === null ? (
                                    <span className="text-gray-500">Not Answered</span>
                                ) : parseInt(answer.selectedAnswer, 10) === parseInt(answer.correctOption, 10) ? (
                                    <span className="text-green-600">Correct</span>
                                ) : (
                                    <span className="text-red-600">Incorrect</span>
                                )}
                            </div>

                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default QuizResultPopup;
