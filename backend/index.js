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
const { createServer } = require('net');
io.on('connection', (socket) => {
    console.log("user connected");
    // Join Room
    socket.on('joinRoom', (room) => {
        socket.join(room);
        console.log(`User joined room: ${room}`);
    });

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

app.get("/", (req, res) => {
    res.json({
        message: "app started"
    })
})
server.listen(PORT, () => {
    console.log(`App is running at Port ${PORT}`);
})
