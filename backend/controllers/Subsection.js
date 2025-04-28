// Import necessary modules
const Course = require("../models/Course");
const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const courseProgress = require("../models/CourseProgress")
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const { videoCallReminderEmail } = require("../mail/templates/videoCallReminderEmail");
const { youtubeReminderEmail } = require("../mail/templates/youtubeReminderEmail")
const mailSender = require("../utils/mailSender");
const cloudinary = require('cloudinary').v2

// Create a new sub-section for a given section
exports.createSubSection = async (req, res) => {
    try {
        const { type } = req.body;
        console.log(req.body);
        // return res.json({
        //     message: "to be"
        // })
        if (type === 'videoCall') {
            const { sectionId, title, video, startTime, description } = req.body;
            const meetUrl = video;
            if (!sectionId || !title || !startTime || !meetUrl) {
                return res.status(404).json({ success: false, message: "All Fields are Required" });
            }
            // Create a new SubSection
            const SubSectionDetails = await SubSection.create({
                type,
                title,
                description,
                meetUrl,
                meetStartTime: startTime,
            });

            // Update the section with the new sub-section
            const updatedSection = await Section.findByIdAndUpdate(
                { _id: sectionId },
                { $push: { subSection: SubSectionDetails._id } },
                { new: true }
            ).populate("subSection");

            return res.status(200).json({ success: true, data: updatedSection });
        }
        if (type === 'quiz') {
            const { sectionId, title, quizId } = req.body;
            if (!sectionId || !title || !quizId) {
                return res.status(404).json({ success: false, message: "All Fields are Required" });
            }

            // Create a new SubSection
            const SubSectionDetails = await SubSection.create({
                type,
                title,
                quiz: quizId
            });
            // --- DEBUGGING 1: Log SubSection creation ---
            const createdSubSection = await SubSection.findById(SubSectionDetails._id);
            console.log("Created SubSection with quizId:", createdSubSection.quiz);
            // --- END DEBUGGING 1 ---


            // Update the section with the new sub-section
            const updatedSection = await Section.findByIdAndUpdate(
                { _id: sectionId },
                { $push: { subSection: SubSectionDetails._id } },
                { new: true }
            ).populate("subSection");

            // --- DEBUGGING 2: Log updatedSection ---
            console.log("Updated Section:", updatedSection);
            // --- END DEBUGGING 2 ---
            return res.status(200).json({ success: true, data: updatedSection });
        }
        if (type === 'youtube') {
            const { sectionId, title, youtubeLink, startTime, description } = req.body;

            // Validate required fields
            if (!sectionId || !title || !youtubeLink || !startTime || !description) {
                return res.status(400).json({ success: false, message: "All Fields are Required" });
            }

            // Create a new SubSection for YouTube
            const newSubSection = await SubSection.create({
                type,
                title,
                description,
                youtubeLink,
                meetStartTime: startTime,
            });

            // Update the section with the new sub-section
            const updatedSection = await Section.findByIdAndUpdate(
                sectionId,
                { $push: { subSection: newSubSection._id } },
                { new: true }
            ).populate("subSection");

            return res.status(200).json({ success: true, data: updatedSection });
        }

        const { sectionId, title, description } = req.body;
        let { resource } = req.body;
        const video = req.files.video;
        const notes = req.files?.lectureNotes;
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
            const maxRetries = process.env.MAX_RETRIES || 10;
            console.log("Number of retries allowed are: ", maxRetries);
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
        // Upload Lecture Notes PDF (optional)
        let lectureNotesUrl = null;
        if (notes) {
            try {
                const uploadedNotes = await uploadImageToCloudinary(notes, process.env.FOLDER_NAME);
                lectureNotesUrl = uploadedNotes.secure_url;
            } catch (err) {
                console.error("Error uploading lecture notes PDF:", err);
                return res.status(500).json({
                    success: false,
                    message: "Error uploading lecture notes",
                    error: err.message,
                });
            }
        }
        // Create a new SubSection
        const SubSectionDetails = await SubSection.create({
            type,
            title,
            timeDuration: `${uploadResult.duration}`,
            description,
            videoUrl: uploadResult.secure_url,
            resource,
            vttFileUrl: transcriptUrl,  // Include the VTT URL if available
            lectureNotes: lectureNotesUrl,
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
        // console.log(req.body);
        const { subSectionType, sectionId, subSectionId } = req.body
        const subSection = await SubSection.findById(subSectionId)

        if (!subSection) {
            return res.status(404).json({
                success: false,
                message: "SubSection not found",
            })
        }
        if (subSectionType === 'recorded') {
            const { title, description, resource } = req.body
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
            // If lecture notes PDF is uploaded
            if (req.files && req.files.lectureNotes !== undefined) {
                const lectureNotesFile = req.files.lectureNotes;
                const pdfUpload = await uploadImageToCloudinary(
                    lectureNotesFile,
                    process.env.FOLDER_NAME,
                );
                subSection.lectureNotes = pdfUpload.secure_url;
            }
        }
        if (subSectionType === 'videoCall') {
            const { title, description, meetUrl, startTime } = req.body
            if (title !== undefined) {
                subSection.title = title
            }

            if (description !== undefined) {
                subSection.description = description
            }
            if (meetUrl !== undefined) {
                subSection.meetUrl = meetUrl
            }
            if (startTime !== undefined) {
                subSection.meetStartTime = startTime
            }
        }
        if (subSectionType === 'youtube') {
            const { title, description, video, startTime } = req.body;
            console.log(req.body);
            // Update fields if provided
            if (title !== undefined) subSection.title = title;
            if (description !== undefined) subSection.description = description;
            if (video !== undefined) subSection.youtubeLink = video;
            if (startTime !== undefined) subSection.meetStartTime = new Date(startTime);

            // Save the updated sub-section
            await subSection.save();

            // Return the updated section
            const updatedSection = await Section.findById(sectionId).populate("subSection");
            return res.json({
                success: true,
                data: updatedSection,
                message: "SubSection updated successfully",
            });
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

        // Update courseProgress by removing the deleted subSection from completedVideos
        await courseProgress.updateMany(
            { completedVideos: subSectionId },
            { $pull: { completedVideos: subSectionId } }
        );

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

exports.videoCallRemainderEmail = async (req, res) => {
    try {
        const now = new Date();
        const reminderTime = new Date(now.getTime() + 30 * 60000); // 30 minutes from now

        // 1. Fetch all courses and populate the sections and subsections
        const allCourses = await Course.find()
            .populate({
                path: 'courseContent',  // Populate the sections within the course
                populate: {
                    path: 'subSection',  // Populate subsections within each section
                    match: {
                        type: 'videoCall',
                        meetStartTime: {  // Only select video calls within the next 30 minutes
                            $gte: now,
                            $lt: reminderTime,
                        },
                    },
                },
            })
            .populate('studentsEnrolled'); // Assuming studentsEnrolled is populated here

        if (allCourses.length === 0) {
            console.log("No courses found.");
            return;
        }

        // 2. Loop through each course and its sections to find matching subsections (video calls)
        for (const course of allCourses) {
            if (!course.courseContent || course.courseContent.length === 0) {
                continue; // Skip if no sections are available in this course
            }

            // 3. Loop through sections and subsections within each course
            for (const section of course.courseContent) {
                if (!section.subSection || section.subSection.length === 0) {
                    continue; // Skip if no subsections are available in this section
                }

                // 4. Loop through the populated subsections and send reminders for video call type
                for (const subSection of section.subSection) {
                    if (!subSection.meetStartTime || !subSection.meetUrl) {
                        continue; // Skip if no meet start time or URL
                    }

                    const { meetStartTime, meetUrl, title } = subSection;

                    // 5. Send reminder emails to all enrolled students in this course
                    for (const student of course.studentsEnrolled) {
                        try {
                            console.log(student);
                            await mailSender(
                                student.email,
                                "⏳ Live upcoming Video Call in 30 minutes",
                                videoCallReminderEmail(course.courseName, section.sectionName, title, meetStartTime, meetUrl, student.firstName)
                            )
                            console.log(`Reminder email sent to ${student.email}`);
                        } catch (err) {
                            console.error(`Error sending email to ${student.email}:`, err);
                        }
                    }
                }
            }
        }

    } catch (err) {
        console.error('Error fetching courses or sending reminders:', err);
    }
}


exports.youtubeRemainderEmail = async (req, res) => {
    try {
        const now = new Date();
        const reminderTime = new Date(now.getTime() + 30 * 60000); // 30 minutes from now

        // 1. Fetch all courses and populate the sections and subsections
        const allCourses = await Course.find()
            .populate({
                path: 'courseContent',  // Populate the sections within the course
                populate: {
                    path: 'subSection',  // Populate subsections within each section
                    match: {
                        type: 'youtube',
                        meetStartTime: {  // Only select video calls within the next 30 minutes
                            $gte: now,
                            $lt: reminderTime,
                        },
                    },
                },
            })
            .populate('studentsEnrolled'); // Assuming studentsEnrolled is populated here

        if (allCourses.length === 0) {
            console.log("No courses found.");
            return;
        }
        // 2. Loop through each course and its sections to find matching subsections (video calls)
        for (const course of allCourses) {
            if (!course.courseContent || course.courseContent.length === 0) {
                continue; // Skip if no sections are available in this course
            }

            // 3. Loop through sections and subsections within each course
            for (const section of course.courseContent) {
                if (!section.subSection || section.subSection.length === 0) {
                    continue; // Skip if no subsections are available in this section
                }

                // 4. Loop through the populated subsections and send reminders for video call type
                for (const subSection of section.subSection) {
                    if (!subSection.meetStartTime || !subSection.youtubeLink) {
                        continue; // Skip if no meet start time or URL
                    }

                    const { meetStartTime, meetUrl, title } = subSection;

                    // 5. Send reminder emails to all enrolled students in this course
                    for (const student of course.studentsEnrolled) {
                        try {
                            await mailSender(
                                student.email,
                                "⏳ Live upcoming Youtube Live Class in 30 minutes",
                                youtubeReminderEmail(course.courseName, section.sectionName, title, meetStartTime, meetUrl, student.firstName)
                            )
                            console.log(`Reminder email sent to ${student.email} for remainder of youtube live class`);
                        } catch (err) {
                            console.error(`Error sending email to ${student.email}:`, err);
                        }
                    }
                }
            }
        }

    } catch (err) {
        console.error('Error fetching courses or sending reminders:', err);
    }
}