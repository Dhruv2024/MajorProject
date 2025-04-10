import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    questionText: String,
    options: [String],
    correctAnswer: Number,
    topic: String,
});

const quizSchema = new mongoose.Schema({
    title: String,
    questions: [questionSchema],
    timeLimit: Number, // in minutes
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
});

export default mongoose.model('Quiz', quizSchema);