const express = require("express")
const { ValidateUser, fetchChitChatMessages, fetchCourseDetails } = require("../controllers/Message")
const router = express.Router()

const { auth } = require("../middlewares/auth")

router.post("/validateUserForRoom", auth, ValidateUser);
router.post("/fetchMessages", auth, fetchChitChatMessages);
router.post("/fetchCourseDetails", auth, fetchCourseDetails);
module.exports = router