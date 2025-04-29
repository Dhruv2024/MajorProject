import { useDispatch, useSelector } from "react-redux"
import { Table, Tbody, Td, Th, Thead, Tr } from "react-super-responsive-table"

import { setCourse, setEditCourse } from "../../../../slices/courseSlice"
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css"
import { useContext, useState } from "react"
import { FaCheck } from "react-icons/fa"
import { FiEdit2 } from "react-icons/fi"
import { HiClock } from "react-icons/hi"
import { RiDeleteBin6Line } from "react-icons/ri"
import { useNavigate } from "react-router-dom"
import { CiChat1 } from "react-icons/ci";

import { formatDate } from "../../../../services/formatDate"
import {
    deleteCourse,
    fetchInstructorCourses,
} from "../../../../services/operations/courseDetailsAPI"
import { COURSE_STATUS } from "../../../../utils/constants"
import { ConfirmationModal } from "../../../common/ConfirmationModal"
import { ThemeContext } from "../../../../provider/themeContext"
import { BiQuestionMark } from "react-icons/bi";
import { BsFillQuestionOctagonFill } from "react-icons/bs";


export default function CoursesTable({ courses, setCourses, courseLoading }) {
    console.log("Current Courses are .................");
    console.log(courses);
    //const dispatch = useDispatch()
    const navigate = useNavigate()
    const { token } = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(false)
    const [confirmationModal, setConfirmationModal] = useState(null)
    const TRUNCATE_LENGTH = 30

    const handleCourseDelete = async (courseId) => {
        setLoading(true)
        await deleteCourse({ courseId: courseId }, token)
        const result = await fetchInstructorCourses(token)
        if (result) {
            setCourses(result)
        }
        setConfirmationModal(null)
        setLoading(false)
    }
    const { darkTheme } = useContext(ThemeContext);
    // console.log("All Course ", courses)
    return (
        <>
            <Table className={`rounded-xl border ${darkTheme ? "border-richblack-800" : " border-richblack-25"}`}>
                <Thead>
                    <Tr className={`flex gap-x-10 rounded-t-md px-6 py-2 ${darkTheme ? "border-b border-b-richblack-800" : "border-b border-b-richblack-25"}`}>
                        <Th className={`flex-1 text-left text-sm font-medium uppercase ${darkTheme ? "text-richblack-100" : " text-richblack-600"}`}>
                            Courses
                        </Th>
                        <Th className={`text-left text-sm font-medium uppercase ${darkTheme ? "text-richblack-100" : " text-richblack-600"}`}>
                            Duration
                        </Th>
                        <Th className={`text-left text-sm font-medium uppercase ${darkTheme ? "text-richblack-100" : " text-richblack-600"}`}>
                            Price
                        </Th>
                        <Th className={`text-left text-sm font-medium uppercase ${darkTheme ? "text-richblack-100" : " text-richblack-600"}`}>
                            Actions
                        </Th>
                    </Tr>
                </Thead>
                {
                    (loading || courseLoading) ? (
                        <div className="spinner mx-auto"></div>
                    ) : (
                        <Tbody>
                            {courses?.length === 0 ? (
                                <Tr>
                                    <Td className={`py-10 text-center text-2xl font-medium  ${darkTheme ? "text-richblack-100" : " text-blue-100"}`}>
                                        No courses found
                                    </Td>
                                </Tr>
                            ) : (
                                courses?.map((course) => (
                                    <Tr
                                        key={course._id}
                                        className="flex gap-x-10 border-b border-richblack-800 px-6 py-8"
                                    >
                                        <Td className="flex flex-1 gap-x-4">
                                            <img
                                                src={course?.thumbnail}
                                                alt={course?.courseName}
                                                className="h-[148px] w-[220px] rounded-lg object-cover"
                                            />
                                            <div className="flex flex-col justify-between">
                                                <p className={`text-lg font-semibold ${darkTheme ? "text-richblack-5" : "text-blue-300"}`}>
                                                    {course.courseName}
                                                </p>
                                                <p className={`text-xs ${darkTheme ? "text-richblack-300 " : "text-richblack-600"}`}>
                                                    {course.courseDescription.split(" ").length >
                                                        TRUNCATE_LENGTH
                                                        ? course.courseDescription
                                                            .split(" ")
                                                            .slice(0, TRUNCATE_LENGTH)
                                                            .join(" ") + "..."
                                                        : course.courseDescription}
                                                </p>
                                                <p className={`text-[12px] ${darkTheme ? "text-white" : "text-black"}`}>
                                                    Created: {formatDate(course.createdAt)}
                                                </p>
                                                {course.status === COURSE_STATUS.DRAFT ? (
                                                    <p className="flex w-fit flex-row items-center gap-2 rounded-full bg-richblack-700 px-2 py-[2px] text-[12px] font-medium text-pink-100">
                                                        <HiClock size={14} />
                                                        Drafted
                                                    </p>
                                                ) : (
                                                    <p className="flex w-fit flex-row items-center gap-2 rounded-full bg-richblack-700 px-2 py-[2px] text-[12px] font-medium text-yellow-100">
                                                        <div className="flex h-3 w-3 items-center justify-center rounded-full bg-yellow-100 text-richblack-700">
                                                            <FaCheck size={8} />
                                                        </div>
                                                        Published
                                                    </p>
                                                )}
                                            </div>
                                        </Td>
                                        <Td className={`text-sm font-medium ${darkTheme ? "text-richblack-100 " : "text-black"}`}>
                                            {course.totalDuration}
                                        </Td>
                                        <Td className={`text-sm font-medium ${darkTheme ? "text-richblack-100 " : "text-black"}`}>
                                            ₹{course.price}
                                        </Td>
                                        <Td className="text-sm font-medium text-richblack-100">
                                            <div className="flex flex-col items-start h-full gap-4">
                                                {/* Top Group: Edit & Delete */}
                                                <div className="flex items-start gap-3">
                                                    <button
                                                        disabled={loading}
                                                        onClick={() => navigate(`/dashboard/edit-course/${course._id}`)}
                                                        title="Edit Course"
                                                        className={`transition-all duration-200 hover:scale-110 ${darkTheme ? "hover:text-caribbeangreen-200" : "hover:text-caribbeangreen-600"
                                                            }`}
                                                    >
                                                        <FiEdit2 size={20} />
                                                    </button>
                                                    <button
                                                        disabled={loading}
                                                        onClick={() =>
                                                            setConfirmationModal({
                                                                text1: "Do you want to delete this course?",
                                                                text2: "All the data related to this course will be deleted",
                                                                btn1Text: !loading ? "Delete" : "Loading...",
                                                                btn2Text: "Cancel",
                                                                btn1Handler: !loading ? () => handleCourseDelete(course._id) : () => { },
                                                                btn2Handler: !loading ? () => setConfirmationModal(null) : () => { },
                                                            })
                                                        }
                                                        title="Delete Course"
                                                        className={`transition-all duration-200 hover:scale-110 ${darkTheme ? "hover:text-[#ff4d4f]" : "hover:text-[#e60000]"
                                                            }`}
                                                    >
                                                        <RiDeleteBin6Line size={20} />
                                                    </button>
                                                </div>

                                                {/* Bottom Group: Chat & Questions */}
                                                <div className="flex items-start gap-3 mt-4">
                                                    <button
                                                        title="Go to Chat"
                                                        onClick={() => navigate(`/dashboard/chat/${course.room}`)}
                                                        className={`transition-all duration-200 hover:scale-110 ${darkTheme ? "hover:text-caribbeangreen-100" : "hover:text-blue-500"
                                                            }`}
                                                    >
                                                        <CiChat1 size={22} />
                                                    </button>
                                                    <button
                                                        title="Answer Doubts"
                                                        onClick={() => navigate(`/dashboard/question/${course._id}`)}
                                                        className={`transition-all duration-200 hover:scale-110 ${darkTheme ? "hover:text-yellow-200" : "hover:text-yellow-500"
                                                            }`}
                                                    >
                                                        <BsFillQuestionOctagonFill size={22} />
                                                    </button>


                                                </div>
                                            </div>
                                        </Td>



                                    </Tr>
                                ))
                            )}
                        </Tbody>
                    )
                }
            </Table>
            {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
        </>
    )
}