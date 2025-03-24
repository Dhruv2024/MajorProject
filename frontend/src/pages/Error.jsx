import React, { useContext } from 'react'
import { ThemeContext } from '../provider/themeContext'

export const Error = () => {
    const { darkTheme } = useContext(ThemeContext);
    return (
        <div className={`flex justify-center items-center text-5xl h-[80vh] ${darkTheme ? "text-red" : "text-blue-100"}`}>
            Page Not Found
        </div>
    )
}