const mongoose = require("mongoose");

// Define the Courses schema
const messageSchema = new mongoose.Schema(
    {
        room: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Room",
        },
        content: {
            type: String,
            required: true,
        },
        sentBy: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "user",
        },
        messageType: {
            type: String,
            default: "chitchat",
            required: true,
        }
    },
    { timestamps: true }
);

// Register the model
const Message = mongoose.model("Message", messageSchema);  // This registers the 'Message' model
module.exports = Message;