import React, { useContext } from 'react';

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/free-mode';
import 'swiper/css/autoplay';

import { Autoplay, FreeMode, Pagination } from 'swiper/modules';

import Course_Card from './Course_Card';
import { ThemeContext } from '../../../provider/themeContext';

const CourseSlider = ({ Courses }) => {
    const { darkTheme } = useContext(ThemeContext);

    return (
        <>
            {Courses?.length ? (
                <Swiper
                    slidesPerView={1}
                    spaceBetween={25}
                    loop={Courses.length > 1}
                    autoplay={{ delay: 3000, disableOnInteraction: false }}
                    modules={[FreeMode, Pagination, Autoplay]}
                    pagination={{ clickable: true }}
                    breakpoints={{
                        640: { slidesPerView: 1 },
                        768: { slidesPerView: 2 },
                        1024: { slidesPerView: 3 },
                    }}
                    className="w-full min-h-[250px]"
                >
                    {Courses.map((course, i) => (
                        <SwiperSlide key={i}>
                            <Course_Card course={course} Height="h-[250px]" />
                        </SwiperSlide>
                    ))}
                </Swiper>
            ) : (
                <p className="text-xl text-richblack-5">No Course Found</p>
            )}
        </>
    );
};

export default CourseSlider;
