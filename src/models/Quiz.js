import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema(
  {
    quiz_name: { type: String, required: true },
    questions_and_answers: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

const Quiz = mongoose.models.Quiz || mongoose.model('Quiz', quizSchema);

export default Quiz;
