import React, { useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getUserEnrolledCourses } from '../../../services/operations/profileAPI';
import ProgressBar from '@ramonak/react-progress-bar';
import { useNavigate } from 'react-router-dom';
import { CiChat1 } from 'react-icons/ci';
import { ThemeContext } from '../../../provider/themeContext';
import { FaQuestion } from 'react-icons/fa';
import './EnrolledCourses.css'; // Import the CSS file for styling

export const EnrolledCourses = () => {
    const { token } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const [enrolledCourses, setEnrolledCourses] = useState(null);
    const { darkTheme } = useContext(ThemeContext);

    const getEnrolledCourses = async () => {
        try {
            const res = await getUserEnrolledCourses(token);
            setEnrolledCourses(res);
        } catch (error) {
            console.log('Could not fetch enrolled courses.');
        }
    };

    useEffect(() => {
        getEnrolledCourses();
    }, []);

    return (
        <div className={`enrolled-courses-container ${darkTheme ? 'dark' : ''}`}>
            <h2 className={`text-3xl ${darkTheme ? 'text-richblack-50' : 'text-blue-200'}`}>
                Enrolled Courses
            </h2>
            {!enrolledCourses ? (
                <div className="spinner-container">
                    <div className={`spinner ${darkTheme ? 'spinner-dark' : ''}`}></div>
                </div>
            ) : !enrolledCourses.length ? (
                <p
                    className={`empty-courses-message ${darkTheme ? 'text-richblack-5' : 'text-richblack-400'
                        }`}
                >
                    You have not enrolled in any course yet.
                    {/* TODO: Modify this Empty State */}
                </p>
            ) : (
                <div className={`enrolled-courses-table-container my-8 ${darkTheme ? 'text-richblack-5' : 'text-richblack-600'}`}>
                    <table className="enrolled-courses-table">
                        <thead
                            className={`rounded-t-lg ${darkTheme ? 'bg-richblack-500' : 'bg-richblack-25'}`}
                        >
                            <tr>
                                <th className="course-name-col">Course Name</th>
                                <th className="duration-col">Duration</th>
                                <th className="progress-col">Progress</th>
                                <th className="actions-col">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {enrolledCourses.map((course, i) => (
                                <tr
                                    key={i}
                                    className={`course-row ${i % 2 === 0 ? 'even-row' : 'odd-row'} ${i === enrolledCourses.length - 1 ? 'last-row' : ''
                                        }`}
                                >
                                    <td
                                        className="course-name-cell cursor-pointer"
                                        onClick={() => {
                                            navigate(
                                                `/view-course/${course?._id}/section/${course.courseContent?.[0]?._id}/sub-section/${course.courseContent?.[0]?.subSection?.[0]?._id}`
                                            );
                                        }}

                                    >
                                        <div className="course-info">
                                            <img
                                                src={course.thumbnail}
                                                alt="course_img"
                                                className="course-thumbnail"
                                            />
                                            <div className="course-details">
                                                <p className="course-title">{course.courseName}</p>
                                                <p className="course-description">
                                                    {course.courseDescription.length > 50
                                                        ? `${course.courseDescription.slice(0, 50)}...`
                                                        : course.courseDescription}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="duration-cell">{course?.totalDuration}</td>
                                    <td className="progress-cell">
                                        <p className="progress-label">
                                            Progress: {course.progressPercentage || 0}%
                                        </p>
                                        <ProgressBar
                                            completed={course.progressPercentage || 0}
                                            height="8px"
                                            isLabelVisible={false}
                                            className="progress-bar"
                                            bgColor={darkTheme ? '#a3b183' : '#6969ff'}
                                            barContainerColor={darkTheme ? '#343a40' : '#e0e0e0'}
                                            labelColor={darkTheme ? '#f8f9fa' : '#212529'}
                                        />
                                    </td>
                                    <td className="actions-cell">
                                        <div className="actions-container">
                                            <div
                                                className={`action-icon message-icon ${darkTheme ? 'action-icon-dark' : ''}`}
                                                onClick={() => {
                                                    navigate(`/dashboard/chat/${course.room}`);
                                                }}
                                                title="Go to Chat"
                                            >
                                                <CiChat1 />
                                                <span className="action-text">Chat</span>
                                            </div>
                                            <div
                                                className={`action-icon question-icon ${darkTheme ? 'action-icon-dark' : ''}`}
                                                onClick={() => {
                                                    navigate(`/dashboard/question/${course?._id}`);
                                                }}
                                                title="Go to Forum"
                                            >
                                                <FaQuestion />
                                                <span className="action-text">Forum</span>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};