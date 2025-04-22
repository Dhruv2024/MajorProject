const mongoose = require('mongoose');
const answerSchema = new mongoose.Schema({
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'QuizQuestion', // Assuming you have a Question model
        required: true,
    },
    answer: {
        type: String, // Index of the selected option
        default: null,
    },
});

const quizSubmissionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user', // Assuming you have a User model
        required: true,
    },
    quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz', // Assuming you have a Quiz model
        required: true,
    },
    answers: [answerSchema],
    submittedAt: {
        type: Date,
        default: Date.now,
    },
    score: {
        type: Number,
        default: 0,
    },
    // You might want to store the total number of questions for easier score calculation later
    totalQuestions: {
        type: Number,
        default: 0,
    },
    report: {
        type: String,
    }
});

const QuizSubmission = mongoose.model('QuizSubmission', quizSubmissionSchema);

module.exports = QuizSubmission;