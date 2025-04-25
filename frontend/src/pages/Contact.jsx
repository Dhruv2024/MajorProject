import React, { useContext } from "react";

import Footer from "../components/common/Footer";
import { ContactUsForm } from "../components/common/ContactUsForm";
import ContactDetails from "../components/common/ContactDetails";
import { ThemeContext } from "../provider/themeContext";

const Contact = () => {
    const { darkTheme } = useContext(ThemeContext);

    // Define text and background colors based on the theme
    const textColorClass = darkTheme ? "text-white" : "text-black";
    const backgroundColorClass = darkTheme ? "bg-richblack-900" : "bg-white";

    return (
        <div className={`${textColorClass} ${backgroundColorClass}`}>
            <div className="mx-auto mt-20 flex w-11/12 max-w-maxContent flex-col justify-between gap-10 lg:flex-row">
                {/* Contact Details */}
                <div className="lg:w-[40%]">
                    <ContactDetails />
                </div>

                {/* Contact Form */}
                <div className="lg:w-[60%]">
                    <ContactUsForm />
                </div>
            </div>
            <div className={`relative mx-auto my-20 flex w-11/12 max-w-maxContent flex-col items-center justify-between gap-8 ${darkTheme ? 'bg-richblack-800' : 'bg-gray-100'} ${textColorClass}`}>
                {/* Reviews from Other Learner */}
                <h1 className="text-center text-4xl font-semibold mt-8">
                    Reviews from other learners
                </h1>
                {/* <ReviewSlider /> */}
            </div>
            <Footer />
        </div>
    );
};

export default Contact;