import React, { useContext } from 'react'
import { useSelector } from 'react-redux'
import { Sidebar } from '../components/core/Dashboard/Sidebar';
import { Outlet } from 'react-router-dom';
import { ThemeContext } from '../provider/themeContext';

export const Dashboard = () => {
    const { loading: authLoading } = useSelector((state) => state.auth);
    const { loading: profileLoading } = useSelector((state) => state.profile);
    const { darkTheme } = useContext(ThemeContext);
    if (authLoading || profileLoading) {
        return (
            <div className='mt-10 spinner'>
            </div>
        )
    }

    return (
        <div className='relative flex min-h-[calc(100vh-3.5rem)] lg:flex-row flex-col'>
            <Sidebar darkTheme={darkTheme} />
            <div className='h-[calc(100vh-3.5rem)] flex-1 overflow-auto'>
                <div className='mx-auto w-11/12 max-w-[1000px] py-10'>
                    <Outlet />
                </div>
            </div>
        </div>
    )
}