import React, { useContext, useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { IconBtn } from '../../common/IconBtn';
import { BsChevronDown } from "react-icons/bs"
import { IoIosArrowBack } from "react-icons/io"
import { MdKeyboardArrowUp } from "react-icons/md";
import { MdKeyboardArrowDown } from "react-icons/md";
import { CiChat1 } from "react-icons/ci";
import { ThemeContext } from '../../../provider/themeContext';

const VideoDetailsSidebar = ({ setReviewModal }) => {

    const [activeStatus, setActiveStatus] = useState("");
    const [videoBarActive, setVideoBarActive] = useState("");
    const navigate = useNavigate();
    const location = useLocation();
    const [open, setOpen] = useState(true);
    const { sectionId, subSectionId } = useParams();
    const {
        courseSectionData,
        courseEntireData,
        totalNoOfLectures,
        completedLectures,
    } = useSelector((state) => state.viewCourse);
    const { room } = courseEntireData;
    useEffect(() => {
        const setActiveFlags = () => {
            if (!courseSectionData.length)
                return;
            const currentSectionIndex = courseSectionData.findIndex(
                (data) => data._id === sectionId
            )
            const currentSubSectionIndex = courseSectionData?.[currentSectionIndex]?.subSection.findIndex(
                (data) => data._id === subSectionId
            )
            const activeSubSectionId = courseSectionData[currentSectionIndex]?.subSection?.[currentSubSectionIndex]?._id;
            //set current section here
            setActiveStatus(courseSectionData?.[currentSectionIndex]?._id);
            //set current sub-section here
            setVideoBarActive(activeSubSectionId);
        }
        setActiveFlags();
    }, [courseSectionData, courseEntireData, location.pathname])

    const handleAddReview = () => {
        console.log("I am inside Add handleAddReview")
        setReviewModal(true);
    }
    const { darkTheme } = useContext(ThemeContext);

    return (
        <>
            <div className={`flex lg:h-[calc(100vh-3.5rem)] w-[320px] max-w-[350px] flex-col border-r-[1px] ${darkTheme ? "border-r-richblack-700 bg-richblack-800" : "bg-richblack-5 border-r-richblack-25"}`}>
                <div className={`mx-5 flex flex-col items-start justify-between gap-2 gap-y-4 border-b border-richblack-600 py-5 text-lg font-bold ${darkTheme ? "text-richblack-25" : "text-blue-100"}`}>
                    <div className="flex w-full items-center justify-between ">
                        <div
                            onClick={() => {
                                navigate(`/dashboard/enrolled-courses`)
                            }}
                            className={`cursor-pointer flex h-[35px] w-[35px] items-center justify-center rounded-full  p-1 text-richblack-700  hover:scale-90 ${darkTheme ? " bg-richblack-100" : "bg-richblack-5"}`}
                            title="back"
                        >
                            <IoIosArrowBack size={30} />
                        </div>
                        <IconBtn
                            text="Add Review"
                            customClasses="ml-auto bg-richblack-5 border-richblack-500"
                            onclick={() => setReviewModal(true)}
                            darkTheme={darkTheme}
                        />
                    </div>
                    <div className="flex flex-col">
                        <div className='flex justify-between w-[300px]'>
                            <p>{courseEntireData?.courseName}</p>
                            <div onClick={() => {
                                setOpen(!open)
                            }}>
                                {
                                    open &&
                                    <MdKeyboardArrowUp />
                                }
                                {
                                    !open &&
                                    <MdKeyboardArrowDown />
                                }
                            </div>
                        </div>
                        <p className="text-sm font-semibold text-richblack-500 flex justify-between">
                            <div>{completedLectures?.length} / {totalNoOfLectures}</div>
                        </p>
                    </div>
                </div>

                {
                    open &&
                    <div className="h-[calc(100vh - 5rem)] overflow-y-auto">
                        {courseSectionData.map((section, index) => (
                            <div
                                className="mt-2 cursor-pointer text-sm text-richblack-5"
                                onClick={() => setActiveStatus(section?._id)}
                                key={index}
                            >
                                {/* Section */}
                                <div className={`flex flex-row justify-between px-5 py-4 ${darkTheme ? "bg-richblack-600" : "bg-blue-25 text-black"}`}>
                                    <div className="w-[70%] font-semibold">
                                        {section?.sectionName}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {/* <span className="text-[12px] font-medium">
                      Lession {course?.subSection.length}
                    </span> */}
                                        <span
                                            className={`${activeStatus === section?.sectionName
                                                ? "rotate-0"
                                                : "rotate-180"
                                                } transition-all duration-500`}
                                        >
                                            <BsChevronDown />
                                        </span>
                                    </div>
                                </div>

                                {/* Sub Sections */}
                                {activeStatus === section?._id && (
                                    <div className="transition-[height] duration-500 ease-in-out">
                                        {section.subSection.map((topic, i) => (
                                            <div
                                                className={`flex gap-3  px-5 py-2 ${videoBarActive === topic._id
                                                    ? `font-semibold ${darkTheme ? "bg-yellow-200 text-richblack-800" : "bg-blue-5 text-black"}`
                                                    : `${darkTheme ? "hover:bg-richblack-900" : "text-richblack-600"}`
                                                    } `}
                                                key={i}
                                                onClick={() => {
                                                    navigate(
                                                        `/view-course/${courseEntireData?._id}/section/${section?._id}/sub-section/${topic?._id}`
                                                    )
                                                    setVideoBarActive(topic._id)
                                                }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={completedLectures.includes(topic?._id)}
                                                    onChange={() => { }}
                                                />
                                                {topic.title}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                }
            </div>
        </>
    )
}

export default VideoDetailsSidebar
