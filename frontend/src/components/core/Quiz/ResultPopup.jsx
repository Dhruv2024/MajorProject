import React, { useState, useEffect, useContext } from 'react';
import { Pie } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import { format } from 'date-fns';
import { MdCheckCircle, MdCancel } from 'react-icons/md';
import { generateQuizResultSummary } from '../../../services/operations/summaryAPI';
import { useSelector } from 'react-redux';
import { ThemeContext } from '../../../provider/themeContext';

const QuizResultPopup = ({ result, onClose }) => {
    if (!result) return null;
    const { darkTheme } = useContext(ThemeContext);

    const [loading, setLoading] = useState(false);
    const [quizSummary, setQuizSummary] = useState('');
    const { token } = useSelector((state) => state.auth);

    const totalQuestions = result.totalQuestions;
    const correctCount = result.score;
    const unattemptedCount = result.detailedAnswers.filter(ans => !ans.attempted).length;
    const incorrectCount = totalQuestions - correctCount - unattemptedCount;

    const correctPercentage = (correctCount / totalQuestions) * 100;
    const incorrectPercentage = (incorrectCount / totalQuestions) * 100;
    const unattemptedPercentage = (unattemptedCount / totalQuestions) * 100;

    const topicStats = result.detailedAnswers.reduce((acc, answer) => {
        const topic = answer.topic || 'Unknown';
        acc[topic] = acc[topic] || { correct: 0, total: 0, unattempted: 0 };
        acc[topic].total += 1;
        if (!answer.attempted) acc[topic].unattempted += 1;
        else if (answer.isCorrect) acc[topic].correct += 1;
        return acc;
    }, {});

    const detailedTopicStats = result.detailedAnswers.reduce((acc, answer) => {
        const topic = answer.topic || 'Unknown';
        acc[topic] = acc[topic] || {
            correct: 0,
            total: 0,
            unattempted: 0,
            correctQuestions: [],
            incorrectQuestions: [],
            unattemptedQuestions: []
        };
        acc[topic].total += 1;
        if (!answer.attempted) {
            acc[topic].unattempted += 1;
            acc[topic].unattemptedQuestions.push(answer.questionText);
        } else if (answer.isCorrect) {
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
                let summaryResult = result.report;
                summaryResult = summaryResult
                    .replace(/\\r\\n/g, "\r\n")
                    .replace(/\\n/g, "\n")
                    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                    .replace(/(\*\*.*?\*\*)/g, "$1<br>")
                    .replace(/\n/g, "<br>")
                    .trim();
                setQuizSummary(summaryResult);
                setLoading(false);
            } else {
                try {
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
    }, [result, token, detailedTopicStats]);

    const overallChartData = {
        labels: ['Correct', 'Incorrect', 'Unattempted'],
        datasets: [
            {
                data: [correctPercentage, incorrectPercentage, unattemptedPercentage],
                backgroundColor: ['#34D399', '#F87171', '#A5B4FC'],
                hoverBackgroundColor: ['#6EE7B7', '#FCA5A5', '#C7D2FE'],
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
            legend: { position: 'bottom', labels: { color: darkTheme ? '#D1D5DB' : '#4B5563' } },
            title: {
                display: true,
                text: 'Overall Quiz Performance',
                font: { size: 18 },
                color: darkTheme ? '#D1D5DB' : '#4B5563',
            },
        },
        maintainAspectRatio: false,
    };

    const getTopicChart = (topic, stats) => {
        const correct = stats.correct;
        const unattempted = stats.unattempted;
        const incorrect = stats.total - correct - unattempted;

        const data = {
            labels: ['Correct', 'Incorrect', 'Unattempted'],
            datasets: [
                {
                    data: [correct, incorrect, unattempted],
                    backgroundColor: ['#34D399', '#F87171', '#A5B4FC'],
                    hoverBackgroundColor: ['#6EE7B7', '#FCA5A5', '#C7D2FE'],
                },
            ],
        };

        const options = {
            plugins: {
                legend: { position: 'bottom', labels: { color: darkTheme ? '#D1D5DB' : '#4B5563' } },
                title: {
                    display: true,
                    text: `Topic: ${topic}`,
                    font: { size: 16 },
                    color: darkTheme ? '#D1D5DB' : '#4B5563',
                },
            },
            maintainAspectRatio: false,
        };

        return (
            <div
                key={topic}
                className={`w-44 h-64 m-4 rounded-xl shadow-md p-3 transition hover:scale-105 duration-300 ${darkTheme ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'
                    }`}
            >
                <Pie data={data} options={options} />
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto px-2">
            <div
                className={`p-6 rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto relative shadow-2xl ${darkTheme ? 'bg-gray-900 text-gray-300' : 'bg-white text-gray-700'
                    }`}
            >
                <button
                    onClick={onClose}
                    className={`absolute top-4 right-4 text-xl ${darkTheme ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-800'
                        }`}
                >
                    ✕
                </button>

                <div className="mb-6">
                    <h2 className={`text-3xl font-bold text-center ${darkTheme ? 'text-gray-200' : 'text-gray-800'}`}>
                        {result.quizTitle} - Quiz Result
                    </h2>
                    <p className={`text-center text-sm mt-1 ${darkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
                        Submitted at: {format(new Date(result.submittedAt), 'PPP hh:mm a zzzz')}
                    </p>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-around mb-10">
                    <div className="text-center mb-6 md:mb-0">
                        <div className={`text-5xl font-bold ${darkTheme ? 'text-green-400' : 'text-green-600'}`}>
                            {result.score} / {totalQuestions}
                        </div>
                        <p className={`mt-2 text-lg ${darkTheme ? 'text-gray-400' : 'text-gray-600'}`}>Your Score</p>
                    </div>
                    <div className="w-64 h-64 relative">
                        <Pie data={overallChartData} options={{
                            ...overallChartOptions,
                            plugins: {
                                ...overallChartOptions.plugins,
                                legend: {
                                    ...overallChartOptions.plugins.legend,
                                    labels: { color: darkTheme ? '#D1D5DB' : '#4B5563' }
                                },
                                title: {
                                    ...overallChartOptions.plugins.title,
                                    color: darkTheme ? '#D1D5DB' : '#4B5563'
                                }
                            }
                        }} />
                    </div>
                </div>

                <h3 className={`text-2xl font-semibold mb-4 ${darkTheme ? 'text-gray-200' : 'text-gray-800'}`}>
                    Performance by Topic
                </h3>
                <div className="flex flex-wrap justify-center gap-4 mb-10">
                    {Object.entries(topicStats).map(([topic, stats]) => getTopicChart(topic, stats))}
                </div>

                <h3 className={`text-2xl font-semibold mb-4 ${darkTheme ? 'text-gray-200' : 'text-gray-800'}`}>
                    Detailed Answers
                </h3>
                <ul className="space-y-6 mb-10">
                    {result.detailedAnswers.map((answer, index) => (
                        <li
                            key={answer.questionId}
                            className={`p-5 rounded-xl border shadow-sm ${darkTheme ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                                }`}
                        >
                            <p className={`font-semibold text-lg mb-2 ${darkTheme ? 'text-gray-300' : 'text-gray-900'}`}>
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
                                    let textColor = darkTheme ? 'text-gray-400' : 'text-gray-700';

                                    if (isCorrect) {
                                        optionClass += darkTheme
                                            ? ' bg-green-900 border-green-700 text-green-400 font-medium'
                                            : ' bg-green-50 border-green-400 text-green-700 font-medium';
                                    } else if (isUserSelected && !isCorrect) {
                                        optionClass += darkTheme
                                            ? ' bg-red-900 border-red-700 text-red-400 font-medium'
                                            : ' bg-red-50 border-red-400 text-red-700 font-medium';
                                    } else {
                                        optionClass += darkTheme
                                            ? ' bg-gray-700 border-gray-600'
                                            : ' bg-white border-gray-300';
                                        textColor = darkTheme ? 'text-gray-400' : 'text-gray-700';
                                    }

                                    return (
                                        <div key={opt._id || i} className={optionClass}>
                                            {opt.isImage ? (
                                                <img src={opt.option} alt={`Option ${i + 1}`} className="h-12 w-auto" />
                                            ) : (
                                                <span className={textColor}>{opt.option}</span>
                                            )}
                                            {isCorrect && <MdCheckCircle className="text-green-600" />}
                                            {isUserSelected && !isCorrect && <MdCancel className="text-red-600" />}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className={`mt-2 text-sm italic ${darkTheme ? 'text-gray-500' : 'text-gray-600'}`}>
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

                <h3 className={`text-2xl font-semibold mb-4 ${darkTheme ? 'text-gray-200' : 'text-gray-800'}`}>Summary</h3>
                {loading ? (
                    <div className={`text-center ${darkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
                        Generating summary...
                    </div>
                ) : (
                    <div
                        className={`prose prose-sm max-w-full text-base ${darkTheme ? 'text-gray-400' : 'text-gray-700'
                            }`}
                        dangerouslySetInnerHTML={{ __html: quizSummary }}
                    />
                )}
            </div>
        </div>
    );
};

export default QuizResultPopup;