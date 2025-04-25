import { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useParams } from "react-router-dom";
import { format } from "date-fns";
import { AiOutlineClose } from "react-icons/ai";

import CourseReviewModal from "../components/core/ViewCourse/CourseReviewModal";
import VideoDetailsSidebar from "../components/core/ViewCourse/VideoDetailsSidebar";
import { getFullDetailsOfCourse } from "../services/operations/courseDetailsAPI";
import {
    setCompletedLectures,
    setCourseSectionData,
    setEntireCourseData,
    setTotalNoOfLectures,
} from "../slices/viewCourseSlice";
import { ThemeContext } from "../provider/themeContext";

export default function ViewCourse() {
    const { courseId } = useParams();
    const { token } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const [reviewModal, setReviewModal] = useState(false);
    const [expiryDateFormatted, setExpiryDateFormatted] = useState("");
    const [showExpiry, setShowExpiry] = useState(true);
    const { darkTheme } = useContext(ThemeContext);

    useEffect(() => {
        async function getDetails() {
            const courseData = await getFullDetailsOfCourse(courseId, token);
            courseData.courseDetails.courseExpiryDate = courseData.courseExpiryDate;
            // console.log("Course Data here... ", courseData.courseDetails)
            dispatch(setCourseSectionData(courseData.courseDetails.courseContent));
            dispatch(setEntireCourseData(courseData.courseDetails));
            dispatch(setCompletedLectures(courseData.completedVideos));
            let lectures = 0;
            courseData?.courseDetails?.courseContent?.forEach((sec) => {
                lectures += sec.subSection.length;
            });
            dispatch(setTotalNoOfLectures(lectures));

            if (courseData.courseDetails.courseExpiryDate) {
                const formattedDate = format(
                    new Date(courseData.courseDetails.courseExpiryDate),
                    "dd MMM yy, HH:mm 'IST'"
                );
                setExpiryDateFormatted(formattedDate);
            }
        }
        getDetails();
    }, [courseId, token, dispatch]);

    const handleCloseExpiry = () => {
        setShowExpiry(false);
    };

    const textColorClass = darkTheme ? "text-white" : "text-richblack-900";
    const backgroundColorClass = darkTheme ? "bg-richblack-900" : "bg-white";
    const expiryBgClass = darkTheme ? "bg-richblack-800" : "bg-blue-100"; // Changed to a light blue
    const expiryTextClass = darkTheme ? "text-yellow-200" : "text-blue-700"; // Changed to a dark blue
    const expiryBorderClass = darkTheme ? "border-yellow-500" : "border-blue-500"; // Changed to a blue
    const closeIconClass = darkTheme ? "text-yellow-300 hover:text-yellow-400" : "text-blue-700 hover:text-blue-900"; // Changed to a blue

    return (
        <div className={`relative flex flex-col lg:flex-row lg:min-h-[calc(100vh-3.5rem)] ${backgroundColorClass} ${textColorClass}`}>
            <VideoDetailsSidebar setReviewModal={setReviewModal} />
            <div className="flex-1 overflow-auto p-6">
                {showExpiry && expiryDateFormatted && (
                    <div className={`relative ${expiryBgClass} border-l-4 ${expiryBorderClass} ${expiryTextClass} p-4 mb-6 rounded-md shadow-md`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-semibold text-lg">Course Access Ends On:</p>
                                <p className="text-md">{expiryDateFormatted}</p>
                            </div>
                            <button
                                onClick={handleCloseExpiry}
                                className={`focus:outline-none ${closeIconClass}`}
                            >
                                <AiOutlineClose size={24} />
                            </button>
                        </div>
                    </div>
                )}
                <div className="mx-auto max-w-7xl">
                    <Outlet />
                </div>
            </div>
            {reviewModal && <CourseReviewModal setReviewModal={setReviewModal} />}
        </div>
    );
}