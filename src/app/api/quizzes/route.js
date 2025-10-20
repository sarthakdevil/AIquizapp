// src/app/api/questions/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Quiz from '@/models/Quiz';

export async function GET(req) {
  try {
    await connectDB();
    console.log('Connected to DB, fetching from questions collection...');
    console.log('Quiz model collection name:', Quiz.collection.name);
    
    const questions = await Quiz.find({}).lean(); // Fetch all quizzes using Mongoose
    console.log('Found questions:', questions.length);
    console.log('Questions data:', questions);
    
    return NextResponse.json(questions, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch questions:", error);
    return NextResponse.json({ message: "Failed to fetch questions." }, { status: 500 });
  }
}
