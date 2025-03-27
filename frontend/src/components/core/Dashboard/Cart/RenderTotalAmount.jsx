import React, { useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { IconBtn } from '../../../common/IconBtn';
import { useNavigate } from 'react-router-dom';
import { buyCourse } from "../../../../services/operations/studentFeaturesAPI"
import { ThemeContext } from '../../../../provider/themeContext';
const RenderTotalAmount = () => {
    const { total, cart } = useSelector((state) => state.cart)
    const { token } = useSelector((state) => state.auth)
    const { user } = useSelector((state) => state.profile)
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const handleBuyCourse = () => {
        const courses = cart.map((course) => course._id)
        buyCourse(token, courses, user, navigate, dispatch)
    }
    const { darkTheme } = useContext(ThemeContext);
    return (
        <div className={`min-w-[280px] rounded-md p-6 ${darkTheme ? "border-[1px] border-richblack-700 bg-richblack-800" : " bg-blue-5"}`}>
            <p className="mb-1 text-sm font-medium text-richblack-300">Total:</p>
            <p className={`mb-6 text-3xl font-medium  ${darkTheme ? "text-yellow-100" : "text-richblack-500"}`}>₹ {total}</p>
            <IconBtn
                text="Buy Now"
                onclick={handleBuyCourse}
                customClasses="w-full justify-center"
            />
        </div>
    )
}

export default RenderTotalAmount
