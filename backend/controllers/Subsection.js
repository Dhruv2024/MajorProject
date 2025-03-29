// Import necessary modules
const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const cloudinary = require('cloudinary').v2

// Create a new sub-section for a given section
exports.createSubSection = async (req, res) => {
    try {
        const { sectionId, title, description } = req.body;
        let { resource } = req.body;
        const video = req.files.video;

        if (!sectionId || !title || !description || !video) {
            return res.status(404).json({ success: false, message: "All Fields are Required" });
        }
        const includeSubtitles = true;
        // Upload the video to Cloudinary, optionally requesting subtitles (VTT file), height, and quality
        const uploadResult = await uploadImageToCloudinary(video, process.env.FOLDER_NAME, includeSubtitles);

        console.log("Uploaded video details:", uploadResult);

        if (!resource) {
            resource = "";  // Ensure resource is defined
        }

        let transcriptUrl = null;

        // If subtitles are requested, poll for transcription status
        if (includeSubtitles) {
            let transcriptionStatus = 'pending';
            let retryCount = 0;
            const maxRetries = 10;
            const delay = 5000; // 5 seconds

            while (transcriptionStatus === 'pending' && retryCount < maxRetries) {
                console.log(`Checking transcription status... Attempt ${retryCount + 1}`);

                try {
                    // Fetch video details from Cloudinary to check transcription status
                    const videoDetails = await cloudinary.api.resource(uploadResult.public_id, {
                        resource_type: 'video',
                    });

                    transcriptionStatus = videoDetails.info.raw_convert?.google_speech?.status;
                    console.log("Transcription Status:", transcriptionStatus);

                    if (transcriptionStatus === 'complete') {
                        // Transcription completed, fetch subtitles URL (VTT file)
                        console.log("Transcription completed. Subtitles are ready.");

                        try {
                            // Check for the VTT file
                            const transcriptDetails = await cloudinary.api.resource(`${uploadResult.public_id}.vtt`, {
                                resource_type: 'raw',  // The transcript is stored as raw text
                            });
                            console.log("Transcript file details:", transcriptDetails);
                            transcriptUrl = transcriptDetails.secure_url;  // URL to access the VTT file
                            console.log("Transcript URL:", transcriptUrl);
                        } catch (err) {
                            console.error("Error fetching transcript:", err);
                            return res.status(500).json({ success: false, message: "Error fetching transcript", error: err.message });
                        }
                        break; // Exit loop once transcript is found
                    } else {
                        console.log("Transcription still pending...");
                    }
                } catch (err) {
                    console.error("Error fetching video details:", err);
                    return res.status(500).json({ success: false, message: "Error fetching video details", error: err.message });
                }

                // Wait before retrying
                retryCount++;
                await new Promise(resolve => setTimeout(resolve, delay)); // Wait 5 seconds before retrying
            }

            if (retryCount >= maxRetries) {
                console.log("Max retries reached. The transcription is still pending.");
                return res.status(500).json({
                    success: false,
                    message: "Max retries reached. The transcription is still pending."
                });
            }
        }

        // Create a new SubSection
        const SubSectionDetails = await SubSection.create({
            title,
            timeDuration: `${uploadResult.duration}`,
            description,
            videoUrl: uploadResult.secure_url,
            resource,
            vttFileUrl: transcriptUrl,  // Include the VTT URL if available
        });

        // Update the section with the new sub-section
        const updatedSection = await Section.findByIdAndUpdate(
            { _id: sectionId },
            { $push: { subSection: SubSectionDetails._id } },
            { new: true }
        ).populate("subSection");

        return res.status(200).json({ success: true, data: updatedSection });

    } catch (error) {
        console.error("Error creating new sub-section:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};


exports.updateSubSection = async (req, res) => {
    try {
        const { sectionId, subSectionId, title, description, resource } = req.body
        const subSection = await SubSection.findById(subSectionId)

        if (!subSection) {
            return res.status(404).json({
                success: false,
                message: "SubSection not found",
            })
        }

        if (title !== undefined) {
            subSection.title = title
        }

        if (description !== undefined) {
            subSection.description = description
        }
        if (req.files && req.files.video !== undefined) {
            const video = req.files.video
            const uploadDetails = await uploadImageToCloudinary(
                video,
                process.env.FOLDER_NAME
            )
            subSection.videoUrl = uploadDetails.secure_url;
            subSection.timeDuration = `${uploadDetails.duration}`
        }
        if (resource !== undefined) {
            subSection.resource = resource;
        }
        await subSection.save()
        const updatedSection = await Section.findById(sectionId).populate("subSection");
        return res.json({
            success: true,
            data: updatedSection,
            message: "Section updated successfully",
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: "An error occurred while updating the section",
        })
    }
}

exports.deleteSubSection = async (req, res) => {
    try {
        const { subSectionId, sectionId } = req.body
        await Section.findByIdAndUpdate(
            { _id: sectionId },
            {
                $pull: {
                    subSection: subSectionId,
                },
            }
        )
        const subSection = await SubSection.findByIdAndDelete({ _id: subSectionId })

        if (!subSection) {
            return res
                .status(404)
                .json({ success: false, message: "SubSection not found" })
        }

        const updatedSection = await Section.findById(sectionId).populate("subSection")

        return res.json({
            success: true,
            data: updatedSection,
            message: "SubSection deleted successfully",
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: "An error occurred while deleting the SubSection",
        })
    }
}