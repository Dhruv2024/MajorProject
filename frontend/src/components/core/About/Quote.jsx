import React, { useContext } from 'react';
import { HighlightText } from '../HomePage/HighlightText';
import { ThemeContext } from '../../../provider/themeContext';

export const Quote = () => {
    const { darkTheme } = useContext(ThemeContext);

    return (
        <div className={darkTheme ? 'text-white' : 'text-richblack-900'}>
            We are passionate about revolutionizing the way we learn. Our innovative platform
            <HighlightText text={"combines technology"} />,
            <span className={darkTheme ? 'text-orange-400' : 'text-orange-600'}>expertise</span>,
            and community to create an
            <span className={darkTheme ? 'text-yellow-400' : 'text-yellow-500'}>unparalleled educational experience</span>.
        </div>
    );
};
