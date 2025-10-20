import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import GameHistory from '@/models/GameHistory';
import Room from '@/models/Room';

// Save game results to history
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { roomCode } = body;

    if (!roomCode) {
      return NextResponse.json(
        { message: "Room code is required." },
        { status: 400 }
      );
    }

    // Get the completed room
    const room = await Room.findOne({ roomCode }).populate('quizId');
    
    if (!room || room.gameState !== 'finished') {
      return NextResponse.json(
        { message: "Room not found or game not finished." },
        { status: 404 }
      );
    }

    // Calculate game statistics
    const gameDuration = room.endTime && room.startTime 
      ? Math.floor((room.endTime - room.startTime) / 1000) 
      : 0;

    // Prepare players data with detailed statistics
    const playersData = room.players.map((player, index) => {
      const correctAnswers = player.answers.filter(ans => ans.isCorrect).length;
      const totalAnswerTime = player.answers.reduce((sum, ans) => sum + (ans.timeToAnswer || 0), 0);
      const averageAnswerTime = player.answers.length > 0 
        ? Math.round(totalAnswerTime / player.answers.length) 
        : 0;

      // Create detailed answers array
      const detailedAnswers = player.answers.map(ans => {
        const question = room.quizId.questions_and_answers[ans.questionIndex];
        return {
          questionIndex: ans.questionIndex,
          question: question ? question.question : 'Unknown question',
          userAnswer: ans.answer,
          correctAnswer: question ? question.answer : 'Unknown',
          isCorrect: ans.isCorrect,
          timeToAnswer: ans.timeToAnswer || 0
        };
      });

      return {
        playerId: player.playerId,
        playerName: player.playerName,
        finalScore: player.score,
        position: index + 1, // Will be recalculated based on score ranking
        correctAnswers,
        totalQuestions: room.quizId.questions_and_answers.length,
        averageAnswerTime,
        answers: detailedAnswers
      };
    });

    // Sort players by score and assign correct positions
    playersData.sort((a, b) => b.finalScore - a.finalScore);
    playersData.forEach((player, index) => {
      player.position = index + 1;
    });

    // Create game history record
    const gameHistory = new GameHistory({
      roomCode: room.roomCode,
      quizId: room.quizId._id,
      quizName: room.quizId.quiz_name,
      players: playersData,
      gameSettings: {
        timePerQuestion: room.settings.timePerQuestion,
        maxPlayers: room.maxPlayers
      },
      gameStats: {
        totalQuestions: room.quizId.questions_and_answers.length,
        gameDuration,
        startTime: room.startTime,
        endTime: room.endTime,
        winner: playersData[0] ? {
          playerId: playersData[0].playerId,
          playerName: playersData[0].playerName,
          finalScore: playersData[0].finalScore
        } : null
      }
    });

    await gameHistory.save();

    return NextResponse.json({
      message: "Game history saved successfully",
      gameId: gameHistory._id,
      stats: {
        totalPlayers: playersData.length,
        winner: gameHistory.gameStats.winner,
        gameDuration,
        totalQuestions: room.quizId.questions_and_answers.length
      }
    }, { status: 201 });

  } catch (error) {
    console.error("Error saving game history:", error);
    return NextResponse.json(
      { message: "Failed to save game history.", error: error.message },
      { status: 500 }
    );
  }
}

// Get game history for a player
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const playerId = searchParams.get('playerId');
    const limit = parseInt(searchParams.get('limit')) || 10;

    if (!playerId) {
      return NextResponse.json(
        { message: "Player ID is required." },
        { status: 400 }
      );
    }

    // Find games where the player participated
    const gameHistories = await GameHistory.find({
      'players.playerId': playerId
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('quizId');

    // Format the response to include only relevant player data
    const playerHistory = gameHistories.map(game => {
      const playerData = game.players.find(p => p.playerId === playerId);
      
      return {
        gameId: game._id,
        roomCode: game.roomCode,
        quizName: game.quizName,
        datePlayed: game.createdAt,
        playerStats: {
          position: playerData.position,
          finalScore: playerData.finalScore,
          correctAnswers: playerData.correctAnswers,
          totalQuestions: playerData.totalQuestions,
          accuracy: Math.round((playerData.correctAnswers / playerData.totalQuestions) * 100),
          averageAnswerTime: playerData.averageAnswerTime
        },
        gameStats: {
          totalPlayers: game.players.length,
          winner: game.gameStats.winner,
          gameDuration: game.gameStats.gameDuration
        }
      };
    });

    // Calculate overall statistics
    const totalGames = playerHistory.length;
    const wins = playerHistory.filter(game => game.playerStats.position === 1).length;
    const totalCorrectAnswers = playerHistory.reduce((sum, game) => sum + game.playerStats.correctAnswers, 0);
    const totalQuestions = playerHistory.reduce((sum, game) => sum + game.playerStats.totalQuestions, 0);
    const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrectAnswers / totalQuestions) * 100) : 0;
    const averagePosition = totalGames > 0 
      ? Math.round(playerHistory.reduce((sum, game) => sum + game.playerStats.position, 0) / totalGames * 10) / 10
      : 0;

    return NextResponse.json({
      playerHistory,
      overallStats: {
        totalGames,
        wins,
        winRate: totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0,
        overallAccuracy,
        averagePosition,
        totalCorrectAnswers,
        totalQuestions
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching game history:", error);
    return NextResponse.json(
      { message: "Failed to fetch game history.", error: error.message },
      { status: 500 }
    );
  }
}