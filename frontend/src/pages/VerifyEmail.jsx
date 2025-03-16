import React, { useEffect, useState } from 'react'
import OTPInput from 'react-otp-input'
import { useDispatch, useSelector } from 'react-redux'
import { FaClockRotateLeft } from "react-icons/fa6";
import { sendOtp, signUp } from '../services/operations/authAPI';
import { Link, useNavigate } from 'react-router-dom';
import { IoIosArrowRoundBack } from "react-icons/io";

export const VerifyEmail = ({ darkTheme }) => {
    const { loading, signupData } = useSelector((state) => state.auth);
    const [otp, setOtp] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();
    useEffect(() => {
        if (!signupData) {
            navigate("/signup");
        }
    })
    function handleOnSubmit(e) {
        e.preventDefault();

        const {
            accountType,
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
        } = signupData
        dispatch(signUp(accountType, firstName, lastName, email, password, confirmPassword, otp, navigate))
    }
    return (
        <div className='flex justify-center items-center flex-col h-[80vh] text-white'>

            {
                loading ? (
                    <div className='spinner'>
                    </div>
                ) : (
                    <div className='lg:w-[25vw] w-[90vw]'>
                        <h1 className={`text-3xl font-semibold mb-4 ${darkTheme ? "text-white" : "text-blue-100"}`}>Verify email</h1>
                        <p className='text-richblack-200 mb-8'>A verification code has been sent to you. Enter the code below</p>
                        <form onSubmit={handleOnSubmit}>
                            <OTPInput
                                value={otp}
                                onChange={setOtp}
                                numInputs={6}
                                // renderSeparator={<span>-</span>}
                                renderInput={(props) => <
                                    input {...props}
                                    placeholder='-'
                                    style={{
                                        boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
                                    }}
                                    className={`w-[40px] lg:w-[60px] border-0  rounded-[0.5rem] aspect-square text-center focus:border-0 focus:outline-2 ${darkTheme ? "bg-richblack-800 text-richblack-5 focus:outline-yellow-50" : " bg-richblack-25 text-black focus:outline-blue-100 "} mr-2`}
                                />}
                            />
                            <button type='submit'
                                style={{
                                    boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
                                }}
                                className="flex items-center bg-yellow-50 cursor-pointer gap-x-2 rounded-md py-2 px-5 font-semibold text-richblack-900 mt-4">
                                Verify email
                            </button>
                        </form>
                        <div className='flex justify-between'>
                            <div className={`mt-7 ${darkTheme ? "text-richblack-50" : "text-blue-100"}`}>
                                <Link to="/login">
                                    <div className='flex items-center'>
                                        <IoIosArrowRoundBack />
                                        <div>
                                            Back to login
                                        </div>
                                    </div>
                                </Link>
                            </div>
                            <div onClick={() => {
                                dispatch(sendOtp(signupData.email, navigate));
                            }} className='mt-7 flex text-blue-100 gap-2 cursor-pointer'>
                                <FaClockRotateLeft />
                                <div>Resend it</div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    )
}