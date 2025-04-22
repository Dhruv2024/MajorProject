import React, { useContext } from 'react';
import { HomeButton } from '../HomePage/HomeButton';
import { HighlightText } from '../HomePage/HighlightText';
import { ThemeContext } from '../../../provider/themeContext';

const LearningGridArray = [
    {
        order: -1,
        heading: "World-Class Learning for",
        highlightText: "Anyone, Anywhere",
        description:
            "EduSphere partners with more than 275+ leading universities and companies to bring flexible, affordable, job-relevant online learning to individuals and organizations worldwide.",
        BtnText: "Learn More",
        BtnLink: "/",
    },
    {
        order: 1,
        heading: "Curriculum Based on Industry Needs",
        description:
            "Save time and money! The Belajar curriculum is made to be easier to understand and in line with industry needs.",
    },
    {
        order: 2,
        heading: "Our Learning Methods",
        description:
            "EduSphere partners with more than 275+ leading universities and companies to bring",
    },
    {
        order: 3,
        heading: "Certification",
        description:
            "EduSphere partners with more than 275+ leading universities and companies to bring",
    },
    {
        order: 4,
        heading: `Rating "Auto-grading"`,
        description:
            "EduSphere partners with more than 275+ leading universities and companies to bring",
    },
    {
        order: 5,
        heading: "Ready to Work",
        description:
            "EduSphere partners with more than 275+ leading universities and companies to bring",
    },
];

export const LearningGrid = () => {
    const { darkTheme } = useContext(ThemeContext);

    return (
        <div className={`grid grid-cols-1 lg:grid-cols-4 mb-10 p-5 lg:w-fit ${darkTheme ? 'bg-richblack-900' : 'bg-white'}`}>
            {
                LearningGridArray.map((card, index) => {
                    return (
                        <div
                            key={index}
                            className={`${index === 0 && "lg:col-span-2 lg:h-[280px] p-5"} 
                                        ${card.order % 2 === 1 ?
                                    (darkTheme ? 'bg-richblack-700' : 'bg-gray-100') :
                                    (darkTheme ? 'bg-richblack-800' : 'bg-gray-50')
                                } 
                                        lg:h-[280px] p-5 
                                        ${card.order === 3 && "lg:col-start-2"}
                                        ${card.order < 0 && "bg-transparent"}`}
                        >
                            {
                                card.order < 0
                                    ? (
                                        <div className={`lg:w-[90%] flex flex-col pb-5 gap-3 ${darkTheme ? 'text-white' : 'text-richblack-900'}`}>
                                            <div className='text-4xl font-semibold'>
                                                {card.heading}
                                                <HighlightText text={card.highlightText} />
                                            </div>
                                            <p className={`font-medium ${darkTheme ? 'text-richblack-300' : 'text-richblack-700'}`}>
                                                {card.description}
                                            </p>
                                            <div className='w-fit mt-4'>
                                                <HomeButton active={true} linkto={card.BtnLink}>
                                                    {card.BtnText}
                                                </HomeButton>
                                            </div>
                                        </div>
                                    )
                                    : (
                                        <div className={`flex flex-col gap-8 p-7 ${darkTheme ? 'text-white' : 'text-richblack-900'}`}>
                                            <h1 className={`${darkTheme ? 'text-richblack-200' : 'text-richblack-600'} text-lg`}>
                                                {card.heading}
                                            </h1>
                                            <p className={`font-medium ${darkTheme ? 'text-richblack-300' : 'text-gray-800'}`}>
                                                {card.description}
                                            </p>
                                        </div>
                                    )
                            }
                        </div>
                    );
                })
            }
        </div>
    );
};
