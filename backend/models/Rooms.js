const mongoose = require("mongoose");

// Define the Courses schema
const roomSchema = new mongoose.Schema(
    {
        instructor: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "user",
        },
        studentsEnrolled: [
            {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: "user",
            },
        ],
        chitchatMessages: [
            {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: "Message",
            }
        ],
        questions: [
            {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: "Question",
            }
        ]
    }, { timestamps: true }
);

// Export the Courses model
module.exports = mongoose.model("Room", roomSchema);