const mongoose = require("mongoose");

const SubSectionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['recorded', 'quiz']
    },
    title: { type: String },
    timeDuration: { type: String },
    description: { type: String },
    videoUrl: { type: String },
    vttFileUrl: { type: String },
    resource: { type: String },
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" }
});

module.exports = mongoose.model("SubSection", SubSectionSchema);