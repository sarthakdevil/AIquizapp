import mongoose from 'mongoose';

const gameHistorySchema = new mongoose.Schema(
  {
    roomCode: { 
      type: String, 
      required: true 
    },
    quizId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Quiz',
      required: true 
    },
    quizName: {
      type: String,
      required: true
    },
    players: [{
      playerId: { type: String, required: true },
      playerName: { type: String, required: true },
      finalScore: { type: Number, default: 0 },
      position: { type: Number, required: true },
      correctAnswers: { type: Number, default: 0 },
      totalQuestions: { type: Number, required: true },
      averageAnswerTime: { type: Number, default: 0 }, // in seconds
      answers: [{
        questionIndex: Number,
        question: String,
        userAnswer: String,
        correctAnswer: String,
        isCorrect: Boolean,
        timeToAnswer: Number
      }]
    }],
    gameSettings: {
      timePerQuestion: { type: Number, required: true },
      maxPlayers: { type: Number, required: true }
    },
    gameStats: {
      totalQuestions: { type: Number, required: true },
      gameDuration: { type: Number }, // in seconds
      startTime: { type: Date, required: true },
      endTime: { type: Date, required: true },
      winner: {
        playerId: String,
        playerName: String,
        finalScore: Number
      }
    }
  },
  { timestamps: true }
);

// Index for efficient queries
gameHistorySchema.index({ roomCode: 1 });
gameHistorySchema.index({ 'players.playerId': 1 });
gameHistorySchema.index({ createdAt: -1 });

const GameHistory = mongoose.models.GameHistory || mongoose.model('GameHistory', gameHistorySchema);

export default GameHistory;