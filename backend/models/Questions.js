const mongoose = require("mongoose");

// Define the Courses schema
const questionSchema = new mongoose.Schema(
    {
        instructor: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "user",
        },
        askedBy: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "user",
        },
        image: {
            type: String,
        },
        text: {
            type: String,
        },
        answeredBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: "Answer",
            }
        ],
        bestAnswer: {
            type: String,
        }
    }, { timestamps: true }
);

// Export the Courses model
module.exports = mongoose.model("Question", questionSchema);