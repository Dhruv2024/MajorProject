// import { generateQuizReport } from '../utils/geminiReport.js'; // use Gemini/TensorFlow.js logic

router.post('/submit-quiz/', async (req, res) => {
    try {
        const { studentId, answers, quizId } = req.body;

        const quiz = await Quiz.findById(quizId);
        let score = 0;
        const detailedAnswers = [];

        quiz.questions.forEach((q, i) => {
            const isCorrect = q.correctAnswer === answers[i];
            if (isCorrect) score++;

            detailedAnswers.push({
                questionText: q.questionText,
                selectedOption: answers[i],
                correctAnswer: q.correctAnswer,
                topic: q.topic,
                options: q.options
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

    }
});
