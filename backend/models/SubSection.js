const mongoose = require("mongoose");

const SubSectionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['recorded', 'quiz', 'videoCall']
    },
    title: { type: String },
    timeDuration: { type: String },
    description: { type: String },
    videoUrl: { type: String },
    meetUrl: { type: String },
    meetStartTime: { type: Date },
    vttFileUrl: { type: String },
    resource: { type: String },
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
    lectureNotes: { type: String, default: null }
});

module.exports = mongoose.model("SubSection", SubSectionSchema);