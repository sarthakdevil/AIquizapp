import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
  {
    roomCode: { 
      type: String, 
      required: true, 
      unique: true,
      length: 6,
      uppercase: true
    },
    hostId: { 
      type: String, 
      required: true 
    },
    hostName: { 
      type: String, 
      required: true 
    },
    quizId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Quiz',
      required: true 
    },
    players: [{
      playerId: { type: String, required: true },
      playerName: { type: String, required: true },
      score: { type: Number, default: 0 },
      answers: [{
        questionIndex: Number,
        answer: String,
        isCorrect: Boolean,
        timeToAnswer: Number // Time taken to answer in seconds
      }],
      joinedAt: { type: Date, default: Date.now }
    }],
    gameState: {
      type: String,
      enum: ['waiting', 'in-progress', 'finished'],
      default: 'waiting'
    },
    currentQuestionIndex: {
      type: Number,
      default: 0
    },
    startTime: Date,
    endTime: Date,
    maxPlayers: {
      type: Number,
      default: 2,
      min: 2,
      max: 2
    },
    settings: {
      timePerQuestion: { type: Number, default: 30 }, // seconds per question
      showCorrectAnswers: { type: Boolean, default: true },
      allowSpectators: { type: Boolean, default: false }
    }
  },
  { timestamps: true }
);

// Index for efficient room code lookup
roomSchema.index({ roomCode: 1 });

// Method to generate a unique room code
roomSchema.statics.generateRoomCode = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Method to add player to room
roomSchema.methods.addPlayer = function(playerId, playerName) {
  if (this.players.length >= this.maxPlayers) {
    throw new Error('Room is full');
  }
  
  if (this.players.some(p => p.playerId === playerId)) {
    throw new Error('Player already in room');
  }
  
  this.players.push({
    playerId,
    playerName,
    score: 0,
    answers: []
  });
  
  return this.save();
};

// Method to remove player from room
roomSchema.methods.removePlayer = function(playerId) {
  this.players = this.players.filter(p => p.playerId !== playerId);
  return this.save();
};

// Method to update player score
roomSchema.methods.updatePlayerScore = function(playerId, questionIndex, answer, isCorrect, timeToAnswer) {
  const player = this.players.find(p => p.playerId === playerId);
  if (!player) {
    throw new Error('Player not found in room');
  }
  
  // Add answer to player's answers
  player.answers.push({
    questionIndex,
    answer,
    isCorrect,
    timeToAnswer
  });
  
  // Update score if correct
  if (isCorrect) {
    // Score based on correctness and time (faster answers get more points)
    const timeBonus = Math.max(0, this.settings.timePerQuestion - timeToAnswer);
    player.score += 100 + timeBonus;
  }
  
  return this.save();
};

const Room = mongoose.models.Room || mongoose.model('Room', roomSchema);

export default Room;