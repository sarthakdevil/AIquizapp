// Vercel-compatible polling-based multiplayer system
// src/app/api/rooms/realtime/route.js

import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Room from '@/models/Room';

// Get room state for polling
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const roomCode = searchParams.get('roomCode');
    const lastUpdate = searchParams.get('lastUpdate');

    if (!roomCode) {
      return NextResponse.json({ error: 'Room code required' }, { status: 400 });
    }

    const room = await Room.findOne({ roomCode }).populate('quizId');
    
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const hasUpdates = !lastUpdate || room.updatedAt > new Date(parseInt(lastUpdate));

    return NextResponse.json({
      room: {
        roomCode: room.roomCode,
        gameState: room.gameState,
        players: room.players,
        currentQuestionIndex: room.currentQuestionIndex,
        quiz: room.quizId
      },
      hasUpdates,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('Polling error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// Handle game actions (start game, submit answer)
export async function POST(req) {
  try {
    await connectDB();
    const { action, roomCode, playerId, data } = await req.json();

    const room = await Room.findOne({ roomCode }).populate('quizId');
    
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    switch (action) {
      case 'start-game':
        if (room.hostId !== playerId) {
          return NextResponse.json({ error: 'Only host can start' }, { status: 403 });
        }
        if (room.players.length !== 2) {
          return NextResponse.json({ error: 'Need exactly 2 players' }, { status: 400 });
        }
        
        room.gameState = 'in-progress';
        room.currentQuestionIndex = 0;
        room.startTime = new Date();
        await room.save();
        
        return NextResponse.json({ 
          success: true, 
          room,
          currentQuestion: room.quizId.questions_and_answers[0]
        });

      case 'submit-answer':
        const { questionIndex, answer, timeToAnswer } = data;
        const quiz = room.quizId;
        const currentQuestion = quiz.questions_and_answers[questionIndex];
        const isCorrect = answer === currentQuestion.correct_answer;
        
        await room.updatePlayerScore(playerId, questionIndex, answer, isCorrect, timeToAnswer);
        
        // Check if both players answered
        const bothAnswered = room.players.every(p => 
          p.answers.some(a => a.questionIndex === questionIndex)
        );
        
        if (bothAnswered) {
          // Move to next question or end game
          if (questionIndex + 1 < quiz.questions_and_answers.length) {
            room.currentQuestionIndex = questionIndex + 1;
          } else {
            room.gameState = 'finished';
          }
          await room.save();
        }
        
        return NextResponse.json({
          success: true,
          isCorrect,
          correctAnswer: currentQuestion.correct_answer,
          bothAnswered,
          nextQuestion: bothAnswered && room.currentQuestionIndex < quiz.questions_and_answers.length 
            ? quiz.questions_and_answers[room.currentQuestionIndex] 
            : null
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Game action error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}