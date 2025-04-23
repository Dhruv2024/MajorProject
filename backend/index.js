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



const Course = require("./models/Course");
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
        // const quizzes = await Quiz.find({ course: course._id });

        // for (const quiz of quizzes) {
        //     const durationInMs = (course.courseDurationDays || 30) * 24 * 60 * 60 * 1000;
        //     quiz.startTime = new Date(quiz.startTime + durationInMs);
        //     quiz.endTime = new Date(quiz.endTime + durationInMs);
        //     await quiz.save();
        //     console.log(`📘 Quiz "${quiz.title}" updated for course "${course.courseName}"`);
        // }
    }
});





app.get("/", (req, res) => {
    res.json({
        message: "app started"
    })
})
server.listen(PORT, () => {
    console.log(`App is running at Port ${PORT}`);
})
