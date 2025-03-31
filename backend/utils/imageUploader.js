const cloudinary = require('cloudinary').v2

exports.uploadImageToCloudinary = async (file, folder, includeSubtitles = false, height, quality) => {
    const options = {
        folder,
        // resource_type: 'video',
    };
    options.resource_type = "auto";
    // Add raw_convert option only if subtitles are requested
    if (includeSubtitles) {
        options.raw_convert = 'google_speech:srt:vtt'; // Request subtitles in vtt format
    }

    // Optional: Add height and quality if provided
    if (height) {
        options.height = height;
    }
    if (quality) {
        options.quality = quality;
    }

    return await cloudinary.uploader.upload(file.tempFilePath, options);
};