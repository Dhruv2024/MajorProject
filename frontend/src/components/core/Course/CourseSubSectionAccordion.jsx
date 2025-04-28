import React, { useContext, useEffect, useRef, useState } from "react"
import { AiOutlineDown } from "react-icons/ai"
import { HiOutlineVideoCamera } from "react-icons/hi"
import QuizIcon from '../../../assets/Images/quiz.png'
import { MdQuiz } from "react-icons/md";
import { AiOutlineYoutube } from "react-icons/ai";
import { SiGooglemeet } from "react-icons/si";

function CourseSubSectionAccordion({ subSec }) {
  return (
    <div>
      <div className="flex justify-between py-2">
        <div className={`flex items-center gap-2`}>
          <span>
            {
              subSec.type === 'recorded' ? <HiOutlineVideoCamera /> : subSec.type === 'youtube' ? <AiOutlineYoutube /> : subSec.type === 'videoCall' ? <SiGooglemeet /> : <MdQuiz className=" text-lg" />
            }
          </span>
          <p>{subSec?.title}</p>
        </div>
      </div>
    </div>
  )
}

export default CourseSubSectionAccordion