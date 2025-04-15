const mongoose = require("mongoose");
const quizSchema = new mongoose.Schema({
    title: String,
    questions: [{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'QuizQuestionSchema',
    }],
    timeLimit: Number, // in minutes
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    startTime: {
        type: Date,
        required: true,
    },
    endTime: {
        type: Date,
        required: true,
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Course',
    }
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);