import React, { useContext, useEffect, useState } from 'react'
import RatingStars from '../../common/RatingStars'
import GetAvgRating from '../../../utils/avgRating';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../../../provider/themeContext';

const Course_Card = ({ course, Height }) => {


    const [avgReviewCount, setAvgReviewCount] = useState(0);

    useEffect(() => {
        const count = GetAvgRating(course.ratingAndReviews);
        setAvgReviewCount(count);
    }, [course])

    // console.log(course)
    // console.log(course?.instructor?.firstName);
    const { darkTheme } = useContext(ThemeContext);
    return (
        <>
            <Link to={`/courses/${course._id}`}>
                <div className="">
                    <div className="rounded-lg">
                        <img
                            src={course?.thumbnail}
                            alt="course thumnail"
                            className={`${Height} w-full rounded-xl object-cover `}
                        />
                    </div>
                    <div className="flex flex-col gap-2 px-1 py-3">
                        <p className={`text-xl ${darkTheme ? "text-richblack-5" : "text-richblack-800"}`}>{course?.courseName}</p>
                        <p className={`text-sm ${darkTheme ? "text-richblack-5" : "text-richblack-800"}`}>
                            {course?.instructor?.firstName} {course?.instructor?.lastName}
                        </p>
                        <div className="flex items-center gap-2">
                            <span className={`${darkTheme ? "text-yellow-5" : "text-black"}`}>{avgReviewCount || 0}</span>
                            <RatingStars Review_Count={avgReviewCount} />
                            <span className="text-richblack-400">
                                {course?.ratingAndReviews?.length} Ratings
                            </span>
                        </div>
                        <p className={`text-xl ${darkTheme ? "text-richblack-5" : "text-richblack-800"}`}>Rs. {course?.price}</p>
                    </div>
                </div>
            </Link>
        </>
    )
}

export default Course_Card
