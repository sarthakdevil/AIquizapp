import connectDB from '@/lib/mongodb';
import Quiz from '@/models/Quiz';

export async function POST(req) {
  try {
    // Connect to the database
    await connectDB();

    // Get data from the request
    const { quizName, questionsAndAnswers } = await req.json();

    // Create the quiz document using Mongoose model
    const newQuiz = new Quiz({
      quiz_name: quizName,
      questions_and_answers: questionsAndAnswers.map((qa) => ({
        question: qa.question,
        answer: qa.answer,
        options: qa.options, // Support MCQ options
        correct_answer: qa.correct_answer // Support MCQ correct answer
      })),
    });

    // Save the quiz
    const result = await newQuiz.save();

    // Return success response with quizId
    return new Response(
      JSON.stringify({ quizId: result._id }), // Mongoose returns _id
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error creating quiz:', error);
    return new Response(
      JSON.stringify({ message: 'Failed to create quiz' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
