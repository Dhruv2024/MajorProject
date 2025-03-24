const mongoose = require("mongoose");

const PaymentConfirmationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "user",
    },
    proof: {
        type: String,
        required: true,
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Course",
    },
    currentPermissionStatus: {
        type: String,
        enum: ["Verified", "Declined", "Processing"],
        required: true,
        default: "Processing",
    }
})

module.exports = mongoose.model("PaymentConfirmation", PaymentConfirmationSchema);