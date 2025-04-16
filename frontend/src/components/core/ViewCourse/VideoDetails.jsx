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

const VideoDetails = () => {
    const { courseId, sectionId, subSectionId } = useParams();
    const { darkTheme } = useContext(ThemeContext);
    const navigate = useNavigate()
    const location = useLocation()
    const playerRef = useRef(null)
    const dispatch = useDispatch()
    const { token } = useSelector((state) => state.auth)
    const { courseSectionData, courseEntireData, completedLectures } =
        useSelector((state) => state.viewCourse)

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
    useEffect(() => {
        setSummary(false);
    }, [courseId, sectionId, subSectionId])

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
                }
                else {
                    setType("recorded");
                    setVideoData(filteredVideoData[0])
                    setPreviewSource(courseEntireData.thumbnail)
                    setVideoEnded(false)
                    setVideoResource(filteredVideoData[0]?.resource)
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


    // console.log(summary);
    // console.log(isSummaryPopupOpen);
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
                        )}
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
                        <p className={`pt-1 pb-3 font-inter ${!darkTheme && "text-richblack-400"}`}>{videoData?.description}</p>

                        {/* Video Resources */}
                        {videoResourceItems.length > 1 || (videoResourceItems.length === 1 && videoResourceItems[0] !== "") && (
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
                        {isSummaryPopupOpen && summary && (
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
                    <div className="text-red text-3xl">
                        Will be available soon
                    </div>
                )
            }

        </div>
    )
}

export default VideoDetails;
