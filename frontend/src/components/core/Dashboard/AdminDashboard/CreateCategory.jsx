import React, { useContext, useState } from 'react'
import { IconBtn } from '../../../common/IconBtn';
import { useDispatch, useSelector } from 'react-redux';
import { createCategory } from '../../../../services/operations/createCategoryAPI';
import toast from 'react-hot-toast';
import { ThemeContext } from '../../../../provider/themeContext';

const CreateCategory = () => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const dispatch = useDispatch();
    const { token } = useSelector((state) => state.auth);
    const { darkTheme } = useContext(ThemeContext);

    function handleSubmit(e) {
        e.preventDefault();
        if (name === "" || description === "") {
            toast.error("Fill all the fields");
            return;
        }
        dispatch(createCategory(name, description, token));
        // console.log("starting to empty columns")
        setName("");
        setDescription("");
    }
    return (
        <div className={` ${darkTheme ? "text-white" : "text-blue-100"}`}>
            <h1 className={`text-center text-3xl font-semibold mb-5`}>Add<span className="text-blue-100"> New Category</span></h1>
            <form onSubmit={handleSubmit} className='flex flex-col'>
                <label htmlFor='name' className='mb-5'>
                    <p className={`font-inter ${!darkTheme && "text-richblack-800"}`}>
                        Title of category <span className='text-red'>*</span>
                    </p>
                    <input name='name' id='name' placeholder='Enter title of Category' value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                        }}
                        style={{
                            boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
                        }}
                        className={`w-full rounded-[0.5rem] p-[12px] ${darkTheme ? "bg-richblack-800 text-richblack-5" : "bg-blue-5"}`} />
                </label>

                <label htmlFor='description'>
                    <p className={`font-inter ${!darkTheme && "text-richblack-800"}`}>
                        Description of category <span className='text-red'>*</span>
                    </p>
                    <input name='description' id='description' placeholder='Enter description of Category'
                        onChange={(e) => {
                            setDescription(e.target.value);
                        }}
                        style={{
                            boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
                        }}
                        className={`w-full rounded-[0.5rem] p-[12px] ${darkTheme ? "bg-richblack-800 text-richblack-5" : "bg-blue-5"}`} />
                </label>
                <button type='submit' className="mt-8 flex justify-center">
                    <IconBtn text={"Create Category"} />
                </button>
            </form>
        </div >
    )
}

export default CreateCategory