import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Room from '@/models/Room';

// Join a room
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { roomCode, playerId, playerName } = body;

    // Validate required fields
    if (!roomCode || !playerId || !playerName) {
      return NextResponse.json(
        { message: "Room code, player ID, and player name are required." },
        { status: 400 }
      );
    }

    const room = await Room.findOne({ roomCode });
    
    if (!room) {
      return NextResponse.json(
        { message: "Room not found." },
        { status: 404 }
      );
    }

    if (room.gameState === 'in-progress') {
      return NextResponse.json(
        { message: "Cannot join room. Game is already in progress." },
        { status: 400 }
      );
    }

    if (room.gameState === 'finished') {
      return NextResponse.json(
        { message: "Cannot join room. Game has finished." },
        { status: 400 }
      );
    }

    try {
      await room.addPlayer(playerId, playerName);
      await room.populate('quizId');
      
      return NextResponse.json({
        message: "Successfully joined room",
        room: {
          roomCode: room.roomCode,
          hostId: room.hostId,
          hostName: room.hostName,
          quizId: room.quizId,
          gameState: room.gameState,
          players: room.players,
          maxPlayers: room.maxPlayers,
          settings: room.settings
        }
      }, { status: 200 });

    } catch (error) {
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error("Error joining room:", error);
    return NextResponse.json(
      { message: "Failed to join room.", error: error.message },
      { status: 500 }
    );
  }
}

// Leave a room
export async function DELETE(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const roomCode = searchParams.get('roomCode');
    const playerId = searchParams.get('playerId');

    if (!roomCode || !playerId) {
      return NextResponse.json(
        { message: "Room code and player ID are required." },
        { status: 400 }
      );
    }

    const room = await Room.findOne({ roomCode });
    
    if (!room) {
      return NextResponse.json(
        { message: "Room not found." },
        { status: 404 }
      );
    }

    await room.removePlayer(playerId);
    
    // If host leaves, delete the room
    if (room.hostId === playerId) {
      await Room.deleteOne({ roomCode });
      return NextResponse.json({
        message: "Room deleted as host left"
      }, { status: 200 });
    }

    return NextResponse.json({
      message: "Successfully left room",
      room: {
        roomCode: room.roomCode,
        players: room.players
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Error leaving room:", error);
    return NextResponse.json(
      { message: "Failed to leave room.", error: error.message },
      { status: 500 }
    );
  }
}