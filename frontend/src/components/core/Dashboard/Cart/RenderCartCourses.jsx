import React, { useContext, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { GiNinjaStar } from "react-icons/gi"
import { RiDeleteBin6Line } from "react-icons/ri"
import { removeFromCart } from '../../../../slices/cartSlice'
import ReactStars from "react-rating-stars-component";
import { ThemeContext } from '../../../../provider/themeContext'

const RenderCartCourses = () => {
    const { cart } = useSelector((state) => state.cart);
    const dispatch = useDispatch();
    const { darkTheme } = useContext(ThemeContext);

    useEffect(() => {
        const currentTime = new Date();

        cart.forEach((course) => {
            if (
                course?.enrollmentCloseAt &&
                new Date(course.enrollmentCloseAt) < currentTime
            ) {
                dispatch(removeFromCart(course._id));
                console.log(`⛔ Removed expired course from cart: ${course.courseName}`);
            }
        });
    }, [cart, dispatch]);

    return (
        <div className="flex flex-1 flex-col">
            {cart.map((course, indx) => (
                <div
                    key={course._id}
                    className={`flex w-full flex-wrap items-start justify-between gap-6 ${indx !== cart.length - 1 && "border-b border-b-richblack-400 pb-6"} ${indx !== 0 && "mt-6"} `}
                >
                    <div className="flex flex-1 flex-col gap-4 xl:flex-row">
                        <img
                            src={course?.thumbnail}
                            alt={course?.courseName}
                            className="h-[148px] w-[220px] rounded-lg object-cover"
                        />
                        <div className="flex flex-col space-y-1">
                            <p className="text-lg font-medium text-richblack-5">
                                {course?.courseName}
                            </p>
                            <p className="text-sm text-richblack-300">
                                {course?.category?.name}
                            </p>
                            <div className="flex items-center gap-2">
                                <span className={darkTheme ? "text-yellow-5" : "text-blue-100"}>0</span>
                                <ReactStars
                                    count={5}
                                    value={course?.ratingAndReviews?.length}
                                    size={20}
                                    edit={false}
                                    activeColor="#ffd700"
                                    emptyIcon={<GiNinjaStar />}
                                    fullIcon={<GiNinjaStar />}
                                />
                                <span className="text-richblack-400">
                                    {course?.ratingAndReviews?.length} Ratings
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                        <button
                            onClick={() => dispatch(removeFromCart(course._id))}
                            className={`flex items-center gap-x-1 rounded-md border py-3 px-[12px] text-pink-200 ${darkTheme ? "border-richblack-600 bg-richblack-700" : "border-none"}`}
                        >
                            <RiDeleteBin6Line />
                            <span>Remove</span>
                        </button>
                        <p className={`mb-6 text-3xl font-medium ${darkTheme ? "text-yellow-100" : "text-blue-50"}`}>
                            ₹ {course?.price}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default RenderCartCourses;
