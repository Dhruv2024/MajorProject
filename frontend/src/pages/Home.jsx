import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa6";
import React from 'react'
import { HighlightText } from "../components/core/HomePage/HighlightText";
import { HomeButton } from "../components/core/HomePage/HomeButton";
import Banner from "../assets/Images/banner.mp4"
import { CodeBlocks } from "../components/core/HomePage/CodeBlocks";
import { TimelineSection } from "../components/core/HomePage/TimelineSection";
import { LearningLanguageSection } from "../components/core/HomePage/LearningLanguageSection";
import { InstructorSection } from "../components/core/HomePage/InstructorSection";
import { ExploreMore } from "../components/core/HomePage/ExploreMore";
import Footer from "../components/common/Footer";
// import ReviewSlider from "../components/common/ReviewSlider";

const Home = ({ darkTheme }) => {
    return (
        <div>
            {/* Section 1 */}
            <div className={`relative mx-auto flex flex-col w-11/12 max-w-maxContent items-center  justify-between ${darkTheme ? "text-white" : "text-black"}`}>
                <Link to={"/signup"}>
                    <div className={`group mt-16 p-1 mx-auto rounded-full font-bold transition-all duration-200 hover:scale-95 w-fit ${darkTheme ? "bg-richblack-800 text-richblack-200" : "bg-blue-25"}`}>
                        <div className={`flex items-center gap-2 rounded-full px-10 py-[5px] transition-all duration-200 ${darkTheme ? "group-hover:bg-richblack-900" : "group-hover:bg-blue-100"}`}>
                            <p>Become an Instrcutor</p>
                            <FaArrowRight />
                        </div>
                    </div>
                </Link>

                <div className="text-center text-4xl font-semibold mt-7">
                    Empower Your Future with <HighlightText text={"Coding Skills"} customColor={darkTheme ? "text-blue-300" : "light-gradient-text"} />
                </div>

                <div className="mt-4 w-[90%] text-center text-lg font-bold text-richblack-300">
                    With our online coding courses, you can learn at your own pace, from anywhere in the world, and get access to a wealth of resources, including hands-on-projects, quizzes, and personalized feedback from instructors.
                </div>

                <div className="flex gap-7 mt-8 lg:flex-row flex-col">
                    <HomeButton active={true} linkTo={"/signup"}>
                        Learn More
                    </HomeButton>
                    <HomeButton active={false} linkTo={"/login"}>
                        Book a Demo
                    </HomeButton>
                </div>

                <div className={`mx-3 my-7 shadow-[10px_-5px_50px_-5px] ${darkTheme ? "shadow-blue-200" : "shadow-caribbeangreen-25"}`}>
                    <video
                        muted
                        loop
                        autoPlay
                    >
                        <source src={Banner} type="video/mp4" />
                    </video>
                </div>


                {/* Code section 1 */}
                <div className="ml-4">
                    <CodeBlocks
                        position={"lg:flex-row"}
                        heading={
                            <div className="text-4xl font-semibold">
                                Unlock your <HighlightText text={"coding potential"} /> with our online courses
                            </div>
                        }
                        subheading={"Our courses are designed and taught by industry experts who have years of experience in coding and are passionate about sharing their knowledge with you."}
                        button1={
                            {
                                btnText: "Try it Yourself",
                                linkTo: "/signup",
                                active: true,
                            }
                        }
                        button2={
                            {
                                btnText: "Learn More",
                                linkTo: "/login",
                                active: false,
                            }
                        }
                        codeblock={`<!DOCTYPE html>\n<html>\n<head>\n<title>Example</title>\n<linkrel="stylesheet" href="styles.css">\n</head>\n<body>\n<h1><ahref="/">Header</a></h1>\n<nav><ahref="one/">One</a><ahref="two/">Two</\na><ahref="three/">Three</a>\n</nav>`}
                        codeColor={darkTheme ? "text-yellow-25" : "text-caribbeangreen-200"}
                        darkTheme={darkTheme}
                    />
                </div>
                {/* Code section 2 */}
                <div className="mr-4">
                    <CodeBlocks
                        position={"lg:flex-row-reverse"}
                        heading={
                            <div className="text-4xl font-semibold">
                                Start <HighlightText text={"coding in seconds"} />
                            </div>
                        }
                        subheading={"Go ahead, give it a try. Our hands-on learning environment means you'll be writing real code from your very first lesson."}
                        button1={
                            {
                                btnText: "Continue Lesson",
                                linkTo: "/signup",
                                active: true,
                            }
                        }
                        button2={
                            {
                                btnText: "Learn More",
                                linkTo: "/login",
                                active: false,
                            }
                        }
                        codeblock={`<!DOCTYPE html>\n<html>\n<head>\n<title>Example</title>\n<linkrel="stylesheet" href="styles.css">\n</head>\n<body>\n<h1><ahref="/">Header</a></h1>\n<nav><ahref="one/">One</a><ahref="two/">Two</\na><ahref="three/">Three</a>\n</nav>`}
                        codeColor={darkTheme ? "text-yellow-25" : "text-blue-200"}
                        darkTheme={darkTheme}
                    />
                </div>

                <ExploreMore darkTheme={darkTheme} />
            </div>

            {/* Section 2 */}
            <div className={`${darkTheme ? "bg-pure-greys-5 text-richblack-700" : " bg-blue-25"}`}>
                <div div className="homepage_bg lg:h-[333px] h-[170px]">
                    <div className="w-11/12 max-w-maxContent flex flex-col items-center gap-5 mx-auto justify-between">
                        <div className="lg:h-[150px] h-[40px]">

                        </div>
                        <div className="flex flex-row gap-7">
                            <HomeButton active={true} linkTo={"/signup"}>
                                <div className="flex items-center gap-5">
                                    Explore Full Catalog
                                    <FaArrowRight />
                                </div>
                            </HomeButton>
                            <HomeButton active={false} linkTo={"/login"}>
                                <div>
                                    Learn More
                                </div>
                            </HomeButton>
                        </div>
                    </div>
                </div>

                <div className="w-11/12 mx-auto max-w-maxContent flex flex-col items-center justify-between gap-7">
                    <div className="flex lg:flex-row flex-col gap-5 mt-[95px] mb-10">
                        <div className="font-inter text-4xl font-semibold lg:w-[48%] w-[100%] text-center lg:mr-5">
                            Get the skills you need for a <HighlightText text={"job that is in demand."} customColor={!darkTheme ? "text-blue-300" : "light-gradient-text"} />
                        </div>
                        <div className="flex flex-col lg:gap-10 gap-7 lg:w-[45%] w-[100%] items-start">
                            <div className="lg:text-[16px] text-[15px]">
                                The modern EduSphere is the dictates its own terms. Today, to be a competitive specialist requires more than professional skills.
                            </div>
                            <HomeButton active={true} linkTo={"/signup"}>
                                Learn More
                            </HomeButton>
                        </div>
                    </div>
                    <TimelineSection />

                    <LearningLanguageSection darkTheme={darkTheme} />

                </div>
            </div>


            {/* Section 3 */}
            <div className={`w-11/12 mx-auto max-w-maxContent flex flex-col justify-between gap-8 ${darkTheme ? "bg-richblack-900 text-white" : "bg-white text-black"}`}>
                <InstructorSection darkTheme={darkTheme} />

                <h2 className="text-center text-4xl font-semibold mt-10">Reviews from other learners</h2>

                {/* Review Slider */}
                <h1 className="text-5xl text-red mx-auto"> To be updated</h1>
                {/* <ReviewSlider /> */}
            </div>

            {/* Footer */}
            <Footer darkTheme={darkTheme} />
        </div >
    )
}

export default Home;