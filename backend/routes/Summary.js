const express = require("express")
const router = express.Router()

const { auth } = require("../middlewares/auth");
const { generateSummary, summarizeQuizResult } = require("../controllers/Summary");

router.post("/generate-summary", auth, generateSummary);
router.post("/generateQuizResultSummary", auth, summarizeQuizResult)
module.exports = router;