import React from 'react'
import Instructor from "../../../assets/Images/Instructor.png"
import { HighlightText } from './HighlightText'
import { HomeButton } from './HomeButton'
import { FaArrowRight } from "react-icons/fa6";

export const InstructorSection = ({ darkTheme }) => {
    return (
        <div className='mt-16'>
            <div className='flex gap-20 items-center lg:flex-row flex-col'>
                <div className='lg:w-[50%] lg:rounded-none rounded-sm'>
                    <img
                        src={Instructor}
                        alt='Instructor Section image'
                        className='shadow-white'
                    />
                </div>
                <div className='w-50%] flex flex-col'>
                    <div className='text-4xl font-semibold w-[50%]'>
                        Become an <HighlightText text={"instructor"} />
                    </div>
                    <p className='font-medium text-[16px] w-[80%] text-richblack-300 mb-12'>
                        Instructors from around the world teach millions of students on EduSphere. We provide the tools and skills to teach what you love.
                    </p>

                    <div className='w-fit'>
                        <HomeButton active={true} linkTo={"/signup"}>
                            <div className='flex gap-2 items-center'>
                                Start Teaching Today
                                <FaArrowRight />
                            </div>
                        </HomeButton>
                    </div>

                </div>
            </div>
        </div>
    )
}
