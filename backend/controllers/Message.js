// const Rooms = require("../models/Rooms");

const Room = require("../models/Rooms");
const Message = require("../models/Message");
const Course = require("../models/Course");

exports.ValidateUser = async (req, res) => {
    try {
        console.log("request received for validating user")
        const userId = req.user.id;
        const { roomId } = req.body;
        console.log("Room id is: ", roomId)
        console.log("User id is :", userId)
        if (!roomId || !userId) {
            return res.status(404).json({
                success: false,
                message: "All Entries are required"
            })
        }
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ status: false, message: 'Room not found' });
        }

        // Check if the user is the instructor or enrolled in the room
        const isUserInstructor = room.instructor.toString() === userId;
        const isUserEnrolled = room.studentsEnrolled.some(studentId => studentId.toString() === userId);

        if (!isUserInstructor && !isUserEnrolled) {
            return res.status(403).json({ status: false, message: 'User is not authorized in this room' });
        }

        // If the room exists and the user is either the instructor or enrolled
        return res.status(200).json({ status: true, message: 'User validated successfully' });

    } catch (error) {
        console.error("Error while validating user", error);
        return res.status(500).json({ message: 'Server error' });
    }
};



exports.fetchChitChatMessages = async (req, res) => {
    try {
        const { roomId } = req.body;
        if (!roomId) {
            return res.status(400).json({
                success: false,
                message: "All fields are required to fill",
            })
        }
        // Find the room by its ID and populate the chitchatMessages field
        const roomMessages = await Room.findById(roomId)
            .populate({
                path: 'chitchatMessages',
                match: { messageType: 'chitchat' },
                options: { sort: { createdAt: 1 }, limit: 100 },  // Sort by createdAt ascending (oldest first)
                populate: {
                    path: 'sentBy',  // Populate sentBy to get user details
                    select: 'firstName email accountType'  // You can adjust the fields to return here
                }
            })
            .exec();

        // If no room found
        if (!roomMessages) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }
        console.log(roomMessages);
        // Return the chitchat messages in the room
        return res.json({
            success: true,
            messages: roomMessages.chitchatMessages
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: err.message });
    }
}

exports.fetchCourseDetails = async (req, res) => {
    try {
        const { roomId } = req.body;
        const response = await Course.findOne({ room: roomId });
        console.log(response);
        if (!response) {
            return res.status(404).json({
                success: false,
                message: "Room does not exist"
            })
        }
        return res.status(200).json({
            success: true,
            courseDetails: response
        })
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: err.message });
    }
}