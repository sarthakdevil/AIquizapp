import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Room from '@/models/Room';
import Quiz from '@/models/Quiz';

// Create a new room
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { hostId, hostName, quizId, maxPlayers, timePerQuestion } = body;

    // Validate required fields
    if (!hostId || !hostName || !quizId) {
      return NextResponse.json(
        { message: "Host ID, host name, and quiz ID are required." },
        { status: 400 }
      );
    }

    // Check if quiz exists
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return NextResponse.json(
        { message: "Quiz not found." },
        { status: 404 }
      );
    }

    // Generate unique room code
    let roomCode;
    let isUnique = false;
    let attempts = 0;
    
    while (!isUnique && attempts < 10) {
      roomCode = Room.generateRoomCode();
      const existingRoom = await Room.findOne({ roomCode });
      if (!existingRoom) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return NextResponse.json(
        { message: "Failed to generate unique room code. Please try again." },
        { status: 500 }
      );
    }

    // Create new room
    const newRoom = new Room({
      roomCode,
      hostId,
      hostName,
      quizId,
      maxPlayers: 2, // Fixed at 2 for 1v1 battles
      settings: {
        timePerQuestion: timePerQuestion || 30,
        showCorrectAnswers: true,
        allowSpectators: false
      }
    });

    // Add host as first player
    await newRoom.addPlayer(hostId, hostName);
    
    const savedRoom = await newRoom.save();
    
    return NextResponse.json({
      message: "Room created successfully",
      room: {
        roomCode: savedRoom.roomCode,
        hostId: savedRoom.hostId,
        hostName: savedRoom.hostName,
        quizId: savedRoom.quizId,
        gameState: savedRoom.gameState,
        players: savedRoom.players,
        maxPlayers: savedRoom.maxPlayers,
        settings: savedRoom.settings
      }
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating room:", error);
    return NextResponse.json(
      { message: "Failed to create room.", error: error.message },
      { status: 500 }
    );
  }
}

// Get room by code
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const roomCode = searchParams.get('roomCode');

    if (!roomCode) {
      return NextResponse.json(
        { message: "Room code is required." },
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

    return NextResponse.json({
      room: {
        roomCode: room.roomCode,
        hostId: room.hostId,
        hostName: room.hostName,
        quizId: room.quizId,
        gameState: room.gameState,
        players: room.players,
        maxPlayers: room.maxPlayers,
        settings: room.settings,
        currentQuestionIndex: room.currentQuestionIndex
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching room:", error);
    return NextResponse.json(
      { message: "Failed to fetch room.", error: error.message },
      { status: 500 }
    );
  }
}