const mongoose = require("mongoose");
const QuestionOptionSchema = new mongoose.Schema({
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'QuizQuestion',
    },
    isImage: {
        type: Boolean,
        default: false,
    },
    option: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model("Option", QuestionOptionSchema);