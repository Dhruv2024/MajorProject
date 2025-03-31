const mongoose = require("mongoose");
const Question = require("../models/Questions");
const Course = require("../models/Course");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const Tesseract = require("tesseract.js");
const natural = require("natural");
const Answer = require("../models/Answers");

exports.askQuestion = async (req, res) => {
    try {
        const { text, courseId } = req.body;
        const userId = req.user.id; // Logged-in user's ID
        const image = req.files?.question; // Image file (if provided)

        // Validate input
        if (!userId || !courseId) {
            return res.status(400).json({
                success: false,
                message: "Instructor ID, User ID, and Course ID are required",
            });
        }

        if (!text && !image) {
            return res.status(400).json({
                success: false,
                message: "You must provide either text or an image",
            });
        }

        // Check if the course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }
        // Check if the user is an enrolled student
        if (!course.studentsEnrolled.includes(userId) && course.instructor.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "You must be enrolled in this course to ask questions",
            });
        }



        // **Extract Text from Image (Without Uploading)**
        let imageText = null;
        if (image) {
            try {
                const { data } = await Tesseract.recognize(image.tempFilePath, "eng");
                imageText = data.text.trim();
                console.log("Extracted text from image:", imageText);
            } catch (ocrError) {
                console.error("Error extracting text from image:", ocrError);
                return res.status(500).json({
                    success: false,
                    message: "Error extracting text from image",
                    error: ocrError.message,
                });
            }
        }

        // **Combine Text + Extracted Image Text**
        const questionText = `${text || ""} ${imageText || ""}`.trim();

        // **Find Similar Questions Using ML (TF-IDF)**
        const allQuestions = await Question.find({
            courseId,
            answers: { $exists: true, $not: { $size: 0 } } // Only fetch questions with answers
        }).select("_id text imageText");

        const existingTexts = allQuestions.map(q => ({
            id: q._id,
            text: `${q.text || ""} ${q.imageText || ""}`.trim(),
        }));

        let similarQuestions = findSimilarQuestions(questionText, existingTexts);

        // **If Similar Questions Exist, Don't Upload Image & Return Similar Questions**
        if (similarQuestions.length > 0) {
            return res.status(200).json({
                success: true,
                message: "Similar questions found",
                similarQuestions,
                allowNewQuestion: true,
            });
        }

        // **If No Similar Question, Proceed to Upload Image**
        let imageUrl = null;
        if (image) {
            try {
                // Validate file format
                const allowedFormats = ["jpg", "jpeg", "png", "gif"];
                const fileFormat = image.mimetype.split("/")[1];

                if (!allowedFormats.includes(fileFormat)) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid file format. Only JPG, JPEG, PNG, and GIF are allowed.",
                    });
                }

                // Upload image to Cloudinary
                const uploadResult = await uploadImageToCloudinary(image, "questions");
                imageUrl = uploadResult.secure_url;
                console.log("Image uploaded:", imageUrl);
            } catch (uploadError) {
                console.error("Error uploading image:", uploadError);
                return res.status(500).json({
                    success: false,
                    message: "Error uploading image",
                    error: uploadError.message,
                });
            }
        }

        // **Create and Save the Question**
        const newQuestion = new Question({
            courseId,
            askedBy: userId,
            imageUrl,
            text,
            imageText,
        });

        await newQuestion.save();

        // Add the question to the course's question list
        course.questionsList.push(newQuestion._id);
        await course.save();

        return res.status(201).json({
            success: true,
            message: "Question asked successfully",
            question: newQuestion,
        });
    } catch (err) {
        console.error("Error in askQuestion:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: err.message,
        });
    }
};

// **ML Function: Find Similar Questions Using TF-IDF + Cosine Similarity**
function findSimilarQuestions(newQuestionText, existingQuestions) {
    if (existingQuestions.length === 0) return [];

    const TfIdf = natural.TfIdf;
    const tfidf = new TfIdf();

    existingQuestions.forEach(q => tfidf.addDocument(q.text));
    tfidf.addDocument(newQuestionText);

    let similarities = [];
    tfidf.tfidfs(newQuestionText, (i, measure) => {
        similarities.push({ index: i, score: measure });
    });

    similarities = similarities.slice(0, -1); // Remove last (new question itself)
    similarities.sort((a, b) => b.score - a.score);

    return similarities
        .filter(sim => sim.score > 0.2) // Threshold for similarity (adjustable)
        .slice(0, 3) // Return top 3 similar questions
        .map(sim => ({
            questionId: existingQuestions[sim.index].id,
            text: existingQuestions[sim.index].text,
        }));
}
exports.deleteQuestion = async (req, res) => {
    try {
        const { questionId } = req.body;
        const userId = req.user.id; // Logged-in user ID

        // Check if the question exists
        const question = await Question.findById(questionId);
        if (!question) {
            return res.status(404).json({
                success: false,
                message: "Question not found"
            });
        }

        // Check if the user is authorized (Only the person who asked or instructor can delete)
        const course = await Course.findById(question.courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        if (question.askedBy.toString() !== userId && question.instructor.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this question"
            });
        }

        // Remove the question from the course's question list
        course.questionsList = course.questionsList.filter(q => q.toString() !== questionId);
        await course.save();


        // Delete the question
        await Question.findByIdAndDelete(questionId);

        return res.status(200).json({
            success: true,
            message: "Question deleted successfully"
        });
    } catch (err) {
        console.error("Error deleting question:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: err.message
        });
    }
};

exports.fetchAllQuestionForCourse = async (req, res) => {
    try {
        // Extract courseId from URL parameters
        const { courseId } = req.body;
        const userId = req.user.id;

        if (!userId || !courseId) {
            return res.status(400).json({
                success: false,
                message: "Both entries are required"
            })
        }

        // Check if the course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        // Check if the user is an enrolled student
        if (!course.studentsEnrolled.includes(userId) && course.instructor.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "You must be enrolled in this course to ask questions",
            });
        }

        // Find all questions for the given courseId and sort by createdAt in descending order
        const questions = await Question.find({ courseId })
            .sort({ createdAt: -1 }) // Sort by createdAt descending (latest questions first)
            .populate('askedBy', 'firstName email')
            .populate('answeredBy'); // Populate user details if needed

        // If no questions found
        if (questions.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No questions found for this course."
            });
        }

        // Return the questions
        return res.status(200).json({
            success: true,
            questions
        });
    } catch (error) {
        console.error("Error fetching questions:", error);
        res.status(500).json({
            success: false,
            message: "Server error, could not fetch questions."
        });
    }
}
