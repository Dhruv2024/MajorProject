import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import InstructorQuizReport from '../components/core/Quiz/InstructorQuizReport';
import { useParams } from "react-router-dom"
import { quizEndpoints } from '../services/apis';
import { apiConnector } from '../services/apiConnector';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { ThemeContext } from '../provider/themeContext';
const { GET_QUIZ_REPORT_FOR_INSTRUCTOR } = quizEndpoints;
const QuizReportPage = () => {
    const [reportData, setReportData] = useState(null);
    const { courseId, quizId } = useParams();
    const { token } = useSelector((state) => state.auth);
    const { darkTheme } = useContext(ThemeContext);
    useEffect(() => {
        async function fetchQuizDetails() {
            try {
                const response = await apiConnector("POST", GET_QUIZ_REPORT_FOR_INSTRUCTOR, { courseId, quizId }, {
                    Authorization: `Bearer ${token}`,
                });
                setReportData(response.data);
            }
            catch (error) {
                console.log("FETCH QUIZ REPORT FOR INSTRUCTOR API ERROR............", error)
                toast.error("Something went wrong");
            }

        }
        fetchQuizDetails();

    }, [courseId, quizId]);

    return (
        <div className={`min-h-screen ${darkTheme ? "bg-gray-900" : "bg-gray-50 "}`}>
            {!reportData ? <p className="text-center p-8">Loading...</p> : <InstructorQuizReport quizData={reportData} />}
        </div>
    );
};

export default QuizReportPage;
