import React, { useContext } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { ThemeContext } from '../../../provider/themeContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const InstructorQuizReport = ({ quizData }) => {
    const detailedReport = quizData.detailedReport || [];
    const quizTitle = quizData.data?.title || "Quiz Report";
    const { darkTheme } = useContext(ThemeContext);

    const labels = detailedReport.map((_, i) => `Q${i + 1}`);
    const correct = detailedReport.map(q => q.correct);
    const wrong = detailedReport.map(q => q.wrong);
    const unattempted = detailedReport.map(q => q.unattempted);

    const textColor = darkTheme ? '#d1d5db' : '#1f2937'; // Tailwind: gray-300 or gray-800
    const bgColor = darkTheme ? '#1f2937' : '#ffffff'; // gray-800 or white
    const borderColor = darkTheme ? '#374151' : '#e5e7eb'; // gray-700 or gray-200
    const tableHeaderBg = darkTheme ? 'bg-gray-700' : 'bg-gray-100';

    const barChartData = {
        labels,
        datasets: [
            {
                label: 'Correct',
                data: correct,
                backgroundColor: '#16a34a',
            },
            {
                label: 'Wrong',
                data: wrong,
                backgroundColor: '#dc2626',
            },
            {
                label: 'Unattempted',
                data: unattempted,
                backgroundColor: '#f59e0b',
            },
        ],
    };

    const barChartOptions = {
        responsive: true,
        animation: {
            duration: 0, // disables animation
        },
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: textColor,
                },
            },
            title: {
                display: true,
                text: 'Question-wise Answer Statistics',
                color: textColor,
                font: { size: 18 },
            },
            tooltip: {
                bodyColor: textColor,
                backgroundColor: darkTheme ? '#374151' : '#f9fafb',
            },
        },
        scales: {
            x: {
                ticks: {
                    color: textColor,
                },
                grid: {
                    color: darkTheme ? '#4b5563' : '#e5e7eb',
                },
            },
            y: {
                ticks: {
                    color: textColor,
                },
                grid: {
                    color: darkTheme ? '#4b5563' : '#e5e7eb',
                },
            },
        },
    };

    return (
        <div className={`p-6 max-w-6xl mx-auto ${darkTheme ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <h1 className={`text-3xl font-bold mb-6 ${darkTheme ? 'text-gray-100' : 'text-gray-800'}`}>
                {quizTitle} - Instructor Report
            </h1>

            <div className={`rounded-lg shadow-md p-6 mb-8 ${darkTheme ? 'bg-gray-800' : 'bg-white'}`}>
                <Bar data={barChartData} options={barChartOptions} />
            </div>

            <div className="space-y-6">
                {detailedReport.map((q, i) => {
                    const pieData = {
                        labels: ['Correct', 'Wrong', 'Unattempted'],
                        datasets: [
                            {
                                data: [q.correct, q.wrong, q.unattempted],
                                backgroundColor: ['#16a34a', '#dc2626', '#f59e0b'],
                                borderWidth: 0,
                            },
                        ],
                    };

                    const pieOptions = {
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                enabled: true,
                                backgroundColor: darkTheme ? '#374151' : '#f9fafb',
                                bodyColor: textColor,
                                callbacks: {
                                    label: function (tooltipItem) {
                                        const labels = ['Correct', 'Wrong', 'Unattempted'];
                                        const label = labels[tooltipItem.dataIndex] || '';
                                        const value = tooltipItem.raw;
                                        return `${label}: ${value}`;
                                    },
                                },
                            },
                        },
                    };

                    return (
                        <div
                            key={q.questionId}
                            className={`shadow-sm p-4 rounded border flex justify-between items-start ${darkTheme ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                        >
                            <div className="flex-1">
                                <p className={`font-semibold mb-1 ${darkTheme ? 'text-gray-200' : 'text-gray-700'}`} style={{ whiteSpace: 'pre-line' }}>
                                    Q{i + 1}: {q.questionText}
                                </p>
                                <div className="text-sm">
                                    <p>✅ Correct: <span className="text-green-500 font-medium">{q.correct}</span></p>
                                    <p>❌ Wrong: <span className="text-red-500 font-medium">{q.wrong}</span></p>
                                    <p>⚪ Unattempted: <span className="text-yellow-400 font-medium">{q.unattempted}</span></p>
                                </div>
                            </div>

                            <div className="w-28 h-28 ml-4">
                                <Pie data={pieData} options={pieOptions} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {quizData.topPerformers && quizData.topPerformers.length > 0 && (
                <div className="mt-10">
                    <h2 className={`text-2xl font-semibold mb-4 ${darkTheme ? 'text-gray-100' : 'text-gray-800'}`}>Top Performers</h2>
                    <div className="overflow-x-auto">
                        <table className={`min-w-full border rounded-lg shadow ${darkTheme ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-gray-200 text-gray-800'}`}>
                            <thead>
                                <tr className={`${tableHeaderBg} text-left`}>
                                    <th className="py-2 px-4 border-b">Name</th>
                                    <th className="py-2 px-4 border-b">Email</th>
                                    <th className="py-2 px-4 border-b">Score</th>
                                    <th className="py-2 px-4 border-b">Total Questions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {quizData.topPerformers.map((performer) => (
                                    <tr key={performer._id} className={`${darkTheme ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                                        <td className="py-2 px-4 border-b">{performer.userId?.firstName}</td>
                                        <td className="py-2 px-4 border-b">{performer.userId?.email}</td>
                                        <td className="py-2 px-4 border-b text-green-500 font-medium">{performer.score}</td>
                                        <td className="py-2 px-4 border-b">{performer.totalQuestions}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InstructorQuizReport;
