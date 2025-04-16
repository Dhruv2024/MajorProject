const express = require('express');
const Quiz = require('../models/Quiz');
const StudentAnswer = require('../models/StudentAnswer');
const axios = require('axios');
const { auth, isInstructor, isStudent } = require('../middlewares/auth');
const { createQuiz, editQuiz, deleteQuiz, fetchQuiz } = require("../controllers/Quiz")
const router = express.Router();
// Instructor uploads quiz
router.post('/upload-quiz', auth, isInstructor, async (req, res) => {
    try {
        const { title, questions, timeLimit, createdBy } = req.body;
        const quiz = new Quiz({ title, questions, timeLimit, createdBy });
        await quiz.save();
        res.status(201).json({ message: 'Quiz uploaded successfully', quiz });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Student submits quiz and gets report
router.post('/submit-quiz', auth, isStudent, async (req, res) => {
    try {
        const { studentId, quizId, answers } = req.body;
        const quiz = await Quiz.findById(quizId);
        let score = 0;
        const detailedAnswers = answers.map((ans, i) => {
            const question = quiz.questions[i];
            if (ans.selectedOption === question.correctAnswer) score++;
            return {
                questionText: question.questionText,
                selectedOption: ans.selectedOption,
                correctAnswer: question.correctAnswer,
                topic: question.topic,
                options: question.options
            };
        });

        const incorrectTopics = detailedAnswers
            .filter(a => a.selectedOption !== a.correctAnswer)
            .map(a => a.topic);

        // const reportRes = await axios.post('http://localhost:8000/api/suggest-videos', {
        //     incorrectTopics
        // });

        const reportText = `You answered ${score} out of ${quiz.questions.length} correctly. Based on your mistakes, we recommend to revise: ` +
            incorrectTopics;

        const studentAnswer = new StudentAnswer({
            studentId,
            quizId,
            answers: detailedAnswers,
            score,
            report: reportText,
            submittedAt: new Date()
        });

        await studentAnswer.save();
        res.status(200).json({ message: 'Quiz submitted', report: reportText, score });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/createQuiz', auth, isInstructor, createQuiz);
router.post('/deleteQuiz', auth, isInstructor, deleteQuiz);
router.post("/fetchQuiz", auth, fetchQuiz);
module.exports = router;