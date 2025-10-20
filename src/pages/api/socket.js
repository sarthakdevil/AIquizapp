import { Server } from 'socket.io';
import Room from '@/models/Room';
import connectDB from '@/lib/mongodb';

let io;

export default function handler(req, res) {
  if (!res.socket.server.io) {
    console.log('Setting up Socket.IO server...');
    
    io = new Server(res.socket.server, {
      path: '/api/socket',
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? ['https://a-iquizapp.vercel.app'] 
          : ['http://localhost:3000'],
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      // Join a room
      socket.on('join-room', async (data) => {
        try {
          const { roomCode, playerId, playerName } = data;
          
          await connectDB();
          const room = await Room.findOne({ roomCode }).populate('quizId');
          
          if (!room) {
            socket.emit('error', { message: 'Room not found' });
            return;
          }

          // Join the socket room
          socket.join(roomCode);
          socket.roomCode = roomCode;
          socket.playerId = playerId;

          // Emit updated room data to all players in the room
          io.to(roomCode).emit('room-updated', {
            room: {
              roomCode: room.roomCode,
              hostId: room.hostId,
              hostName: room.hostName,
              gameState: room.gameState,
              players: room.players,
              maxPlayers: room.maxPlayers,
              settings: room.settings,
              currentQuestionIndex: room.currentQuestionIndex
            }
          });

          socket.emit('joined-room', { 
            message: 'Successfully joined room',
            room: {
              roomCode: room.roomCode,
              hostId: room.hostId,
              hostName: room.hostName,
              gameState: room.gameState,
              players: room.players,
              quiz: room.quizId
            }
          });

        } catch (error) {
          console.error('Error joining room:', error);
          socket.emit('error', { message: 'Failed to join room' });
        }
      });

      // Start game
      socket.on('start-game', async (data) => {
        try {
          const { roomCode, hostId } = data;
          
          await connectDB();
          const room = await Room.findOne({ roomCode }).populate('quizId');
          
          if (!room || room.hostId !== hostId) {
            socket.emit('error', { message: 'Unauthorized to start game' });
            return;
          }

          if (room.players.length !== 2) {
            socket.emit('error', { message: 'Exactly 2 players required for 1v1 battle' });
            return;
          }

          // Update room state
          room.gameState = 'in-progress';
          room.startTime = new Date();
          room.currentQuestionIndex = 0;
          await room.save();

          // Notify all players that game has started
          io.to(roomCode).emit('game-started', {
            room: {
              gameState: room.gameState,
              startTime: room.startTime,
              currentQuestionIndex: room.currentQuestionIndex,
              quiz: room.quizId,
              settings: room.settings
            }
          });

          // Start the first question
          setTimeout(() => {
            const firstQuestion = room.quizId.questions_and_answers[0];
            io.to(roomCode).emit('next-question', {
              questionIndex: 0,
              question: firstQuestion.question,
              options: firstQuestion.options || null, // Include options for MCQ
              correct_answer: firstQuestion.correct_answer || null,
              timeLimit: room.settings.timePerQuestion
            });
          }, 3000); // 3 second countdown

        } catch (error) {
          console.error('Error starting game:', error);
          socket.emit('error', { message: 'Failed to start game' });
        }
      });

      // Submit answer
      socket.on('submit-answer', async (data) => {
        try {
          const { roomCode, playerId, questionIndex, answer, timeToAnswer } = data;
          
          await connectDB();
          const room = await Room.findOne({ roomCode }).populate('quizId');
          
          if (!room || room.gameState !== 'in-progress') {
            socket.emit('error', { message: 'Game not in progress' });
            return;
          }

          // Get correct answer - all questions are now MCQ format from 3-stage pipeline
          const quiz = room.quizId;
          const currentQuestionData = quiz.questions_and_answers[questionIndex];
          
          // Multiple choice question - exact match on letter
          const isCorrect = answer === currentQuestionData.correct_answer;
          const matchResult = {
            isMatch: isCorrect,
            method: 'multiple_choice',
            confidence: isCorrect ? 'exact' : 'none',
            score: isCorrect ? 1.0 : 0.0
          };

          // Update player score
          await room.updatePlayerScore(playerId, questionIndex, answer, isCorrect, timeToAnswer);
          
          // Get updated room data
          const updatedRoom = await Room.findOne({ roomCode }).populate('quizId');

          // Emit answer result to the player with match details
          socket.emit('answer-result', {
            isCorrect,
            correctAnswer: currentQuestionData.options 
              ? `${currentQuestionData.correct_answer}) ${currentQuestionData.options[currentQuestionData.correct_answer]}`
              : currentQuestionData.answer,
            userAnswer: currentQuestionData.options 
              ? `${answer}) ${currentQuestionData.options[answer] || 'Invalid option'}`
              : answer,
            currentScore: updatedRoom.players.find(p => p.playerId === playerId)?.score || 0,
            matchDetails: {
              confidence: matchResult.confidence,
              method: matchResult.method,
              score: matchResult.score || (isCorrect ? 1.0 : 0.0)
            }
          });

          // Check if all players have answered
          const allPlayersAnswered = updatedRoom.players.every(player => 
            player.answers.some(ans => ans.questionIndex === questionIndex)
          );

          if (allPlayersAnswered) {
            // Show results to all players
            const results = updatedRoom.players.map(player => ({
              playerId: player.playerId,
              playerName: player.playerName,
              score: player.score,
              lastAnswer: player.answers.find(ans => ans.questionIndex === questionIndex)
            }));

            io.to(roomCode).emit('question-results', {
              questionIndex,
              correctAnswer: currentQuestionData.options 
                ? `${currentQuestionData.correct_answer}) ${currentQuestionData.options[currentQuestionData.correct_answer]}`
                : currentQuestionData.answer,
              results
            });

            // Move to next question or end game
            setTimeout(async () => {
              const nextQuestionIndex = questionIndex + 1;
              
              if (nextQuestionIndex >= quiz.questions_and_answers.length) {
                // End game
                updatedRoom.gameState = 'finished';
                updatedRoom.endTime = new Date();
                await updatedRoom.save();

                const finalResults = updatedRoom.players
                  .sort((a, b) => b.score - a.score)
                  .map((player, index) => ({
                    position: index + 1,
                    playerId: player.playerId,
                    playerName: player.playerName,
                    score: player.score,
                    answers: player.answers
                  }));

                io.to(roomCode).emit('game-finished', {
                  results: finalResults,
                  winner: finalResults[0]
                });

                // Save game history
                try {
                  const axios = require('axios');
                  await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/games/history`, {
                    roomCode
                  });
                } catch (error) {
                  console.error('Failed to save game history:', error);
                }
              } else {
                // Next question
                updatedRoom.currentQuestionIndex = nextQuestionIndex;
                await updatedRoom.save();

                const nextQuestion = quiz.questions_and_answers[nextQuestionIndex];
                io.to(roomCode).emit('next-question', {
                  questionIndex: nextQuestionIndex,
                  question: nextQuestion.question,
                  options: nextQuestion.options || null,
                  correct_answer: nextQuestion.correct_answer || null,
                  timeLimit: updatedRoom.settings.timePerQuestion
                });
              }
            }, 5000); // 5 seconds to show results
          }

        } catch (error) {
          console.error('Error submitting answer:', error);
          socket.emit('error', { message: 'Failed to submit answer' });
        }
      });

      // Handle player disconnect
      socket.on('disconnect', async () => {
        console.log('User disconnected:', socket.id);
        
        if (socket.roomCode && socket.playerId) {
          try {
            await connectDB();
            const room = await Room.findOne({ roomCode: socket.roomCode });
            
            if (room) {
              // If host disconnects, notify other players
              if (room.hostId === socket.playerId) {
                io.to(socket.roomCode).emit('host-disconnected');
              } else {
                // Remove player from room
                await room.removePlayer(socket.playerId);
                io.to(socket.roomCode).emit('player-left', {
                  playerId: socket.playerId,
                  players: room.players
                });
              }
            }
          } catch (error) {
            console.error('Error handling disconnect:', error);
          }
        }
      });

      // Leave room manually
      socket.on('leave-room', async (data) => {
        try {
          const { roomCode, playerId } = data;
          
          await connectDB();
          const room = await Room.findOne({ roomCode });
          
          if (room) {
            socket.leave(roomCode);
            
            if (room.hostId === playerId) {
              // Host is leaving, notify others and delete room
              io.to(roomCode).emit('room-closed');
              await Room.deleteOne({ roomCode });
            } else {
              await room.removePlayer(playerId);
              io.to(roomCode).emit('player-left', {
                playerId,
                players: room.players
              });
            }
          }
          
          socket.emit('left-room');
        } catch (error) {
          console.error('Error leaving room:', error);
          socket.emit('error', { message: 'Failed to leave room' });
        }
      });
    });

    res.socket.server.io = io;
  }
  
  res.end();
}

export const config = {
  api: {
    bodyParser: false,
  },
};