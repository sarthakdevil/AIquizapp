import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Room from '@/models/Room';

// Start game
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { roomCode, hostId } = body;

    if (!roomCode || !hostId) {
      return NextResponse.json(
        { message: "Room code and host ID are required." },
        { status: 400 }
      );
    }

    const room = await Room.findOne({ roomCode }).populate('quizId');
    
    if (!room) {
      return NextResponse.json(
        { message: "Room not found." },
        { status: 404 }
      );
    }

    if (room.hostId !== hostId) {
      return NextResponse.json(
        { message: "Only the host can start the game." },
        { status: 403 }
      );
    }

    if (room.players.length < 2) {
      return NextResponse.json(
        { message: "At least 2 players are required to start the game." },
        { status: 400 }
      );
    }

    if (room.gameState !== 'waiting') {
      return NextResponse.json(
        { message: "Game has already started or finished." },
        { status: 400 }
      );
    }

    // Update room state
    room.gameState = 'in-progress';
    room.startTime = new Date();
    room.currentQuestionIndex = 0;
    
    await room.save();

    return NextResponse.json({
      message: "Game started successfully",
      room: {
        roomCode: room.roomCode,
        gameState: room.gameState,
        startTime: room.startTime,
        currentQuestionIndex: room.currentQuestionIndex,
        quiz: room.quizId
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Error starting game:", error);
    return NextResponse.json(
      { message: "Failed to start game.", error: error.message },
      { status: 500 }
    );
  }
}

// Submit answer
export async function PUT(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { roomCode, playerId, questionIndex, answer, timeToAnswer } = body;

    if (!roomCode || !playerId || questionIndex === undefined || !answer) {
      return NextResponse.json(
        { message: "Room code, player ID, question index, and answer are required." },
        { status: 400 }
      );
    }

    const room = await Room.findOne({ roomCode }).populate('quizId');
    
    if (!room) {
      return NextResponse.json(
        { message: "Room not found." },
        { status: 404 }
      );
    }

    if (room.gameState !== 'in-progress') {
      return NextResponse.json(
        { message: "Game is not in progress." },
        { status: 400 }
      );
    }

    // Check if question exists
    const quiz = room.quizId;
    if (!quiz || questionIndex >= quiz.questions_and_answers.length) {
      return NextResponse.json(
        { message: "Invalid question index." },
        { status: 400 }
      );
    }

    // Check MCQ answer - all questions are now multiple choice from 3-stage pipeline
    const currentQuestion = quiz.questions_and_answers[questionIndex];
    const isCorrect = answer === currentQuestion.correct_answer;

    // Update player score
    await room.updatePlayerScore(playerId, questionIndex, answer, isCorrect, timeToAnswer || 0);

    return NextResponse.json({
      message: "Answer submitted successfully",
      isCorrect,
      correctAnswer: currentQuestion.correct_answer,
      currentScore: room.players.find(p => p.playerId === playerId)?.score || 0,
      matchDetails: {
        confidence: isCorrect ? 'exact' : 'none',
        method: 'multiple_choice',
        score: isCorrect ? 1.0 : 0.0
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Error submitting answer:", error);
    return NextResponse.json(
      { message: "Failed to submit answer.", error: error.message },
      { status: 500 }
    );
  }
}