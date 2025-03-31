import { useContext, useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"

import { fetchInstructorCourses } from "../../../services/operations/courseDetailsAPI"
import { getInstructorData } from "../../../services/operations/profileAPI"
import InstructorChart from "./InstructorDashboard/InstructorChart"
import { ThemeContext } from "../../../provider/themeContext"

export default function Instructor() {
    const { token } = useSelector((state) => state.auth)
    const { user } = useSelector((state) => state.profile)
    const [loading, setLoading] = useState(false)
    const [instructorData, setInstructorData] = useState(null)
    const [courses, setCourses] = useState([])
    const { darkTheme } = useContext(ThemeContext);
    useEffect(() => {
        async function fetchInstructorCoursesAndData() {
            setLoading(true)
            const instructorApiData = await getInstructorData(token)
            const result = await fetchInstructorCourses(token)
            // console.log(instructorApiData)
            if (instructorApiData.length) setInstructorData(instructorApiData)
            if (result) {
                setCourses(result)
            }
            setLoading(false)
        }
        fetchInstructorCoursesAndData();
    }, [])

    const totalAmount = instructorData?.reduce(
        (acc, curr) => acc + curr.totalAmountGenerated,
        0
    )

    const totalStudents = instructorData?.reduce(
        (acc, curr) => acc + curr.totalStudentsEnrolled,
        0
    )
    return (
        <div>
            <div className="space-y-2">
                <h1 className={`text-2xl font-bold ${darkTheme ? "text-richblack-5" : " text-blue-50"}`}>
                    Hi {user?.firstName} 👋
                </h1>
                <p className="font-medium text-richblack-200">
                    Let's start something new
                </p>
            </div>
            {loading ? (
                <div className="spinner"></div>
            ) : courses.length > 0 ? (
                <div>
                    <div className="my-4 flex lg:h-[450px] space-x-4 lg:flex-row flex-col">
                        {/* Render chart / graph */}
                        {totalAmount > 0 || totalStudents > 0 ? (
                            <InstructorChart courses={instructorData} darkTheme={darkTheme} />
                        ) : (
                            <div className="flex-1 rounded-md bg-richblack-800 p-6">
                                <p className="text-lg font-bold text-richblack-5">Visualize</p>
                                <p className="mt-4 text-xl font-medium text-richblack-50">
                                    Not Enough Data To Visualize
                                </p>
                            </div>
                        )}
                        {/* Total Statistics */}
                        <div className={`flex min-w-[250px] flex-col rounded-md p-6 ${darkTheme ? "bg-richblack-800" : "bg-white"}`}>
                            <p className={`text-lg font-bold ${darkTheme ? "text-richblack-5" : "text-richblack-600"}`}>Statistics</p>
                            <div className="mt-4 space-y-4">
                                <div>
                                    <p className={`text-lg ${darkTheme ? "text-richblack-200" : "text-richblack-800"}`}>Total Courses</p>
                                    <p className={`text-3xl font-semibold ${darkTheme ? "text-richblack-50" : "text-richblack-400"}`}>
                                        {courses.length}
                                    </p>
                                </div>
                                <div>
                                    <p className={`text-lg ${darkTheme ? "text-richblack-200" : "text-richblack-800"}`}>Total Students</p>
                                    <p className={`text-3xl font-semibold ${darkTheme ? "text-richblack-50" : "text-richblack-400"}`}>
                                        {totalStudents}
                                    </p>
                                </div>
                                <div>
                                    <p className={`text-lg ${darkTheme ? "text-richblack-200" : "text-richblack-800"}`}>Total Income</p>
                                    <p className={`text-3xl font-semibold ${darkTheme ? "text-richblack-50" : "text-richblack-400"}`}>
                                        Rs. {totalAmount}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={`rounded-md p-6 ${darkTheme ? "bg-richblack-800" : "bg-white"}`}>
                        {/* Render 3 courses */}
                        <div className="flex items-center justify-between">
                            <p className={`text-lg font-bold ${darkTheme ? "text-richblack-5" : "text-richblack-600"}`}>Your Courses</p>
                            <Link to="/dashboard/my-courses">
                                <p className={`text-xs font-semibold ${darkTheme ? "text-yellow-50" : "text-blue-50"}`}>View All</p>
                            </Link>
                        </div>
                        <div className="my-4 flex items-start space-x-6">
                            {courses.slice(0, 2).map((course) => (
                                <div key={course._id} className="lg:w-1/3 w-1/2">
                                    <img
                                        src={course.thumbnail}
                                        alt={course.courseName}
                                        className="h-[201px] w-full rounded-md object-cover"
                                    />
                                    <div className="mt-3 w-full">
                                        <p className={`text-sm font-medium ${darkTheme ? "text-richblack-50" : "text-black"}`}>
                                            {course.courseName}
                                        </p>
                                        <div className="mt-1 flex items-center space-x-2">
                                            <p className="text-xs font-medium text-richblack-300">
                                                {course.studentsEnrolled.length} students
                                            </p>
                                            <p className="text-xs font-medium text-richblack-300">
                                                |
                                            </p>
                                            <p className="text-xs font-medium text-richblack-300">
                                                Rs. {course.price}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className={`mt-20 rounded-md p-6 py-20 ${darkTheme ? "bg-richblack-800" : " bg-richblack-5"}`}>
                    <p className={`text-center text-2xl font-bold ${darkTheme ? "text-richblack-5" : " text-black"}`}>
                        You have not created any courses yet
                    </p>
                    <Link to="/dashboard/add-course">
                        <p className={`mt-1 text-center text-lg font-semibold ${darkTheme ? "text-yellow-50" : " text-blue-100"}`}>
                            Create a course
                        </p>
                    </Link>
                </div>
            )}
        </div>
    )
}
