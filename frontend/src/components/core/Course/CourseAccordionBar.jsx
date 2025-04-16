import { useContext, useEffect, useRef, useState } from "react"
import { AiOutlineDown } from "react-icons/ai"

import CourseSubSectionAccordion from "./CourseSubSectionAccordion"
import { ThemeContext } from "../../../provider/themeContext"

export default function CourseAccordionBar({ course, isActive, handleActive }) {
  const contentEl = useRef(null)
  const { darkTheme } = useContext(ThemeContext);
  // Accordian state
  const [active, setActive] = useState(false)
  useEffect(() => {
    setActive(isActive?.includes(course._id))
  }, [isActive])
  const [sectionHeight, setSectionHeight] = useState(0)
  useEffect(() => {
    setSectionHeight(active ? contentEl.current.scrollHeight : 0)
  }, [active])

  return (
    <div className={`overflow-hidden border border-solid last:mb-0 font-semibold ${darkTheme ? "border-richblack-600 bg-richblack-700 text-richblack-5" : "border-richblack-5 bg-blue-5 text-richblack-800"}`}>
      <div>
        <div
          className={`flex cursor-pointer items-start justify-between bg-opacity-20 px-7  py-6 transition-[0.3s]`}
          onClick={() => {
            handleActive(course._id)
          }}
        >
          <div className="flex items-center gap-2">
            <i
              className={
                isActive.includes(course._id) ? "rotate-180" : "rotate-0"
              }
            >
              <AiOutlineDown />
            </i>
            <p>{course?.sectionName}</p>
          </div>
          <div className="space-x-4">
            <span className={`${darkTheme ? "text-yellow-25" : "text-blue-300"}`}>
              {
                course?.sectionName === "Course Quizzes" ? <div>{`${course.subSection.length || 0} Quiz(s)`}</div> : <div>{`${course.subSection.length || 0} lecture(s)`}</div>
              }

            </span>
          </div>
        </div>
      </div>
      <div
        ref={contentEl}
        className={`relative h-0 overflow-hidden transition-[height] duration-[0.35s] ease-[ease] ${darkTheme ? "bg-richblack-900" : "bg-blue-5"}`}
        style={{
          height: sectionHeight,
        }}
      >
        <div className="text-textHead flex flex-col gap-2 px-7 py-6 font-medium">
          {course?.subSection?.map((subSec, i) => {
            return <CourseSubSectionAccordion subSec={subSec} key={i} />
          })}
        </div>
      </div>
    </div>
  )
}