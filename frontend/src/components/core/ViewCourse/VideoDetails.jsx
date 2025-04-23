import React, { useContext, useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"
import "video-react/dist/video-react.css"
import { useLocation } from "react-router-dom"
import { BigPlayButton, Player } from "video-react"
import { markLectureAsComplete } from "../../../services/operations/courseDetailsAPI"
import { updateCompletedLectures } from "../../../slices/viewCourseSlice"
import { IconBtn } from "../../common/IconBtn"
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io"
import { ThemeContext } from "../../../provider/themeContext"
import { generateSummary } from "../../../services/operations/summaryAPI"
import { FaRegClosedCaptioning } from "react-icons/fa";
import { MdDateRange } from "react-icons/md";
import { getQuizResult } from "../../../services/operations/quizAPI"
import QuizResultPopup from "../Quiz/ResultPopup"
import VideoCallLink from "./VideoCallLink"
import { formatDateTime } from "../../../utils/formatDateTime"
import { buyCourse } from "../../../services/operations/studentFeaturesAPI"
import { ConfirmationModal } from "../../common/ConfirmationModal"

const VideoDetails = () => {
    const { courseId, sectionId, subSectionId } = useParams();
    const { darkTheme } = useContext(ThemeContext);
    const navigate = useNavigate()
    const location = useLocation()
    const playerRef = useRef(null)
    const dispatch = useDispatch()
    const { token } = useSelector((state) => state.auth)
    const { courseSectionData,
        courseEntireData,
        completedLectures } =
        useSelector((state) => state.viewCourse);
    const { courseExpiryDate } = courseEntireData;
    const [courseExpired, setCourseExpired] = useState(false);
    useEffect(() => {
        if (courseExpiryDate) {
            // Get the current time as a Date object
            const currentTime = new Date();

            // Parse the ISO string into a Date object
            const targetTime = new Date(courseExpiryDate);

            if (targetTime < currentTime) {
                setCourseExpired(true);
            }
        }
    }, [courseExpiryDate]);
    // console.log(courseExpired);
    // console.log(courseExpiryDate)
    // console.log(completedLectures);
    // console.log(courseEntireData);
    const [isEnrollmentOpen, setIsEnrollmentOpen] = useState(true);
    useEffect(() => {
        setIsEnrollmentOpen(courseEntireData.enrollmentOpen);
    }, [courseEntireData.enrollmentOpen])
    const [videoData, setVideoData] = useState([])
    const [previewSource, setPreviewSource] = useState("")
    const [videoEnded, setVideoEnded] = useState(false)
    const [loading, setLoading] = useState(false)
    const [videoResource, setVideoResource] = useState("");
    const [open, setOpen] = useState(false);
    const [captionsEnabled, setCaptionsEnabled] = useState(true);  // Track captions state
    const [summary, setSummary] = useState(null); // Changed to store summary data
    const [isSummaryPopupOpen, setSummaryPopupOpen] = useState(false); // Track summary popup visibility
    const [type, setType] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [quizStartTime, setQuizStartTime] = useState(null);
    const [quizEndTime, setQuizEndTime] = useState(null);
    const [quizId, setQuizId] = useState(null);
    const [meetDetails, setMeetDetails] = useState(null);
    const [completed, setCompleted] = useState(completedLectures.includes(subSectionId));
    useEffect(() => {
        const subSectionCompleted = completedLectures.includes(subSectionId);
        // console.log(subSectionCompleted);
        setCompleted(subSectionCompleted);
    }, [courseId, sectionId, subSectionId, completedLectures])

    useEffect(() => {
        setSummary(false);
    }, [courseId, sectionId, subSectionId])
    // console.log(completedLectures);
    // Detect full-screen state change
    useEffect(() => {
        const handleFullScreenChange = () => {
            if (document.fullscreenElement) {
                setIsFullScreen(true);
            } else {
                setIsFullScreen(false);
            }
        };

        document.addEventListener("fullscreenchange", handleFullScreenChange);

        return () => {
            document.removeEventListener("fullscreenchange", handleFullScreenChange);
        };
    }, []);
    // console.log(quizStartTime);
    // Update current time every second
    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(intervalId);
    }, []);
    useEffect(() => {
        async function getVideoDetails() {
            if (!courseSectionData.length) return
            if (!courseId && !sectionId && !subSectionId) {
                navigate(`/dashboard/enrolled-courses`)
            } else {
                console.log(courseSectionData)
                const filteredData = courseSectionData.filter(
                    (course) => course._id === sectionId
                )
                const filteredVideoData = filteredData?.[0]?.subSection.filter(
                    (data) => data._id === subSectionId
                )
                console.log("printing filtered data");
                console.log(filteredData);

                console.log("printing filtered video data");
                console.log(filteredVideoData);

                if (filteredVideoData[0]?.type === "quiz") {
                    setType("quiz");
                    setQuizStartTime(new Date(filteredVideoData[0]?.quiz?.startTime));
                    setQuizEndTime(new Date(filteredVideoData[0]?.quiz?.endTime))
                    setQuizId(filteredVideoData[0]?.quiz?._id);
                }
                else if (filteredVideoData[0]?.type === "recorded") {
                    setType("recorded");
                    setVideoData(filteredVideoData[0])
                    setPreviewSource(courseEntireData.thumbnail)
                    setVideoEnded(false)
                    setVideoResource(filteredVideoData[0]?.resource)
                }
                else if (filteredVideoData[0]?.type === "videoCall") {
                    setType("videoCall");
                    setMeetDetails(filteredVideoData[0]);
                }
            }
        }
        getVideoDetails();
    }, [courseSectionData, courseEntireData, location.pathname])

    // Toggle captions on and off
    const toggleCaptions = () => {
        setCaptionsEnabled(!captionsEnabled);
    }

    const isFirstVideo = () => {
        const currentSectionIndx = courseSectionData.findIndex(
            (data) => data._id === sectionId
        )

        const currentSubSectionIndx = courseSectionData[
            currentSectionIndx
        ].subSection.findIndex((data) => data._id === subSectionId)

        return currentSectionIndx === 0 && currentSubSectionIndx === 0
    }

    const goToNextVideo = () => {
        const currentSectionIndx = courseSectionData.findIndex(
            (data) => data._id === sectionId
        )

        const noOfSubsections =
            courseSectionData[currentSectionIndx].subSection.length

        const currentSubSectionIndx = courseSectionData[
            currentSectionIndx
        ].subSection.findIndex((data) => data._id === subSectionId)

        if (currentSubSectionIndx !== noOfSubsections - 1) {
            const nextSubSectionId =
                courseSectionData[currentSectionIndx].subSection[
                    currentSubSectionIndx + 1
                ]._id
            navigate(
                `/view-course/${courseId}/section/${sectionId}/sub-section/${nextSubSectionId}`
            )
        } else {
            const nextSectionId = courseSectionData[currentSectionIndx + 1]._id
            const nextSubSectionId =
                courseSectionData[currentSectionIndx + 1].subSection[0]._id
            navigate(
                `/view-course/${courseId}/section/${nextSectionId}/sub-section/${nextSubSectionId}`
            )
        }
    }

    const isLastVideo = () => {
        const currentSectionIndx = courseSectionData.findIndex(
            (data) => data._id === sectionId
        )

        const noOfSubsections =
            courseSectionData[currentSectionIndx].subSection.length

        const currentSubSectionIndx = courseSectionData[
            currentSectionIndx
        ].subSection.findIndex((data) => data._id === subSectionId)

        return (
            currentSectionIndx === courseSectionData.length - 1 &&
            currentSubSectionIndx === noOfSubsections - 1
        )
    }

    const goToPrevVideo = () => {
        const currentSectionIndx = courseSectionData.findIndex(
            (data) => data._id === sectionId
        )

        const currentSubSectionIndx = courseSectionData[
            currentSectionIndx
        ].subSection.findIndex((data) => data._id === subSectionId)

        if (currentSubSectionIndx !== 0) {
            const prevSubSectionId =
                courseSectionData[currentSectionIndx].subSection[
                    currentSubSectionIndx - 1
                ]._id
            navigate(
                `/view-course/${courseId}/section/${sectionId}/sub-section/${prevSubSectionId}`
            )
        } else {
            const prevSectionId = courseSectionData[currentSectionIndx - 1]._id
            const prevSubSectionLength =
                courseSectionData[currentSectionIndx - 1].subSection.length
            const prevSubSectionId =
                courseSectionData[currentSectionIndx - 1].subSection[
                    prevSubSectionLength - 1
                ]._id
            navigate(
                `/view-course/${courseId}/section/${prevSectionId}/sub-section/${prevSubSectionId}`
            )
        }
    }

    const handleLectureCompletion = async () => {
        setLoading(true)
        const res = await markLectureAsComplete(
            { courseId: courseId, subSectionId: subSectionId },
            token
        )
        if (res) {
            dispatch(updateCompletedLectures(subSectionId))
        }
        setLoading(false)
    }
    let videoResourceItems = [];
    if (videoResource) {
        let temp = JSON.stringify(videoResource)
        temp = temp.slice(1, -1).replace(/\\r\\n/g, '\r\n');
        videoResourceItems = temp.split(/\r?\n/);
    }

    const handleGenerateSummary = async () => {
        const res = await dispatch(generateSummary(videoData?.videoUrl, token));
        setSummary(res);
        setSummaryPopupOpen(true); // Open the summary popup once it's generated
    }

    const handleShowSummary = () => {
        setSummaryPopupOpen(true);
    }

    const [showQuizResult, setQuizResult] = useState(null);
    const handleShowResult = async () => {
        if (type !== 'quiz') {
            return;
        }
        const result = await getQuizResult(quizId, token);
        // console.log(result);
        setQuizResult(result);
    }
    const handleCloseResult = async () => {
        setQuizResult(null);
    }
    // console.log(summary);
    // console.log(isSummaryPopupOpen);
    const { user } = useSelector((state) => state.profile);
    const [confirmationModal, setConfirmationModal] = useState(null);
    const handleEnrollAgain = async () => {
        // alert("to be handled");
        if (token) {
            const reEnroll = true
            buyCourse(token, [courseId], user, navigate, dispatch, reEnroll);
            return
        }
        setConfirmationModal({
            text1: "You are not logged in!",
            text2: "Please login to Purchase Course.",
            btn1Text: "Login",
            btn2Text: "Cancel",
            btn1Handler: () => navigate("/login"),
            btn2Handler: () => setConfirmationModal(null),
        })
    }

    return (
        <div className="flex flex-col gap-5 text-white">
            {
                type === "recorded" ? (
                    <div>
                        {!videoData ? (
                            <img
                                src={previewSource}
                                alt="Preview"
                                className="h-full w-full rounded-md object-cover"
                            />
                        ) : (
                            courseExpired ? (
                                <div className="bg-white p-8 rounded-lg shadow-md text-center">
                                    <div className="flex justify-center items-center mb-6">
                                        <svg
                                            className="w-10 h-10 text-red mr-3"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                        <h2 className="text-xl font-semibold text-pure-greys-800">
                                            Course Access Expired
                                        </h2>
                                    </div>
                                    <p className="text-pure-greys-600 mb-4">
                                        Your enrollment period for this course has ended. To regain access to:
                                    </p>
                                    <ul className="list-disc list-inside text-pure-greys-600 mb-4">
                                        <li>Lectures</li>
                                        <li>Unattempted Quizzes</li>
                                        <li>Live Meetings</li>
                                    </ul>
                                    {
                                        isEnrollmentOpen ? (
                                            <button
                                                onClick={handleEnrollAgain} // Assuming handleEnrollAgain is defined in your component
                                                className="bg-caribbeangreen-500 hover:bg-caribbeangreen-700 text-white font-bold py-3 px-6 rounded-full focus:outline-none focus:ring-2 focus:ring-green-400"
                                            >
                                                Re-enroll Now
                                            </button>
                                        ) : (
                                            <div>Enrollement will open on :{formatDateTime(courseEntireData.enrollmentOpenAt)}</div>
                                        )
                                    }
                                    <p className="mt-4 text-sm text-pure-greys-500">
                                        Have questions? <a href="#" className="text-blue-500 hover:underline">Contact Support</a>
                                    </p>
                                </div>
                            ) : (
                                <div className="relative">
                                    <Player
                                        ref={playerRef}
                                        aspectRatio="16:9"
                                        playsInline
                                        onEnded={() => setVideoEnded(true)}
                                        src={videoData?.videoUrl}
                                        crossOrigin='anonymous'
                                    >
                                        {
                                            captionsEnabled && videoData?.vttFileUrl && (
                                                <track
                                                    label="English"
                                                    kind="subtitles"
                                                    srcLang="en"
                                                    src={videoData.vttFileUrl}
                                                    default
                                                    crossOrigin="anonymous" // Allow cross-origin subtitles
                                                />
                                            )
                                        }
                                        <BigPlayButton position="center" />
                                        {/* Render When Video Ends */}
                                        {videoEnded && (
                                            <div
                                                style={{
                                                    backgroundImage:
                                                        "linear-gradient(to top, rgb(0, 0, 0), rgba(0,0,0,0.7), rgba(0,0,0,0.5), rgba(0,0,0,0.1) ",
                                                }}
                                                className="full absolute inset-0 z-[100] grid h-full place-content-center font-inter"
                                            >
                                                {!completedLectures.includes(subSectionId) && (
                                                    <IconBtn
                                                        disabled={loading}
                                                        onclick={() => handleLectureCompletion()}
                                                        text={!loading ? "Mark As Completed" : "Loading..."}
                                                        customClasses="text-xl max-w-max px-4 mx-auto"
                                                    />
                                                )}
                                                <IconBtn
                                                    disabled={loading}
                                                    onclick={() => {
                                                        if (playerRef?.current) {
                                                            playerRef?.current?.seek(0)
                                                            playerRef?.current?.play()
                                                            setVideoEnded(false)
                                                        }
                                                    }}
                                                    text="Rewatch"
                                                    customClasses="text-xl max-w-max px-4 mx-auto mt-2"
                                                />
                                                <div className="mt-10 flex min-w-[250px] justify-center gap-x-4 text-xl">
                                                    {!isFirstVideo() && (
                                                        <button
                                                            disabled={loading}
                                                            onClick={goToPrevVideo}
                                                            className="blackButton"
                                                        >
                                                            Prev
                                                        </button>
                                                    )}
                                                    {!isLastVideo() && (
                                                        <button
                                                            disabled={loading}
                                                            onClick={goToNextVideo}
                                                            className="blackButton"
                                                        >
                                                            Next
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </Player>

                                    {/* Overlapping icon for captions toggle */}
                                    {
                                        videoData?.vttFileUrl && (
                                            <div
                                                className="absolute top-4 left-4 z-50 cursor-pointer"
                                                onClick={toggleCaptions}
                                            >
                                                <FaRegClosedCaptioning className={`text-2xl ${captionsEnabled ? "text-blue-100" : "text-white"}`} />
                                            </div>
                                        )
                                    }
                                </div>
                            )
                        )}
                        {
                            !courseExpired && (
                                <div className="flex justify-between items-center">
                                    <h1 className={`mt-4 text-3xl font-semibold ${!darkTheme && "text-richblack-800"}`}>{videoData?.title}</h1>
                                    {
                                        !summary && (
                                            <button
                                                className={`pr-20 ${!darkTheme && "text-blue-200 font-semibold"}`}
                                                onClick={handleGenerateSummary}
                                            >
                                                Generate Summary
                                            </button>
                                        )
                                    }
                                    {
                                        summary && (
                                            <button
                                                className={`pr-20 ${!darkTheme && "text-blue-200 font-semibold"}`}
                                                onClick={handleShowSummary}
                                            >
                                                Show Summary
                                            </button>
                                        )
                                    }
                                </div>
                            )
                        }
                        {
                            !courseExpired && (
                                <p className={`pt-1 pb-3 font-inter ${!darkTheme && "text-richblack-400"}`}>{videoData?.description}</p>
                            )
                        }

                        {/* Video Resources */}
                        {!courseExpired && (videoResourceItems.length > 1 || (videoResourceItems.length === 1 && videoResourceItems[0] !== "")) && (
                            <div className="flex flex-col pb-10">
                                <div
                                    className="flex items-center gap-1 font-semibold text-red text-2xl mb-2 cursor-pointer"
                                    onClick={() => {
                                        setOpen(!open);
                                    }}
                                >
                                    {open ? <IoIosArrowDown /> : <IoIosArrowForward />}
                                    <h1>Video Resources</h1>
                                </div>
                                {open && (
                                    <ul className="list-disc">
                                        {videoResourceItems.map((ele, index) => (
                                            <li key={index} className="ml-10 font-normal">{ele}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}

                        {/* Popup for Showing Summary */}
                        {!courseExpired && isSummaryPopupOpen && summary && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                                <div className="bg-white text-black p-6 rounded-lg max-w-lg w-full">
                                    <h2 className="text-xl font-semibold mb-4">Summary</h2>
                                    <div
                                        className="summary-content"
                                        dangerouslySetInnerHTML={{ __html: summary }}
                                    />
                                    <button
                                        className="mt-4 text-blue-500 font-semibold"
                                        onClick={() => setSummaryPopupOpen(false)}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    type === "videoCall" ? (
                        <div>
                            !courseExpired?(
                            <div>
                                <VideoCallLink data={meetDetails} handleLectureCompletion={handleLectureCompletion} completed={completed} />
                            </div>
                            ):(
                            <div className="bg-white p-8 rounded-lg shadow-md text-center">
                                <div className="flex justify-center items-center mb-6">
                                    <svg
                                        className="w-10 h-10 text-red mr-3"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    <h2 className="text-xl font-semibold text-pure-greys-800">
                                        Course Access Expired
                                    </h2>
                                </div>
                                <p className="text-pure-greys-600 mb-4">
                                    Your enrollment period for this course has ended. To regain access to:
                                </p>
                                <ul className="list-disc list-inside text-pure-greys-600 mb-4">
                                    <li>Lectures</li>
                                    <li>Unattempted Quizzes</li>
                                    <li>Live Meetings</li>
                                </ul>
                                {
                                    isEnrollmentOpen ? (
                                        <button
                                            onClick={handleEnrollAgain} // Assuming handleEnrollAgain is defined in your component
                                            className="bg-caribbeangreen-500 hover:bg-caribbeangreen-700 text-white font-bold py-3 px-6 rounded-full focus:outline-none focus:ring-2 focus:ring-green-400"
                                        >
                                            Re-enroll Now
                                        </button>
                                    ) : (
                                        <div>Enrollement will open on :{formatDateTime(courseEntireData.enrollmentOpenAt)}</div>
                                    )
                                }
                                <p className="mt-4 text-sm text-pure-greys-500">
                                    Have questions? <a href="#" className="text-blue-500 hover:underline">Contact Support</a>
                                </p>
                            </div>
                            )
                        </div>
                    ) : (
                        <div className="text-red space-y-4">

                            {
                                quizStartTime && quizEndTime && currentTime ? (
                                    courseExpired ? (
                                        <div className="bg-white p-8 rounded-lg shadow-md text-center">
                                            <div className="flex justify-center items-center mb-6">
                                                <svg
                                                    className="w-10 h-10 text-red mr-3"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                    />
                                                </svg>
                                                <h2 className="text-xl font-semibold text-pure-greys-800">
                                                    Course Access Expired
                                                </h2>
                                            </div>
                                            <p className="text-pure-greys-600 mb-4">
                                                Your enrollment period for this course has ended. To regain access to:
                                            </p>
                                            <ul className="list-disc list-inside text-pure-greys-600 mb-4">
                                                <li>Lectures</li>
                                                <li>Unattempted Quizzes</li>
                                                <li>Live Meetings</li>
                                            </ul>
                                            {
                                                isEnrollmentOpen ? (
                                                    <button
                                                        onClick={handleEnrollAgain} // Assuming handleEnrollAgain is defined in your component
                                                        className="bg-caribbeangreen-500 hover:bg-caribbeangreen-700 text-white font-bold py-3 px-6 rounded-full focus:outline-none focus:ring-2 focus:ring-green-400"
                                                    >
                                                        Re-enroll Now
                                                    </button>
                                                ) : (
                                                    <div>Enrollement will open on :{formatDateTime(courseEntireData.enrollmentOpenAt)}</div>
                                                )
                                            }
                                            <p className="mt-4 text-sm text-pure-greys-500">
                                                Have questions? <a href="#" className="text-blue-500 hover:underline">Contact Support</a>
                                            </p>
                                        </div>
                                    ) : (
                                        quizStartTime.getTime() <= currentTime.getTime() && currentTime.getTime() <= quizEndTime.getTime() ? (
                                            <div className="text-caribbeangreen-400 rounded-lg p-4 shadow-md">
                                                <div className="text-xl font-semibold">📢 Quiz is <span className="text-green-600">LIVE</span></div>
                                                <div className="flex items-center gap-2 mt-2 text-sm">
                                                    <MdDateRange className="text-green-600" />
                                                    <span>Ends at: {quizEndTime.toLocaleString('en-US', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: 'numeric',
                                                        minute: '2-digit',
                                                        hour12: true
                                                    })}</span>
                                                </div>
                                                <div className="mt-4 flex justify-center">
                                                    {type === 'quiz' && !completed && (
                                                        <button
                                                            onClick={() => navigate(`/startQuiz/${courseId}/${subSectionId}/${quizId}`)}
                                                            className=" hover:bg-richblack-5 hover:text-black text-caribbeangreen-600 font-semibold py-2 px-4 transition duration-200 text-3xl border-2 border-richblack-25 rounded-full"
                                                        >
                                                            Start Test
                                                        </button>
                                                    )}
                                                    {type === 'quiz' && completed && (
                                                        <div className="flex flex-col items-center justify-center gap-4 p-6 rounded-md shadow-md bg-white">
                                                            <div className="text-2xl font-semibold text-caribbeangreen-600">
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 inline-block mr-2">
                                                                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-2 15l-5-5 1.414-1.414L10 13.172l7.586-7.586L19 7l-9 9-3 3z" clipRule="evenodd" />
                                                                </svg>
                                                                Quiz Attempted
                                                            </div>
                                                            <div className="text-center text-gray-600 text-lg">
                                                                Result will be announced when the quiz is over. Please check back later.
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : quizStartTime.getTime() > currentTime.getTime() ? (
                                            <div className="bg-yellow-100 text-yellow-800 rounded-lg p-4 shadow-md">
                                                <div className="text-xl font-semibold">🕒 Quiz is <span className="text-yellow-600">Scheduled</span></div>
                                                <div className="flex items-center gap-2 mt-2 text-sm">
                                                    <MdDateRange className="text-yellow-600" />
                                                    <span>Starts at: {quizStartTime.toLocaleString('en-US', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: 'numeric',
                                                        minute: '2-digit',
                                                        hour12: true
                                                    })}</span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-1 text-sm">
                                                    <MdDateRange className="text-yellow-600" />
                                                    <span>Ends at: {quizEndTime.toLocaleString('en-US', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: 'numeric',
                                                        minute: '2-digit',
                                                        hour12: true
                                                    })}</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-gray-100 text-gray-700 rounded-lg p-6 shadow-md flex flex-col items-center justify-center gap-4">
                                                {type === 'quiz' && !completed && (
                                                    <div className="bg-white border border-red-300 rounded-md p-6 flex flex-col items-center justify-center gap-4 w-full max-w-sm">
                                                        <div className="text-2xl font-semibold text-red-600 flex items-center">
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 inline-block mr-2">
                                                                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm3.707 8.293a1 1 0 00-1.414-1.414L12 10.586l-2.293-2.293a1 1 0 00-1.414 1.414L10.586 12l-2.293 2.293z" clipRule="evenodd" />
                                                            </svg>
                                                            Quiz Ended
                                                        </div>
                                                        <div className="text-center text-gray-700 font-medium">
                                                            You have not attempted this quiz.
                                                        </div>
                                                    </div>
                                                )}
                                                {type === 'quiz' && completed && (
                                                    <div className="bg-white border border-green-300 rounded-md p-6 flex flex-col items-center justify-center gap-4 w-full max-w-sm">
                                                        <div className="text-2xl font-semibold text-green-600 flex items-center">
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 inline-block mr-2">
                                                                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-2 15l-5-5 1.414-1.414L10 13.172l7.586-7.586L19 7l-9 9-3 3z" clipRule="evenodd" />
                                                            </svg>
                                                            Quiz Attempted
                                                        </div>
                                                        <button
                                                            className="mt-4 px-6 py-3 rounded-md bg-blue-500 text-white font-semibold hover:bg-blue-600 transition duration-200"
                                                            onClick={() => handleShowResult()}
                                                        >
                                                            Check Result
                                                        </button>
                                                    </div>
                                                )}
                                                {type === 'quiz' && (
                                                    <div className="flex items-center gap-2 mt-4 text-sm text-gray-600">
                                                        <MdDateRange className="text-red-600" />
                                                        <span>
                                                            Ended at:{' '}
                                                            {quizEndTime?.toLocaleString('en-US', {
                                                                weekday: 'long',
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric',
                                                                hour: 'numeric',
                                                                minute: '2-digit',
                                                                hour12: true,
                                                            })}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    )
                                ) : (
                                    <div className="text-gray-500 text-lg animate-pulse">⏳ Loading quiz info...</div>
                                )
                            }


                            {showQuizResult && (
                                <QuizResultPopup result={showQuizResult} onClose={handleCloseResult} />
                            )}

                            {/* Button to trigger the popup (for testing) */}
                            {/* <button onClick={() => handleShowResult(yourQuizResultData)}>Show Quiz Result</button> */}
                        </div>
                    )


                )
            }
            {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
        </div>
    )
}

export default VideoDetails;
