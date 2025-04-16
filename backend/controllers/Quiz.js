// import { generateQuizReport } from '../utils/geminiReport.js'; // use Gemini/TensorFlow.js logic
const Quiz = require("../models/Quiz");
const QuizQuestion = require('../models/QuizQuestions');
const Option = require('../models/QuestionOption');
const { uploadImageToCloudinary } = require("../utils/imageUploader");

exports.submitQuiz = async (req, res) => {
    try {
        const { studentId, answers, quizId } = req.body;

        const quiz = await Quiz.findById(quizId);
        let score = 0;
        const detailedAnswers = [];

        quiz.questions.forEach((question, i) => {
            const isCorrect = question.correctAnswer === answers[i];
            if (isCorrect) score++;

            detailedAnswers.push({
                questionText: question.questionText,
                selectedOption: answers[i],
                correctAnswer: question.correctAnswer,
                topic: question.topic,
                options: question.options
            });
        });

        //   const report = await generateQuizReport(detailedAnswers);
        const report = "";
        const newSubmission = new StudentAnswer({
            studentId,
            quizId,
            answers: detailedAnswers,
            score,
            report,
            submittedAt: new Date(),
        });

        await newSubmission.save();
        return res.json({
            status: 200,
            score, report, detailedAnswers
        });
    }
    catch (err) {
        console.log("error while submitting quiz....");
        return res.status(500).json({
            success: false,
            message: err.message()
        })
    }
};


// Updated Controller for creating a new quiz
exports.createQuiz = async (req, res) => {
    try {
        const { title, timeLimit, startTime, endTime } = req.body;
        // console.log(req.body);
        const { userId } = req.user.id;
        const quiz = new Quiz({ title, timeLimit, createdBy: userId, startTime, endTime });
        const questionsData = [];
        const questionKeys = Object.keys(req.body).filter(key => key.startsWith('questionsData'));
        const questionsMap = {};

        questionKeys.forEach(key => {
            const parts = key.match(/questionsData\[(\d+)\]\[(.*?)\](?:\[(\d+)\]\[(.*?)\])?/);
            if (parts) {
                const questionIndex = parts[1];
                const questionField = parts[2];
                const optionIndex = parts[3];
                const optionField = parts[4];
                const value = req.body[key];

                if (!questionsMap[questionIndex]) {
                    questionsMap[questionIndex] = { options: [] };
                }

                if (optionIndex !== undefined && optionField) {
                    if (!questionsMap[questionIndex].options[optionIndex]) {
                        questionsMap[questionIndex].options[optionIndex] = {};
                    }
                    questionsMap[questionIndex].options[optionIndex][optionField] = value;
                } else {
                    questionsMap[questionIndex][questionField] = value;
                }
            }
        });

        // Convert the map to an array, ensuring order if needed
        for (const index in questionsMap) {
            questionsData.push(questionsMap[index]);
        }

        console.log('Parsed questionsData:', questionsData);

        const questionIds = [];
        // console.log(req.files);
        for (const i in questionsData) {
            const questionData = questionsData[i];
            const { questionText, isImage, options, correctAnswer, topic } = questionData;
            let imageUrl = null;
            // console.log("**************");
            // console.log(image)
            if (isImage === 'true' && image) { // Handle string 'true' from form
                const image = req.files[`questionsData[${i}][questionImage]`];
                // console.log("image conversion request received");
                // console.log(image);
                const response = await uploadImageToCloudinary(image, process.env.FOLDER_NAME);
                imageUrl = response.secure_url;
            }
            // Create the quiz question first to get its ID for the options
            const quizQuestion = new QuizQuestion({
                question: questionText, // Handle string 'true'
                isImage: isImage === 'true', // Handle string 'true'
                imageUrl: isImage === 'true' ? imageUrl : null,
                correctAnswer,
                topic,
            });
            await quizQuestion.save();
            questionIds.push(quizQuestion._id);

            // Create the option documents, referencing the quiz question
            const optionObjects = await Promise.all(options.map(async (optionData) => {
                let optionText = optionData?.text;
                let optionIsImage = optionData?.isImage === 'true' || false; // Handle string 'true'
                let optionImageUrl = '';

                if (optionIsImage && optionData.image) {
                    const response = await uploadImageToCloudinary(optionData.image, process.env.FOLDER_NAME || 'quiz_options'); // Separate folder for options if needed
                    optionImageUrl = response.secure_url;
                    optionText = optionImageUrl; // Store the image URL as the option text
                }

                return Option.create({
                    questionId: quizQuestion._id,
                    isImage: optionIsImage,
                    option: optionText,
                });
            }));
            const optionIds = optionObjects.map(option => option._id);

            // Update the quiz question with the option IDs
            quizQuestion.options = optionIds;
            await quizQuestion.save();
        }

        quiz.questions = questionIds;
        await quiz.save();

        res.status(201).json({ success: true, message: 'Quiz created successfully', quiz });
    } catch (error) {
        console.error('Error creating quiz:', error);
        res.status(500).json({ success: false, message: 'Failed to create quiz', error: error.message });
    }
};

// Updated Controller for editing an existing quiz
exports.editQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;
        const { title, questionsData, timeLimit } = req.body;

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        quiz.title = title || quiz.title;
        quiz.timeLimit = timeLimit || quiz.timeLimit;
        quiz.startTime = startTime || quiz.startTime;
        quiz.endTime = endTime || quiz.endTime;
        if (questionsData && Array.isArray(questionsData)) {
            // For simplicity, we'll still replace all existing questions
            // More sophisticated logic to update specific questions is recommended for production

            // 1. Get existing question IDs
            const existingQuestionIds = quiz.questions;

            // 2. Delete existing questions and their options
            await Option.deleteMany({ questionId: { $in: existingQuestionIds } });
            await QuizQuestion.deleteMany({ _id: { $in: existingQuestionIds } });
            quiz.questions = [];

            // 3. Create new questions and options
            const newQuestionIds = [];
            for (const questionData of questionsData) {
                const { question: questionText, isImage: questionIsImage, options: optionTexts, correctAnswer, topic } = questionData;

                const newQuizQuestion = new QuizQuestion({
                    question: questionText,
                    isImage: questionIsImage,
                    correctAnswer,
                    topic,
                });
                await newQuizQuestion.save();
                newQuestionIds.push(newQuizQuestion._id);

                const optionObjects = await Promise.all(optionTexts.map(optionText =>
                    Option.create({ questionId: newQuizQuestion._id, option: optionText })
                ));
                const optionIds = optionObjects.map(option => option._id);
                newQuizQuestion.options = optionIds;
                await newQuizQuestion.save();
            }
            quiz.questions = newQuestionIds;
        }

        await quiz.save();

        res.json({ message: 'Quiz updated successfully', quiz });
    } catch (error) {
        console.error('Error editing quiz:', error);
        res.status(500).json({ message: 'Failed to edit quiz', error: error.message });
    }
};

// Updated Controller for deleting a quiz
exports.deleteQuiz = async (req, res) => {
    try {
        const { quizId } = req.body;

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        const questionIdsToDelete = quiz.questions;

        // Delete associated options first based on question IDs
        await Option.deleteMany({ questionId: { $in: questionIdsToDelete } });

        // Then delete the quiz questions
        await QuizQuestion.deleteMany({ _id: { $in: questionIdsToDelete } });

        // Finally, delete the quiz itself
        await Quiz.findByIdAndDelete(quizId);

        res.json({ message: 'Quiz deleted successfully' });
    } catch (error) {
        console.error('Error deleting quiz:', error);
        res.status(500).json({ message: 'Failed to delete quiz', error: error.message });
    }
};