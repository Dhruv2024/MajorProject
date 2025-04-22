import React, { useContext } from 'react';
import { HighlightText } from '../components/core/HomePage/HighlightText';
import BannerImage1 from '../assets/Images/aboutus1.webp';
import BannerImage2 from '../assets/Images/aboutus2.webp';
import BannerImage3 from '../assets/Images/aboutus3.webp';
import { Quote } from '../components/core/About/Quote';
import FoundingStory from '../assets/Images/FoundingStory.png';
import { StatsComponent } from '../components/core/About/StatsComponent';
import { LearningGrid } from '../components/core/About/LearningGrid';
import { ContactPageSection } from '../components/core/About/ContactPageSection';
import Footer from '../components/common/Footer';
import ReviewSlider from '../components/common/ReviewSlider';
import { ThemeContext } from '../provider/themeContext';

export const About = () => {
    const { darkTheme } = useContext(ThemeContext);

    return (
        <div className={darkTheme ? 'bg-richblack-900 text-white' : 'bg-white text-richblack-900'}>
            <section className={darkTheme ? 'bg-richblack-700' : 'bg-lightgray'}>
                <div className="relative mx-auto flex w-11/12 max-w-maxContent flex-col justify-between gap-10 text-center">
                    <header className="mx-auto py-20 text-4xl font-semibold lg:w-[70%]">
                        Driving Innovation in Online Education for a <HighlightText text={"Brighter Future"} />
                        <p className={darkTheme ? 'mx-auto mt-3 text-center text-base font-medium text-richblack-300 lg:w-[95%]' : 'mx-auto mt-3 text-center text-base font-medium text-gray-700 lg:w-[95%]'}>
                            EduSphere is at the forefront of driving innovation in online
                            education. We're passionate about creating a brighter future by
                            offering cutting-edge courses, leveraging emerging technologies,
                            and nurturing a vibrant learning community.
                        </p>
                    </header>
                    <div className="sm:h-[70px] lg:h-[150px]"></div>
                    <div className="absolute bottom-0 left-[50%] grid w-[100%] translate-x-[-50%] translate-y-[30%] grid-cols-3 gap-3 lg:gap-5">
                        <img src={BannerImage1} alt="" />
                        <img src={BannerImage2} alt="" />
                        <img src={BannerImage3} alt="" />
                    </div>
                </div>
            </section>

            <section className={darkTheme ? 'border-b border-richblack-700' : 'border-b border-gray-300'}>
                <div className="mx-auto flex w-11/12 max-w-maxContent flex-col justify-between gap-10">
                    <div className="h-[100px] "></div>
                    <Quote />
                </div>
            </section>

            <section>
                <div className="mx-auto flex w-11/12 max-w-maxContent flex-col justify-between gap-10">
                    <div className="flex flex-col items-center gap-10 lg:flex-row justify-between">
                        <div className="my-24 flex lg:w-[50%] flex-col gap-10">
                            <h1 className={darkTheme ? 'bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCB045] bg-clip-text text-4xl font-semibold text-transparent lg:w-[70%]' : 'bg-gradient-to-br from-[#5A67D8] via-[#4299E1] to-[#63B3ED] bg-clip-text text-4xl font-semibold text-transparent lg:w-[70%]'}>
                                Our Founding Story
                            </h1>
                            <p className={darkTheme ? 'text-base font-medium text-richblack-300 lg:w-[95%]' : 'text-base font-medium text-gray-700 lg:w-[95%]'}>
                                Our e-learning platform was born out of a shared vision and
                                passion for transforming education. It all began with a group of
                                educators, technologists, and lifelong learners who recognized
                                the need for accessible, flexible, and high-quality learning
                                opportunities in a rapidly evolving digital world.
                            </p>
                            <p className={darkTheme ? 'text-base font-medium text-richblack-300 lg:w-[95%]' : 'text-base font-medium text-gray-700 lg:w-[95%]'}>
                                As experienced educators ourselves, we witnessed firsthand the
                                limitations and challenges of traditional education systems. We
                                believed that education should not be confined to the walls of a
                                classroom or restricted by geographical boundaries. We
                                envisioned a platform that could bridge these gaps and empower
                                individuals from all walks of life to unlock their full
                                potential.
                            </p>
                        </div>

                        <div>
                            <img
                                src={FoundingStory}
                                alt=""
                                className={darkTheme ? 'shadow-[0_0_20px_0] shadow-[#FC6767]' : 'shadow-[0_0_20px_0] shadow-gray-500'}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col items-center lg:gap-10 lg:flex-row justify-between">
                        <div className="my-24 flex lg:w-[40%] flex-col gap-10">
                            <h1 className={darkTheme ? 'bg-gradient-to-b from-[#FF512F] to-[#F09819] bg-clip-text text-4xl font-semibold text-transparent lg:w-[70%]' : 'bg-gradient-to-b from-[#FBBF24] to-[#F59E0B] bg-clip-text text-4xl font-semibold text-transparent lg:w-[70%]'}>
                                Our Vision
                            </h1>
                            <p className={darkTheme ? 'text-base font-medium text-richblack-300 lg:w-[95%]' : 'text-base font-medium text-gray-700 lg:w-[95%]'}>
                                With this vision in mind, we set out on a journey to create an
                                e-learning platform that would revolutionize the way people
                                learn. Our team of dedicated experts worked tirelessly to
                                develop a robust and intuitive platform that combines
                                cutting-edge technology with engaging content, fostering a
                                dynamic and interactive learning experience.
                            </p>
                        </div>
                        <div className="my-24 flex lg:w-[40%] flex-col gap-10">
                            <h1 className={darkTheme ? 'bg-gradient-to-b from-[#1FA2FF] via-[#12D8FA] to-[#A6FFCB] text-transparent bg-clip-text text-4xl font-semibold lg:w-[70%]' : 'bg-gradient-to-b from-[#4C51BF] to-[#434190] text-transparent bg-clip-text text-4xl font-semibold lg:w-[70%]'}>
                                Our Mission
                            </h1>
                            <p className={darkTheme ? 'text-base font-medium text-richblack-300 lg:w-[95%]' : 'text-base font-medium text-gray-700 lg:w-[95%]'}>
                                Our mission goes beyond just delivering courses online. We wanted to create a vibrant community of learners, where individuals can connect, collaborate, and learn from one another. We believe that knowledge thrives in an environment of sharing and dialogue, and we foster this spirit of collaboration through forums, live sessions, and networking opportunities.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <StatsComponent />

            <section className={darkTheme ? 'mx-auto mt-20 flex w-11/12 max-w-maxContent flex-col justify-between gap-10 bg-richblack-900 text-white' : 'mx-auto mt-20 flex w-11/12 max-w-maxContent flex-col justify-between gap-10 bg-gray-100 text-black'}>
                <LearningGrid />
                <ContactPageSection />
            </section>

            <div className={`w-11/12 mx-auto max-w-maxContent flex flex-col justify-between gap-8 ${darkTheme ? "bg-richblack-900 text-white" : "bg-white text-black"}`}>

                <h2 className="text-center text-4xl font-semibold mt-10">Reviews from other learners</h2>

                {/* Review Slider */}
                {/* <h1 className="text-5xl text-red mx-auto"> To be updated</h1> */}
                <ReviewSlider />
            </div>
            <Footer />
        </div>
    );
};
