import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import { format } from 'date-fns';
import { MdCheckCircle, MdCancel } from 'react-icons/md';
import { generateQuizResultSummary } from '../../../services/operations/summaryAPI';
import { useSelector } from 'react-redux';

const QuizResultPopup = ({ result, onClose }) => {
    if (!result) return null;
    // console.log(result);
    const correctPercentage = (result.score / result.totalQuestions) * 100;
    const incorrectPercentage = 100 - correctPercentage;
    const [loading, setLoading] = useState(false);
    const [quizSummary, setQuizSummary] = useState('');
    const { token } = useSelector((state) => state.auth);
    // console.log(loading);
    // console.log(quizSummary);
    const topicStats = result.detailedAnswers.reduce((acc, answer) => {
        const topic = answer.topic || 'Unknown';
        acc[topic] = acc[topic] || { correct: 0, total: 0 };
        acc[topic].total += 1;
        if (answer.isCorrect) acc[topic].correct += 1;
        return acc;
    }, {});

    const detailedTopicStats = result.detailedAnswers.reduce((acc, answer) => {
        const topic = answer.topic || 'Unknown';
        acc[topic] = acc[topic] || {
            correct: 0,
            total: 0,
            correctQuestions: [],
            incorrectQuestions: [],
        };
        acc[topic].total += 1;
        if (answer.isCorrect) {
            acc[topic].correct += 1;
            acc[topic].correctQuestions.push(answer.questionText);
        } else {
            acc[topic].incorrectQuestions.push(answer.questionText);
        }
        return acc;
    }, {});

    useEffect(() => {
        async function fetchQuizSummary() {
            setLoading(true);
            if (result.report) {
                console.log("auto generated");

                let summaryResult = result.report;
                if (summaryResult) {
                    // Handle escaped newlines (\r\n and \n)
                    summaryResult = summaryResult.replace(/\\r\\n/g, "\r\n")  // Handle escaped \r\n
                        .replace(/\\n/g, "\n")      // Handle escaped \n
                        .trim();                    // Remove unnecessary leading/trailing whitespace

                    // Replace text wrapped in ** ** with bold HTML tags
                    summaryResult = summaryResult.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

                    // Add line breaks after bold sections so the following text starts on a new line
                    summaryResult = summaryResult.replace(/(\*\*.*?\*\*)/g, "$1<br>");

                    // Ensure that each section (Problem, Solution, Market) starts on a new line
                    summaryResult = summaryResult.replace(/\n/g, "<br>"); // Replace newlines with <br> to ensure proper formatting in HTML
                }
                // console.log(summaryResult);
                setQuizSummary(summaryResult);
                setLoading(false);
            }
            else {
                try {
                    console.log("generating");
                    const summary = await generateQuizResultSummary(detailedTopicStats, token);
                    setQuizSummary(summary);
                } catch (error) {
                    console.error('Error fetching quiz summary:', error);
                    setQuizSummary('<p class="text-red-500">Failed to generate summary.</p>');
                } finally {
                    setLoading(false);
                }
            }
        }

        fetchQuizSummary();
    }, [result]);

    const overallChartData = {
        labels: ['Correct', 'Incorrect'],
        datasets: [
            {
                data: [correctPercentage, incorrectPercentage],
                backgroundColor: ['#4CAF50', '#F44336'],
                hoverBackgroundColor: ['#66BB6A', '#EF5350'],
            },
        ],
    };

    const overallChartOptions = {
        plugins: {
            tooltip: {
                callbacks: {
                    label: (context) =>
                        context.parsed !== null
                            ? `${context.label}: ${context.parsed.toFixed(2)}%`
                            : context.label,
                },
            },
            legend: { position: 'bottom' },
            title: {
                display: true,
                text: 'Overall Quiz Performance',
                font: { size: 18 },
            },
        },
        maintainAspectRatio: false,
    };

    const getTopicChart = (topic, stats) => {
        const correct = stats.correct;
        const incorrect = stats.total - stats.correct;
        const data = {
            labels: ['Correct', 'Incorrect'],
            datasets: [
                {
                    data: [correct, incorrect],
                    backgroundColor: ['#2196F3', '#FF9800'],
                    hoverBackgroundColor: ['#64B5F6', '#FFB74D'],
                },
            ],
        };

        const options = {
            plugins: {
                legend: { position: 'bottom' },
                title: {
                    display: true,
                    text: `Topic: ${topic}`,
                    font: { size: 16 },
                },
            },
            maintainAspectRatio: false,
        };

        return (
            <div
                key={topic}
                className="w-44 h-64 m-4 bg-white rounded-xl shadow-md p-3 transition hover:scale-105 duration-300"
            >
                <Pie data={data} options={options} />
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto px-2">
            <div className="bg-white text-black p-6 rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto relative shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-xl"
                >
                    ✕
                </button>

                <div className="mb-6">
                    <h2 className="text-3xl font-bold text-center text-gray-800">
                        {result.quizTitle} - Quiz Result
                    </h2>
                    <p className="text-center text-gray-500 text-sm mt-1">
                        Submitted at: {format(new Date(result.submittedAt), 'PPP hh:mm a zzzz')}
                    </p>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-around mb-10">
                    <div className="text-center mb-6 md:mb-0">
                        <div className="text-5xl font-bold text-green-600">
                            {result.score} / {result.totalQuestions}
                        </div>
                        <p className="text-gray-600 mt-2 text-lg">Your Score</p>
                    </div>
                    <div className="w-64 h-64 relative">
                        <Pie data={overallChartData} options={overallChartOptions} />
                    </div>
                </div>

                <h3 className="text-2xl font-semibold mb-4 text-gray-800">Performance by Topic</h3>
                <div className="flex flex-wrap justify-center gap-4 mb-10">
                    {Object.entries(topicStats).map(([topic, stats]) => getTopicChart(topic, stats))}
                </div>

                <h3 className="text-2xl font-semibold mb-4 text-gray-800">Detailed Answers</h3>
                <ul className="space-y-6 mb-10">
                    {result.detailedAnswers.map((answer, index) => (
                        <li key={answer.questionId} className="bg-gray-50 p-5 rounded-xl border border-gray-200 shadow-sm">
                            <p className="font-semibold text-lg mb-2 text-gray-900">
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

                                    let optionClass = 'p-3 rounded-md border text-sm flex items-center gap-2';

                                    if (isCorrect) {
                                        optionClass += ' bg-green-50 border-green-400 text-green-700 font-medium';
                                    } else if (isUserSelected && !isCorrect) {
                                        optionClass += ' bg-red-50 border-red-400 text-red-700 font-medium';
                                    } else {
                                        optionClass += ' bg-white border-gray-300 text-gray-700';
                                    }

                                    return (
                                        <div key={opt._id || i} className={optionClass}>
                                            {opt.isImage ? (
                                                <img src={opt.option} alt={`Option ${i + 1}`} className="h-12 w-auto" />
                                            ) : (
                                                <span>{opt.option}</span>
                                            )}
                                            {isCorrect && <MdCheckCircle className="text-green-600" />}
                                            {isUserSelected && !isCorrect && <MdCancel className="text-red-600" />}
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

                <h3 className="text-2xl font-semibold mb-4 text-gray-800">Summary</h3>
                {loading ? (
                    <div className="text-center text-gray-500">Generating summary...</div>
                ) : (
                    <div
                        className="prose prose-sm max-w-full text-gray-700 text-base"
                        dangerouslySetInnerHTML={{ __html: quizSummary }}
                    />
                )}
            </div>
        </div>
    );
};

export default QuizResultPopup;
