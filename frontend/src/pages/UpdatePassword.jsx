import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { resetPassword } from '../services/operations/authAPI';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import { Link } from 'react-router-dom';
import { IoIosArrowRoundBack } from "react-icons/io";

export const UpdatePassword = ({ darkTheme }) => {
    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: "",
    })
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { loading } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const { password, confirmPassword } = formData;
    function handleOnChange(e) {
        setFormData((prevData) => (
            {
                ...prevData,
                [e.target.name]: e.target.value,
            }
        ))
    }
    function handleOnSubmit(e) {
        e.preventDefault();
        const token = location.pathname.split('/').at(-1);
        dispatch(resetPassword(password, confirmPassword, token, navigate))
    }
    return (
        <div className={`flex justify-center items-center flex-col h-[80vh] ${darkTheme ? "text-white " : "text-blue-100"}`}>
            {
                loading ? (
                    <div className='spinner'>
                    </div>
                ) : (
                    <div className='lg:w-[25vw]'>
                        <h1 className='text-3xl font-semibold mb-4'> Choose new Password</h1>
                        <p className='text-richblack-200 mb-8'>Almost done. Enter your new password and youre all set.</p>
                        <form onSubmit={handleOnSubmit}>
                            <label>
                                <p className={`text-sm ${darkTheme ? "text-richblack-25" : "text-richblack-600"}`}>New Password<sup className='text-red'>*</sup></p>
                                <input
                                    required
                                    type={showPassword ? 'text' : 'password'}
                                    name='password'
                                    value={password}
                                    onChange={handleOnChange}
                                    placeholder='Password'
                                    className={`w-[100%] h-[48px] relative ${darkTheme ? "bg-richblack-800" : "bg-blue-5"} placeholder:px-2 mb-4`}
                                />
                                <span onClick={() => { setShowPassword(!showPassword) }} className='absolute text-[27px] left-[60%] translate-x-[-30%] mt-2 cursor-pointer'>
                                    {
                                        showPassword ? <FaEye /> : <FaEyeSlash />
                                    }
                                </span>
                            </label>

                            <label>
                                <p className={`text-sm ${darkTheme ? "text-richblack-25" : "text-richblack-600"}`}>Confirm new Password<sup className='text-red'>*</sup></p>
                                <input
                                    required
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name='confirmPassword'
                                    value={confirmPassword}
                                    onChange={handleOnChange}
                                    placeholder='Confirm Password'
                                    className={`w-[100%] h-[48px] relative ${darkTheme ? "bg-richblack-800" : "bg-blue-5"} placeholder:px-2`}
                                />
                                <span onClick={() => { setShowConfirmPassword(!showConfirmPassword) }} className='absolute text-[27px] left-[60%] translate-x-[-30%] mt-2 cursor-pointer'>
                                    {
                                        showConfirmPassword ? <FaEye /> : <FaEyeSlash />
                                    }
                                </span>
                            </label>

                            <button type='submit' className='w-[100%] bg-yellow-50 mt-7 rounded-md text-black text-center py-3 text-[16px] font-bold'>
                                Reset Password
                            </button>
                        </form>
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
                    </div >
                )
            }
        </div >
    )
}