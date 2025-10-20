import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema(
  {
    quiz_name: { type: String, required: true },
    questions_and_answers: [
      {
        question: { type: String, required: true },
        answer: { type: String }, // Legacy text answer support
        options: { // MCQ options
          type: [String],
          validate: {
            validator: function(options) {
              // If options exist, there should be exactly 4 of them
              return !options || options.length === 4;
            },
            message: 'MCQ questions must have exactly 4 options'
          }
        },
        correct_answer: { type: String }, // MCQ correct answer (A, B, C, or D)
      },
    ],
  },
  { timestamps: true }
);

const Quiz = mongoose.models.Quiz || mongoose.model('Quiz', quizSchema, 'questions');

export default Quiz;
