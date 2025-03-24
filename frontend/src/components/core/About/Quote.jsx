import React from 'react'
import { HighlightText } from '../HomePage/HighlightText'

export const Quote = () => {
    return (
        <div>
            We are passionate about revolutionizing the way we learn. Our innovative platform <HighlightText text={"combines technology"} />, <span className='text-orange'>expertise</span>, and community to create an <span className='text-yellow-5'>unparalleled educational experience</span>.
        </div>
    )
}
