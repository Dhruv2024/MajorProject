import React, { useEffect, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { createRating } from '../../../services/operations/courseDetailsAPI';
import { IconBtn } from '../../common/IconBtn';
import { RxCross2 } from "react-icons/rx";
import ReactStars from "react-rating-stars-component";
import { ThemeContext } from '../../../provider/themeContext';

const CourseReviewModal = ({ setReviewModal }) => {
    const { user } = useSelector((state) => state.profile);
    const { token } = useSelector((state) => state.auth);
    const { courseEntireData } = useSelector((state) => state.viewCourse);
    const { darkTheme } = useContext(ThemeContext);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm();

    useEffect(() => {
        setValue("courseExperience", "");
        setValue("courseRating", 0);
    }, [setValue]);

    const ratingChanged = (newRating) => {
        setValue("courseRating", newRating);
    };

    const onSubmit = async (data) => {
        await createRating(
            {
                courseId: courseEntireData._id,
                rating: data.courseRating,
                review: data.courseExperience,
            },
            token
        );
        setReviewModal(false);
    };

    return (
        <div className="fixed inset-0 z-[1000] grid h-screen w-screen place-items-center overflow-auto bg-black bg-opacity-30 backdrop-blur-sm">
            <div
                className={`my-10 w-11/12 max-w-[700px] rounded-lg border 
                    ${darkTheme ? 'border-richblack-600 bg-richblack-800' : 'border-gray-300 bg-white'}`}
            >
                {/* Modal Header */}
                <div
                    className={`flex items-center justify-between rounded-t-lg p-5 
                        ${darkTheme ? 'bg-richblack-700 text-richblack-5' : 'bg-richblack-5 text-gray-900'}`}
                >
                    <p className="text-xl font-semibold">Add Review</p>
                    <button onClick={() => setReviewModal(false)}>
                        <RxCross2 className="text-2xl" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className={`p-6 ${darkTheme ? 'text-richblack-5' : 'text-gray-800'}`}>
                    <div className="flex items-center justify-center gap-x-4">
                        <img
                            src={user?.image}
                            alt={user?.firstName + " profile"}
                            className="aspect-square w-[50px] rounded-full object-cover"
                        />
                        <div>
                            <p className="font-semibold">
                                {user?.firstName} {user?.lastName}
                            </p>
                            <p className="text-sm">Posting Publicly</p>
                        </div>
                    </div>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="mt-6 flex flex-col items-center"
                    >
                        <ReactStars
                            count={5}
                            onChange={ratingChanged}
                            size={24}
                            activeColor={darkTheme ? "#ffd700" : "#75e9eb"}
                        />
                        <div className="flex w-11/12 flex-col space-y-2">
                            <label
                                htmlFor="courseExperience"
                                className="text-sm"
                            >
                                Add Your Experience <sup className="text-pink-200">*</sup>
                            </label>
                            <textarea
                                id="courseExperience"
                                placeholder="Add Your Experience"
                                {...register("courseExperience", { required: true })}
                                className={` min-h-[130px] w-full resize-none ${darkTheme ? 'bg-richblack-700 text-richblack-5 placeholder:text-richblack-300 form-style' : 'bg-white text-gray-800 placeholder:text-gray-400 light-form-style'
                                    }`}
                            />
                            {errors.courseExperience && (
                                <span className="ml-2 text-xs tracking-wide text-pink-200">
                                    Please Add Your Experience
                                </span>
                            )}
                        </div>
                        <div className="mt-6 flex w-11/12 justify-end gap-x-2">
                            <button
                                type="button"
                                onClick={() => setReviewModal(false)}
                                className={`flex cursor-pointer items-center gap-x-2 rounded-md py-[8px] px-[20px] font-semibold 
                                    ${darkTheme ? 'bg-richblack-600 text-richblack-5' : 'bg-gray-200 text-gray-900'}`}
                            >
                                Cancel
                            </button>
                            <IconBtn text="Save" />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CourseReviewModal;
