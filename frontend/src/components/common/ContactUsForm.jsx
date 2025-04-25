import React, { useContext, useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import CountryCode from "../../data/countrycode.json";
import { ThemeContext } from '../../provider/themeContext';

export const ContactUsForm = () => {
    const [loading, setLoading] = useState(false);
    const { darkTheme } = useContext(ThemeContext);
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitSuccessful }
    } = useForm();

    const submitContactForm = async (data) => {
        console.log("Logging Data", data);
        try {
            setLoading(true);
            // const response = await apiConnector("POST", contactusEndpoint.CONTACT_US_API, data);
            const response = { status: "OK" };
            console.log("Logging response", response);
            setLoading(false);
        }
        catch (error) {
            console.log("Error:", error.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isSubmitSuccessful) {
            reset({
                email: "",
                firstname: "",
                lastname: "",
                message: "",
                phoneNo: "",
            });
        }
    }, [reset, isSubmitSuccessful]);

    // Define text color for labels based on the theme
    const labelStyle = darkTheme ? 'text-white' : 'text-richblack-900';
    const errorStyle = darkTheme ? 'text-yellow-100' : 'text-yellow-500';
    const buttonBgDark = 'bg-yellow-50 text-black shadow-[2px_2px_0px_0px_rgba(255,255,255,0.18)]';
    const buttonBgLight = 'bg-blue-600 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.18)]';
    const buttonStyle = `rounded-md px-6 py-3 text-center text-[13px] font-bold transition-all duration-200 hover:scale-95 hover:shadow-none sm:text-[16px] disabled:bg-richblack-500 ${darkTheme ? buttonBgDark : buttonBgLight}`;
    const inputTextColor = darkTheme ? 'text-white' : 'text-richblack-900';

    return (
        <form
            className={`flex flex-col gap-7 ${labelStyle}`}
            onSubmit={handleSubmit(submitContactForm)}
        >
            <div className="flex flex-col gap-5 lg:flex-row">
                <div className="flex flex-col gap-2 lg:w-[48%]">
                    <label htmlFor="firstname" className={labelStyle}>
                        First Name
                    </label>
                    <input
                        type="text"
                        name="firstname"
                        id="firstname"
                        placeholder="Enter first name"
                        className={` ${darkTheme ? 'form-style' : 'light-form-style'} ${inputTextColor}`}
                        {...register("firstname", { required: "Please enter your first name." })}
                    />
                    {errors.firstname && (
                        <span className={`-mt-1 text-[12px] ${errorStyle}`}>
                            {errors.firstname.message}
                        </span>
                    )}
                </div>
                <div className="flex flex-col gap-2 lg:w-[48%]">
                    <label htmlFor="lastname" className={labelStyle}>
                        Last Name
                    </label>
                    <input
                        type="text"
                        name="lastname"
                        id="lastname"
                        placeholder="Enter last name"
                        className={` ${darkTheme ? 'form-style' : 'light-form-style'} ${inputTextColor}`}
                        {...register("lastname")}
                    />
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <label htmlFor="email" className={labelStyle}>
                    Email Address
                </label>
                <input
                    type="email"
                    name="email"
                    id="email"
                    placeholder="Enter email address"
                    className={` ${darkTheme ? 'form-style' : 'light-form-style'} ${inputTextColor}`}
                    {...register("email", { required: "Please enter your email address." })}
                />
                {errors.email && (
                    <span className={`-mt-1 text-[12px] ${errorStyle}`}>
                        {errors.email.message}
                    </span>
                )}
            </div>

            <div className="flex flex-col gap-2">
                <label htmlFor="phonenumber" className={labelStyle}>
                    Phone Number
                </label>

                <div className="flex gap-5">
                    <div className="flex w-[81px] flex-col gap-2">
                        <select
                            name="countrycode"
                            id="countrycode"
                            className={` ${darkTheme ? 'form-style' : 'light-form-style'} ${inputTextColor}`}
                            {...register("countrycode", { required: "Country code is required." })}
                        >
                            {CountryCode.map((ele, i) => (
                                <option key={i} value={ele.code}>
                                    {ele.code} - {ele.country}
                                </option>
                            ))}
                        </select>
                        {errors.countrycode && (
                            <span className={`-mt-1 text-[12px] ${errorStyle}`}>
                                {errors.countrycode.message}
                            </span>
                        )}
                    </div>
                    <div className="flex w-[calc(100%-90px)] flex-col gap-2">
                        <input
                            type="number"
                            name="phonenumber"
                            id="phonenumber"
                            placeholder="12345 67890"
                            className={` ${darkTheme ? 'form-style' : 'light-form-style'} ${inputTextColor}`}
                            {...register("phoneNo", {
                                required: "Please enter your phone number.",
                                maxLength: { value: 12, message: "Invalid phone number (max 12 digits)." },
                                minLength: { value: 10, message: "Invalid phone number (min 10 digits)." },
                            })}
                        />
                    </div>
                </div>
                {errors.phoneNo && (
                    <span className={`-mt-1 text-[12px] ${errorStyle}`}>
                        {errors.phoneNo.message}
                    </span>
                )}
            </div>

            <div className="flex flex-col gap-2">
                <label htmlFor="message" className={labelStyle}>
                    Message
                </label>
                <textarea
                    name="message"
                    id="message"
                    cols="30"
                    rows="7"
                    placeholder="Enter your message here"
                    className={` ${darkTheme ? 'form-style' : 'light-form-style'} ${inputTextColor}`}
                    {...register("message", { required: "Please enter your message." })}
                />
                {errors.message && (
                    <span className={`-mt-1 text-[12px] ${errorStyle}`}>
                        {errors.message.message}
                    </span>
                )}
            </div>

            <button
                disabled={loading}
                type="submit"
                className={buttonStyle}
            >
                Send Message
            </button>
        </form>
    );
};