const mongoose = require("mongoose");
const studentAnswerSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
    answers: [{
        questionText: String,
        selectedOption: Number,
        correctAnswer: Number,
        topic: String,
        options: [String]
    }],
    score: Number,
    report: String, // AI-generated summary
    submittedAt: Date,
});


module.exports = mongoose.model('StudentAnswer', studentAnswerSchema);
