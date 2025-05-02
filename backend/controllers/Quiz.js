// import { generateQuizReport } from '../utils/geminiReport.js'; // use Gemini/TensorFlow.js logic
const Course = require('../models/Course');
const Quiz = require("../models/Quiz");
const QuizQuestion = require('../models/QuizQuestions');
const Option = require('../models/QuestionOption');
const QuizSubmission = require('../models/QuizSubmission');
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const SubSection = require('../models/SubSection');
const CourseProgress = require('../models/CourseProgress');
const User = require('../models/User');
const { GoogleGenerativeAI } = require("@google/generative-ai");


// Updated Controller for creating a new quiz
exports.createQuiz = async (req, res) => {
    try {
        const { title, timeLimit, startTime, endTime, courseId } = req.body;
        // console.log(req.body);
        const { userId } = req.user.id;
        const quiz = new Quiz({ title, timeLimit, createdBy: userId, startTime, endTime, course: courseId });
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
            if (isImage === 'true') { // Handle string 'true' from form

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

exports.fetchQuiz = async (req, res) => {
    try {
        // console.log("received request for fetching quiz");
        // console.log(req.body);
        const { courseId, quizId } = req.body;
        const userId = req.user.id;

        // Step 1: Verify user is enrolled in the course
        const course = await Course.findById(courseId).populate({
            path: 'courseContent',
            populate: {
                path: 'subSection',
                model: 'SubSection',
            },
        });

        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        const isEnrolled = course.studentsEnrolled.includes(userId);
        if (!isEnrolled) {
            return res.status(403).json({ success: false, message: 'User not enrolled in this course' });
        }

        // Step 2: Check if the quiz exists in any subsection
        let quizFound = false;
        for (const section of course.courseContent) {
            for (const subSection of section.subSection) {
                if (subSection.quiz?.toString() === quizId) {
                    quizFound = true;
                    break;
                }
            }
            if (quizFound) break;
        }

        if (!quizFound) {
            return res.status(404).json({ success: false, message: 'Quiz not found in course content' });
        }

        // Step 3: Check if the user has already attempted the quiz
        const submission = await QuizSubmission.findOne({ userId: userId, quizId: quizId });
        if (submission) {
            return res.status(200).json({ success: false, message: 'You have already attempted this quiz', attempted: true });
        }

        // Step 4: Fetch quiz with deeply populated questions and options
        const quiz = await Quiz.findById(quizId)
            .populate({
                path: 'questions',
                model: 'QuizQuestion',
                populate: {
                    path: 'options',
                    model: 'Option',
                },
            });

        if (!quiz) {
            return res.status(404).json({ success: false, message: 'Quiz not found' });
        }
        return res.status(200).json({
            success: true,
            message: 'Quiz fetched successfully',
            data: quiz,
        });

    } catch (error) {
        console.error('Error fetching quiz:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

const updateCourseProgress = async (courseId, subSectionId, userId) => {
    try {
        //check if the subsection is valid
        console.log("Received subsection id is :" + subSectionId)
        const subSection = await SubSection.findById(subSectionId);

        if (!subSection) {
            return res.status(404).json({ error: "Invalid SUbSection" });
        }

        console.log("SubSection Validation Done");

        //check for old entry 
        let courseProgress = await CourseProgress.findOne({
            courseID: courseId,
            userId: userId,
        });
        if (!courseProgress) {
            return res.status(404).json({
                success: false,
                message: "Course Progress does not exist"
            });
        }
        else {
            console.log("Course Progress Validation Done");
            //check for re-completing video/subsection
            if (courseProgress.completedVideos.includes(subSectionId)) {
                return res.status(400).json({
                    error: "Subsection already completed",
                });
            }

            //poush into completed video
            courseProgress.completedVideos.push(subSectionId);
            console.log("Copurse Progress Push Done");
        }
        await courseProgress.save();
        console.log("Course Progress Save call Done");
        return true;
    }
    catch (error) {
        console.log("Error while updating course Progress for Quiz")
        console.error(error);
        return false;
    }
}


const summarizeQuizResult = async (quizResultTopicWise) => {
    try {
        const genAI = new GoogleGenerativeAI(process.env.AI_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        // const { transcript } = req.body;
        // const { quizResultTopicWise } = req.body;
        console.log(quizResultTopicWise);
        const prompt = `Analyze the following quiz results provided in JSON format. Provide a concise summary of the performance in each subject area and offer specific, actionable suggestions for improvement in each area where the student did not achieve a perfect score.
Quiz Results:
${JSON.stringify(quizResultTopicWise, null, 2)}
`;
        // const { videoId } = req.body;
        // const prompt = `Summarize the YouTube video with ID: ${videoId} into revision notes.`;
        // console.log(prompt);
        const result = await model.generateContent(prompt);
        // console.log(result.response.text());
        return result.response.text()
        // return res.json({
        //     success: true,
        //     message: result.response.text(),
        //     status: 200
        // });
    } catch (error) {
        console.log("Something went wrong");
        console.log(error);
        // return res.json({
        //     success: false,
        //     message: "Something went wrong ",
        //     status: 500
        // });
    }
}


// Controller to store user's quiz answers
exports.submitQuiz = async (req, res) => {
    try {
        const { quizId, finalAnswers, courseId, subSectionId } = req.body;
        const userId = req.user.id;

        const quiz = await Quiz.findById(quizId).populate({
            path: 'questions',
            populate: {
                path: 'options',
            },
        });
        console.log(quiz);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        let score = 0;
        for (const userAnswer of finalAnswers) {
            const question = await QuizQuestion.findById(userAnswer.questionId);
            // console.log(Number(question.correctAnswer), typeof (Number(question.correctAnswer)));
            // console.log(userAnswer.answer, typeof (userAnswer.answer));
            // console.log(Number(question.correctAnswer) === userAnswer.answer);
            if (question && Number(question.correctAnswer) === userAnswer.answer) {
                score++;
            }
        }
        console.log(score);

        const detailedAnswers = await Promise.all(finalAnswers.map(async (userAnswer) => {
            const question = await QuizQuestion.findById(userAnswer.questionId).populate('options');
            const correctAnswerIndex = question ? question.correctAnswer : null;
            // console.log(correctAnswerIndex)

            return {
                questionId: userAnswer.questionId,
                selectedAnswer: userAnswer.answer,
                // selectedAnswer: selectedAnswer,
                correctOption: correctAnswerIndex,
                // correctAnswer: correctAnswer,
                isCorrect: userAnswer.answer === parseInt(correctAnswerIndex),
                questionText: question ? question.question : 'Question not found',
                options: question ? question.options.map(opt => ({
                    _id: opt._id,
                    option: opt.option,
                    isImage: opt.isImage
                })) : [],
                isImage: question ? question.isImage : false,
                imageUrl: question ? question.imageUrl : null,
                topic: question.topic
            };
        }));
        // console.log(detailedAnswers);
        const quizResultTopicWise = detailedAnswers.reduce((acc, answer) => {
            const topic = answer.topic || 'Unknown';
            acc[topic] = acc[topic] || {
                correct: 0,
                total: 0,
                correctQuestions: [],
                incorrectQuestions: [],
            };
            acc[topic].total += 1;
            if (answer.isCorrect) {
                acc[topic].correct += 1;
                acc[topic].correctQuestions.push(answer.questionText);
            } else {
                acc[topic].incorrectQuestions.push(answer.questionText);
            }
            return acc;
        }, {});
        // console.log("printing detailed topic stat");
        // console.log(quizResultTopicWise);
        // return res.json({
        //     message: "done"
        // })
        const summaryResult = await summarizeQuizResult(quizResultTopicWise);

        // const report=summarizeQuizResult
        const submission = new QuizSubmission({
            userId,
            quizId,
            answers: finalAnswers,
            score,
            totalQuestions: quiz.questions.length,
            report: summaryResult
        });

        await submission.save();

        const courseProgressed = await updateCourseProgress(courseId, subSectionId, userId);
        if (courseProgressed) {

            return res.status(201).json({ message: 'Quiz submitted successfully', submissionId: submission._id });
        }
        else {
            return res.status(500).json({
                success: false,
                message: "Failed while updating courseProgress for Quiz Subsection"
            })
        }
    } catch (error) {
        console.error('Error submitting quiz:', error);
        res.status(500).json({ message: 'Failed to submit quiz' });
    }
};

// Controller to show quiz result to a student by quizId and userId
exports.getQuizResultByUserAndQuiz = async (req, res) => {
    try {
        const { quizId } = req.body;
        const userId = req.user.id;

        const submission = await QuizSubmission.findOne({ quizId, userId })
            .populate({
                path: 'quizId',
                model: 'Quiz',
                populate: {
                    path: 'questions',
                    model: 'QuizQuestion',
                    populate: {
                        path: 'options',
                        model: 'Option',
                    },
                },
            })
            .populate('userId', 'name email')
            .sort({ submittedAt: -1 });
        // console.log(submission);
        // console.log(submission.quizId.questions);
        if (!submission) {
            return res.status(404).json({ message: 'No submission found for this user and quiz' });
        }

        const detailedAnswers = await Promise.all(submission.answers.map(async (userAnswer) => {
            const question = await QuizQuestion.findById(userAnswer.questionId).populate('options');
            const correctAnswerIndex = question ? question.correctAnswer : null;
            // console.log(correctAnswerIndex)
            // const correctAnswer = question && correctAnswerIndex !== null
            //     ? (await Option.findById(question.options[correctAnswerIndex])).option
            //     : null;
            // const selectedAnswer = userAnswer.answer !== null && question && question.options[userAnswer.answer]
            //     ? (await Option.findById(question.options[userAnswer.answer])).option
            //     : null;

            return {
                questionId: userAnswer.questionId,
                selectedAnswer: userAnswer.answer,
                // selectedAnswer: selectedAnswer,
                correctOption: correctAnswerIndex,
                // correctAnswer: correctAnswer,
                attempted: userAnswer?.answer ? true : false,
                isCorrect: userAnswer.answer === correctAnswerIndex,
                questionText: question ? question.question : 'Question not found',
                options: question ? question.options.map(opt => ({
                    _id: opt._id,
                    option: opt.option,
                    isImage: opt.isImage
                })) : [],
                isImage: question ? question.isImage : false,
                imageUrl: question ? question.imageUrl : null,
                topic: question.topic
            };
        }));

        res.status(200).json({
            quizTitle: submission.quizId.title,
            submittedAt: submission.submittedAt,
            score: submission.score,
            totalQuestions: submission.totalQuestions,
            detailedAnswers,
            report: submission.report
        });
    } catch (error) {
        console.error('Error fetching quiz result:', error);
        res.status(500).json({ message: 'Failed to fetch quiz result' });
    }
};



exports.unsubmitQuiz = async (req, res) => {
    try {
        const { submissionId } = req.body;
        const userId = req.user.id;

        // Find the submission by ID
        const submission = await QuizSubmission.findById(submissionId);

        if (!submission) {
            return res.status(404).json({ message: 'Quiz submission not found' });
        }

        // Make sure the submission belongs to the authenticated user
        if (submission.userId.toString() !== userId) {
            return res.status(403).json({ message: 'You are not authorized to unsubmit this quiz' });
        }

        // Delete the submission
        await QuizSubmission.deleteOne({ _id: submissionId });

        return res.status(200).json({
            success: true,
            message: 'Quiz unsubmitted successfully',
        });
    } catch (error) {
        console.error('Error unsubmitting quiz:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to unsubmit quiz',
        });
    }
};


// Controller function to update quizzes and add `remainderMailSent` if missing
exports.addRemainderMailSentField = async (req, res) => {
    try {
        // Find all quizzes where `remainderMailSent` field is not present
        const result = await Quiz.updateMany(
            { remainderMailSent: { $exists: false } }, // condition to check missing field
            { $set: { remainderMailSent: false } }     // adding the missing field with default value
        );

        // Respond with a success message and how many documents were modified
        return res.status(200).json({
            message: 'Field `remainderMailSent` added to missing documents.',
            modifiedCount: result.modifiedCount,
        });
    } catch (error) {
        console.error('Error while adding remainderMailSent field:', error);
        return res.status(500).json({
            message: 'Error while updating records.',
            error: error.message,
        });
    }
};

exports.fetchQuizForInstructor = async (req, res) => {
    try {
        const { courseId, quizId } = req.body;
        const userId = req.user.id;

        // Step 1: Verify user is enrolled in the course
        const course = await Course.findById(courseId).populate({
            path: 'courseContent',
            populate: {
                path: 'subSection',
                model: 'SubSection',
            },
        });

        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }
        // console.log(course.instructor.toString());
        // console.log(userId);
        if (course.instructor.toString() !== userId) {
            return res.status(404).json({ success: false, message: 'You are not instructor of this course', isInstructor: false });
        }
        const quiz = await Quiz.findById(quizId)
            .populate({
                path: 'questions',
                model: 'QuizQuestion',
                populate: {
                    path: 'options',
                    model: 'Option',
                },
            });

        if (!quiz) {
            return res.status(404).json({ success: false, message: 'Quiz not found' });
        }
        // Step 3: Fetch all quiz submissions
        const submissions = await QuizSubmission.find({ quizId }).populate('userId', 'firstName email');

        // Step 4: Top 10 performers
        const topPerformers = submissions
            .sort((a, b) => b.score - a.score || new Date(a.submittedAt) - new Date(b.submittedAt))
            .slice(0, 10);

        // Step 5: Generate question-wise report
        const questionStats = {};
        // console.log(quiz);
        for (const question of quiz.questions) {
            const qid = (question._id).toString();
            console.log("********************");
            // console.log(qid);
            // console.log(question);
            questionStats[qid] = {
                question: question.question,
                correct: 0,
                wrong: 0,
                unattempted: 0
            };
            console.log(submissions);
            for (const submission of submissions) {
                const answerObj = submission.answers.find(ans => ans.questionId.toString() === qid);
                // console.log(qid);
                // console.log(answerObj.answer);
                // console.log(question.correctAnswer);
                if (!answerObj || answerObj.answer === null || answerObj.answer === undefined) {
                    questionStats[qid].unattempted += 1;
                } else if (answerObj.answer === question.correctAnswer) {
                    questionStats[qid].correct += 1;
                } else {
                    questionStats[qid].wrong += 1;
                }
            }

        }

        // Convert stats into array for frontend-friendliness
        const detailedReport = Object.entries(questionStats).map(([qid, data]) => ({
            questionId: qid,
            questionText: data.question,
            correct: data.correct,
            wrong: data.wrong,
            unattempted: data.unattempted
        }));

        return res.status(200).json({
            success: true,
            message: 'Quiz fetched successfully',
            data: quiz,
            topPerformers,
            detailedReport,
        });
    }
    catch (error) {
        console.error('Error fetching quiz for instructor:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
}