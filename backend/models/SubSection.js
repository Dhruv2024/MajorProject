const mongoose = require("mongoose");

const SubSectionSchema = new mongoose.Schema({
    title: { type: String },
    timeDuration: { type: String },
    description: { type: String },
    liveClass: { type: Boolean },
    isLive: { type: Boolean },
    classFinished: { type: Boolean },
    public: { type: Boolean },
    videoUrl: { type: String },
    vttFileUrl: { type: String },
    resource: { type: String }
});

module.exports = mongoose.model("SubSection", SubSectionSchema);