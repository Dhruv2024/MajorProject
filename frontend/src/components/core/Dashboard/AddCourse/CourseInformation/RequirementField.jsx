import { useContext, useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { ThemeContext } from "../../../../../provider/themeContext"

export default function RequirementsField({
    name,
    label,
    register,
    setValue,
    errors,
    getValues,
}) {
    const { editCourse, course } = useSelector((state) => state.course)
    const [requirement, setRequirement] = useState("")
    const [requirementsList, setRequirementsList] = useState([])

    useEffect(() => {
        if (editCourse) {
            setRequirementsList(course?.instructions)
        }
        register(name, { required: true, validate: (value) => value.length > 0 })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        setValue(name, requirementsList)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [requirementsList])

    const handleAddRequirement = () => {
        if (requirement) {
            setRequirementsList([...requirementsList, requirement])
            setRequirement("")
        }
    }

    const handleRemoveRequirement = (index) => {
        const updatedRequirements = [...requirementsList]
        updatedRequirements.splice(index, 1)
        setRequirementsList(updatedRequirements)
    }
    const { darkTheme } = useContext(ThemeContext);
    return (
        <div className="flex flex-col space-y-2">
            <label className={`text-sm  ${darkTheme ? "text-richblack-5" : "text-richblack-400"}`} htmlFor={name}>
                {label} <sup className="text-pink-200">*</sup>
            </label>
            <div className="flex flex-col items-start space-y-2">
                <input
                    type="text"
                    id={name}
                    value={requirement}
                    onChange={(e) => setRequirement(e.target.value)}
                    className={`w-full ${darkTheme ? "form-style" : "light-form-style"}`}
                />
                <button
                    type="button"
                    onClick={handleAddRequirement}
                    className={`font-semibold ${darkTheme ? "text-yellow-50" : "text-blue-500"}`}
                >
                    Add
                </button>
            </div>
            {requirementsList.length > 0 && (
                <ul className="mt-2 list-inside list-disc">
                    {requirementsList.map((requirement, index) => (
                        <li key={index} className={`flex items-center ${darkTheme ? "text-richblack-5" : "text-black"}`}>
                            <span>{requirement}</span>
                            <button
                                type="button"
                                className="ml-2 text-xs text-pure-greys-300 "
                                onClick={() => handleRemoveRequirement(index)}
                            >
                                clear
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            {errors[name] && (
                <span className="ml-2 text-xs tracking-wide text-pink-200">
                    {label} is required
                </span>
            )}
        </div>
    )
}