import React from 'react'

export const HighlightText = ({ text, customColor }) => {
    return (
        <div>

            {
                customColor !== undefined ? (
                    <span className={`font-bold ${customColor}`}>
                        {text}
                    </span>
                ) : (
                    <span className='font-bold text-blue-100 light-gradient-text'>
                        {text}
                    </span>
                )
            }
        </div>
    )
}
