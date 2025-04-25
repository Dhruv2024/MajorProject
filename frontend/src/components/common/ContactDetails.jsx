import React, { useContext } from "react";
import * as Icon1 from "react-icons/bi";
import * as Icon3 from "react-icons/hi2";
import * as Icon2 from "react-icons/io5";
import { ThemeContext } from "../../provider/themeContext";

const contactDetails = [
    {
        icon: "HiChatBubbleLeftRight",
        heading: "Chat on us",
        description: "Our friendly team is here to help.",
        details: "info@EduSphere.com",
    },
    {
        icon: "BiWorld",
        heading: "Visit us",
        description: "Come and say hello at our office HQ.",
        details:
            "Akshya Nagar 1st Block 1st Cross, Rammurthy nagar, Bangalore-560016",
    },
    {
        icon: "IoCall",
        heading: "Call us",
        description: "Mon - Fri From 8am to 5pm",
        details: "+123 456 7869",
    },
];

const ContactDetails = () => {
    const { darkTheme } = useContext(ThemeContext);

    // Define text and background colors based on the theme
    const backgroundColorClass = darkTheme ? "bg-richblack-800" : "bg-gray-100";
    const textColorClass = darkTheme ? "text-richblack-200" : "text-gray-700";
    const headingColorClass = darkTheme ? "text-richblack-5" : "text-black";

    return (
        <div className={`flex flex-col gap-6 rounded-xl p-4 lg:p-6 ${backgroundColorClass}`}>
            {contactDetails.map((ele, i) => {
                let Icon = Icon1[ele.icon] || Icon2[ele.icon] || Icon3[ele.icon];
                return (
                    <div
                        className={`flex flex-col gap-[2px] p-3 text-sm ${textColorClass}`}
                        key={i}
                    >
                        <div className="flex flex-row items-center gap-3">
                            <Icon size={25} color={darkTheme ? "#A8B1BB" : "#475569"} />
                            <h1 className={`text-lg font-semibold ${headingColorClass}`}>
                                {ele?.heading}
                            </h1>
                        </div>
                        <p className="font-medium">{ele?.description}</p>
                        <p className="font-semibold">{ele?.details}</p>
                    </div>
                );
            })}
        </div>
    );
};

export default ContactDetails;