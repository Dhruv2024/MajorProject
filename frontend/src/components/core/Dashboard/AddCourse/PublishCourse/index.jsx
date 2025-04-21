import { useContext, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { editCourseDetails } from "../../../../../services/operations/courseDetailsAPI"
import { resetCourseState, setStep } from "../../../../../slices/courseSlice"
import { COURSE_STATUS } from "../../../../../utils/constants"
import { IconBtn } from "../../../../common/IconBtn"
import { ThemeContext } from "../../../../../provider/themeContext"

export default function PublishCourse() {
    const { register, handleSubmit, setValue, getValues } = useForm();
    const { darkTheme } = useContext(ThemeContext);
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { token } = useSelector((state) => state.auth)
    const { course } = useSelector((state) => state.course)
    const [loading, setLoading] = useState(false)
    const [isPublic, setIsPublic] = useState(false)
    useEffect(() => {
        if (course?.status === COURSE_STATUS.PUBLISHED) {
            setValue("public", true);
            setIsPublic(true);
        }
    }, [])

    const goBack = () => {
        dispatch(setStep(2))
    }

    const goToCourses = () => {
        dispatch(resetCourseState())
        navigate("/dashboard/my-courses")
    }
    useEffect(() => {
        const currentPublic = getValues("public");
        console.log(currentPublic);
        // 🔒 Prevent changing Published to Draft
        if (course?.status === COURSE_STATUS.PUBLISHED && !currentPublic) {
            alert("You cannot unpublish a course once it has been made public.")
            return
        }
    }, [getValues("public")])
    const handleCoursePublish = async () => {
        // check if form has been updated or not
        if (
            (course?.status === COURSE_STATUS.PUBLISHED &&
                getValues("public") === true) ||
            (course?.status === COURSE_STATUS.DRAFT && getValues("public") === false)
        ) {
            // form has not been updated
            // no need to make api call
            goToCourses()
            return
        }
        const formData = new FormData()
        formData.append("courseId", course._id)
        const courseStatus = getValues("public")
            ? COURSE_STATUS.PUBLISHED
            : COURSE_STATUS.DRAFT;

        if (course?.status === COURSE_STATUS.DRAFT) {
            formData.append("status", courseStatus)
            if (courseStatus === "Published") {
                const now = new Date();
                const enrollmentOpenAt = now;
                const enrollmentCloseAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

                formData.append("enrollmentOpen", true);
                formData.append("enrollmentOpenAt", enrollmentOpenAt);
                formData.append("enrollmentCloseAt", enrollmentCloseAt);
            }
        }

        setLoading(true)
        const result = await editCourseDetails(formData, token)
        if (result) {
            goToCourses()
        }
        setLoading(false)
    }
    const handleCheckboxChange = (e) => {
        const checked = e.target.checked

        // Prevent unchecking if already published
        if (course?.status === COURSE_STATUS.PUBLISHED && !checked) {
            alert("You cannot unpublish a course once it has been made public.")
            return
        }

        setIsPublic(checked)
        setValue("public", checked)
    }
    const onSubmit = (data) => {
        // console.log(data)
        handleCoursePublish()
    }

    return (
        <div className={`rounded-md border-[1px] p-6 ${darkTheme ? "border-richblack-700 bg-richblack-800" : "border-richblack-5 bg-white"}`}>
            <p className={`text-2xl font-semibold ${darkTheme ? "text-richblack-5" : "text-richblack-800"}`}>
                Publish Settings
            </p>
            <form onSubmit={handleSubmit(onSubmit)}>
                {/* Checkbox */}
                <div className="my-6 mb-8">
                    <label htmlFor="public" className="inline-flex items-center text-lg">
                        <input
                            type="checkbox"
                            id="public"
                            checked={isPublic}
                            onChange={handleCheckboxChange}
                            className="border-gray-300 h-4 w-4 rounded bg-richblack-500 text-richblack-400 focus:ring-2 focus:ring-richblack-5"
                        />
                        <span className="ml-2 text-richblack-400">
                            Make this course as public
                        </span>
                    </label>
                </div>

                {/* Next Prev Button */}
                <div className="ml-auto flex max-w-max items-center gap-x-4">
                    <button
                        disabled={loading}
                        type="button"
                        onClick={goBack}
                        className={`flex cursor-pointer items-center gap-x-2 rounded-md py-[8px] px-[20px] font-semibold ${darkTheme ? "bg-richblack-300 text-richblack-900" : "bg-white border-2 border-richblack-25"}`}
                    >
                        Back
                    </button>
                    <IconBtn disabled={loading} text="Save Changes" />
                </div>
            </form>
        </div>
    )
}