import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Quiz from '@/models/Quiz';

export async function GET() {
  try {
    console.log('=== DATABASE TEST ===');
    console.log('MongoDB URI exists:', !!process.env.MONGODB_URI);
    console.log('Environment:', process.env.NODE_ENV);
    
    await connectDB();
    console.log('✅ MongoDB connection successful');
    
    const count = await Quiz.countDocuments();
    console.log('📊 Total documents in questions collection:', count);
    
    const sampleQuiz = await Quiz.findOne().lean();
    console.log('📝 Sample quiz found:', !!sampleQuiz);
    
    return NextResponse.json({
      success: true,
      hasMongoUri: !!process.env.MONGODB_URI,
      environment: process.env.NODE_ENV,
      totalQuizzes: count,
      hasSampleQuiz: !!sampleQuiz,
      sampleQuizName: sampleQuiz?.quiz_name || 'None found',
      message: 'Database connection successful!'
    });
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    
    return NextResponse.json({
      success: false,
      hasMongoUri: !!process.env.MONGODB_URI,
      environment: process.env.NODE_ENV,
      error: error.message,
      message: 'Database connection failed'
    }, { status: 500 });
  }
}