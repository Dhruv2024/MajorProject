import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import {
    createSubSection,
    updateSubSection,
} from "../services/operations/courseDetailsAPI";
import { setCourse } from "../slices/courseSlice"
const QuizCreateForm = ({ modalData, setModalData }) => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false)
    const [title, setTitle] = useState('');
    const [timeLimit, setTimeLimit] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [questions, setQuestions] = useState([{
        questionText: '',
        isImage: false,
        questionImage: null,
        questionImagePreview: null,
        options: [
            { text: '', isImage: false, image: null, imagePreview: null },
            { text: '', isImage: false, image: null, imagePreview: null },
            { text: '', isImage: false, image: null, imagePreview: null },
            { text: '', isImage: false, image: null, imagePreview: null },
        ],
        correctAnswer: '1',
        topic: '',
    }]);
    const [confirmationModal, setConfirmationModal] = useState(null);
    const { course } = useSelector((state) => state.course);
    const courseId = course._id || "temp";
    // console.log(courseId);
    const BASE_URL = import.meta.env.VITE_BASE_URL;
    const { token } = useSelector((state) => state.auth);
    const handleInputChange = useCallback((event, questionIndex, field) => {
        const newQuestions = [...questions];
        if (field === 'questionImage') {
            const file = event.target.files[0];
            if (file) {
                newQuestions[questionIndex][field] = file;
                newQuestions[questionIndex].questionImagePreview = URL.createObjectURL(file);
                newQuestions[questionIndex].isImage = true; // Set isImage to true when an image is uploaded
            } else {
                newQuestions[questionIndex][field] = null;
                newQuestions[questionIndex].questionImagePreview = null;
                newQuestions[questionIndex].isImage = false; // Set isImage to false when no image
            }
        } else {
            newQuestions[questionIndex][field] = event.target.value;
        }
        setQuestions(newQuestions);
    }, [questions, setQuestions]);

    const handleOptionChange = useCallback((event, questionIndex, optionIndex, field) => {
        const newQuestions = [...questions];
        const option = newQuestions[questionIndex].options[optionIndex];

        if (field === 'image') {
            const file = event.target.files[0];
            if (file) {
                option[field] = file;
                option.imagePreview = URL.createObjectURL(file);
                option.text = '';
                option.isImage = true;
            } else {
                option[field] = null;
                option.imagePreview = null;
                option.isImage = false;
            }
        } else {
            option[field] = event.target.value;
            option.isImage = false;
            option.image = null;
            option.imagePreview = null;
        }
        setQuestions(newQuestions);
    }, [questions, setQuestions]);

    const addQuestion = useCallback(() => {
        setQuestions(prevQuestions => [...prevQuestions, {
            questionText: '',
            isImage: false,
            questionImage: null,
            questionImagePreview: null,
            options: [
                { text: '', isImage: false, image: null, imagePreview: null },
                { text: '', isImage: false, image: null, imagePreview: null },
                { text: '', isImage: false, image: null, imagePreview: null },
                { text: '', isImage: false, image: null, imagePreview: null },
            ],
            correctAnswer: '1',
            topic: '',
        }]);
    }, [setQuestions]);
    const toISOStringLocal = (datetimeString) => {
        const date = new Date(datetimeString);
        return date.toISOString(); // Always UTC
    };

    const removeQuestion = useCallback((index) => {
        setQuestions(prevQuestions => {
            const newQuestions = [...prevQuestions];
            newQuestions.splice(index, 1);
            return newQuestions;
        });
    }, [setQuestions]);


    const addQuiz = async () => {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('timeLimit', timeLimit);
        formData.append('createdBy', 'user_placeholder'); // Replace with actual user ID
        formData.append('startTime', toISOStringLocal(startTime));
        formData.append('endTime', toISOStringLocal(endTime));
        formData.append('courseId', courseId);
        questions.forEach((questionData, index) => {
            formData.append(`questionsData[${index}][questionText]`, questionData.questionText);
            formData.append(`questionsData[${index}][isImage]`, questionData.isImage);
            if (questionData.questionImage) {
                // console.log("image is there");
                formData.append(`questionsData[${index}][questionImage]`, questionData.questionImage);
            }
            questionData.options.forEach((option, optionIndex) => {
                formData.append(`questionsData[${index}][options][${optionIndex}][text]`, option.text);
                formData.append(`questionsData[${index}][options][${optionIndex}][isImage]`, option.isImage);
                if (option.image) {
                    formData.append(`questionsData[${index}][options][${optionIndex}][image]`, option.image);
                }
            });
            formData.append(`questionsData[${index}][correctAnswer]`, questionData.correctAnswer);
            formData.append(`questionsData[${index}][topic]`, questionData.topic);
        });
        const toastId = toast.loading("Loading...")
        try {
            const response = await axios.post(`${BASE_URL}/quiz/createQuiz`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });
            // formData.forEach((value, key) => {
            //     console.log(`${key}: ${value}`);
            // });
            // const response = "";

            console.log('Quiz created:', response.data);
            if (response.data.success) {
                const quiz = response.data.quiz;
                const formData = new FormData()
                formData.append("type", "quiz")
                formData.append("sectionId", modalData)
                formData.append("title", quiz.title);
                formData.append("quizId", quiz._id);
                setLoading(true)
                const result = await createSubSection(formData, token, 'quiz')
                if (result) {
                    // update the structure of course
                    const updatedCourseContent = course.courseContent.map((section) =>
                        section._id === modalData ? result : section
                    )
                    const updatedCourse = { ...course, courseContent: updatedCourseContent }
                    dispatch(setCourse(updatedCourse))
                }
                setModalData(null)
                setLoading(false)
            }
            // Optionally redirect or show success message
        } catch (error) {
            console.error('Error creating quiz:', error.response ? error.response.data : error.message);
            // Optionally show error message
        }
        finally {
            toast.dismiss(toastId)
        }
    }

    const handleSubmit = useCallback(async (event) => {
        event.preventDefault();
        if (questions.length < 10) {
            toast.error("Minimum 10 questions are required for a quiz");
            return;
        }
        const confirmation = window.confirm("Are you sure??(once submitted quiz can not be edited)");
        if (!confirmation) {
            return;
        }
        addQuiz();
    }, [title, timeLimit, startTime, endTime, questions]);

    return (
        <div>
            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <h2 className="text-xl font-bold mb-6">Create New Quiz</h2>
                <div className="mb-4">
                    <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">
                        Title:
                    </label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="timeLimit" className="block text-gray-700 text-sm font-bold mb-2">
                        Time Limit (minutes):
                    </label>
                    <input
                        type="number"
                        id="timeLimit"
                        value={timeLimit}
                        onChange={(e) => setTimeLimit(e.target.value)}
                        min="1"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="startTime" className="block text-pure-greys-600 text-sm font-bold mb-2">
                        Start Time:
                    </label>
                    <input
                        type="datetime-local"
                        id="startTime"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        required
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="endTime" className="block text-pure-greys-600 text-sm font-bold mb-2">
                        End Time (for score release):
                    </label>
                    <input
                        type="datetime-local"
                        id="endTime"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        required
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>

                <h3 className="text-lg font-semibold mb-4">Questions:</h3>
                {questions.map((question, questionIndex) => (
                    <div key={questionIndex} className="mb-6 p-4 border rounded">
                        <h4 className="text-md font-semibold mb-2">Question {questionIndex + 1}</h4>
                        <div className="mb-2">
                            <label htmlFor={`questionText-${questionIndex}`} className="block text-pure-greys-600 text-sm font-bold mb-2">
                                Question Text:
                            </label>
                            <textarea
                                id={`questionText-${questionIndex}`}
                                value={question.questionText}
                                onChange={(e) => handleInputChange(e, questionIndex, 'questionText')}
                                rows="3"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-pure-greys-600 leading-tight focus:outline-none focus:shadow-outline"
                            />
                        </div>
                        <div className="mb-2">
                            {/* <label htmlFor={`image-${questionIndex}`} className="block text-gray-700 text-sm font-bold mb-2">
                                Select Image:
                            </label> */}
                            <div className="mt-1 flex rounded-md shadow-sm">
                                <label htmlFor={`image-${questionIndex}`} className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2">
                                    <span>Upload a file</span>
                                    <input
                                        id={`image-${questionIndex}`}
                                        name="questionImage"
                                        type="file"
                                        className="sr-only"
                                        accept="image/*"
                                        onChange={(e) => handleInputChange(e, questionIndex, 'questionImage')}
                                    />
                                </label>
                                {question.questionImage && (
                                    <span className="ml-3 inline-flex items-center px-3 py-2 rounded-md text-sm text-gray-500">
                                        {question.questionImage.name}
                                    </span>
                                )}
                            </div>
                            {question.questionImagePreview && (
                                <div className="mt-2">
                                    <label className="block text-gray-700 text-sm font-bold mb-1">Image Preview:</label>
                                    <img src={question.questionImagePreview} alt="Question Preview" className="max-w-xs h-auto rounded border" />
                                </div>
                            )}
                        </div>
                        <div className="mb-2">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Options:</label>
                            {question.options.map((option, optionIndex) => (
                                <div key={`option-${questionIndex}-${optionIndex}`} className="mb-2 flex items-center">


                                    {/* Text input field for options */}
                                    <input
                                        type="text"
                                        value={option.text}
                                        onChange={(e) => handleOptionChange(e, questionIndex, optionIndex, 'text')}
                                        placeholder={`Option ${optionIndex + 1}`}
                                        required
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    />
                                </div>
                            ))}

                        </div>
                        <div className="mb-2 relative">
                            <label htmlFor={`correctAnswer-${questionIndex}`} className="block text-gray-700 text-sm font-bold mb-2">
                                Correct Answer:
                            </label>

                            <div className="relative">
                                <select
                                    id={`correctAnswer-${questionIndex}`}
                                    value={question.correctAnswer || "1"}
                                    onChange={(e) => handleInputChange(e, questionIndex, 'correctAnswer')}
                                    required
                                    className="shadow appearance-none border rounded w-full py-2 pl-3 pr-10 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                >
                                    {/* Define your 4 options here */}
                                    <option value="1">Option 1</option>
                                    <option value="2">Option 2</option>
                                    <option value="3">Option 3</option>
                                    <option value="4">Option 4</option>
                                </select>

                                {/* Dropdown arrow icon */}
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>


                        <div className="mb-4">
                            <label htmlFor={`topic-${questionIndex}`} className="block text-gray-700 text-sm font-bold mb-2">
                                Topic:
                            </label>
                            <input
                                type="text"
                                id={`topic-${questionIndex}`}
                                value={question.topic}
                                onChange={(e) => handleInputChange(e, questionIndex, 'topic')}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => removeQuestion(questionIndex)}
                            className=" bg-richblue-100 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            Remove Question
                        </button>
                        <hr className="my-4" />
                    </div>
                ))}
                <div className='flex justify-between'>
                    <button
                        type="button"
                        onClick={addQuestion}
                        className="bg-caribbeangreen-400 hover:bg-caribbeangreen-500 text-white font-bold py-3 px-6 rounded focus:outline-none focus:shadow-outline mb-4"
                    >
                        Add New Question
                    </button>
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold px-6 rounded focus:outline-none focus:shadow-outline"
                    >
                        Create Quiz
                    </button>
                </div>
            </form>
        </div>
    );
};

export default QuizCreateForm;