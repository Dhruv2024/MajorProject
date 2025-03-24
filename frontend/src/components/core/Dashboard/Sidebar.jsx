import React, { useState } from 'react'
import { sidebarLinks } from '../../../data/dashboard-links'
import { logout } from '../../../services/operations/authAPI'
import { useDispatch, useSelector } from 'react-redux'
import { SidebarLink } from './SidebarLink'
import { VscSignOut } from "react-icons/vsc"
import { useNavigate } from 'react-router-dom'
import { ConfirmationModal } from '../../common/ConfirmationModal'
import { AiOutlineMenu } from "react-icons/ai";
import { RxDropdownMenu } from "react-icons/rx";

export const Sidebar = ({ darkTheme }) => {

    const { user, loading: profileLoading } = useSelector((state) => state.profile);
    const { loading: authLoading } = useSelector((state) => state.auth);
    const [confirmationModal, setConfirmationModal] = useState(null);
    const [open, setOpen] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    if (authLoading || profileLoading) {
        return (
            <div className={`grid h-[calc(100vh-3.5rem)] min-w-[220px] items-center border-r-[1px] ${darkTheme ? "border-r-richblack-700 bg-richblack-800" : " bg-blue-100"}`}>
                <div className='spinner'></div>
            </div>
        )
    }
    return (
        <div>
            {/* for laptop screen */}
            <div className={`lg:flex lg:h-[calc(100vh-3.5rem)] pb-10 min-w-[220px] flex-col border-r-[1px] py-10 hidden ${darkTheme ? "border-r-richblack-700 bg-richblack-800" : " bg-blue-5 border-r-blue-25"}`}>
                <div className='flex flex-col'>
                    {
                        sidebarLinks.map((link, index) => {
                            if (link.type && user?.accountType !== link.type) return null;
                            return (
                                <SidebarLink key={link.id} link={link} iconName={link.icon} darkTheme={darkTheme} />
                            )
                        })
                    }
                </div>
                <div className='mx-auto mt-6 mb-6 h-[1px] w-10/12 bg-richblack-700"'></div>

                <div className='flex flex-col'>
                    <SidebarLink
                        link={{
                            name: "Settings",
                            path: "dashboard/settings"
                        }}
                        iconName="VscSettingsGear"
                    />

                    <button
                        onClick={() => setConfirmationModal({
                            text1: "Are You Sure ?",
                            text2: "You will be logged out of your Account",
                            btn1Text: "Logout",
                            btn2Text: "Cancel",
                            btn1Handler: () => dispatch(logout(navigate)),
                            btn2Handler: () => setConfirmationModal(null),
                        })}
                        className='px-8 py-2 text-sm font-medium text-richblack-300'
                    >

                        <div className='flex items-center gap-x-2'>
                            <VscSignOut className='text-lg' />
                            <span>Logout</span>
                        </div>

                    </button>
                </div>
            </div>

            {/* for small screen */}
            <div className='flex justify-center lg:hidden'>
                <div className='h-[24px] w-[29px] bg-richblack-600 rounded-b-xl relative' ></div>
                {
                    !open &&
                    <AiOutlineMenu className='text-white text-center absolute' onClick={() => {
                        setOpen(!open);
                    }} />
                }
                {
                    open &&
                    <RxDropdownMenu className='text-white text-center absolute' onClick={() => {
                        setOpen(!open);
                    }} />

                }
            </div>
            {
                open &&
                <div className='flex lg:h-[calc(100vh-3.5rem)] pb-10 min-w-[220px] flex-col border-r-[1px] border-r-richblack-700 bg-richblack-800 py-10 lg:hidden'>
                    <div className='flex flex-col'>
                        {
                            sidebarLinks.map((link, index) => {
                                if (link.type && user?.accountType !== link.type) return null;
                                return (
                                    <SidebarLink key={link.id} link={link} iconName={link.icon} />
                                )
                            })
                        }
                    </div>
                    <div className='mx-auto mt-6 mb-6 h-[1px] w-10/12 bg-richblack-700"'></div>

                    <div className='flex flex-col'>
                        <SidebarLink
                            link={{
                                name: "Settings",
                                path: "dashboard/settings"
                            }}
                            iconName="VscSettingsGear"
                        />

                        <button
                            onClick={() => setConfirmationModal({
                                text1: "Are You Sure ?",
                                text2: "You will be logged out of your Account",
                                btn1Text: "Logout",
                                btn2Text: "Cancel",
                                btn1Handler: () => dispatch(logout(navigate)),
                                btn2Handler: () => setConfirmationModal(null),
                            })}
                            className='px-8 py-2 text-sm font-medium text-richblack-300'
                        >

                            <div className='flex items-center gap-x-2'>
                                <VscSignOut className='text-lg' />
                                <span>Logout</span>
                            </div>

                        </button>
                    </div>
                </div>
            }
            {confirmationModal && <ConfirmationModal modalData={confirmationModal} className="z-10" />}
        </div>
    )
}