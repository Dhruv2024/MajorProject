import React from 'react'

export const Error = ({ darkTheme }) => {
    return (
        <div className={`flex justify-center items-center text-5xl h-[80vh] ${darkTheme ? "text-red" : "text-blue-100"}`}>
            Page Not Found
        </div>
    )
}