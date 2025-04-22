import React, { useContext } from 'react';
import { ThemeContext } from '../../../provider/themeContext';

const stats = [
    {
        count: "5K",
        label: "Active Students"
    },
    {
        count: "10+",
        label: "Mentors"
    },
    {
        count: "200+",
        label: "Courses"
    },
    {
        count: "50+",
        label: "Awards"
    }
];

export const StatsComponent = () => {
    const { darkTheme } = useContext(ThemeContext);

    return (
        <div className={darkTheme ? 'flex w-[100%] justify-around bg-richblack-900 lg:h-[254px] items-center text-white' : 'flex w-[100%] justify-around bg-gray-100 lg:h-[254px] items-center text-richblack-900'}>
            {
                stats.map((item, index) => (
                    <div key={index}>
                        <div className={darkTheme ? 'font-semibold text-2xl' : 'font-semibold text-2xl text-gray-900'}>
                            {item.count}
                        </div>
                        <div className={darkTheme ? 'font-medium' : 'font-medium text-gray-700'}>
                            {item.label}
                        </div>
                    </div>
                ))
            }
        </div>
    );
};
