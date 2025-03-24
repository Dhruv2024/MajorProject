import React from 'react'


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
]
export const StatsComponent = () => {
    return (
        <div className='flex w-[100%] justify-around bg-richblack-700 lg:h-[254px] items-center text-white'>
            {
                stats.map((item, index) => (
                    <div key={index}>
                        <div className='font-semibold text-2xl'>{item.count}</div>
                        <div className='font-medium'>{item.label}</div>
                    </div>
                ))
            }
        </div>
    )
}
