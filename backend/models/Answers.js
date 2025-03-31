const mongoose = require("mongoose");

// Define the Courses schema
const answerSchema = new mongoose.Schema(
    {
        questionDetails: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Question",
        },
        image: {
            type: String,
        },
        text: {
            type: String,
        },
        userDetails: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "user",
        },
    }, { timestamps: true }
);

// Export the Courses model
module.exports = mongoose.model("Answer", answerSchema);