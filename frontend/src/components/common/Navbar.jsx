import React, { useEffect, useState } from 'react'
import { Link, matchPath } from 'react-router-dom'
import Logo from '../../assets/Logo/Logo-Full-Light.png'
import LightEduSphereLogo from '../../assets/Logo/edusphereLight.png'
import EduSphereLogo from '../../assets/Logo/edusphere.png'
import { NavbarLinks } from '../../data/navbar-links'
import { useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { IoCart } from "react-icons/io5";
import { apiConnector } from '../../services/apiConnector'
import { categories } from '../../services/apis'
import ProfileDropdown from '../core/Auth/ProfileDropDown'
import { IoIosArrowDown } from "react-icons/io";


// const subLinks = [
//     {
//         name: "python",
//         link: "/catalog/python"
//     },
//     {
//         name: "web dev",
//         link: "/catalog/web-development"
//     }
// ];

const Navbar = ({ darkTheme }) => {
    const { token } = useSelector((state) => state.auth);
    const { user } = useSelector((state) => state.profile);
    const { totalItems } = useSelector((state) => state.cart);
    const location = useLocation();
    const [loading, setLoading] = useState(false);

    const [subLinks, setSubLinks] = useState([]);

    async function fetchSublinks() {
        // console.log(subLinks)
        try {
            setLoading(true);
            const result = await apiConnector("GET", categories.CATEGORIES_API);
            // console.log("Printing Sublinks result ", result);
            setSubLinks(result.data.data);
            // setSubLinks(subLinks);
            setLoading(false);
        }
        catch (err) {
            console.log("Not fetched the catalog list")
            console.log(err);
        }
    }
    useEffect(() => {
        fetchSublinks();
    }, [])

    const matchRoute = (route) => {
        return matchPath({ path: route }, location.pathname)
    }
    return (
        <div className='flex h-14 items-center justify-center border-b-[1px] border-b-richblack-700'>
            <div className='flex w-11/12 max-w-maxContent items-center justify-between'>
                <Link to="/">
                    {
                        darkTheme ? (
                            <img src={EduSphereLogo} width={160} height={32} loading='lazy' className='lg:inline-block hidden' />
                        ) : (
                            <img src={LightEduSphereLogo} width={160} height={32} loading='lazy' className='lg:inline-block hidden' />
                        )
                    }
                    {
                        darkTheme ? (
                            <img src={EduSphereLogo} loading='lazy' className='w-[60%] lg:hidden' />
                        ) : (
                            <img src={LightEduSphereLogo} loading='lazy' className='w-[60%] lg:hidden' />
                        )
                    }

                </Link>

                <nav>
                    {/* for large screen */}
                    <ul className={`lg:flex gap-x-6 hidden ${darkTheme ? "text-richblack-25" : " text-richblack-600"}`}>
                        {
                            NavbarLinks.map((link, index) => {
                                return <li key={index}>
                                    {
                                        link.title === "Catalog" ? (
                                            <div className='relative flex items-center gap-2 group'>
                                                <p>{link.title}</p>
                                                <IoIosArrowDown />
                                                <div className='z-0 invisible absolute 
                                                left-[50%] translate-x-[-50%] translate-y-[20%] 
                                                top-[50%] flex flex-col rounded-md bg-richblack-5 p-4 text-richblack-900 opacity-0 transition-all duration-300 
                                                group-hover:visible group-hover:opacity-100 group-hover:z-40 lg:w-[300px]'>

                                                    <div className='absolute left-[50%] top-0
                                                     translate-x-[80%] translate-y-[-45%]
                                                    h-6 w-6 rotate-45 rounded bg-richblack-5'>
                                                    </div>
                                                    {
                                                        loading ? (
                                                            <div className="bg-transparent py-4 loader mx-auto"></div>
                                                            // <div className='text-black flex items-center'>
                                                            //  <span>Loading</span> 
                                                            // </div>
                                                        ) :
                                                            (

                                                                subLinks.length === 0 ? (
                                                                    <div className="rounded-lg bg-transparent py-4 pl-4 hover:bg-richblack-50">
                                                                        No categories Available
                                                                    </div>
                                                                ) : (
                                                                    subLinks.map((subLink, index) => (
                                                                        <Link
                                                                            to={`/catalog/${subLink.name
                                                                                .split(" ")
                                                                                .join("-")
                                                                                .toLowerCase()}`}
                                                                            className="rounded-lg bg-transparent py-4 pl-4 hover:bg-richblack-50"
                                                                            key={index}>
                                                                            <p>
                                                                                {subLink.name}
                                                                            </p>
                                                                        </Link>
                                                                    ))
                                                                )

                                                            )
                                                    }


                                                </div>
                                            </div>
                                        ) : (
                                            <Link to={link?.path}>
                                                <p className={`${matchRoute(link?.path) ? `${darkTheme ? " text-caribbeangreen-25" : "text-red"}` : `${darkTheme ? "text-richblack-25" : " text-richblack-600"}`}`}>
                                                    {link.title}
                                                </p>
                                            </Link>
                                        )
                                    }
                                </li>
                            })
                        }
                    </ul>
                </nav>

                {/* Login/Signup/Dashboard */}
                <div className='flex gap-x-4 items-center'>
                    {
                        user && user.accountType !== "Instructor" && (
                            <Link to="/dashboard/cart" className='relative'>
                                <IoCart className={`text-2xl ${darkTheme ? "text-white" : "text-black"}`} />
                                {
                                    totalItems > 0 &&
                                    <span className='absolute -top-1 -right-2 bg-green-600 text-xs w-5 h-5 flex justify-center items-center animate-bounce rounded-full text-white'>
                                        {totalItems}
                                    </span>
                                }
                            </Link>
                        )
                    }
                    {
                        token === null && (
                            <Link to="/login">
                                <button className={`lg:px-[20px] lg:py-[12px] rounded-md px-[2px] text-sm ${darkTheme ? "border bg-richblack-800 text-richblack-100 border-richblack-700 " : "bg-white text-richblack-600 hover:bg-richblack-5"}`}>
                                    Login
                                </button>
                            </Link>
                        )
                    }
                    {
                        token === null && (
                            <Link to="/signup">
                                <button className={`lg:px-[20px] lg:py-[12px] rounded-md px-[2px] text-sm ${darkTheme ? "border bg-richblack-800 text-richblack-100 border-richblack-700 " : "bg-white text-richblack-600 hover:bg-richblack-5"}`}>
                                    SignUp
                                </button>
                            </Link>
                        )
                    }
                    {
                        token !== null && <ProfileDropdown />
                    }
                </div>

            </div>
        </div >
    )
}

export default Navbar;