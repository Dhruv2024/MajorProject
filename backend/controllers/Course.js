const Course = require("../models/Course")
const Category = require("../models/Category")
const Section = require("../models/Section")
const SubSection = require("../models/SubSection")
const CourseExpiry = require("../models/CourseExpiry")
const User = require("../models/User")
const { uploadImageToCloudinary } = require("../utils/imageUploader")
const CourseProgress = require("../models/CourseProgress")
const { convertSecondsToDuration } = require("../utils/secToDuration")
const Rooms = require("../models/Rooms")
// Function to create a new course
exports.createCourse = async (req, res) => {
    try {
        // Get user ID from request object
        const userId = req.user.id

        // Get all required fields from request body
        let {
            courseName,
            courseDescription,
            whatYouWillLearn,
            price,
            tag: _tag,
            category,
            status,
            instructions: _instructions,
            courseDuration,
        } = req.body
        console.log(req.body);
        // Get thumbnail image from request files
        const thumbnail = req.files.thumbnailImage

        // Convert the tag and instructions from stringified Array to Array
        const tag = JSON.parse(_tag)
        const instructions = JSON.parse(_instructions)

        console.log("tag", tag)
        console.log("instructions", instructions)

        // Check if any of the required fields are missing
        if (
            !courseName ||
            !courseDescription ||
            !whatYouWillLearn ||
            !price ||
            !tag.length ||
            !thumbnail ||
            !category ||
            !instructions.length
        ) {
            return res.status(400).json({
                success: false,
                message: "All Fields are Mandatory",
            })
        }
        if (!status || status === undefined) {
            status = "Draft"
        }
        // Check if the user is an instructor
        const instructorDetails = await User.findById(userId, {
            accountType: "Instructor",
        })

        if (!instructorDetails) {
            return res.status(404).json({
                success: false,
                message: "Instructor Details Not Found",
            })
        }

        // Check if the tag given is valid
        const categoryDetails = await Category.findById(category)
        if (!categoryDetails) {
            return res.status(404).json({
                success: false,
                message: "Category Details Not Found",
            })
        }
        // Upload the Thumbnail to Cloudinary
        const thumbnailImage = await uploadImageToCloudinary(
            thumbnail,
            process.env.FOLDER_NAME
        )
        console.log(thumbnailImage)
        // Create a new course with the given details
        const newRoom = await Rooms.create({
            instructor: instructorDetails._id
        });
        // const temp = parseInt(courseDurationDays);
        // console.log(temp);
        // console.log(typeof (temp));
        // Calculate the enrollmentCloseAt (based on user-defined course duration)
        // const enrollmentCloseAt = new Date();
        // enrollmentCloseAt.setDate(enrollmentCloseAt.getDate() + parseInt(courseDurationDays));  // user-defined duration
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn: whatYouWillLearn,
            price,
            tag,
            category: categoryDetails._id,
            thumbnail: thumbnailImage.secure_url,
            status: status,
            instructions,
            room: newRoom._id,
            // Enrollment dates
            // enrollmentCloseAt,
            enrollmentOpen: true,  // initially set to true
            courseDurationDays: parseInt(courseDuration),  // store user-defined course duration
        })
        // Create the default "Course Quizzes" section
        const courseQuizzesSection = await Section.create({
            sectionName: "Course Quizzes",
        });

        // Update the course to include the new section
        const updatedCourse = await Course.findByIdAndUpdate(
            newCourse._id,
            {
                $push: {
                    courseContent: courseQuizzesSection._id,
                },
            },
            { new: true }
        ).populate('courseContent');
        // Add the new course to the User Schema of the Instructor
        await User.findByIdAndUpdate(
            {
                _id: instructorDetails._id,
            },
            {
                $push: {
                    courses: newCourse._id,
                },
            },
            { new: true }
        )
        // Add the new course to the Categories
        const categoryDetails2 = await Category.findByIdAndUpdate(
            { _id: category },
            {
                $push: {
                    courses: newCourse._id,
                },
            },
            { new: true }
        )
        console.log("HEREEEEEEEE", categoryDetails2)
        // Return the new course and a success message
        res.status(200).json({
            success: true,
            data: updatedCourse,
            message: "Course Created Successfully",
        })
    } catch (error) {
        // Handle any errors that occur during the creation of the course
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Failed to create course",
            error: error.message,
        })
    }
};

// Edit Course Details
exports.editCourse = async (req, res) => {
    try {
        const { courseId } = req.body
        const updates = req.body
        const course = await Course.findById(courseId)

        if (!course) {
            return res.status(404).json({ error: "Course not found" })
        }

        // If Thumbnail Image is found, update it
        if (req.files) {
            console.log("thumbnail update")
            const thumbnail = req.files.thumbnailImage
            const thumbnailImage = await uploadImageToCloudinary(
                thumbnail,
                process.env.FOLDER_NAME
            )
            course.thumbnail = thumbnailImage.secure_url
        }

        // Update only the fields that are present in the request body
        for (const key in updates) {
            if (updates.hasOwnProperty(key)) {
                if (key === "tag" || key === "instructions") {
                    course[key] = JSON.parse(updates[key])
                } else {
                    course[key] = updates[key]
                }
            }
        }

        await course.save()

        const updatedCourse = await Course.findOne({
            _id: courseId,
        })
            .populate({
                path: "instructor",
                populate: {
                    path: "additionalDetails",
                },
            })
            .populate("category")
            .populate("ratingAndReviews")
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                },
            })
            .exec()

        res.json({
            success: true,
            message: "Course updated successfully",
            data: updatedCourse,
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        })
    }
}
// Get Course List
exports.getAllCourses = async (req, res) => {
    try {
        const allCourses = await Course.find(
            { status: "Published" },
            {
                courseName: true,
                price: true,
                thumbnail: true,
                instructor: true,
                ratingAndReviews: true,
                studentsEnrolled: true,
            }
        )
            .populate("instructor")
            .exec()

        return res.status(200).json({
            success: true,
            data: allCourses,
        })
    } catch (error) {
        console.log(error)
        return res.status(404).json({
            success: false,
            message: `Can't Fetch Course Data`,
            error: error.message,
        })
    }
}

exports.getCourseDetails = async (req, res) => {
    try {
        const { courseId } = req.body
        const courseDetails = await Course.findOne({
            _id: courseId,
        })
            .populate({
                path: "instructor",
                populate: {
                    path: "additionalDetails",
                },
            })
            .populate("category")
            .populate("ratingAndReviews")
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                    select: "-videoUrl",
                    populate: {
                        path: "quiz",
                        model: "Quiz",
                        populate: { // Populate questions and options
                            path: 'questions',
                            model: 'QuizQuestion',
                            populate: {
                                path: 'options',
                                model: 'Option'
                            }
                        }
                        // match: { type: 'quiz' }
                    }
                },
            })
            .exec();

        console.log(courseDetails);
        if (!courseDetails) {
            return res.status(400).json({
                success: false,
                message: `Could not find course with id: ${courseId}`,
            })
        }

        // if (courseDetails.status === "Draft") {
        //   return res.status(403).json({
        //     success: false,
        //     message: `Accessing a draft course is forbidden`,
        //   });
        // }

        let totalDurationInSeconds = 0
        courseDetails.courseContent.forEach((content) => {
            content.subSection.forEach((subSection) => {
                if (subSection.type === 'quiz' || subSection.type === 'youtube' || subSection.type === 'videoCall') {
                    return;
                }
                const timeDurationInSeconds = parseInt(subSection.timeDuration)
                totalDurationInSeconds += timeDurationInSeconds
            })
        })

        const totalDuration = convertSecondsToDuration(totalDurationInSeconds)

        return res.status(200).json({
            success: true,
            data: {
                courseDetails,
                totalDuration,
            },
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}
exports.getFullCourseDetails = async (req, res) => {
    try {
        const { courseId } = req.body
        const userId = req.user.id
        let courseDetails = await Course.findOne({
            _id: courseId,
        })
            .populate({
                path: "instructor",
                populate: {
                    path: "additionalDetails",
                },
            })
            .populate("category")
            .populate("ratingAndReviews")
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                    populate: {
                        path: "quiz",
                        model: "Quiz",
                        populate: { // Populate questions and options
                            path: 'questions',
                            model: 'QuizQuestion',
                            populate: {
                                path: 'options',
                                model: 'Option'
                            }
                        }
                        // match: { type: 'quiz' }
                    }
                },
            })
            .exec();

        // --- DEBUGGING 3: Logging with Null Check and Type Handling ---
        console.log("Course Details:", courseDetails);
        if (courseDetails && courseDetails.courseContent) {
            courseDetails.courseContent.forEach(content => {
                if (content.subSection) {
                    content.subSection.forEach(sub => {
                        console.log(`SubSection ID: ${sub._id}, Type: ${sub.type}, Quiz:`, sub.quiz);
                        if (sub.type === 'quiz' && sub.quiz) {
                            console.log("Populated Quiz Details:", sub.quiz);
                        }
                    });
                }
            });
        }
        const courseExpiry = await CourseExpiry.findOne({
            userId: userId,
            courseId: courseDetails._id,
        });
        console.log("***************************");
        const expiryDate = courseExpiry?.expiryDate
        console.log(expiryDate);
        if (expiryDate) {
            // console.log("entered");
            Object.assign(courseDetails, { "expiryDate": expiryDate });
            // console.log(courseDetails.expiryDate);
        }
        let courseProgressCount = await CourseProgress.findOne({
            courseID: courseId,
            userId: userId,
        })

        console.log("courseProgressCount : ", courseProgressCount)

        if (!courseDetails) {
            return res.status(400).json({
                success: false,
                message: `Could not find course with id: ${courseId}`,
            })
        }

        // if (courseDetails.status === "Draft") {
        //   return res.status(403).json({
        //     success: false,
        //     message: `Accessing a draft course is forbidden`,
        //   });
        // }

        let totalDurationInSeconds = 0
        courseDetails.courseContent.forEach((content) => {
            content.subSection.forEach((subSection) => {
                const timeDurationInSeconds = parseInt(subSection.timeDuration)
                totalDurationInSeconds += timeDurationInSeconds
            })
        })
        // console.log(courseDetails.expiryDate);
        const totalDuration = convertSecondsToDuration(totalDurationInSeconds)

        return res.status(200).json({
            success: true,
            data: {
                courseDetails,
                totalDuration,
                completedVideos: courseProgressCount?.completedVideos
                    ? courseProgressCount?.completedVideos
                    : [],
                courseExpiryDate: expiryDate
            },
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

// Get a list of Course for a given Instructor
exports.getInstructorCourses = async (req, res) => {
    try {
        // Get the instructor ID from the authenticated user or request body
        const instructorId = req.user.id

        // Find all courses belonging to the instructor
        const instructorCourses = await Course.find({
            instructor: instructorId,
        })
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                    populate: {
                        path: "quiz",
                        model: "Quiz",
                        populate: { // Populate questions and options
                            path: 'questions',
                            model: 'QuizQuestion',
                            populate: {
                                path: 'options',
                                model: 'Option'
                            }
                        }
                        // match: { type: 'quiz' }
                    }
                }
            }).
            sort({ createdAt: -1 });


        // console.log(instructorCourses)
        const instructorCoursesWithDuration = instructorCourses.map((courseDetails) => {
            let totalDurationInSeconds = 0
            courseDetails.courseContent.forEach((content) => {
                content.subSection.forEach((subSection) => {
                    // console.log(subSection);
                    if (subSection.type === "quiz" || subSection.type === "videoCall" || subSection.type === "youtube") {
                        return;
                    }
                    // console.log(subSection);
                    const timeDurationInSeconds = parseInt(subSection.timeDuration)
                    totalDurationInSeconds += timeDurationInSeconds
                })
            })

            const totalDuration = convertSecondsToDuration(totalDurationInSeconds)
            return {
                ...courseDetails.toObject(),
                totalDuration
            };
        })

        console.log("PRINTING INSTRUCTOR COURSES WITH DURATION");
        console.log(instructorCoursesWithDuration);
        // Return the instructor's courses
        res.status(200).json({
            success: true,
            data: instructorCoursesWithDuration,
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Failed to retrieve instructor courses",
            error: error.message,
        })
    }
}
// Delete the Course
exports.deleteCourse = async (req, res) => {
    try {
        const { courseId } = req.body

        // Find the course
        const course = await Course.findById(courseId)
        if (!course) {
            return res.status(404).json({ message: "Course not found" })
        }

        // Unenroll students from the course
        const studentsEnrolled = course.studentsEnrolled
        for (const studentId of studentsEnrolled) {
            await User.findByIdAndUpdate(studentId, {
                $pull: { courses: courseId },
            })
        }

        // Delete sections and sub-sections
        const courseSections = course.courseContent
        for (const sectionId of courseSections) {
            // Delete sub-sections of the section
            const section = await Section.findById(sectionId)
            if (section) {
                const subSections = section.subSection
                for (const subSectionId of subSections) {
                    await SubSection.findByIdAndDelete(subSectionId)
                }
            }

            // Delete the section
            await Section.findByIdAndDelete(sectionId)
        }

        // Delete the course
        await Course.findByIdAndDelete(courseId)

        return res.status(200).json({
            success: true,
            message: "Course deleted successfully",
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}


exports.unenrollFromCourse = async (req, res) => {
    try {
        const { courseId } = req.body; // The course the user wants to unenroll from
        // console.log(req.user.id);
        const userId = req.user.id;
        // console.log(userId);

        // 1. Find the course and check if it's valid
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        // 2. Check if the user is enrolled in the course
        if (!course.studentsEnrolled.includes(userId)) {
            return res.status(400).json({
                success: false,
                message: "User is not enrolled in this course",
            });
        }

        // 3. Remove the student from the course's enrolled students list
        await Course.findByIdAndUpdate(courseId, {
            $pull: { studentsEnrolled: userId },
        });

        // 4. Remove the course from the student's list of enrolled courses
        await User.findByIdAndUpdate(userId, {
            $pull: { courses: courseId },
        });

        // 5. Remove the student's course progress data
        const courseProgress = await CourseProgress.findOneAndDelete({
            courseID: courseId,
            userId: userId,
        });

        // 6. Remove the student from the course room (if applicable)
        const room = await Rooms.findById(course.room);
        if (room) {
            await Rooms.findByIdAndUpdate(course.room, {
                $pull: { studentsEnrolled: userId },
            });
        }

        // 7. Optionally, remove the expiry date record from CourseExpiry if needed
        const courseExpiry = await CourseExpiry.findOneAndDelete({
            userId: userId,
            courseId: courseId,
        });

        // Optionally: Send an email to notify the student about unenrollment
        const enrolledStudent = await User.findById(userId);
        return res.status(200).json({
            success: true,
            message: `Successfully unenrolled from ${course.courseName}`,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
