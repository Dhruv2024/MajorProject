//Importing packages
const express = require('express');
const app = express();

const userRoutes = require('./routes/User');
const profileRoutes = require('./routes/Profile');
const paymentRoutes = require('./routes/Payments');
const courseRoutes = require('./routes/Course');
const messageRoutes = require('./routes/Message');
const summaryRoutes = require('./routes/Summary');
const questionRoutes = require('./routes/Questions');
const quizRoutes = require('./routes/Quiz');
const cron = require('node-cron');

const Course = require("./models/Course");
const SubSection = require("./models/SubSection");
const Quiz = require("./models/Quiz");
const User = require("./models/User");
const QuizSubmission = require("./models/QuizSubmission");
const CourseExpiry = require("./models/CourseExpiry");

const { quizReminderEmail } = require("./mail/templates/quizRemainderEmail");
const { quizScoreEmail } = require("./mail/templates/quizScoreEmail");
const { courseExpiryReminderEmail } = require("./mail/templates/courseExpiryReminderEmail");

const { dbConnect } = require('./config/dbConnect');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { cloudinaryConnect } = require('./config/cloudinary');
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");
dotenv.config();
const { Server } = require('socket.io')
const http = require("http");
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"],
    },
});
const Message = require("./models/Message");
const Room = require("./models/Rooms");
// const { createServer } = require('net');
const Answers = require('./models/Answers');
const Questions = require('./models/Questions');
const { uploadImageToCloudinary } = require('./utils/imageUploader');
const mailSender = require('./utils/mailSender');
const { sendProgressEmails } = require('./controllers/courseProgress');
const { videoCallRemainderEmail, youtubeRemainderEmail } = require('./controllers/Subsection');
io.on('connection', (socket) => {
    console.log("user connected");
    // Join Room
    socket.on('joinRoom', (room) => {
        socket.join(room);
        console.log(`User joined room: ${room}`);
    });
    socket.on('joinAnswerRoom', (questionId) => {
        socket.join(questionId);
        console.log('Now you can answer the question');
    })
    socket.on('answeredQuestion', async (data) => {
        try {
            const { questionDetails, image, text, userDetails } = data;
            console.log(data);
            console.log("answer received is ", data);
            let imageUrl = null;
            if (image) {
                const uploadResult = await uploadImageToCloudinary(image, "questions");
                console.log(uploadResult.secure_url);
                imageUrl = uploadResult.secure_url;
            }
            const answer = await Answers.create({
                questionDetails, image: imageUrl, text, userDetails
            });

            const populatedAnswer = await Answers.findById(answer._id)
                .populate("questionDetails")
                .populate("userDetails", 'firstName email accountType image ');

            const updatedQuestion = await Questions.findByIdAndUpdate(
                questionDetails, // Find the question by ID
                { $push: { answeredBy: answer._id } }, // Push the answerId into the 'answeredBy' array
                { new: true } // Return the updated document
            );
            // console.log(populatedAnswer);
            io.to(questionDetails).emit("new-answer-list", populatedAnswer);
        } catch (error) {
            console.log("error occured while uploading answer");
            console.error(error);
        }

    })

    socket.on("check", (data) => {
        console.log(data);
    })
    socket.on("new-message", async (data) => {
        // console.log(data);
        const { room, content, sentBy } = data;
        const message = await Message.create({
            room, content, sentBy
        })
        // Populate user details for the sender
        const populatedMessage = await Message.findById(message._id).populate('sentBy', 'firstName email accountType'); // Modify the fields you want to populate
        await Room.findByIdAndUpdate(
            room,
            { $push: { chitchatMessages: message._id } },
            { new: true }
        );

        // ?for only keeping 100 messages in db(not tested)
        // Push the message to the room's chitchatMessages array
        // const roomDoc = await Room.findByIdAndUpdate(
        //     room,
        //     { $push: { chitchatMessages: message._id } },
        //     { new: true }
        // );

        // Limit chitchatMessages to the latest 100
        // if (roomDoc.chitchatMessages.length > 100) {
        //     const messagesToRemove = roomDoc.chitchatMessages.slice(0, roomDoc.chitchatMessages.length - 100);
        //     await Message.deleteMany({ _id: { $in: messagesToRemove } });
        //     await Room.findByIdAndUpdate(
        //         room,
        //         { $pull: { chitchatMessages: { $in: messagesToRemove } } }
        //     );
        // }

        console.log("Message added successfully!");
        // console.log(populatedMessage);
        io.emit("trial", "");
        io.to(room).emit("received-message", populatedMessage);
    })
    socket.on("disconnect", () => {
        console.log("user disconnected");
    })
})

const PORT = process.env.PORT || 4000;

//connecting with database
dbConnect();
//connect cloudinary
cloudinaryConnect();

app.use(express.json());
app.use(cookieParser());


app.use(cors({
    origin: ["http://localhost:5173"],
    credentials: true
}))
app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: "/tmp",
    })
)



app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/message", messageRoutes);
app.use("/api/v1/summary", summaryRoutes);
app.use("/api/v1/questions", questionRoutes);
app.use("/api/v1/quiz", quizRoutes);



// A cron job to check every hour and close courses if necessary

// cron.schedule('0 * * * *', async () => {  // This will run every hour
cron.schedule('*/2 * * * *', async () => {
    console.log("hmm")
    const currentDate = new Date();
    currentDate.setMilliseconds(0);
    const coursesToClose = await Course.find({
        enrollmentOpen: true,
        enrollmentCloseAt: { $lte: currentDate }, // Check if the current time is after enrollmentCloseAt
    });

    // Close enrollment for each course that has passed the duration
    for (const course of coursesToClose) {
        console.log(`➡️ Closing course: ${course.courseName}`);
        console.log(`  - Current Duration: ${course.courseDurationDays}`);
        console.log(`  - Current Close At: ${course.enrollmentCloseAt.toISOString()}`);

        const durationDays = course.courseDurationDays || 30;
        const nextOpenAt = new Date(currentDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
        nextOpenAt.setMilliseconds(0);
        const nextCloseAt = new Date(nextOpenAt.getTime() + 7 * 24 * 60 * 60 * 1000);
        nextCloseAt.setMilliseconds(0);

        course.enrollmentOpen = false;
        course.enrollmentOpenAt = nextOpenAt;
        course.enrollmentCloseAt = nextCloseAt;

        await course.save();

        console.log(`✅ Enrollment closed for: ${course.courseName}`);
        console.log(`🔜 Next Open: ${nextOpenAt.toISOString()}`);
        console.log(`🔚 Next Close: ${nextCloseAt.toISOString()}`);
    }


    const coursesToOpen = await Course.find({
        enrollmentOpen: false,
        enrollmentOpenAt: { $lte: currentDate },
    });

    for (const course of coursesToOpen) {
        course.enrollmentOpen = true;
        await course.save();
        console.log(`Enrollment opened for course: ${course.courseName}`);

        // Update quizzes linked to this course
        const quizzes = await Quiz.find({ course: course._id });

        for (const quiz of quizzes) {
            const durationInMs = (course.courseDurationDays || 30) * 24 * 60 * 60 * 1000;
            quiz.startTime = new Date(quiz.startTime + durationInMs);
            quiz.endTime = new Date(quiz.endTime + durationInMs);
            quiz.reportMailSent = false;
            await quiz.save();
            console.log(`📘 Quiz "${quiz.title}" updated for course "${course.courseName}"`);
        }
    }
});

const sendQuizReminderEmail = async (user, quiz) => {
    try {
        const mailResponse = await mailSender(
            user.email,
            "Test Remainder",
            quizReminderEmail(quiz.title, quiz.startTime, quiz.endTime, user.firstName),
        )
        console.log('Email sent successfully to:', user.email);
    }
    catch (error) {
        console.log(error);
        // return res.status(500).json({ success: false, message: error.message });
    }
};

// Function to check and send email reminders
const checkAndSendQuizReminder = async () => {
    console.log("checking for sending mail");
    const quizzes = await Quiz.find({ remainderMailSent: false });
    const now = new Date();  // Current time in UTC
    const thirtyMinutesBefore = new Date(now.getTime() + 30 * 60000);  // 30 minutes from now

    quizzes.forEach(async (quiz) => {
        // Convert quiz start time (ISO format) to Date object
        const quizStartTime = new Date(quiz.startTime);

        // Check if the quiz is about to start in 30 minutes
        if (quizStartTime <= thirtyMinutesBefore && quizStartTime > now) {
            // Find all the eligible users for this quiz (those enrolled in the course)
            const course = await Course.findById(quiz.course);
            const eligibleUsers = await User.find({
                _id: { $in: course.studentsEnrolled },
                active: true,  // You may want to only send to active users
            });

            // Send an email to each eligible user
            eligibleUsers.forEach(user => {
                sendQuizReminderEmail(user, quiz);
            });

            // Update the quiz document to mark the reminder as sent
            quiz.remainderMailSent = true;
            await quiz.save();
        }
    }
    );
};


const sendQuizResultEmail = async (user, quiz, score, totalQuestions, websiteUrl) => {
    try {
        const mailResponse = await mailSender(
            user.email,
            "Quiz Result",
            quizScoreEmail(quiz.title, user.firstName, score, totalQuestions, websiteUrl),
        )
        console.log('Email sent successfully to:', user.email);
    }
    catch (error) {
        console.log(error);
        // return res.status(500).json({ success: false, message: error.message });
    }
};

const sendCourseExpiryEmail = async (user, userCourseList) => {
    try {
        const mailResponse = await mailSender(
            user.email,
            "⏳ Course Expiry in 15 Days",
            courseExpiryReminderEmail(user.firstName, userCourseList)
        )
        console.log('Email sent successfully to:', user.email);
    }
    catch (error) {
        console.log(error);
        // return res.status(500).json({ success: false, message: error.message });
    }
};


const checkAndSendQuizResultReport = async () => {
    console.log("Checking for sending report mail");

    const quizzes = await Quiz.find({ reportMailSent: false }); // Find quizzes that haven't sent the report yet
    const now = new Date();  // Current time in UTC

    quizzes.forEach(async (quiz) => {
        // Convert quiz end time (ISO format) to Date object
        const quizEndTime = new Date(quiz.endTime);

        // Check if the quiz has already ended
        if (quizEndTime <= now) {
            // Find all the eligible users for this quiz (those enrolled in the course)
            const course = await Course.findById(quiz.course);
            const eligibleUsers = await User.find({
                _id: { $in: course.studentsEnrolled },
                active: true,  // Only send to active users
            });

            // Send the report email to each eligible user
            // eligibleUsers.forEach(async (user) => {
            //     const userReportDetails = await QuizSubmission.findById(user._id);
            //     sendQuizResultEmail(user, quiz, userReportDetails.score, userReportDetails.totalQuestions, `${process.env.FRONTEND_URL}`);
            // });

            for (const user of eligibleUsers) {
                const userSubmission = await QuizSubmission.findOne({ quizId: quiz._id, userId: user._id });
                if (userSubmission) {
                    // console.log(userSubmission);
                    // User has submitted the quiz, so send the email
                    sendQuizResultEmail(user, quiz, userSubmission.score, userSubmission.totalQuestions, `${process.env.FRONTEND_URL}`);
                }
            }

            // Update the quiz document to mark the report as sent
            quiz.reportMailSent = true;
            await quiz.save();
        }
    });
};


// Set up the cron job to run every minute
cron.schedule('*/15 * * * *', checkAndSendQuizReminder);  // Every 15 minute
cron.schedule('*/15 * * * *', checkAndSendQuizResultReport);  // Every 15 minute
cron.schedule('*/30 * * * *', async () => {
    console.log("checking");
    videoCallRemainderEmail();
    youtubeRemainderEmail();
});
cron.schedule("0 8 * * *", async () => {
    try {
        console.log("📬 Running Course Expiry Email Reminder...");

        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 15);
        targetDate.setHours(0, 0, 0, 0);

        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);

        const expiringCourses = await CourseExpiry.find({
            expiryDate: {
                $gte: targetDate,
                $lt: nextDay,
            },
        }).populate("userId").populate("courseId");

        const userCourseMap = {};

        expiringCourses.forEach(entry => {
            const userId = entry.userId._id.toString();
            if (!userCourseMap[userId]) {
                userCourseMap[userId] = {
                    user: entry.userId,
                    courses: [],
                };
            }
            userCourseMap[userId].courses.push(entry.courseId.courseName);
        });

        for (const userId in userCourseMap) {
            const { user, courses } = userCourseMap[userId];
            const courseList = courses.map((c, i) => `${i + 1}. ${c}`).join("\n");

            // const mailOptions = {
            //     to: user.email,
            //     subject: "⏰ Reminder: Your courses will expire in 15 days",
            //     body: `Hi ${user.firstName},\n\nThese courses will expire in 15 days:\n\n${courseList}\n\nFinish them soon!\n\nBest,\nYour Learning Platform Team`
            // };

            // await mailSender(mailOptions.to, mailOptions.subject, mailOptions.body);
            // console.log(courseList);
            sendCourseExpiryEmail(user, courses);

            console.log(`📨 Reminder sent to ${user.email}`);
        }

    } catch (error) {
        console.error("⚠️ Error sending course expiry reminders:", error);
    }
});
// Runs every Monday at 9 AM
cron.schedule("17 13 * * 1", async () => {
    console.log("Sending progress reports")
    await sendProgressEmails();
});

app.get("/", (req, res) => {
    res.json({
        message: "app started"
    })
})
server.listen(PORT, () => {
    console.log(`App is running at Port ${PORT}`);
})
