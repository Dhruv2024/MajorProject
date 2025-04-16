import React from 'react'

const RecordedLectureModal = () => {
    return (
        <div>
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-8 px-8 py-10"
            >
                {/* Lecture Video Upload */}
                <Upload
                    name="lectureVideo"
                    label="Lecture Video"
                    register={register}
                    setValue={setValue}
                    errors={errors}
                    video={true}
                    viewData={view ? modalData.videoUrl : null}
                    editData={edit ? modalData.videoUrl : null}
                />
                {/* Lecture Title */}
                <div className="flex flex-col space-y-2">
                    <label className={`text-sm ${darkTheme ? "text-richblack-5" : "text-richblack-400"}`} htmlFor="lectureTitle">
                        Lecture Title {!view && <sup className="text-pink-200">*</sup>}
                    </label>
                    <input
                        disabled={view || loading}
                        id="lectureTitle"
                        placeholder="Enter Lecture Title"
                        {...register("lectureTitle", { required: true })}
                        className={`w-full ${darkTheme ? "form-style" : "light-form-style"}`}
                    />
                    {errors.lectureTitle && (
                        <span className="ml-2 text-xs tracking-wide text-pink-200">
                            Lecture title is required
                        </span>
                    )}
                </div>
                {/* Lecture Description */}
                <div className="flex flex-col space-y-2">
                    <label className={`text-sm ${darkTheme ? "text-richblack-5" : "text-richblack-400"}`} htmlFor="lectureDesc">
                        Lecture Description{" "}
                        {!view && <sup className="text-pink-200">*</sup>}
                    </label>
                    <textarea
                        disabled={view || loading}
                        id="lectureDesc"
                        placeholder="Enter Lecture Description"
                        {...register("lectureDesc", { required: true })}
                        className={`resize-x-none min-h-[130px] w-full ${darkTheme ? "form-style" : "light-form-style"}`}
                    />
                    {errors.lectureDesc && (
                        <span className="ml-2 text-xs tracking-wide text-pink-200">
                            Lecture Description is required
                        </span>
                    )}
                </div>
                {/* Lecture resource */}
                <div className="flex flex-col space-y-2">
                    <label className={`text-sm ${darkTheme ? "text-richblack-5" : "text-richblack-400"}`} htmlFor="lectureDesc">
                        Lecture Resource{" "}
                    </label>
                    <textarea
                        disabled={view || loading}
                        id="lectureResource"
                        placeholder="Enter Lecture Resource"
                        {...register("lectureResource")}
                        className={`resize-x-none min-h-[130px] w-full ${darkTheme ? "form-style" : "light-form-style"}`}
                    />
                </div>
                {!view && (
                    <div className="flex justify-end">
                        <IconBtn
                            disabled={loading}
                            text={loading ? "Loading.." : edit ? "Save Changes" : "Save"}
                        />
                    </div>
                )}
            </form>
        </div>
    )
}

export default RecordedLectureModal