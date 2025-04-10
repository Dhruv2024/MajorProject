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
    // If file is received as Buffer, use the buffer directly.
    if (file instanceof Buffer) {
        options.resource_type = 'auto';
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
                if (error) {
                    reject(new Error("Cloudinary upload failed"));
                }
                resolve(result);
            });
            uploadStream.end(file);
        });
    }
    return await cloudinary.uploader.upload(file.tempFilePath, options);
};