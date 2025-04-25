const express = require('express');
const Quiz = require('../models/Quiz');
const axios = require('axios');
const { auth, isInstructor, isStudent } = require('../middlewares/auth');
const { createQuiz, editQuiz, deleteQuiz, fetchQuiz, submitQuiz, getQuizResultByUserAndQuiz, unsubmitQuiz, addRemainderMailSentField } = require("../controllers/Quiz")
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


router.post('/createQuiz', auth, isInstructor, createQuiz);
router.post('/deleteQuiz', auth, isInstructor, deleteQuiz);
router.post("/fetchQuiz", auth, fetchQuiz);
router.post("/submitQuiz", auth, submitQuiz);
router.post("/getResult", auth, getQuizResultByUserAndQuiz);
router.post("/addField", addRemainderMailSentField)
router.post("/unsubmitQuiz", auth, unsubmitQuiz);
module.exports = router;