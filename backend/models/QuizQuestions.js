const mongoose = require("mongoose");
const QuizQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    isImage: {
        type: Boolean,
        default: false,
    },
    imageUrl: {
        type: String,
    },
    options: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Option',
        required: true,
    }],
    correctAnswer: String,
    topic: String,
});

module.exports = mongoose.model("QuizQuestion", QuizQuestionSchema);