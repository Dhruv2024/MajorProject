
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { fetchQuiz, submitQuiz } from '../services/operations/quizAPI';
import { useSelector } from 'react-redux';

const StartQuiz = () => {
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const { courseId, subSectionId, quizId } = useParams();
    const { token } = useSelector((state) => state.auth);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [inFullscreen, setInFullscreen] = useState(document.fullscreenElement !== null);
    const [quizStarted, setQuizStarted] = useState(false);
    const [popupImage, setPopupImage] = useState(null);
    const [completed, setCompleted] = useState(null);
    const [error, setError] = useState(null);

    const {
        courseSectionData,
        courseEntireData,
        totalNoOfLectures,
        completedLectures,
    } = useSelector((state) => state.viewCourse);
    console.log(completedLectures);

    const localQuizKey = `active-quiz-${quizId}`;
    const localEndKey = `quiz-${quizId}-endTime`;
    const localAnswersKey = `quiz-${quizId}-answers`;
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const fetchingQuiz = async () => {
            setLoading(true);
            const data = { courseId, quizId };
            const result = await fetchQuiz(data, token, navigate, location);
            console.log(result);
            if (result) {
                setQuiz(result);
            } else {
                setError("Failed to fetch quiz.");
            }
            setLoading(false);
        };
        fetchingQuiz();
    }, [courseId, quizId, token]);

    useEffect(() => {
        if (!quiz) return;

        const storedQuizId = localStorage.getItem(localQuizKey);
        const storedEnd = localStorage.getItem(localEndKey);
        const storedAnswers = localStorage.getItem(localAnswersKey);

        if (storedQuizId === quiz._id && storedEnd && Date.now() < new Date(storedEnd).getTime()) {
            setQuizStarted(true);
            setTimeLeft(new Date(storedEnd).getTime() - Date.now());
            if (storedAnswers) {
                setAnswers(JSON.parse(storedAnswers));
            } else {
                const initialAnswers = {};
                quiz.questions.forEach(q => {
                    initialAnswers[q._id] = null;
                });
                setAnswers(initialAnswers);
            }
        } else if (storedQuizId === quiz._id && Date.now() >= new Date(storedEnd).getTime()) {
            // Quiz time expired on previous session
            setSubmitted(true);
            localStorage.removeItem(localEndKey);
            localStorage.removeItem(localQuizKey);
            localStorage.removeItem(localAnswersKey);
        }
    }, [quiz, localQuizKey, localEndKey, localAnswersKey]);

    useEffect(() => {
        if (!quizStarted || !quiz) return;

        const interval = setInterval(() => {
            const storedEnd = localStorage.getItem(localEndKey);
            if (!storedEnd) {
                clearInterval(interval);
                return;
            }

            const endTime = new Date(storedEnd).getTime();
            const now = Date.now();
            const diff = Math.max(0, endTime - now);
            setTimeLeft(diff);

            if (diff <= 0 && !submitted) {
                handleSubmit();
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [submitted, quizStarted, quiz, localEndKey]);

    useEffect(() => {
        const handler = () => setInFullscreen(document.fullscreenElement !== null);
        document.addEventListener("fullscreenchange", handler);
        return () => document.removeEventListener("fullscreenchange", handler);
    }, []);

    const startQuiz = () => {
        if (!quiz) return;

        const now = new Date();
        const quizEndTime = new Date(quiz.endTime);
        const maxAllowedTime = Math.floor((quizEndTime.getTime() - now.getTime()) / 60000);

        if (maxAllowedTime <= 0) {
            setError("Quiz time is over.");
            return;
        }

        const actualTime = Math.min(quiz.timeLimit, maxAllowedTime);
        const end = new Date();
        end.setMinutes(end.getMinutes() + actualTime);
        localStorage.setItem(localEndKey, end.toISOString());
        localStorage.setItem(localQuizKey, quiz._id);

        const initialAnswers = {};
        quiz.questions.forEach(q => {
            initialAnswers[q._id] = null;
        });
        setAnswers(initialAnswers);
        localStorage.setItem(localAnswersKey, JSON.stringify(initialAnswers));

        setQuizStarted(true);
        setTimeLeft(actualTime * 60 * 1000); // Set initial timeLeft
        enterFullscreen();
    };

    const handleOptionChange = (qId, index) => {
        setAnswers((prev) => ({ ...prev, [qId]: index + 1 }));
        localStorage.setItem(localAnswersKey, JSON.stringify({ ...answers, [qId]: index }));
    };

    const handleSubmit = async () => {
        if (!quiz) return;
        const finalAnswers = quiz.questions.map((q) => ({
            questionId: q._id,
            answer: answers[q._id] ?? null,
        }));
        localStorage.removeItem(localEndKey);
        localStorage.removeItem(localQuizKey);
        localStorage.removeItem(localAnswersKey);
        const data = { quizId, finalAnswers, courseId, subSectionId }
        console.log("Quiz Submitted!", data);
        const result = await submitQuiz(data, token);
        setSubmitted(true);

    };

    const enterFullscreen = () => {
        const el = document.documentElement;
        if (el.requestFullscreen) el.requestFullscreen();
    };

    const formatTime = (ms) => {
        if (ms <= 0) return "00:00";
        const total = Math.floor(ms / 1000);
        const minutes = String(Math.floor(total / 60)).padStart(2, "0");
        const seconds = String(total % 60).padStart(2, "0");
        return `${minutes}:${seconds}`;
    };

    if (loading) {
        return <div className='loader'></div>;
    }

    if (error) {
        return (
            <div style={styles.centeredContainer}>
                <div style={styles.errorContainer}>
                    <div style={styles.errorHeader}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4"
                        >
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        <div style={styles.errorTitle}>Error</div>
                    </div>
                    <div>{error}</div>
                </div>
            </div>
        );
    }

    if (submitted) return (
        <div style={styles.centeredContainer}>
            <div style={styles.submittedContainer}>
                <div style={styles.submittedTitle}>Quiz Submitted!</div>
                <div style={styles.submittedText}>
                    Thank you for completing the quiz.
                </div>
            </div>
        </div>
    );

    return (
        <div style={styles.mainContainer}>
            {quiz && (
                <div style={styles.quizContainer}>
                    <h1 style={styles.quizTitle}>Quiz Topic: {quiz.title}</h1>

                    {!quizStarted && (
                        <div style={{ textAlign: 'center' }}>
                            <button
                                onClick={startQuiz}
                                style={styles.startButton}
                            >
                                Start Quiz
                            </button>
                        </div>
                    )}

                    {quizStarted && (
                        <>
                            <div style={styles.timeLeft}>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-5 w-5"
                                >
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                    <path d="M2 12h20"></path>
                                </svg>
                                <span>Time Left:
                                    <span style={styles.timeLeftValue}>
                                        {formatTime(timeLeft)}
                                    </span>
                                </span>
                            </div>

                            {!inFullscreen ? (
                                <div style={styles.fullscreenWarning}>
                                    <div style={styles.fullscreenWarningHeader}>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="h-4 w-4"
                                        >
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <line x1="12" y1="8" x2="12" y2="12"></line>
                                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                        </svg>
                                        <div style={styles.fullscreenWarningTitle}>Fullscreen Required</div>
                                    </div>
                                    <div>
                                        Please enter fullscreen mode to continue the quiz.
                                        <button
                                            onClick={enterFullscreen}
                                            style={styles.fullscreenButton}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="h-4 w-4"
                                            >
                                                <path d="M15 3h6v6"></path>
                                                <path d="M9 15H3v6"></path>
                                                <path d="M21 3l-9.19 9.19"></path>
                                                <path d="M3 21l9.19-9.19"></path>
                                            </svg>
                                            Enter Fullscreen
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                    {quiz.questions.map((q, index) => (
                                        <div
                                            key={q._id}
                                            style={styles.questionContainer}
                                        >
                                            <div style={styles.questionTitle}>
                                                Question {index + 1}: {q.question}
                                            </div>
                                            {q.isImage && (
                                                <div
                                                    style={styles.imageContainer}
                                                    onClick={() => setPopupImage(q.imageUrl)}
                                                >
                                                    <img
                                                        src={q.imageUrl}
                                                        alt="Question"
                                                        style={styles.questionImage}
                                                    />
                                                </div>
                                            )}
                                            <div style={{ marginTop: '1.5rem' }}>
                                                {q.options.map((optObj, i) => {
                                                    const isSelected = answers[q._id] === i + 1;
                                                    return (
                                                        <div key={i} style={styles.optionContainer}>
                                                            <input
                                                                type="radio"
                                                                id={`question-<span class="math-inline">\{q\.\_id\}\-option\-</span>{i}`}
                                                                name={q._id}
                                                                value={optObj.option}
                                                                checked={isSelected}
                                                                onChange={() => handleOptionChange(q._id, i)}
                                                                style={styles.optionInput}
                                                            />
                                                            <label
                                                                htmlFor={`question-<span class="math-inline">\{q\.\_id\}\-option\-</span>{i}`}
                                                                style={styles.optionLabel}
                                                            >
                                                                {optObj.option}
                                                            </label>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}

                                    <div style={{ textAlign: 'center' }}>
                                        <button
                                            onClick={handleSubmit}
                                            style={styles.submitButton}
                                        >
                                            Submit Quiz
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* 🔍 Image Popup Modal */}
                    {popupImage && (
                        <div
                            style={styles.popupOverlay}
                            onClick={() => setPopupImage(null)}
                        >
                            <div
                                style={styles.popupContent}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <img
                                    src={popupImage}
                                    alt="Enlarged"
                                    style={styles.popupImage}
                                />
                                <button
                                    onClick={() => setPopupImage(null)}
                                    style={styles.popupCloseButton}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="h-6 w-6 text-gray-900"
                                    >
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <path d="M15 9l-6 6"></path>
                                        <path d="M9 9l6 6"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const styles = {
    mainContainer: {
        minHeight: '100vh',
        backgroundColor: '#f3f4f6',
        padding: '2rem 0',
    },
    quizContainer: {
        maxWidth: '896px',
        margin: '0 auto',
        padding: '0 1rem',
        position: 'relative',
    },
    quizTitle: {
        fontSize: '2.25rem',
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: '1.5rem',
        textAlign: 'center'
    },
    startButton: {
        backgroundColor: '#3b82f6',
        color: '#fff',
        padding: '0.75rem 2rem',
        borderRadius: '1.5rem',
        transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        fontWeight: '600',
        fontSize: '1.125rem',
        cursor: 'pointer',
        border: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 'fit-content',
        margin: '0 auto'
    },
    timeLeft: {
        marginBottom: '1.5rem',
        fontSize: '1.25rem',
        color: '#dc2626',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    timeLeftValue: {
        backgroundColor: '#ef4444',
        color: '#fff',
        padding: '0.25rem 0.5rem',
        borderRadius: '1rem',
        fontWeight: '600',
        marginLeft: '0.5rem'
    },
    fullscreenWarning: {
        marginBottom: '1.5rem',
        backgroundColor: '#fffbeb',
        border: '1px solid #fef08a',
        borderRadius: '0.5rem',
        padding: '1rem',
        color: '#854d0e',
    },
    fullscreenWarningHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '0.75rem',
    },
    fullscreenWarningTitle: {
        fontSize: '1rem',
        fontWeight: '600'
    },
    fullscreenButton: {
        marginLeft: '0.5rem',
        backgroundColor: '#f59e0b',
        color: '#1e293b',
        padding: '0.25rem 0.75rem',
        borderRadius: '1rem',
        fontSize: '0.875rem',
        fontWeight: '500',
        transition: 'background-color 0.2s ease',
        border: 'none',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem'
    },
    questionContainer: {
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
        borderRadius: '0.5rem',
        border: '1px solid rgba(229, 231, 235, 0.5)',
        backgroundColor: '#fff',
        padding: '1.5rem',
    },
    questionTitle: {
        fontSize: '1.25rem',
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: '0.5rem',
    },
    imageContainer: {
        width: '100%',
        maxWidth: '384px',
        borderRadius: '0.5rem',
        marginTop: '1rem',
        cursor: 'pointer',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    },
    questionImage: {
        width: '100%',
        maxWidth: '384px',
        borderRadius: '0.5rem',
        marginTop: '1rem',
        cursor: 'pointer',
    },
    optionContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '0.75rem'
    },
    optionInput: {
        border: '1px solid #d1d5db',
        color: '#3b82f6',
        cursor: 'pointer',
        margin: 0,
        height: '1rem',
        width: '1rem'
    },
    optionLabel: {
        color: '#374151',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'color 0.2s ease'
    },
    submitButton: {
        backgroundColor: '#16a34a',
        color: '#fff',
        padding: '0.75rem 2rem',
        borderRadius: '1.5rem',
        transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        fontWeight: '600',
        fontSize: '1.125rem',
        cursor: 'pointer',
        border: 'none'
    },
    popupOverlay: {
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        cursor: 'pointer'
    },
    popupContent: {
        position: 'relative',
        width: '90vw',
        maxWidth: '800px',
        cursor: 'default'
    },
    popupImage: {
        maxHeight: '90vh',
        width: '100%',
        borderRadius: '0.5rem',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
        border: '1px solid #374151',
    },
    popupCloseButton: {
        position: 'absolute',
        top: '0.5rem',
        right: '0.5rem',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: '9999px',
        padding: '0.25rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        transition: 'background-color 0.2s ease',
        border: 'none',
        cursor: 'pointer'
    },
    centeredContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f3f4f6'
    },
    submittedContainer: {
        width: '100%',
        maxWidth: '768px',
        backgroundColor: '#fff',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        padding: '2rem'
    },
    submittedTitle: {
        fontSize: '1.5rem',
        fontWeight: '600',
        color: '#16a34a',
        marginBottom: '0.75rem',
        textAlign: 'center'
    },
    submittedText: {
        color: '#4b5563',
        textAlign: 'center'
    },
    errorContainer: {
        width: '100%',
        maxWidth: '768px',
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '0.5rem',
        padding: '1rem',
        color: '#b91c1c'
    },
    errorHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '0.75rem'
    },
    errorTitle: {
        fontSize: '1.25rem',
        fontWeight: '600'
    }
};

export default StartQuiz;























// import React, { useState, useEffect } from 'react';
// import { useLocation, useNavigate, useParams } from 'react-router-dom';
// import { fetchQuiz, submitQuiz, fetchQuizSubmission } from '../services/operations/quizAPI';
// import { useSelector } from 'react-redux';

// const StartQuiz = () => {
//     const [quiz, setQuiz] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const { courseId, quizId } = useParams();
//     const { token } = useSelector((state) => state.auth);
//     const [answers, setAnswers] = useState({});
//     const [timeLeft, setTimeLeft] = useState(0);
//     const [submitted, setSubmitted] = useState(false);
//     const [inFullscreen, setInFullscreen] = useState(document.fullscreenElement !== null);
//     const [quizStarted, setQuizStarted] = useState(false);
//     const [popupImage, setPopupImage] = useState(null);
//     const [error, setError] = useState(null);
//     const [hasAttempted, setHasAttempted] = useState(false);
//     const [quizResult, setQuizResult] = useState(null);
//     const [isQuizEnded, setIsQuizEnded] = useState(false);

//     const localQuizKey = `active-quiz-${quizId}`;
//     const localEndKey = `quiz-${quizId}-endTime`;
//     const localAnswersKey = `quiz-${quizId}-answers`;
//     const navigate = useNavigate();
//     const location = useLocation();

//     useEffect(() => {
//         const checkQuizStatus = async () => {
//             try {
//                 const result = await fetchQuizSubmission({ quizId }, token, navigate, location);
//                 if (result && result.submissionId) {
//                     setHasAttempted(true);
//                 }
//             } catch (error) {
//                 console.error("Error checking quiz submission:", error);
//                 // Handle error appropriately
//             }
//         };

//         const fetchingQuiz = async () => {
//             setLoading(true);
//             const data = { courseId, quizId };
//             const result = await fetchQuiz(data, token, navigate, location);
//             if (result) {
//                 setQuiz(result);
//                 const now = new Date();
//                 const quizEndTime = new Date(result.endTime);
//                 setIsQuizEnded(now >= quizEndTime);
//             } else {
//                 setError("Failed to fetch quiz.");
//             }
//             setLoading(false);
//         };

//         fetchingQuiz();
//         checkQuizStatus();
//     }, [courseId, quizId, token, navigate, location]);

//     useEffect(() => {
//         if (!quiz) return;

//         const storedQuizId = localStorage.getItem(localQuizKey);
//         const storedEnd = localStorage.getItem(localEndKey);
//         const storedAnswers = localStorage.getItem(localAnswersKey);

//         if (storedQuizId === quiz._id && storedEnd && Date.now() < new Date(storedEnd).getTime()) {
//             setQuizStarted(true);
//             setTimeLeft(new Date(storedEnd).getTime() - Date.now());
//             if (storedAnswers) {
//                 setAnswers(JSON.parse(storedAnswers));
//             } else {
//                 const initialAnswers = {};
//                 quiz.questions.forEach(q => {
//                     initialAnswers[q._id] = null;
//                 });
//                 setAnswers(initialAnswers);
//             }
//         } else if (storedQuizId === quiz._id && Date.now() >= new Date(storedEnd).getTime()) {
//             // Quiz time expired on previous session
//             setSubmitted(true);
//             localStorage.removeItem(localEndKey);
//             localStorage.removeItem(localQuizKey);
//             localStorage.removeItem(localAnswersKey);
//         }
//     }, [quiz, localQuizKey, localEndKey, localAnswersKey]);

//     useEffect(() => {
//         if (!quizStarted || !quiz) return;

//         const interval = setInterval(() => {
//             const storedEnd = localStorage.getItem(localEndKey);
//             if (!storedEnd) {
//                 clearInterval(interval);
//                 return;
//             }

//             const endTime = new Date(storedEnd).getTime();
//             const now = Date.now();
//             const diff = Math.max(0, endTime - now);
//             setTimeLeft(diff);

//             if (diff <= 0 && !submitted) {
//                 handleSubmit();
//                 clearInterval(interval);
//             }
//         }, 1000);

//         return () => clearInterval(interval);
//     }, [submitted, quizStarted, quiz, localEndKey]);

//     useEffect(() => {
//         const handler = () => setInFullscreen(document.fullscreenElement !== null);
//         document.addEventListener("fullscreenchange", handler);
//         return () => document.removeEventListener("fullscreenchange", handler);
//     }, []);

//     const startQuiz = () => {
//         if (!quiz) return;

//         const now = new Date();
//         const quizEndTime = new Date(quiz.endTime);
//         const maxAllowedTime = Math.floor((quizEndTime.getTime() - now.getTime()) / 60000);

//         if (maxAllowedTime <= 0) {
//             setError("Quiz time is over.");
//             return;
//         }

//         const actualTime = Math.min(quiz.timeLimit, maxAllowedTime);
//         const end = new Date();
//         end.setMinutes(end.getMinutes() + actualTime);
//         localStorage.setItem(localEndKey, end.toISOString());
//         localStorage.setItem(localQuizKey, quiz._id);

//         const initialAnswers = {};
//         quiz.questions.forEach(q => {
//             initialAnswers[q._id] = null;
//         });
//         setAnswers(initialAnswers);
//         localStorage.setItem(localAnswersKey, JSON.stringify(initialAnswers));

//         setQuizStarted(true);
//         setTimeLeft(actualTime * 60 * 1000); // Set initial timeLeft
//         enterFullscreen();
//     };

//     const handleOptionChange = (qId, index) => {
//         setAnswers((prev) => ({ ...prev, [qId]: index + 1 }));
//         localStorage.setItem(localAnswersKey, JSON.stringify({ ...answers, [qId]: index + 1 }));
//     };

//     const handleSubmit = async () => {
//         if (!quiz) return;
//         const finalAnswers = quiz.questions.map((q) => ({
//             questionId: q._id,
//             answer: answers[q._id] ?? null,
//         }));
//         setSubmitted(true);
//         localStorage.removeItem(localEndKey);
//         localStorage.removeItem(localQuizKey);
//         localStorage.removeItem(localAnswersKey);
//         const data = { quizId, finalAnswers };
//         console.log("Quiz Submitted!", data);
//         const result = await submitQuiz(data, token);
//         if (result && result.submissionId) {
//             // Optionally fetch and display the result immediately
//             fetchQuizResult();
//         }
//     };

//     const fetchQuizResult = async () => {
//         setLoading(true);
//         try {
//             const result = await fetchQuizSubmission({ quizId }, token, navigate, location);
//             if (result && result.detailedAnswers) {
//                 setQuizResult(result);
//             } else {
//                 setError("Failed to fetch quiz result.");
//             }
//         } catch (error) {
//             console.error("Error fetching quiz result:", error);
//             setError("Failed to fetch quiz result.");
//         }
//         setLoading(false);
//     };

//     const enterFullscreen = () => {
//         const el = document.documentElement;
//         if (el.requestFullscreen) el.requestFullscreen();
//     };

//     const formatTime = (ms) => {
//         if (ms <= 0) return "00:00";
//         const total = Math.floor(ms / 1000);
//         const minutes = String(Math.floor(total / 60)).padStart(2, "0");
//         const seconds = String(total % 60).padStart(2, "0");
//         return `<span class="math-inline">\{minutes\}\:</span>{seconds}`;
//     };

//     if (loading) {
//         return <div className='loader'></div>;
//     }

//     if (error) {
//         return (
//             <div style={styles.centeredContainer}>
//                 <div style={styles.errorContainer}>
//                     <div style={styles.errorHeader}>
//                         <svg
//                             xmlns="http://www.w3.org/2000/svg"
//                             viewBox="0 0 24 24"
//                             fill="none"
//                             stroke="currentColor"
//                             strokeWidth="2"
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             className="h-4 w-4"
//                         >
//                             <circle cx="12" cy="12" r="10"></circle>
//                             <line x1="12" y1="8" x2="12" y2="12"></line>
//                             <line x1="12" y1="16" x2="12.01" y2="16"></line>
//                         </svg>
//                         <div style={styles.errorTitle}>Error</div>
//                     </div>
//                     <div>{error}</div>
//                 </div>
//             </div>
//         );
//     }

//     if (hasAttempted && isQuizEnded && quizResult) {
//         return (
//             <div style={styles.centeredContainer}>
//                 <div style={styles.submittedContainer}>
//                     <div style={styles.submittedTitle}>Quiz Result</div>
//                     <div>
//                         <p>Score: {quizResult.score} / {quizResult.totalQuestions}</p>
//                         {quizResult.detailedAnswers && quizResult.detailedAnswers.map((item, index) => (
//                             <div key={item.questionId} style={{ marginBottom: '1rem', border: '1px solid #ccc', padding: '1rem', borderRadius: '0.5rem' }}>
//                                 <p><strong>Question {index + 1}:</strong> {item.questionText}</p>
//                                 {item.isImage && <img src={item.imageUrl} alt="Question Image" style={{ maxWidth: '200px', maxHeight: '200px' }} />}
//                                 <p>Your Answer: {item.selectedAnswer !== null ? item.selectedAnswer : 'Not answered'}</p>
//                                 <p>Correct Answer: {item.correctAnswer}</p>
//                                 <p style={{ color: item.isCorrect ? 'green' : 'red' }}>{item.isCorrect ? 'Correct' : 'Incorrect'}</p>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     if (hasAttempted) {
//         return (
//             <div style={styles.centeredContainer}>
//                 <div style={styles.submittedContainer}>
//                     <div style={styles.submittedTitle}>Quiz Attempted</div>
//                     <div style={styles.submittedText}>
//                         You have already attempted this quiz.
//                         {isQuizEnded && !quizResult && (
//                             <button onClick={fetchQuizResult} style={styles.startButton}>View Result</button>
//                         )}
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     if (submitted) return (
//         <div style={styles.centeredContainer}>
//             <div style={styles.submittedContainer}>
//                 <div style={styles.submittedTitle}>Quiz Submitted!</div>
//                 <div style={styles.submittedText}>
//                     Thank you for completing the quiz.
//                     {isQuizEnded && !quizResult && (
//                         <button onClick={fetchQuizResult} style={styles.startButton}>View Result</button>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );

//     return (
//         <div style={styles.mainContainer}>
//             {quiz && (
//                 <div style={styles.quizContainer}>
//                     <h1 style={styles.quizTitle}>Quiz Topic: {quiz.title}</h1>

//                     {!quizStarted && !isQuizEnded && (
//                         <div style={{ textAlign: 'center' }}>
//                             <button
//                                 onClick={startQuiz}
//                                 style={styles.startButton}
//                             >
//                                 Start Quiz
//                             </button>
//                         </div>
//                     )}

//                     {isQuizEnded && !hasAttempted && (
//                         <div style={styles.centeredContainer}>
//                             <div style={styles.submittedContainer}>
//                                 <div style={styles.submittedTitle}>Quiz Ended</div>
//                                 <div style={styles.submittedText}>
//                                     This quiz has ended.
//                                 </div>
//                             </div>
//                         </div>
//                     )}

//                     {quizStarted && (
//                         <>
//                             <div style={styles.timeLeft}>
//                                 <svg
//                                     xmlns="http://www.w3.org/2000/svg"
//                                     viewBox="0 0 24 24"
//                                     fill="none"
//                                     stroke="currentColor"
//                                     strokeWidth="2"
//                                     strokeLinecap="round"
//                                     strokeLinejoin="round"
//                                     className="h-5 w-5"
//                                 >
//                                     <circle cx="12" cy="12" r="10"></circle>
//                                     <polyline points="12 6 12 12 16 14"></polyline>
//                                     <path d="M2 12h20"></path>
//                                 </svg>
//                                 <span>Time Left:
//                                     <span style={styles.timeLeftValue}>
//                                         {formatTime(timeLeft)}
//                                     </span>
//                                 </span>
//                             </div>

//                             {!inFullscreen ? (
//                                 <div style={styles.fullscreenWarning}>
//                                     <div style={styles.fullscreenWarningHeader}>
//                                         <svg
//                                             xmlns="http://www.w3.org/2000/svg"
//                                             viewBox="0 0 24 24"
//                                             fill="none"
//                                             stroke="currentColor"
//                                             strokeWidth="2"
//                                             strokeLinecap="round"
//                                             strokeLinejoin="round"
//                                             className="h-4 w-4"
//                                         >
//                                             <circle cx="12" cy="12" r="10"></circle>
//                                             <line x1="12" y1="8" x2="12" y2="12"></line>
//                                             <line x1="12" y1="16" x2="12.01" y2="16"></line>
//                                         </svg>
//                                         <div style={styles.fullscreenWarningTitle}>Fullscreen Required</div>
//                                     </div>
//                                     <div>
//                                         Please enter fullscreen mode to continue the quiz.
//                                         <button
//                                             onClick={enterFullscreen}
//                                             style={styles.fullscreenButton}
//                                         >
//                                             <svg
//                                                 xmlns="http://www.w3.org/2000/svg"
//                                                 viewBox="0 0 24 24"
//                                                 fill="none"
//                                                 stroke="currentColor"
//                                                 strokeWidth="2"
//                                                 strokeLinecap="round"
//                                                 strokeLinejoin="round"
//                                                 className="h-4 w-4"
//                                             >
//                                                 <path d="M15 3h6v6"></path>
//                                                 <path d="M9 15H3v6"></path>
//                                                 <path d="M21 3l-9.19 9.19"></path>
//                                                 <path d="M3 21l9.19-9.19"></path>
//                                             </svg>
//                                             Enter Fullscreen
//                                         </button>
//                                     </div>
//                                 </div>
//                             ) : (
//                                 <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
//                                     {quiz.questions.map((q, index) => (
//                                         <div
//                                             key={q._id}
//                                             style={styles.questionContainer}
//                                         >
//                                             <div style={styles.questionTitle}>
//                                                 Question {index + 1}: {q.question}
//                                             </div>
//                                             {q.isImage && (
//                                                 <div
//                                                     style={styles.imageContainer}
//                                                     onClick={() => setPopupImage(q.imageUrl)}
//                                                 >
//                                                     <img
//                                                         src={q.imageUrl}
//                                                         alt="Question"
//                                                         style={styles.questionImage}
//                                                     />
//                                                 </div>
//                                             )}
//                                             <div style={{ marginTop: '1.5rem' }}>
//                                                 {q.options.map((optObj, i) => {
//                                                     const isSelected = answers[q._id] === i + 1;
//                                                     return (
//                                                         <div key={i} style={styles.optionContainer}>
//                                                             <input
//                                                                 type="radio"
//                                                                 id={`question-<span class="math-inline">\{q\.\_id\}\-option\-</span>{i}`}
//                                                                 name={q._id}
//                                                                 value={optObj.option}
//                                                                 checked={isSelected}
//                                                                 onChange={() => handleOptionChange(q._id, i)}
//                                                                 style={styles.optionInput}
//                                                             />
//                                                             <label
//                                                                 htmlFor={`question-<span class="math-inline">\{q\.\_id\}\-option\-</span>{i}`}
//                                                                 style={styles.optionLabel}
//                                                             >
//                                                                 {optObj.option}
//                                                             </label>
//                                                         </div>
//                                                     );
//                                                 })}
//                                             </div>
//                                         </div>
//                                     ))}

//                                     <div style={{ textAlign: 'center' }}>
//                                         <button
//                                             onClick={handleSubmit}
//                                             style={styles.submitButton}
//                                         >
//                                             Submit Quiz
//                                         </button>
//                                     </div>
//                                 </div>
//                             )}
//                         </>
//                     )}

//                     {/* 🔍 Image Popup Modal */}
//                     {popupImage && (
//                         <div
//                             style={styles.popupOverlay}
//                             onClick={() => setPopupImage(null)}
//                         >
//                             <div
//                                 style={styles.popupContent}
//                                 onClick={(e) => e.stopPropagation()}
//                             >
//                                 <img
//                                     src={popupImage}
//                                     alt="Enlarged"
//                                     style={styles.popupImage}
//                                 />
//                                 <button
//                                     onClick={() => setPopupImage(null)}
//                                     style={styles.popupCloseButton}
//                                 >
//                                     <svg
//                                         xmlns="http://www.w3.org/2000/svg"
//                                         viewBox="0 0 24 24"
//                                         fill="none"
//                                         stroke="currentColor"
//                                         strokeWidth="2"
//                                         strokeLinecap="round"
//                                         strokeLinejoin="round"
//                                         className="h-6 w-6 text-gray-900"
//                                     >
//                                         <circle cx="12" cy="12" r="10"></circle>
//                                         <path d="M15 9l-6 6"></path>
//                                         <path d="M9 9l6 6"></path>
//                                     </svg>
//                                 </button>
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             )}
//         </div>
//     );
// };

// const styles = {
//     mainContainer: {
//         minHeight: '100vh',
//         backgroundColor: '#f3f4f6',
//         padding: '2rem 0',
//     },
//     quizContainer: {
//         maxWidth: '896px',
//         margin: '0 auto',
//         padding: '0 1rem',
//         position: 'relative',
//     },
//     quizTitle: {
//         fontSize: '2.25rem',
//         fontWeight: 'bold',
//         color: '#1f2937',
//         marginBottom: '1.5rem',
//         textAlign: 'center'
//     },
//     startButton: {
//         backgroundColor: '#3b82f6',
//         color: '#fff',
//         padding: '0.75rem 2rem',
//         borderRadius: '1.5rem',
//         transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
//         boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
//         fontWeight: '600',
//         fontSize: '1.125rem',
//         cursor: 'pointer',
//         border: 'none',
//         display: 'inline-flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         width: 'fit-content',
//         margin: '0 auto'
//     },
//     timeLeft: {
//         marginBottom: '1.5rem',
//         fontSize: '1.25rem',
//         color: '#dc2626',
//         display: 'flex',
//         alignItems: 'center',
//         gap: '0.5rem',
//     },
//     timeLeftValue: {
//         backgroundColor: '#ef4444',
//         color: '#fff',
//         padding: '0.25rem 0.5rem',
//         borderRadius: '1rem',
//         fontWeight: '600',
//         marginLeft: '0.5rem'
//     },
//     fullscreenWarning: {
//         marginBottom: '1.5rem',
//         backgroundColor: '#fffbeb',
//         border: '1px solid #fef08a',
//         borderRadius: '0.5rem',
//         padding: '1rem',
//         color: '#854d0e',
//     },
//     fullscreenWarningHeader: {
//         display: 'flex',
//         alignItems: 'center',
//         gap: '0.5rem',
//         marginBottom: '0.75rem',
//     },
//     fullscreenWarningTitle: {
//         fontSize: '1rem',
//         fontWeight: '600'
//     },
//     fullscreenButton: {
//         marginLeft: '0.5rem',
//         backgroundColor: '#f59e0b',
//         color: '#1e293b',
//         padding: '0.25rem 0.75rem',
//         borderRadius: '1rem',
//         fontSize: '0.875rem',
//         fontWeight: '500',
//         transition: 'background-color 0.2s ease',
//         border: 'none',
//         cursor: 'pointer',
//         display: 'inline-flex',
//         alignItems: 'center',
//         gap: '0.25rem'
//     },
//     questionContainer: {
//         boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
//         transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
//         borderRadius: '0.5rem',
//         border: '1px solid rgba(229, 231, 235, 0.5)',
//         backgroundColor: '#fff',
//         padding: '1.5rem',
//     },
//     questionTitle: {
//         fontSize: '1.25rem',
//         fontWeight: '600',
//         color: '#1f2937',
//         marginBottom: '0.5rem',
//     },
//     imageContainer: {
//         width: '100%',
//         maxWidth: '384px',
//         borderRadius: '0.5rem',
//         marginTop: '1rem',
//         cursor: 'pointer',
//         transition: 'transform 0.3s ease, box-shadow 0.3s ease',
//     },
//     questionImage: {
//         width: '100%',
//         maxWidth: '384px',
//         borderRadius: '0.5rem',
//         marginTop: '1rem',
//         cursor: 'pointer',
//     },
//     optionContainer: {
//         display: 'flex',
//         alignItems: 'center',
//         gap: '0.75rem',
//         marginBottom: '0.75rem'
//     },
//     optionInput: {
//         border: '1px solid #d1d5db',
//         color: '#3b82f6',
//         cursor: 'pointer',
//         margin: 0,
//         height: '1rem',
//         width: '1rem'
//     },
//     optionLabel: {
//         color: '#374151',
//         fontWeight: '500',
//         cursor: 'pointer',
//         transition: 'color 0.2s ease'
//     },
//     submitButton: {
//         backgroundColor: '#16a34a',
//         color: '#fff',
//         padding: '0.75rem 2rem',
//         borderRadius: '1.5rem',
//         transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
//         boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
//         fontWeight: '600',
//         fontSize: '1.125rem',
//         cursor: 'pointer',
//         border: 'none'
//     },
//     popupOverlay: {
//         position: 'fixed',
//         inset: 0,
//         backgroundColor: 'rgba(0, 0, 0, 0.7)',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         zIndex: 50,
//         cursor: 'pointer'
//     },
//     popupContent: {
//         position: 'relative',
//         width: '90vw',
//         maxWidth: '800px',
//         cursor: 'default'
//     },
//     popupImage: {
//         maxHeight: '90vh',
//         width: '100%',
//         borderRadius: '0.5rem',
//         boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
//         border: '1px solid #374151',
//     },
//     popupCloseButton: {
//         position: 'absolute',
//         top: '0.5rem',
//         right: '0.5rem',
//         backgroundColor: 'rgba(255, 255, 255, 0.8)',
//         borderRadius: '9999px',
//         padding: '0.25rem',
//         boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
//         transition: 'background-color 0.2s ease',
//         border: 'none',
//         cursor: 'pointer'
//     },
//     centeredContainer: {
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         height: '100vh',
//         backgroundColor: '#f3f4f6'
//     },
//     submittedContainer: {
//         width: '100%',
//         maxWidth: '768px',
//         backgroundColor: '#fff',
//         borderRadius: '0.5rem',
//         boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
//         padding: '2rem'
//     },
//     submittedTitle: {
//         fontSize: '1.5rem',
//         fontWeight: '600',
//         color: '#16a34a',
//         marginBottom: '0.75rem',
//         textAlign: 'center'
//     },
//     submittedText: {
//         color: '#4b5563',
//         textAlign: 'center'
//     },
//     errorContainer: {
//         width: '100%',
//         maxWidth: '768px',
//         backgroundColor: '#fef2f2',
//         border: '1px solid #fecaca',
//         borderRadius: '0.5rem',
//         padding: '1rem',
//         color: '#b91c1c'
//     },
//     errorHeader: {
//         display: 'flex',
//         alignItems: 'center',
//         gap: '0.5rem',
//         marginBottom: '0.75rem'
//     },
//     errorTitle: {
//         fontSize: '1.25rem',
//         fontWeight: '600'
//     }
// };

// export default StartQuiz;

