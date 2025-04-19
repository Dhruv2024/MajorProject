import { useState, useEffect, useContext } from "react";
import { MdClose } from "react-icons/md";  // For the close (delete) icon
import { ThemeContext } from "../../../../../provider/themeContext";

export default function TagInput({ questionIndex, question, handleInputChange }) {
    const { darkTheme } = useContext(ThemeContext);

    // State to store tags entered by the user
    const [tags, setTags] = useState([]);

    // Update tags if the question object already has tags
    useEffect(() => {
        if (question?.tags) {
            setTags(question.tags);
        }
    }, [question]);

    // Function to handle user input when tags are added (on "Enter" or ",")
    const handleKeyDown = (event) => {
        if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            const tagValue = event.target.value.trim();
            // Only add the tag if it is non-empty and not already in the array
            if (tagValue && !tags.includes(tagValue)) {
                setTags([...tags, tagValue]);
                event.target.value = "";  // Clear the input field after adding
            }
        }
    };

    // Function to handle deletion of a tag
    const handleDeleteTag = (index) => {
        const newTags = tags.filter((_, i) => i !== index);
        setTags(newTags);
    };

    // Update parent component when tags change
    useEffect(() => {
        handleInputChange({ target: { value: tags } }, questionIndex, 'tags');
    }, [tags, questionIndex, handleInputChange]);

    return (
        <div className="mb-4">
            <label htmlFor={`topic-${questionIndex}`} className="block text-gray-700 text-sm font-bold mb-2">
                Topic:
            </label>
            <div className="flex flex-col space-y-2">
                {/* Render the chips and input */}
                <div className="flex flex-wrap gap-2">
                    {/* Render tags as chips */}
                    {tags.map((tag, index) => (
                        <div
                            key={index}
                            className={`m-1 flex items-center rounded-full px-2 py-1 text-sm ${darkTheme ? "bg-yellow-400 text-richblack-5" : "bg-blue-50 text-blue-500"}`}
                        >
                            {tag}
                            <button
                                type="button"
                                className="ml-2 focus:outline-none"
                                onClick={() => handleDeleteTag(index)}
                            >
                                <MdClose className="text-sm" />
                            </button>
                        </div>
                    ))}
                    {/* Input field to add new tags */}
                    <input
                        type="text"
                        placeholder="Add a tag"
                        onKeyDown={handleKeyDown}
                        className={`w-full ${darkTheme ? "form-style" : "light-form-style"}`}
                    />
                </div>
            </div>
        </div>
    );
}
