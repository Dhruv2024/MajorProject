import React from 'react'
import { HomeButton } from './HomeButton'
import { FaArrowRight } from "react-icons/fa6";
import { TypeAnimation } from 'react-type-animation';

export const CodeBlocks = ({
    position, heading, subheading, button1, button2, codeblock, backgroundGradient, codeColor, darkTheme
}) => {
    return (
        <div className={`flex ${position} my-20 justify-between gap-10 flex-col`}>
            {/* Section 1 */}
            <div className={`lg:w-[50%] w-[100%] flex flex-col gap-8 ${darkTheme ? "text-white" : " text-richblack-600"}`}>
                {heading}
                <div className='text-richblack-300 font-bold'>
                    {subheading}
                </div>
                <div className='flex gap-7 mt-7'>
                    <HomeButton active={button1.active} linkTo={button1.linkTo}>
                        <div className='flex gap-2 items-center'>
                            {button1.btnText}
                            <FaArrowRight />
                        </div>
                    </HomeButton>
                    <HomeButton active={button2.active} linkTo={button2.linkTo}>
                        {button2.btnText}
                    </HomeButton>
                </div>
            </div>

            {/* Section 2 */}
            <div className='h-fit flex flex-row text-[10px] w-[100%] py-4 lg:w-[500px]'>

                <div className='text-center flex flex-col w-[10%] text-richblack-400 font-inter font-bold'>
                    <p>1</p>
                    <p>2</p>
                    <p>3</p>
                    <p>4</p>
                    <p>5</p>
                    <p>6</p>
                    <p>7</p>
                    <p>8</p>
                    <p>9</p>
                    <p>10</p>
                    <p>11</p>
                </div>

                <div className={`w-[90%] flex flex-col gap-2 font-bold font-mono ${codeColor} pr-2`}>
                    <TypeAnimation
                        sequence={[codeblock, 5000, ""]}
                        repeat={Infinity}
                        cursor={true}
                        style={
                            {
                                whiteSpace: "pre-line",
                                display: "block"
                            }
                        }
                        omitDeletionAnimation={true}
                    />
                </div>
            </div>
        </div>
    )
}
