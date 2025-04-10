const express = require("express")
const { askQuestion, deleteQuestion, fetchAllQuestionForCourse, askQuestionAgain } = require("../controllers/Questions")
const router = express.Router()

const { auth } = require("../middlewares/auth")

router.post("/askQuestion", auth, askQuestion);
router.post("/askQuestionAgain", auth, askQuestionAgain);
router.post("/deleteQuestion", auth, deleteQuestion);
router.post("/fetchQuestions", auth, fetchAllQuestionForCourse);
module.exports = router