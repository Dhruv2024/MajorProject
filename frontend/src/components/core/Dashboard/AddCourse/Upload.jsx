import { useContext, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FiUploadCloud } from "react-icons/fi";
import { useSelector } from "react-redux";
import "video-react/dist/video-react.css";
import { Player } from "video-react";
import { ThemeContext } from "../../../../provider/themeContext";

export default function Upload({
    name,
    label,
    register,
    setValue,
    errors,
    video = false,
    viewData = null,
    editData = null,
    disable = false
}) {
    const { course } = useSelector((state) => state.course);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewSource, setPreviewSource] = useState(
        viewData ? viewData : editData ? editData : ""
    );
    const inputRef = useRef(null);
    const { darkTheme } = useContext(ThemeContext);

    // Handle file drop
    const onDrop = (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (file) {
            previewFile(file);
            setSelectedFile(file);
        }
    };

    // Setup dropzone
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: !video ? { "image/*": [".jpeg", ".jpg", ".png"] } : { "video/*": [".mp4"] },
        onDrop,
    });

    // File preview logic
    const previewFile = (file) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            setPreviewSource(reader.result);
        };
    };

    // Register with form
    useEffect(() => {
        register(name, { required: !disable });
    }, [register]);

    // Set value for form state when file is selected
    useEffect(() => {
        setValue(name, selectedFile);
    }, [selectedFile, setValue]);

    return (
        <div className="flex flex-col space-y-2">
            <label
                className={`text-sm  ${darkTheme ? "text-richblack-5" : "text-richblack-400"}`}
                htmlFor={name}
            >
                {label} {!viewData && <sup className="text-pink-200">*</sup>}
            </label>
            <div
                {...getRootProps()}
                className={`${isDragActive
                    ? `${darkTheme ? "bg-richblack-600" : "bg-blue-25"}`
                    : `${darkTheme ? "bg-richblack-700" : "bg-blue-5"}`
                    } flex min-h-[250px] cursor-pointer items-center justify-center rounded-md border-2 border-dotted border-richblack-500`}
            >
                {previewSource ? (
                    <div className="flex w-full flex-col p-6">
                        {!video ? (
                            <img
                                src={previewSource}
                                alt="Preview"
                                className="h-full w-full rounded-md object-cover"
                            />
                        ) : (
                            <Player aspectRatio="16:9" playsInline src={previewSource} />
                        )}
                        {!viewData && (
                            <button
                                type="button"
                                onClick={() => {
                                    setPreviewSource("");
                                    setSelectedFile(null);
                                    setValue(name, null);
                                }}
                                className="mt-3 text-richblack-400 underline"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="flex w-full flex-col items-center p-6">
                        <div className={`grid aspect-square w-14 place-items-center rounded-full ${darkTheme ? "bg-pure-greys-800" : "bg-blue-50"}`}>
                            <FiUploadCloud className={`text-2xl ${darkTheme ? "text-yellow-50" : "text-blue-500"}`} />
                        </div>
                        <p className="mt-2 max-w-[200px] text-center text-sm text-richblack-200">
                            Drag and drop an {!video ? "image" : "video"}, or click to{" "}
                            <span className={`font-semibold ${darkTheme ? "text-yellow-50" : "text-blue-500"}`}>Browse</span> a file
                        </p>
                        <ul className="mt-10 flex list-disc justify-between space-x-12 text-center text-xs text-richblack-200">
                            <li>Aspect ratio 16:9</li>
                            <li>Recommended size 1024x576</li>
                        </ul>
                    </div>
                )}
                {/* Ensures that input is correctly passed from useDropzone */}
                <input {...getInputProps()} ref={inputRef} style={{ display: 'none' }} />
            </div>
            {errors[name] && (
                <span className="ml-2 text-xs tracking-wide text-pink-200">
                    {label} is required
                </span>
            )}
        </div>
    );
}
