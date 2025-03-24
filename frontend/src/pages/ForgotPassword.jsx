import React, { useContext, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom';
import { IoIosArrowRoundBack } from "react-icons/io";
import { getPasswordResetToken } from '../services/operations/authAPI';
import { ThemeContext } from '../provider/themeContext';

export const ForgotPassword = () => {
    const { loading } = useSelector((state) => state.auth);
    const [emailSent, setEmailSent] = useState(false);
    const [email, setEmail] = useState("");
    const dispatch = useDispatch();
    const { darkTheme } = useContext(ThemeContext);

    function handleOnSubmit(e) {
        e.preventDefault();
        dispatch(getPasswordResetToken(email, setEmailSent));
    }

    return (
        <div className={`flex justify-center items-center lg:h-[70vh] ${darkTheme ? "text-white" : "text-blue-100"}`}>
            {
                loading ? (
                    <div className='spinner'></div>
                ) : (
                    <div className='lg:w-[25vw]'>
                        <h1 className='text-3xl font-semibold mb-4'>
                            {
                                !emailSent ? "Reset your password" : "Check email"
                            }
                        </h1>

                        <p className='text-richblack-200 mb-8'>
                            {
                                !emailSent ?
                                    "Have no fear. We’ll email you instructions to reset your password. If you dont have access to your email we can try account recovery" :
                                    `We have sent the reset email to ${email}`
                            }
                        </p>

                        <form onSubmit={handleOnSubmit}>
                            {
                                !emailSent &&
                                <label>
                                    <p className={`${darkTheme ? 'text-richblack-25' : "text-richblack-600"}`}>Email Address<sup className='text-red'>*</sup></p>
                                    <input
                                        required
                                        type='email'
                                        name='email'
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value)
                                        }}
                                        placeholder='Enter Your Email Address'
                                        className={`w-[100%] h-[48px] ${darkTheme ? "bg-richblack-800" : "bg-blue-5"} placeholder:px-2`}
                                    />
                                </label>
                            }
                            <div className='bg-yellow-50 mt-7 rounded-md text-black text-center py-3 text-[13px] font-bold'>
                                <button>
                                    {
                                        !emailSent ? ("Reset Password") : "Resend email"
                                    }
                                </button>
                            </div>
                        </form>
                        <div className={`mt-7 ${darkTheme ? " text-richblack-50" : "text-blue-100"}`}>
                            <Link to="/login">
                                <div className='flex items-center'>
                                    <IoIosArrowRoundBack />
                                    <div>
                                        Back to login
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </div>
                )
            }
        </div>
    )
}