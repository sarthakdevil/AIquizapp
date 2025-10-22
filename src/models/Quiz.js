import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema(
  {
    pdf_name: { type: String },
    quiz_name: { type: String, required: true },
    quiz_time: { type: mongoose.Schema.Types.Mixed }, // Can be number or string
    questions_and_answers: [
      {
        question: { type: String, required: true },
        answer: { type: String }, // Legacy text answer support
        options: { 
          // MCQ options object with A, B, C, D keys
          type: mongoose.Schema.Types.Mixed,
          default: undefined
        },
        correct_answer: { type: String }, // MCQ correct answer (A, B, C, or D)
      },
    ],
  },
  { 
    timestamps: true,
    strict: false // Allow additional fields that might exist in the database
  }
);

const Quiz = mongoose.models.Quiz || mongoose.model('Quiz', quizSchema, 'questions');

export default Quiz;
