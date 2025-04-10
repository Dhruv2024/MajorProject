const mongoose = require("mongoose");

// Define the Courses schema
const questionSchema = new mongoose.Schema(
    {
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Course",
        },
        askedBy: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "user",
        },
        imageUrl: {
            type: String,
        },
        imageText: {
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