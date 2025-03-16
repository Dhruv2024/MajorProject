import React from "react";

// Importing React Icons
import { HiUsers } from "react-icons/hi";
import { ImTree } from "react-icons/im";

export const CourseCard = ({ cardData, currentCard, setCurrentCard, darkTheme }) => {
    return (
        <div
            className={`w-[300px] lg:w-[30%] ${currentCard === cardData?.heading
                ? `${darkTheme ? "bg-white shadow-[12px_12px_0_0] shadow-yellow-50" : " bg-blue-5 shadow-[12px_12px_0_0] shadow-richblack-100"}`
                : `${darkTheme ? "bg-richblack-800 text-richblack-25" : " bg-white text-richblack-500"}`
                }  h-[300px]box - border cursor - pointer rounded-xl`}
            onClick={() => setCurrentCard(cardData?.heading)}
        >
            <div className="border-b-[2px] border-richblack-400 border-dashed h-[80%] p-6 flex flex-col gap-3">
                <div
                    className={` ${currentCard === cardData?.heading && "text-richblack-800"
                        } font - semibold text - [20px]`}
                >
                    {cardData?.heading}
                </div>

                <div className="text-richblack-400">{cardData?.description}</div>
            </div>

            <div
                className={`flex justify-between ${currentCard === cardData?.heading ? "text-blue-300" : "text-richblack-300"
                    } px - 6 py - 3 font - medium mt-1`}
            >
                {/* Level */}
                <div className="flex items-center gap-2 text-[16px] ml-2">
                    <HiUsers />
                    <p>{cardData?.level}</p>
                </div>

                {/* Flow Chart */}
                <div className="flex items-center gap-2 text-[16px] mr-2">
                    <ImTree />
                    <p>{cardData?.lessonNumber} Lessons</p>
                </div>
            </div>
        </div>
    );
};