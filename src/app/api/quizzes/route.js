// src/app/api/questions/route.js
import { clientPromise } from '@/lib/mongodb'; // Adjust the path if necessary

export async function GET(req) {
  try {
    const client = await clientPromise;
    const database = client.db('question_db'); // Replace with your database name
    const collection = database.collection('questions'); // Replace with your collection name

    const questions = await collection.find({}).toArray(); // Fetch all questions

    return new Response(JSON.stringify(questions), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error("Failed to fetch questions:", error);
    return new Response(JSON.stringify({ message: "Failed to fetch questions." }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
