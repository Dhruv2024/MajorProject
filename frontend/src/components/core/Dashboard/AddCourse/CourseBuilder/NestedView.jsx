import { useContext, useState } from "react"
import { AiFillCaretDown } from "react-icons/ai"
import { FaPlus } from "react-icons/fa"
import { MdEdit } from "react-icons/md"
import { RiDeleteBin6Line } from "react-icons/ri"
import { RxDropdownMenu } from "react-icons/rx"
import { useDispatch, useSelector } from "react-redux"
import { SiGooglemeet } from "react-icons/si";

import {
    deleteSection,
    deleteSubSection,
} from "../../../../../services/operations/courseDetailsAPI"
import { setCourse } from "../../../../../slices/courseSlice"
import SubSectionModal from "./SubSectionModal"
import { ConfirmationModal } from "../../../../common/ConfirmationModal"
import { ThemeContext } from "../../../../../provider/themeContext"

export default function NestedView({ handleChangeEditSectionName }) {
    const { course } = useSelector((state) => state.course);
    console.log(course);
    const { token } = useSelector((state) => state.auth);
    const { darkTheme } = useContext(ThemeContext);
    const dispatch = useDispatch()
    // States to keep track of mode of modal [add, view, edit]
    const [addSubSection, setAddSubsection] = useState(null)
    const [viewSubSection, setViewSubSection] = useState(null)
    const [editSubSection, setEditSubSection] = useState(null)
    // to keep track of confirmation modal
    const [confirmationModal, setConfirmationModal] = useState(null);
    const [type, setType] = useState(null);
    const handleDeleleSection = async (sectionId) => {
        const result = await deleteSection({
            sectionId,
            courseId: course._id,
            token,
        })
        if (result) {
            dispatch(setCourse(result))
        }
        setConfirmationModal(null)
    }

    const handleDeleteSubSection = async (subSectionId, sectionId, quizId, section) => {
        let result;
        if (section.sectionName === "Course Quizzes") {
            result = await deleteSubSection({ subSectionId, sectionId }, token, 'quiz', quizId)
        }
        else {
            result = await deleteSubSection({ subSectionId, sectionId, token })
        }
        if (result) {
            // update the structure of course
            const updatedCourseContent = course.courseContent.map((section) =>
                section._id === sectionId ? result : section
            )
            const updatedCourse = { ...course, courseContent: updatedCourseContent }
            dispatch(setCourse(updatedCourse))
        }
        setConfirmationModal(null)
    }

    return (
        <>
            <div
                className={`rounded-lg p-6 px-8 ${darkTheme ? "bg-richblack-700" : "bg-blue-5"}`}
                id="nestedViewContainer"
            >
                {course?.courseContent?.map((section) => (
                    // Section Dropdown
                    <details key={section._id} open>
                        {/* Section Dropdown Content */}
                        <summary className={`flex cursor-pointer items-center justify-between border-b-2 ${darkTheme ? "border-b-richblack-600" : "border-b-richblack-25"} py-2`}>
                            <div className="flex items-center gap-x-3">
                                <RxDropdownMenu className={`text-2xl ${darkTheme ? "text-richblack-50" : "text-richblack-800"}`} />
                                <p className={`font-semibold ${darkTheme ? "text-richblack-50" : "text-richblack-800"}`}>
                                    {section.sectionName}
                                </p>
                            </div>
                            <div className="flex items-center gap-x-3">
                                {
                                    section.sectionName !== "Course Quizzes" &&
                                    <button
                                        onClick={() =>
                                            handleChangeEditSectionName(
                                                section._id,
                                                section.sectionName
                                            )
                                        }
                                    >
                                        <MdEdit className={`text-xl ${darkTheme ? "text-richblack-300" : "text-richblack-400"}`} />
                                    </button>
                                }
                                {
                                    section?.sectionName !== "Course Quizzes" &&
                                    <button
                                        onClick={() =>
                                            setConfirmationModal({
                                                text1: "Delete this Section?",
                                                text2: "All the lectures in this section will be deleted",
                                                btn1Text: "Delete",
                                                btn2Text: "Cancel",
                                                btn1Handler: () => handleDeleleSection(section._id),
                                                btn2Handler: () => setConfirmationModal(null),
                                            })
                                        }
                                    >
                                        <RiDeleteBin6Line className={`text-xl ${darkTheme ? "text-richblack-300" : "text-richblack-400"}`} />
                                    </button>
                                }
                                <span className="font-medium text-richblack-300">|</span>
                                <AiFillCaretDown className={`text-xl ${darkTheme ? "text-richblack-300" : "text-richblack-400"}`} />
                            </div>
                        </summary>
                        <div className="px-6 pb-4">
                            {/* Render All Sub Sections Within a Section */}
                            {section.subSection.map((data) => (
                                <div
                                    key={data?._id}
                                    onClick={() => {
                                        if (section.sectionName === "Course Quizzes") {
                                            return;
                                        }
                                        else {
                                            setViewSubSection(data);
                                            if (section.sectionName === "Course Quizzes") {
                                                return;
                                            }
                                            setType(data.type);
                                            console.log(data.type);
                                        }
                                    }}
                                    className={`flex cursor-pointer items-center justify-between gap-x-3 py-2 ${darkTheme ? "border-b-2 border-b-richblack-600" : "border-b-2 border-b-richblack-5"}`}
                                >
                                    <div className="flex items-center gap-x-3 py-2 ">
                                        {
                                            data.type === 'videoCall' ? <SiGooglemeet className="text-xl text-richblack-50" /> : <RxDropdownMenu className="text-2xl text-richblack-50" />
                                        }

                                        <p className={`font-semibold ${darkTheme ? "text-richblack-50" : "text-richblack-400"}`}>
                                            {data.title}
                                        </p>
                                    </div>
                                    <div
                                        onClick={(e) => e.stopPropagation()}
                                        className="flex items-center gap-x-3"
                                    >
                                        {
                                            section.sectionName !== "Course Quizzes" &&
                                            <button
                                                onClick={() =>
                                                    setEditSubSection({ ...data, sectionId: section._id })
                                                }
                                            >
                                                <MdEdit className="text-xl text-richblack-300" />
                                            </button>
                                        }
                                        <button
                                            onClick={() => {
                                                // console.log(data);
                                                setConfirmationModal({
                                                    text1: "Delete this Sub-Section?",
                                                    text2: "This lecture will be deleted",
                                                    btn1Text: "Delete",
                                                    btn2Text: "Cancel",
                                                    btn1Handler: () =>
                                                        handleDeleteSubSection(data._id, section._id, data.quiz, section),
                                                    btn2Handler: () => setConfirmationModal(null),
                                                })
                                            }
                                            }
                                        >
                                            <RiDeleteBin6Line className="text-xl text-richblack-300" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {/* Add New Lecture to Section */}
                            <button
                                onClick={() => {
                                    setAddSubsection(section._id);
                                    if (section.sectionName === "Course Quizzes") {
                                        setType('quiz')
                                    }
                                    else {
                                        setType('recorded');
                                    }
                                }}
                                className={`mt-3 flex items-center gap-x-1 ${darkTheme ? "text-yellow-50" : "text-blue-300"}`}
                            >
                                <FaPlus className="text-lg" />
                                <p>{
                                    section.sectionName === "Course Quizzes" ? "Add Quiz" : "Add Lecture"
                                }</p>
                            </button>
                        </div>
                    </details>
                ))}
            </div>
            {/* Modal Display */}
            {addSubSection ? (
                <SubSectionModal
                    modalData={addSubSection}
                    setModalData={setAddSubsection}
                    add={true}
                    sectionName={type === 'quiz' && "Course Quizzes"}
                    type={type}
                />
            ) : viewSubSection ? (
                <SubSectionModal
                    modalData={viewSubSection}
                    setModalData={setViewSubSection}
                    sectionName={type === 'quiz' && "Course Quizzes"}
                    view={true}
                    type={type}
                />
            ) : editSubSection ? (
                <SubSectionModal
                    modalData={editSubSection}
                    setModalData={setEditSubSection}
                    edit={true}
                    sectionName={type === 'quiz' && "Course Quizzes"}
                    type={type}
                />
            ) : (
                <></>
            )}
            {/* Confirmation Modal */}
            {confirmationModal ? (
                <ConfirmationModal modalData={confirmationModal} />
            ) : (
                <></>
            )}
        </>
    )
}