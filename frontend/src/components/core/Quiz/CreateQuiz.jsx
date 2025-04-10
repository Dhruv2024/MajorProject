import React, { useState } from 'react';
import axios from 'axios';

const CreateQuiz = ({ instructorId }) => {
    const [title, setTitle] = useState('');
    const [timeLimit, setTimeLimit] = useState(30);
    const [questions, setQuestions] = useState([
        { questionText: '', options: ['', '', '', ''], correctAnswer: 0, topic: '' }
    ]);

    const handleQuestionChange = (index, field, value) => {
        const updated = [...questions];
        updated[index][field] = value;
        setQuestions(updated);
    };

    const handleOptionChange = (qIndex, oIndex, value) => {
        const updated = [...questions];
        updated[qIndex].options[oIndex] = value;
        setQuestions(updated);
    };

    const addQuestion = () => {
        setQuestions([...questions, { questionText: '', options: ['', '', '', ''], correctAnswer: 0, topic: '' }]);
    };

    const submitQuiz = async () => {
        try {
            await axios.post('/upload-quiz', {
                title,
                timeLimit,
                questions,
                createdBy: instructorId
            });
            alert('Quiz created!');
            setTitle('');
            setTimeLimit(30);
            setQuestions([{ questionText: '', options: ['', '', '', ''], correctAnswer: 0, topic: '' }]);
        } catch (err) {
            alert('Error creating quiz');
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Create Quiz</h2>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Quiz Title" className="border p-2 w-full mb-2" />
            <input value={timeLimit} onChange={e => setTimeLimit(Number(e.target.value))} type="number" placeholder="Time Limit (min)" className="border p-2 w-full mb-4" />
            {questions.map((q, i) => (
                <div key={i} className="mb-4 border p-3 rounded">
                    <input
                        value={q.questionText}
                        onChange={e => handleQuestionChange(i, 'questionText', e.target.value)}
                        placeholder={`Question ${i + 1}`}
                        className="border p-2 w-full mb-2"
                    />
                    {q.options.map((opt, j) => (
                        <input
                            key={j}
                            value={opt}
                            onChange={e => handleOptionChange(i, j, e.target.value)}
                            placeholder={`Option ${j + 1}`}
                            className="border p-2 w-full mb-1"
                        />
                    ))}
                    <input
                        type="number"
                        value={q.correctAnswer}
                        onChange={e => handleQuestionChange(i, 'correctAnswer', Number(e.target.value))}
                        placeholder="Correct Option Index (0-3)"
                        className="border p-2 w-full mb-1"
                    />
                    <input
                        value={q.topic}
                        onChange={e => handleQuestionChange(i, 'topic', e.target.value)}
                        placeholder="Topic"
                        className="border p-2 w-full"
                    />
                </div>
            ))}
            <button onClick={addQuestion} className="bg-blue-500 text-white px-4 py-2 rounded mr-2">Add Question</button>
            <button onClick={submitQuiz} className="bg-green-600 text-white px-4 py-2 rounded">Submit Quiz</button>
        </div>
    );
};

export default CreateQuiz;