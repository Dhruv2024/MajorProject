import React, { useContext } from 'react'
import { IconBtn } from './IconBtn'
import { ThemeContext } from '../../provider/themeContext'

export const ConfirmationModal = ({ modalData }) => {
    const { darkTheme } = useContext(ThemeContext)

    // Dynamic classes based on theme
    const modalBgClass = darkTheme ? 'bg-richblack-800 border-richblack-400' : 'bg-blue-5 border-gray-300'
    const titleTextClass = darkTheme ? 'text-richblack-5' : 'text-gray-900'
    const bodyTextClass = darkTheme ? 'text-richblack-200' : 'text-gray-700'
    const secondaryBtnClass = darkTheme
        ? 'bg-richblack-200 text-richblack-900'
        : 'bg-gray-200 text-gray-900'

    return (
        <div className="fixed inset-0 z-[1000] !mt-0 grid place-items-center overflow-auto bg-white bg-opacity-10 backdrop-blur-sm">
            <div className={`w-11/12 max-w-[350px] rounded-lg border p-6 ${modalBgClass} `}>
                <p className={`text-2xl font-semibold ${titleTextClass}`}>
                    {modalData.text1}
                </p>
                <p className={`mt-3 mb-5 leading-6 ${bodyTextClass}`}>
                    {modalData.text2}
                </p>
                <div className="flex items-center gap-x-4">
                    <IconBtn
                        onclick={modalData?.btn1Handler}
                        text={modalData?.btn1Text}
                    />
                    <button
                        onClick={modalData?.btn2Handler}
                        className={`cursor-pointer rounded-md py-[8px] px-[20px] font-semibold ${secondaryBtnClass}`}
                    >
                        {modalData?.btn2Text}
                    </button>
                </div>
            </div>
        </div>
    )
}
