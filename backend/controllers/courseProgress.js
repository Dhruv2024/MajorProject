const CourseProgress = require("../models/CourseProgress");
const SubSection = require("../models/SubSection");
const User = require("../models/User");
const Course = require("../models/Course");
const { progressReminderEmail } = require("../mail/templates/progressReminderEmail");
const Section = require("../models/Section");
const mailSender = require("../utils/mailSender");

exports.updateCourseProgress = async (req, res) => {
    const { courseId, subSectionId } = req.body;
    const userId = req.user.id;
    try {
        //check if the subsection is valid
        console.log("Received subsection id is :" + subSectionId)
        const subSection = await SubSection.findById(subSectionId);

        if (!subSection) {
            return res.status(404).json({ error: "Invalid SUbSection" });
        }

        console.log("SubSection Validation Done");

        //check for old entry 
        let courseProgress = await CourseProgress.findOne({
            courseID: courseId,
            userId: userId,
        });
        if (!courseProgress) {
            return res.status(404).json({
                success: false,
                message: "Course Progress does not exist"
            });
        }
        else {
            console.log("Course Progress Validation Done");
            //check for re-completing video/subsection
            if (courseProgress.completedVideos.includes(subSectionId)) {
                return res.status(400).json({
                    error: "Subsection already completed",
                });
            }

            //poush into completed video
            courseProgress.completedVideos.push(subSectionId);
            console.log("Copurse Progress Push Done");
        }
        await courseProgress.save();
        console.log("Course Progress Save call Done");
        return res.status(200).json({
            success: true,
            message: "Course Progress Updated Successfully",
        })
    }
    catch (error) {
        console.error(error);
        return res.status(400).json({ error: "Internal Server Error" });
    }
}


async function countTotalSubsections(course) {

    const sections = await Section.find({ _id: { $in: course.courseContent } });
    let total = 0;
    for (const section of sections) {
        total += section.subSection.length;
    }
    return total;
}

const sendProgressReportEmail = async (user, progressSummaries) => {
    try {
        const mailResponse = await mailSender(
            user.email,
            "Your Weekly Course Progress",
            progressReminderEmail(user.firstName, progressSummaries, `${process.env.FRONTEND_URL}`),
        )
        console.log('Email sent successfully to:', user.email);
    }
    catch (error) {
        console.log(error);
        // return res.status(500).json({ success: false, message: error.message });
    }
};

exports.sendProgressEmails = async () => {
    try {
        const users = await User.find({ accountType: "Student" }).populate("courses");

        for (const user of users) {
            const progressSummaries = [];

            console.log(user.courses);
            console.log("-----------------------");
            for (const course of user.courses) {
                console.log(course);
                const progress = await CourseProgress.findOne({
                    userId: user._id,
                    courseID: course._id,
                });
                console.log(progress);
                if (!progress) continue;

                const totalSubsections = await countTotalSubsections(course);

                const completed = progress.completedVideos.length;
                const percentage = totalSubsections === 0
                    ? 0
                    : (completed / totalSubsections) * 100;

                if (percentage < 100) {
                    progressSummaries.push({
                        courseName: course.courseName,
                        percentage: Math.round(percentage),
                    });
                }
            }
            console.log(progressSummaries);
            if (progressSummaries.length > 0) {

                await sendProgressReportEmail(user, progressSummaries);
                console.log(`Mail is sent to ${user.email} regarding the student course Progress`);
            }

        }
    }
    catch (error) {
        console.error("Error sending progress emails:", error);
    }
};

