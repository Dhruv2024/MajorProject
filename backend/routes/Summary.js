const express = require("express")
const router = express.Router()

const { auth } = require("../middlewares/auth");
const { generateSummary } = require("../controllers/Summary");

router.post("/generate-summary", auth, generateSummary);
module.exports = router