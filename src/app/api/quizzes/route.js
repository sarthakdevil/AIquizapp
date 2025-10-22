// src/app/api/quizzes/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Quiz from '@/models/Quiz';

export async function GET(req) {
  try {
    console.log('Attempting to connect to MongoDB...');
    await connectDB();
    console.log('Connected to DB successfully');
    
    console.log('MongoDB URI exists:', !!process.env.MONGODB_URI);
    console.log('Quiz model collection name:', Quiz.collection.name);
    
    const questions = await Quiz.find({}).lean(); // Fetch all quizzes using Mongoose
    console.log('Found questions:', questions.length);
    
    if (questions.length > 0) {
      console.log('Sample question structure:', JSON.stringify(questions[0], null, 2));
    }
    
    return NextResponse.json(questions, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch questions:", error);
    console.error("Error details:", error.message);
    console.error("MongoDB URI present:", !!process.env.MONGODB_URI);
    
    return NextResponse.json({ 
      message: "Failed to fetch questions.", 
      error: error.message,
      hasMongoUri: !!process.env.MONGODB_URI 
    }, { status: 500 });
  }
}
