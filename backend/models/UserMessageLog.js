// models/UserMessageLog.js
const mongoose = require("mongoose");

const userMessageLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("UserMessageLog", userMessageLogSchema);