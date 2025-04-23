const mongoose = require("mongoose");

// Define the Courses schema
const courseExpirySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "user",
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Course",
    },
    expiryDate: {
        type: Date,
        required: true,
    }
});

// Export the Courses model
module.exports = mongoose.model("CourseExpiry", courseExpirySchema);