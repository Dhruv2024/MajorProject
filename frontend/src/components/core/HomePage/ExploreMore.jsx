import React from 'react'
import { HomePageExplore } from "../../../data/homepage-explore"
import { useState } from 'react';
import { HighlightText } from './HighlightText';
import { CourseCard } from './CourseCard';


const tabsName = [
    "Free",
    "New to coding",
    "Most popular",
    "Skills paths",
    "Career paths"
];

export const ExploreMore = ({ darkTheme }) => {

    const [currentTab, setCurrentTab] = useState(tabsName[0]);
    const [courses, setCourses] = useState(HomePageExplore[0].courses);
    const [currentCard, setCurrentCard] = useState(HomePageExplore[0].courses[0].heading)

    const setMyCards = (value) => {
        setCurrentTab(value);
        const result = HomePageExplore.filter((course) => course.tag === value);
        setCourses(result[0].courses);
        setCurrentCard(result[0].courses[0].heading);
    }


    return (
        <div>

            <div className='lg:text-4xl font-semibold text-center text-2xl'>
                Unlock the
                <HighlightText text={" Power of Code"} />
            </div>

            <p className='text-center text-richblack-300 text-sm text-[16px] mt-3'>
                Learn to build anything you can imagine
            </p>

            <div className={`mt-5 flex lg:flex-row flex-col rounded-full mb-5 
      px-1 py-1 items-center ${darkTheme ? "bg-richblack-800 border-richblack-100" : "bg-blue-25 border-blue-5"}`}>
                {
                    tabsName.map((element, index) => {
                        return (
                            darkTheme ? (
                                <div
                                    className={`lg:text-[16px] flex flex-row items-center gap-2 text-[12px]
                ${currentTab === element
                                            ? "bg-richblack-900 text-richblack-5 font-medium"
                                            : "text-richblack-200"} rounded-full transition-all duration-200 cursor-pointer
                hover:bg-richblack-900 hover:text-richblack-5 px-7 py-2`}
                                    key={index}
                                    onClick={() => setMyCards(element)}
                                >
                                    {element}
                                </div>
                            ) : (
                                <div
                                    className={`lg:text-[16px] flex flex-row items-center gap-2 text-[12px]
                ${currentTab === element
                                            ? "bg-white text-black font-medium"
                                            : "text-richblack-300"} rounded-full transition-all duration-200 cursor-pointer
                hover:bg-richblack-5 hover:text-richblack-300 px-7 py-2`}
                                    key={index}
                                    onClick={() => setMyCards(element)}
                                >
                                    {element}
                                </div>
                            )
                        )
                    })
                }

            </div>

            <div className='hidden lg:block lg:h-[200px]'></div>


            <div className='lg:absolute gap-10 justify-center lg:gap-0 flex lg:justify-between flex-wrap w-full lg:bottom-[0] lg:left-[50%] lg:translate-x-[-50%] lg:translate-y-[50%] text-black lg:mb-0 mb-7 lg:px-0 px-3'>
                {
                    courses.map((element, index) => {
                        return (
                            <CourseCard
                                key={index}
                                cardData={element}
                                currentCard={currentCard}
                                setCurrentCard={setCurrentCard}
                                darkTheme={darkTheme}
                            />
                        )
                    })
                }
            </div>


        </div>
    )
}
