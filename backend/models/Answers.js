const mongoose = require("mongoose");

// Define the Courses schema
const answerSchema = new mongoose.Schema(
    {
        room: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Room",
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