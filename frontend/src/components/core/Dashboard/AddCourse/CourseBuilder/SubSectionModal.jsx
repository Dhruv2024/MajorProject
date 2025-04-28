import { useContext, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import { RxCross2 } from "react-icons/rx"
import { useDispatch, useSelector } from "react-redux"

import {
    createSubSection,
    updateSubSection,
} from "../../../../../services/operations/courseDetailsAPI"
import { setCourse } from "../../../../../slices/courseSlice"

import Upload from "../Upload"
import { IconBtn } from "../../../../common/IconBtn"
import { ThemeContext } from "../../../../../provider/themeContext"
import QuizCreateForm from "../../../../../pages/Quiz"

export default function SubSectionModal({
    modalData,
    setModalData,
    add = false,
    view = false,
    edit = false,
    type: initialType
}) {
    // console.log("view", view);
    // console.log(initialType);
    console.log(modalData);
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
        getValues,
    } = useForm()

    const { darkTheme } = useContext(ThemeContext);
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false)
    const { token } = useSelector((state) => state.auth)
    const { course } = useSelector((state) => state.course)
    const [subSectionType, setSubSectionType] = useState(initialType);
    const [pdfPreview, setPdfPreview] = useState(null);

    console.log("subsection type is ", subSectionType);
    useEffect(() => {
        if (view || edit) {
            // console.log("viewing");
            // console.log(modalData.type);
            if (modalData.type === 'recorded') {
                setValue("lectureTitle", modalData.title)
                setValue("lectureDesc", modalData.description)
                setValue("lectureVideo", modalData.videoUrl)
                setValue("lectureResource", modalData.resource)
                setValue("lectureNotes", modalData.lectureNotes);
                if (modalData.lectureNotes && modalData.lectureNotes.endsWith(".pdf")) {
                    setPdfPreview(modalData.lectureNotes);
                }

            }
            else if (modalData.type === 'videoCall') {
                setValue("lectureTitle", modalData.title)
                setValue("lectureDesc", modalData.description)
                setValue("lectureVideo", modalData.meetUrl)
                // Convert UTC time to local datetime-local format (YYYY-MM-DDTHH:MM)
                const localStartTime = new Date(modalData.meetStartTime)
                const tzOffset = localStartTime.getTimezoneOffset() * 60000
                const localISOTime = new Date(localStartTime - tzOffset).toISOString().slice(0, 16)

                setValue("startTime", localISOTime)

            }
            else if (modalData.type === 'youtube') {
                setValue("lectureVideo", modalData.youtubeLink);
                setValue("lectureTitle", modalData.title);
                setValue("lectureDesc", modalData.description);
                // Convert UTC time to local datetime-local format (YYYY-MM-DDTHH:MM)
                const localStartTime = new Date(modalData.meetStartTime)
                const tzOffset = localStartTime.getTimezoneOffset() * 60000
                const localISOTime = new Date(localStartTime - tzOffset).toISOString().slice(0, 16)

                setValue("startTime", localISOTime)
            }
            setSubSectionType(modalData.type);
        } else if (initialType === 'quiz') {
            setSubSectionType('quiz');
        }
        else if (add) {
            setSubSectionType('recorded');
        }
    }, [view, edit, modalData, setValue, add, initialType])

    // detect whether form is updated or not
    const isFormUpdated = () => {
        const currentValues = getValues();
        console.log(currentValues.lectureNotes !== modalData.lectureNotes);
        if (
            currentValues.lectureTitle !== modalData.title ||
            currentValues.lectureDesc !== modalData.description ||
            currentValues.lectureVideo !== modalData.videoUrl ||
            currentValues.lectureResource !== modalData.resource ||
            (subSectionType === 'videoCall' && currentValues.startTime !== modalData.startTime) ||
            subSectionType !== (modalData.subSectionType || 'recorded') ||
            currentValues.lectureNotes !== modalData.lectureNotes ||
            (subSectionType === 'youtube' && currentValues.lectureVideo !== modalData.youtubeLink) ||
            (subSectionType === 'youtube' && currentValues.startTime !== modalData.meetStartTime)
        ) {
            return true
        }
        return false
    }

    // handle the editing of subsection
    const handleEditSubsection = async () => {
        const currentValues = getValues();
        // console.log(currentValues)
        const formData = new FormData()
        formData.append("sectionId", modalData.sectionId)
        formData.append("subSectionId", modalData._id)
        formData.append("subSectionType", subSectionType)
        if (currentValues.lectureTitle !== modalData.title) {
            formData.append("title", currentValues.lectureTitle)
        }
        if (currentValues.lectureDesc !== modalData.description) {
            formData.append("description", currentValues.lectureDesc)
        }
        if (currentValues.lectureVideo !== modalData.videoUrl && subSectionType === 'recorded') {
            formData.append("video", currentValues.lectureVideo)
        }
        if (currentValues.lectureResource !== modalData.resource && subSectionType === 'recorded') {
            formData.append("resource", currentValues.lectureResource)
        }
        if (currentValues.lectureNotes !== modalData.lectureNotes && subSectionType === 'recorded') {
            formData.append("lectureNotes", currentValues.lectureNotes)
        }
        if (subSectionType === 'videoCall' && currentValues.startTime !== modalData.meetStartTime) {
            formData.append("startTime", currentValues.startTime)
        }
        if (subSectionType === 'videoCall' && currentValues.lectureTitle !== modalData.title) {
            formData.append("tile", currentValues.lectureTitle)
        }
        if (subSectionType === 'videoCall' && currentValues.lectureDesc !== modalData.description) {
            formData.append("description", currentValues.lectureDesc)
        } if (subSectionType === 'videoCall' && currentValues.lectureVideo !== modalData.meetUrl) {
            formData.append("meetUrl", currentValues.lectureVideo)
        }
        if (subSectionType === 'youtube') {
            if (currentValues.lectureVideo !== modalData.youtubeLink) {
                formData.append("video", currentValues.lectureVideo);
                toast((t) => (
                    <div className="flex justify-between items-center space-x-4">
                        <span>
                            If you are doing a live class, then update link for recording after ending class
                        </span>
                        <button
                            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                            onClick={() => toast.dismiss(t.id)}
                        >
                            Dismiss
                        </button>
                    </div>
                ));

            }
            if (currentValues.startTime !== modalData.startTime) {
                formData.append("startTime", currentValues.startTime)
            }
        }

        setLoading(true)
        const result = await updateSubSection(formData, token)
        if (result) {
            const updatedCourseContent = course.courseContent.map((section) =>
                section._id === modalData.sectionId ? result : section
            )
            const updatedCourse = { ...course, courseContent: updatedCourseContent }
            dispatch(setCourse(updatedCourse))
        }
        setModalData(null)
        setLoading(false)
    }

    const onSubmit = async (data) => {
        if (view) return

        if (edit) {
            if (!isFormUpdated()) {
                toast.error("No changes made to the form")
            } else {
                handleEditSubsection()
            }
            return
        }
        console.log(data);
        const formData = new FormData()
        formData.append("subSectionType", subSectionType)
        formData.append("sectionId", modalData)
        formData.append("title", data.lectureTitle)
        formData.append("description", data.lectureDesc)
        if (subSectionType === 'recorded') {
            formData.append("video", data.lectureVideo)
            formData.append("resource", data.lectureResource)
            formData.append("type", "recorded");
            if (data.lectureNotes && data.lectureNotes instanceof File) {
                formData.append("lectureNotes", data.lectureNotes);
            }
        }
        else if (subSectionType === 'videoCall') {
            formData.append("video", data.lectureVideo) // Using video for video call link
            const localStart = new Date(data.startTime)
            const utcStart = new Date(localStart.getTime() - localStart.getTimezoneOffset() * 60000)
            formData.append("startTime", utcStart.toISOString())
            formData.append("type", "videoCall");

        }
        else if (subSectionType === 'youtube') {
            formData.append("youtubeLink", data.lectureVideo)
            const localStart = new Date(data.startTime)
            const utcStart = new Date(localStart.getTime() - localStart.getTimezoneOffset() * 60000)
            formData.append("startTime", utcStart.toISOString())
            formData.append("type", "youtube")
        }

        setLoading(true)
        const result = await createSubSection(formData, token)
        if (result) {
            const updatedCourseContent = course.courseContent.map((section) =>
                section._id === modalData ? result : section
            )
            const updatedCourse = { ...course, courseContent: updatedCourseContent }
            dispatch(setCourse(updatedCourse))
        }
        setModalData(null)
        setLoading(false)
    }

    const handleSubSectionTypeChange = (event) => {
        setSubSectionType(event.target.value);
    };
    // console.log(modalData);
    return (
        <div className={`fixed inset-0 z-[1000] !mt-0 grid h-screen w-screen place-items-center overflow-auto bg-opacity-10 backdrop-blur-sm ${darkTheme ? "bg-white" : "bg-black"}`}>
            <div className={`my-10 w-11/12 max-w-[700px] rounded-lg border ${darkTheme ? "border-richblack-400 bg-richblack-800" : "border-richblack-25 bg-white"}`}>
                {/* Modal Header */}
                <div className="flex items-center justify-between rounded-t-lg p-5">
                    {
                        subSectionType === 'recorded' &&
                        <p className={`text-xl font-semibold ${darkTheme ? "text-richblack-5" : "text-richblack-700"}`}>
                            {view && "Viewing"} {add && "Adding"} {edit && "Editing"} Lecture
                        </p>
                    }
                    {
                        subSectionType === 'quiz' &&
                        <p className={`text-xl font-semibold ${darkTheme ? "text-richblack-5" : "text-richblack-700"}`}>
                            {view && "Viewing"} {add && "Adding"} {edit && "Editing"} Quiz
                        </p>
                    }
                    {
                        subSectionType === 'videoCall' &&
                        <p className={`text-xl font-semibold ${darkTheme ? "text-richblack-5" : "text-richblack-700"}`}>
                            {view && "Viewing"} {add && "Adding"} {edit && "Editing"} Video Call
                        </p>
                    }
                    {
                        subSectionType === 'youtube' &&
                        <p className={`text-xl font-semibold ${darkTheme ? "text-richblack-5" : "text-richblack-700"}`}>
                            {view && "Viewing"} {add && "Adding"} {edit && "Editing"} Youtube Lecture
                        </p>
                    }
                    <button onClick={() => (!loading ? setModalData(null) : {})}>
                        <RxCross2 className={`text-2xl ${darkTheme ? "text-richblack-5" : "text-black"}`} />
                    </button>
                </div>
                {/* Modal Form */}
                <div className="px-8 py-6">
                    {initialType !== 'quiz' && (
                        <div className="flex flex-col space-y-2 mb-4">
                            <label className={`text-sm ${darkTheme ? "text-richblack-5" : "text-richblack-400"}`} htmlFor="subSectionType">
                                Sub-Section Type {!view && <sup className="text-pink-200">*</sup>}
                            </label>
                            <select
                                id="subSectionType"
                                disabled={view || loading}
                                value={subSectionType}
                                onChange={handleSubSectionTypeChange}
                                className={`w-full ${darkTheme ? "form-style" : "light-form-style"}`}
                            >
                                <option value="recorded">Recorded Lecture</option>
                                <option value="videoCall">Video Call</option>
                                <option value="youtube">YouTube</option>
                            </select>
                        </div>
                    )}

                    {subSectionType === 'recorded' && (
                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="space-y-8"
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
                                disable={view}
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
                                    Lecture Description {!view && <sup className="text-pink-200">*</sup>}
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
                                <label className={`text-sm ${darkTheme ? "text-richblack-5" : "text-richblack-400"}`} htmlFor="lectureResource">
                                    Lecture Resource
                                </label>
                                <textarea
                                    disabled={view || loading}
                                    id="lectureResource"
                                    placeholder="Enter Lecture Resource"
                                    {...register("lectureResource")}
                                    className={`resize-x-none min-h-[130px] w-full ${darkTheme ? "form-style" : "light-form-style"}`}
                                />
                            </div>
                            {/* Upload Lecture Notes PDF (lectureNotes) */}
                            <div className="flex flex-col space-y-2">
                                <label className={`text-sm ${darkTheme ? "text-richblack-5" : "text-richblack-400"}`}>
                                    Upload Lecture Notes (PDF)
                                </label>
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    disabled={view || loading}
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file && file.type === "application/pdf") {
                                            setValue("lectureNotes", file);
                                            setPdfPreview(URL.createObjectURL(file));
                                        }
                                    }}
                                    className={`w-full ${darkTheme ? "form-style" : "light-form-style"}`}
                                />
                                {pdfPreview && (
                                    <div className="mt-2 w-full h-[400px] border rounded">
                                        <iframe
                                            src={pdfPreview}
                                            title="Lecture Notes Preview"
                                            className="w-full h-full"
                                            frameBorder="0"
                                        />
                                    </div>
                                )}
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
                    )}

                    {subSectionType === 'quiz' && (
                        <div>
                            <QuizCreateForm modalData={modalData} setModalData={setModalData} />
                        </div>
                    )}

                    {subSectionType === 'videoCall' && (
                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="space-y-8"
                        >
                            {/* Video Call Link */}
                            <div className="flex flex-col space-y-2">
                                <label className={`text-sm ${darkTheme ? "text-richblack-5" : "text-richblack-400"}`} htmlFor="lectureVideo">
                                    Video Call Link {!view && <sup className="text-pink-200">*</sup>}
                                </label>
                                <input
                                    disabled={view || loading}
                                    id="lectureVideo"
                                    placeholder="Enter Video Call Link (e.g., Google Meet, Zoom)"
                                    {...register("lectureVideo", { required: true })}
                                    className={`w-full ${darkTheme ? "form-style" : "light-form-style"}`}
                                />
                                {errors.lectureVideo && (
                                    <span className="ml-2 text-xs tracking-wide text-pink-200">
                                        Video Call Link is required
                                    </span>
                                )}
                            </div>
                            {/* Start Time */}
                            <div className="flex flex-col space-y-2">
                                <label className={`text-sm ${darkTheme ? "text-richblack-5" : "text-richblack-400"}`} htmlFor="startTime">
                                    Start Time {!view && <sup className="text-pink-200">*</sup>}
                                </label>
                                {view ? (
                                    <div className="w-full px-2 py-2 border rounded text-sm">
                                        {modalData.meetStartTime ? new Date(modalData.meetStartTime).toLocaleString() : "N/A"}

                                    </div>
                                ) : (
                                    <div>
                                        <input
                                            id="startTime"
                                            type="datetime-local"
                                            disabled={loading}
                                            {...register("startTime", { required: true })}
                                            className={`w-full ${darkTheme ? "form-style" : "light-form-style"}`}
                                        />
                                        {errors.startTime && (
                                            <span className="ml-2 text-xs tracking-wide text-pink-200">
                                                Start Time is required
                                            </span>
                                        )}
                                    </div>
                                )}
                                {/* <input
                                    disabled={view || loading}
                                    id="startTime"
                                    type="datetime-local"
                                    {...register("startTime", { required: true })}
                                    className={`w-full ${darkTheme ? "form-style" : "light-form-style"}`}
                                />
                                {errors.startTime && (
                                    <span className="ml-2 text-xs tracking-wide text-pink-200">
                                        Start Time is required
                                    </span>
                                )} */}
                            </div>
                            {/* Title */}
                            <div className="flex flex-col space-y-2">
                                <label className={`text-sm ${darkTheme ? "text-richblack-5" : "text-richblack-400"}`} htmlFor="lectureTitle">
                                    Title {!view && <sup className="text-pink-200">*</sup>}
                                </label>
                                <input
                                    disabled={view || loading}
                                    id="lectureTitle"
                                    placeholder="Enter Title for the Video Call"
                                    {...register("lectureTitle", { required: true })}
                                    className={`w-full ${darkTheme ? "form-style" : "light-form-style"}`}
                                />
                                {errors.lectureTitle && (
                                    <span className="ml-2 text-xs tracking-wide text-pink-200">
                                        Title is required
                                    </span>
                                )}
                            </div>
                            {/* Description */}
                            <div className="flex flex-col space-y-2">
                                <label className={`text-sm ${darkTheme ? "text-richblack-5" : "text-richblack-400"}`} htmlFor="lectureDesc">
                                    Description{!view && <sup className="text-pink-200">*</sup>}
                                </label>
                                <textarea
                                    disabled={view || loading}
                                    id="lectureDesc"
                                    placeholder="Enter Description for the Video Call"
                                    {...register("lectureDesc", { required: true })}
                                    className={`resize-x-none min-h-[130px] w-full ${darkTheme ? "form-style" : "light-form-style"}`}
                                />
                                {errors.lectureDesc && (
                                    <span className="ml-2 text-xs tracking-wide text-pink-200">
                                        Description is required
                                    </span>
                                )}
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
                    )}

                    {subSectionType === 'youtube' && (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                            {/* YouTube Link */}
                            <div className="flex flex-col space-y-2">
                                <label className={`text-sm ${darkTheme ? "text-richblack-5" : "text-richblack-400"}`} htmlFor="lectureVideo">
                                    YouTube Video Link {!view && <sup className="text-pink-200">*</sup>}
                                </label>
                                <input
                                    disabled={view || loading}
                                    id="lectureVideo"
                                    placeholder="Enter YouTube Video Link"
                                    {...register("lectureVideo", { required: true })}
                                    className={`w-full ${darkTheme ? "form-style" : "light-form-style"}`}
                                />
                                {errors.lectureVideo && (
                                    <span className="ml-2 text-xs tracking-wide text-pink-200">
                                        YouTube link is required
                                    </span>
                                )}
                            </div>

                            {/* Start Time */}
                            <div className="flex flex-col space-y-2">
                                <label className={`text-sm ${darkTheme ? "text-richblack-5" : "text-richblack-400"}`} htmlFor="startTime">
                                    Start Time {!view && <sup className="text-pink-200">*</sup>}
                                </label>
                                {view ? (
                                    <div className="w-full px-2 py-2 border rounded text-sm">
                                        {modalData?.meetStartTime ? new Date(modalData.meetStartTime).toLocaleString() : "N/A"}
                                    </div>
                                ) : (
                                    <input
                                        id="startTime"
                                        type="datetime-local"
                                        disabled={loading}
                                        {...register("startTime", { required: true })}
                                        className={`w-full ${darkTheme ? "form-style" : "light-form-style"}`}
                                    />
                                )}
                                {errors.startTime && (
                                    <span className="ml-2 text-xs tracking-wide text-pink-200">
                                        Start Time is required
                                    </span>
                                )}
                            </div>

                            {/* Title */}
                            <div className="flex flex-col space-y-2">
                                <label className={`text-sm ${darkTheme ? "text-richblack-5" : "text-richblack-400"}`} htmlFor="lectureTitle">
                                    Title {!view && <sup className="text-pink-200">*</sup>}
                                </label>
                                <input
                                    disabled={view || loading}
                                    id="lectureTitle"
                                    placeholder="Enter Title"
                                    {...register("lectureTitle", { required: true })}
                                    className={`w-full ${darkTheme ? "form-style" : "light-form-style"}`}
                                />
                            </div>

                            {/* Description */}
                            <div className="flex flex-col space-y-2">
                                <label className={`text-sm ${darkTheme ? "text-richblack-5" : "text-richblack-400"}`} htmlFor="lectureDesc">
                                    Description {!view && <sup className="text-pink-200">*</sup>}
                                </label>
                                <textarea
                                    disabled={view || loading}
                                    id="lectureDesc"
                                    placeholder="Enter Description"
                                    {...register("lectureDesc", { required: true })}
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
                    )}

                </div>
            </div>
        </div>
    )
}