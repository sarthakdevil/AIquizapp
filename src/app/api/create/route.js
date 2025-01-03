import { clientPromise } from '@/lib/mongodb'; // MongoDB client

export async function POST(req) {
  try {
    // Connect to the database
    const client = await clientPromise;
    const database = client.db('question_db'); // Replace with your database name
    const collection = database.collection('questions'); // Replace with your collection name

    // Get data from the request
    const { quizName, questionsAndAnswers } = await req.json();

    // Create the quiz document
    const newQuiz = {
      quiz_name: quizName,
      questions_and_answers: questionsAndAnswers.map((qa) => ({
        question: qa.question,
        answer: qa.answer,
      })),
    };

    // Insert the new quiz into the 'questions' collection
    const result = await collection.insertOne(newQuiz);

    // Return success response with quizId
    return new Response(
      JSON.stringify({ quizId: result.insertedId }), // MongoDB generates the inserted _id
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
