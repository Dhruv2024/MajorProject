import React, { useContext, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { getUserEnrolledCourses } from '../../../services/operations/profileAPI';
import ProgressBar from '@ramonak/react-progress-bar';
import { useNavigate } from 'react-router-dom';
import { CiChat1 } from "react-icons/ci";
import { ThemeContext } from '../../../provider/themeContext';
import { MdOutlineQuestionMark } from "react-icons/md";
import { FaClipboardQuestion } from "react-icons/fa6";

export const EnrolledCourses = () => {
    const { token } = useSelector((state) => state.auth)
    const navigate = useNavigate()

    const [enrolledCourses, setEnrolledCourses] = useState(null)
    const getEnrolledCourses = async () => {
        try {
            const res = await getUserEnrolledCourses(token);

            setEnrolledCourses(res);
        } catch (error) {
            console.log("Could not fetch enrolled courses.")
        }
    };
    // console.log(enrolledCourses);
    useEffect(() => {
        getEnrolledCourses();
    }, []);
    const { darkTheme } = useContext(ThemeContext);
    return (
        <>
            <div className={`text-3xl ${darkTheme ? "text-richblack-50" : "text-blue-200"}`}>Enrolled Courses</div>
            {!enrolledCourses ? (
                <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
                    <div className="spinner"></div>
                </div>
            ) : !enrolledCourses.length ? (
                <p className={`grid h-[10vh] w-full place-content-center ${darkTheme ? "text-richblack-5" : "text-richblack-400"}`}>
                    You have not enrolled in any course yet.
                    {/* TODO: Modify this Empty State */}
                </p>
            ) : (
                <div className={`my-8 ${darkTheme ? "text-richblack-5" : "text-richblack-600"}`}>
                    {/* Headings */}
                    <div className={`flex rounded-t-lg ${darkTheme ? "bg-richblack-500" : "bg-richblack-25"}`}>
                        <p className="w-[45%] px-5 py-3">Course Name</p>
                        <p className="w-1/5 px-2 py-3">Duration</p>
                        <p className="flex-1 px-2 py-3">Progress</p>
                        <p className=' pr-7 px-2 py-3'>Actions</p>
                    </div>
                    {/* Course Names */}
                    {enrolledCourses.map((course, i, arr) => (
                        <div
                            className={`flex items-center border border-richblack-700 ${i === arr.length - 1 ? "rounded-b-lg" : "rounded-none"
                                }`}
                            key={i}
                        >
                            <div
                                className="flex w-[45%] cursor-pointer items-center gap-4 px-5 py-3 lg:flex-row flex-col"
                                onClick={() => {
                                    // console.log("PRINTING LINK.........");
                                    // console.log(`/view-course/${course?._id}/section/${course.courseContent?.[0]}/sub-section/${course.courseContent?.[0]?.subSection?.[0]?._id}`)
                                    navigate(
                                        `/view-course/${course?._id}/section/${course.courseContent?.[0]?._id}/sub-section/${course.courseContent?.[0]?.subSection?.[0]?._id}`
                                    )
                                }}
                            >
                                <img
                                    src={course.thumbnail}
                                    alt="course_img"
                                    className="h-14 w-14 rounded-lg object-cover"
                                />
                                <div className="flex max-w-xs flex-col gap-2">
                                    <p className="font-semibold">{course.courseName}</p>
                                    <p className="text-xs text-richblack-300">
                                        {course.courseDescription.length > 50
                                            ? `${course.courseDescription.slice(0, 50)}...`
                                            : course.courseDescription}
                                    </p>
                                </div>
                            </div>
                            <div className="w-1/5 px-2 py-3">{course?.totalDuration}</div>
                            <div className="flex w-1/5 flex-col gap-2 px-2 py-3">
                                <p>Progress: {course.progressPercentage || 0}%</p>
                                <ProgressBar
                                    completed={course.progressPercentage || 0}
                                    height="8px"
                                    isLabelVisible={false}
                                />
                            </div>
                            <div className=' pl-20 pr-3 px-2 py-3 text-2xl flex '>
                                <CiChat1 className='outline-8 hover:text-blue-100 cursor-pointer' onClick={() => {
                                    navigate(`/dashboard/chat/${course.room}`)
                                }} />
                                <FaClipboardQuestion className='outline-8 hover:text-blue-100 cursor-pointer' onClick={() => {
                                    navigate(`/dashboard/question/${course?._id}`)
                                }} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    )
}
