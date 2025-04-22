import React, { useContext, useEffect, useState } from "react";
import ReactStars from "react-rating-stars-component";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";
import "../../App.css";
import { FaStar } from "react-icons/fa";
import { Autoplay, FreeMode, Pagination } from "swiper/modules";
import { apiConnector } from "../../services/apiConnector";
import { ratingsEndpoints } from "../../services/apis";
import { ThemeContext } from "../../provider/themeContext";

function ReviewSlider() {
    const [reviews, setReviews] = useState([]);
    const truncateWords = 20;
    const [loading, setLoading] = useState(false);
    const { darkTheme } = useContext(ThemeContext);

    useEffect(() => {
        async function fetchAllReviews() {
            setLoading(true);
            const { data } = await apiConnector("GET", ratingsEndpoints.REVIEWS_DETAILS_API);
            if (data?.success) {
                setReviews(data?.data);
            }
            setLoading(false);
        }
        fetchAllReviews();
    }, []);

    return (
        <div className="review-slider-container">
            {loading ? (
                <div className="loader-container">
                    <div className="loader"></div>
                </div>
            ) : reviews.length === 0 ? (
                <div className="no-reviews">No Reviews Available</div>
            ) : (
                <div className={`reviews ${darkTheme ? 'dark' : ''}`}>
                    <div className="desktop-slider my-[50px] hidden lg:block">
                        <Swiper
                            slidesPerView={4}
                            spaceBetween={25}
                            loop={true}
                            freeMode={true}
                            autoplay={{
                                delay: 2500,
                                disableOnInteraction: false,
                            }}
                            modules={[FreeMode, Pagination, Autoplay]}
                            className="w-full"
                        >
                            {reviews.map((review, i) => (
                                <SwiperSlide key={i}>
                                    <div className={`review-card ${darkTheme ? "bg-richblack-800" : "bg-richblack-5"} p-4 rounded-lg shadow-md hover:scale-105 transition-transform duration-300`}>
                                        <div className="review-header flex items-center gap-4 mb-3">
                                            <img
                                                src={
                                                    review?.user?.image
                                                        ? review?.user?.image
                                                        : `https://api.dicebear.com/5.x/initials/svg?seed=${review?.user?.firstName} ${review?.user?.lastName}`
                                                }
                                                alt=""
                                                className="user-avatar h-12 w-12 rounded-full object-cover"
                                            />
                                            <div className="user-details">
                                                <h1 className={`user-name font-semibold ${darkTheme ? "text-richblack-5" : "text-richblack-700"}`}>
                                                    {review?.user?.lastName
                                                        ? `${review?.user?.firstName} ${review?.user?.lastName}`
                                                        : review?.user?.firstName}
                                                </h1>
                                                <h2 className="course-name text-sm font-medium text-richblack-500">
                                                    {review?.course?.courseName}
                                                </h2>
                                            </div>
                                        </div>
                                        <p className={`review-text font-medium mb-3 ${darkTheme ? "text-richblack-25" : "text-richblack-700"}`}>
                                            {review?.review.split(" ").length > truncateWords
                                                ? `${review?.review
                                                    .split(" ")
                                                    .slice(0, truncateWords)
                                                    .join(" ")} ...`
                                                : review?.review}
                                        </p>
                                        <div className="rating flex items-center gap-2">
                                            <h3 className="rating-score font-semibold text-yellow-100">
                                                {review.rating.toFixed(1)}
                                            </h3>
                                            <ReactStars
                                                count={5}
                                                value={review.rating}
                                                size={20}
                                                edit={false}
                                                activeColor="#ffd700"
                                                emptyIcon={<FaStar />}
                                                fullIcon={<FaStar />}
                                            />
                                        </div>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>

                    <div className="mobile-slider my-[30px] lg:hidden">
                        <Swiper
                            slidesPerView={1}
                            spaceBetween={25}
                            loop={true}
                            freeMode={true}
                            autoplay={{
                                delay: 2500,
                                disableOnInteraction: false,
                            }}
                            modules={[FreeMode, Pagination, Autoplay]}
                            className="w-full"
                        >
                            {reviews.map((review, i) => (
                                <SwiperSlide key={i}>
                                    <div className="review-card bg-richblack-800 p-4 rounded-lg shadow-md hover:scale-105 transition-transform duration-300">
                                        <div className="review-header flex items-center gap-4 mb-3">
                                            <img
                                                src={
                                                    review?.user?.image
                                                        ? review?.user?.image
                                                        : `https://api.dicebear.com/5.x/initials/svg?seed=${review?.user?.firstName} ${review?.user?.lastName}`
                                                }
                                                alt=""
                                                className="user-avatar h-12 w-12 rounded-full object-cover"
                                            />
                                            <div className="user-details">
                                                <h1 className="user-name font-semibold text-richblack-5">
                                                    {review?.user?.lastName
                                                        ? `${review?.user?.firstName} ${review?.user?.lastName}`
                                                        : review?.user?.firstName}
                                                </h1>
                                                <h2 className="course-name text-sm font-medium text-richblack-500">
                                                    {review?.course?.courseName}
                                                </h2>
                                            </div>
                                        </div>
                                        <p className="review-text font-medium text-richblack-25 mb-3">
                                            {review?.review.split(" ").length > truncateWords
                                                ? `${review?.review
                                                    .split(" ")
                                                    .slice(0, truncateWords)
                                                    .join(" ")} ...`
                                                : review?.review}
                                        </p>
                                        <div className="rating flex items-center gap-2">
                                            <h3 className="rating-score font-semibold text-yellow-100">
                                                {review.rating.toFixed(1)}
                                            </h3>
                                            <ReactStars
                                                count={5}
                                                value={review.rating}
                                                size={20}
                                                edit={false}
                                                activeColor="#ffd700"
                                                emptyIcon={<FaStar />}
                                                fullIcon={<FaStar />}
                                            />
                                        </div>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ReviewSlider;
