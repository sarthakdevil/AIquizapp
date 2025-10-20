"use client";
import { useState, useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSocket } from '@/contexts/SocketContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Navbar from '@/components/nav';
import LoadingSpinner from '@/components/loader';
import { 
  Users, 
  Clock, 
  Play, 
  Copy, 
  CheckCircle, 
  Trophy,
  AlertCircle,
  Crown,
  Timer,
  Send
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function RoomPage({ params }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { socket, connected, joinRoom, startGame, submitAnswer, leaveRoom } = useSocket();
  
  const resolvedParams = use(params);
  const roomCode = resolvedParams.roomCode;
  const playerId = searchParams.get('playerId') || '';
  const playerName = searchParams.get('playerName') || '';
  const isHost = searchParams.get('isHost') === 'true';

  const [room, setRoom] = useState(null);
  const [gameState, setGameState] = useState('waiting'); // waiting, countdown, playing, results, finished
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [questionResults, setQuestionResults] = useState(null);
  const [finalResults, setFinalResults] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(0);

  // Handle parameter validation in useEffect to avoid render-time redirects
  useEffect(() => {
    if (!roomCode || !playerId || !playerName) {
      router.push('/multiplayer');
      return;
    }
  }, [roomCode, playerId, playerName, router]);

  useEffect(() => {
    if (!connected || !roomCode || !playerId || !playerName) {
      return;
    }

    // Join the room via socket
    joinRoom(roomCode, playerId, playerName);

    // Socket event listeners
    socket.on('joined-room', (data) => {
      setRoom(data.room);
      setLoading(false);
      toast.success('Joined room successfully!');
    });

    socket.on('room-updated', (data) => {
      setRoom(data.room);
    });

    socket.on('game-started', (data) => {
      setRoom(prev => ({ ...prev, ...data.room }));
      setGameState('countdown');
      setCountdown(3);
      toast.success('Game is starting!');
    });

    socket.on('next-question', (data) => {
      setCurrentQuestion(data);
      setQuestionIndex(data.questionIndex);
      setTimeLeft(data.timeLimit);
      setUserAnswer('');
      setHasAnswered(false);
      setShowResults(false);
      setGameState('playing');
    });

    socket.on('answer-result', (data) => {
      setHasAnswered(true);
      if (data.isCorrect) {
        toast.success('Correct answer! 🎉');
      } else {
        toast.error(`Wrong! Correct answer: ${data.correctAnswer}`);
      }
    });

    socket.on('question-results', (data) => {
      setQuestionResults(data);
      setShowResults(true);
      setGameState('results');
    });

    socket.on('game-finished', (data) => {
      setFinalResults(data);
      setGameState('finished');
      toast.success('Game completed!');
    });

    socket.on('player-left', (data) => {
      toast.info(`Player left the room`);
    });

    socket.on('host-disconnected', () => {
      toast.error('Host disconnected. Returning to lobby.');
      // Use setTimeout to avoid state updates during render
      setTimeout(() => router.push('/multiplayer'), 100);
    });

    socket.on('room-closed', () => {
      toast.error('Room has been closed.');
      // Use setTimeout to avoid state updates during render
      setTimeout(() => router.push('/multiplayer'), 100);
    });

    socket.on('error', (data) => {
      toast.error(data.message);
    });

    return () => {
      socket.off('joined-room');
      socket.off('room-updated');
      socket.off('game-started');
      socket.off('next-question');
      socket.off('answer-result');
      socket.off('question-results');
      socket.off('game-finished');
      socket.off('player-left');
      socket.off('host-disconnected');
      socket.off('room-closed');
      socket.off('error');
    };
  }, [connected, socket, roomCode, playerId, playerName, joinRoom, router]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Game timer
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0 && !hasAnswered) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameState === 'playing' && !hasAnswered) {
      handleSubmitAnswer();
    }
  }, [timeLeft, gameState, hasAnswered]);

  const handleStartGame = () => {
    if (!isHost) return;
    startGame(roomCode, playerId);
  };

  const handleSubmitAnswer = () => {
    if (hasAnswered) return;
    
    const timeToAnswer = currentQuestion.timeLimit - timeLeft;
    submitAnswer(roomCode, playerId, questionIndex, userAnswer, timeToAnswer);
  };

  const handleLeaveRoom = () => {
    leaveRoom(roomCode, playerId);
    router.push('/multiplayer');
  };

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      toast.success('Room code copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy room code');
    }
  };

  if (loading || !room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Countdown Screen
  if (gameState === 'countdown') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <Card className="backdrop-blur-sm bg-white/10 border-white/20 text-white text-center p-8">
          <div className="text-8xl font-bold mb-4 text-green-300">
            {countdown || 'GO!'}
          </div>
          <p className="text-2xl text-blue-100">Get ready to play!</p>
        </Card>
      </div>
    );
  }

  // Game Playing Screen
  if (gameState === 'playing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-900 to-pink-900">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="text-white">
                <h1 className="text-2xl font-bold">Question {questionIndex + 1}</h1>
                <p className="text-blue-100">Room: {roomCode}</p>
              </div>
              <div className="flex items-center gap-2 text-white">
                <Timer className="w-6 h-6" />
                <span className="text-3xl font-bold">{timeLeft}s</span>
              </div>
            </div>

            {/* Question */}
            <Card className="backdrop-blur-sm bg-white/10 border-white/20 text-white mb-6">
              <CardHeader>
                <CardTitle className="text-2xl text-center text-white">
                  {currentQuestion?.question}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentQuestion?.options ? (
                  // Multiple Choice Question
                  <div className="space-y-3">
                    {Object.entries(currentQuestion.options).map(([letter, option]) => (
                      <button
                        key={letter}
                        onClick={() => setUserAnswer(letter)}
                        disabled={hasAnswered}
                        className={`w-full p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                          userAnswer === letter
                            ? 'bg-blue-500/30 border-blue-400 shadow-lg'
                            : 'bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/40'
                        } ${hasAnswered ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                            userAnswer === letter
                              ? 'bg-blue-500 text-white'
                              : 'bg-white/20 text-white'
                          }`}>
                            {letter}
                          </div>
                          <span className="text-lg text-white">{option}</span>
                        </div>
                      </button>
                    ))}
                    
                    <Button
                      onClick={handleSubmitAnswer}
                      disabled={hasAnswered || !userAnswer}
                      className="w-full mt-4 bg-green-600 hover:bg-green-700 text-lg py-3"
                    >
                      {hasAnswered ? 'Answer Submitted!' : 'Submit Answer'}
                    </Button>
                  </div>
                ) : (
                  // Traditional Text Answer
                  <div>
                    <div className="flex gap-2">
                      <Input
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="Type your answer here..."
                        className="bg-white/10 border-white/30 text-white placeholder:text-blue-200 text-lg"
                        disabled={hasAnswered}
                        onKeyPress={(e) => e.key === 'Enter' && handleSubmitAnswer()}
                      />
                      <Button
                        onClick={handleSubmitAnswer}
                        disabled={hasAnswered || !userAnswer.trim()}
                        className="bg-green-600 hover:bg-green-700 px-6"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
                
                {hasAnswered && (
                  <p className="text-center text-green-300 mt-4">
                    Answer submitted! Waiting for other players...
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Players Status */}
            <Card className="backdrop-blur-sm bg-white/10 border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Players ({room.players?.filter(p => p.answers?.some(a => a.questionIndex === questionIndex)).length || 0}/{room.players?.length || 0} answered)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {room.players?.map((player) => {
                    const hasPlayerAnswered = player.answers?.some(a => a.questionIndex === questionIndex);
                    return (
                      <div
                        key={player.playerId}
                        className={`flex items-center gap-2 p-3 rounded-lg border ${
                          hasPlayerAnswered 
                            ? 'bg-green-500/20 border-green-500/30' 
                            : 'bg-white/5 border-white/10'
                        }`}
                      >
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold">
                          {player.playerName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{player.playerName}</p>
                          <p className="text-xs text-blue-200">Score: {player.score || 0}</p>
                        </div>
                        {hasPlayerAnswered && <CheckCircle className="w-5 h-5 text-green-400" />}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Question Results Screen
  if (gameState === 'results' && questionResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-4">Question Results</h1>
              <p className="text-xl text-blue-100">
                Correct Answer: <span className="font-bold text-green-300">{questionResults.correctAnswer}</span>
              </p>
            </div>

            <Card className="backdrop-blur-sm bg-white/10 border-white/20 text-white">
              <CardHeader>
                <CardTitle>Leaderboard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {questionResults.results
                    ?.sort((a, b) => b.score - a.score)
                    .map((result, index) => (
                      <div
                        key={result.playerId}
                        className={`flex items-center gap-4 p-4 rounded-lg ${
                          result.lastAnswer?.isCorrect 
                            ? 'bg-green-500/20 border border-green-500/30' 
                            : 'bg-red-500/10 border border-red-500/20'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold">{index + 1}</span>
                          {index === 0 && <Crown className="w-5 h-5 text-yellow-400" />}
                        </div>
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center font-bold">
                          {result.playerName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{result.playerName}</p>
                          <p className="text-sm text-blue-200">
                            Answer: {result.lastAnswer?.answer || 'No answer'} 
                            {result.lastAnswer?.isCorrect && ' ✓'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold">{result.score}</p>
                          <p className="text-xs text-blue-200">Total Score</p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Final Results Screen
  if (gameState === 'finished' && finalResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-900 via-orange-900 to-red-900">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <div className="bg-yellow-500/20 rounded-full p-6">
                  <Trophy className="w-16 h-16 text-yellow-300" />
                </div>
              </div>
              <h1 className="text-5xl font-bold text-white mb-4">Game Complete!</h1>
              <p className="text-2xl text-yellow-100">
                Winner: <span className="font-bold">{finalResults.winner?.playerName}</span>
              </p>
            </div>

            <Card className="backdrop-blur-sm bg-white/10 border-white/20 text-white mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                  Final Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {finalResults.results?.map((result, index) => (
                    <div
                      key={result.playerId}
                      className={`flex items-center gap-4 p-6 rounded-lg border ${
                        index === 0 
                          ? 'bg-yellow-500/20 border-yellow-500/30' 
                          : index === 1
                          ? 'bg-gray-300/20 border-gray-300/30'
                          : index === 2
                          ? 'bg-orange-400/20 border-orange-400/30'
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-3xl font-bold">#{result.position}</span>
                        {index === 0 && <Crown className="w-6 h-6 text-yellow-400" />}
                      </div>
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-lg font-bold">
                        {result.playerName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="text-xl font-bold">{result.playerName}</p>
                        <p className="text-blue-200">
                          {result.answers?.filter(a => a.isCorrect).length || 0} / {result.answers?.length || 0} correct
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-yellow-300">{result.score}</p>
                        <p className="text-sm text-blue-200">points</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex gap-4">
                <Button
                  onClick={() => router.push('/multiplayer')}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Play Again
                </Button>
                <Button
                  onClick={() => router.push('/')}
                  variant="outline"
                  className="flex-1 border-white/30 text-white hover:bg-white/10"
                >
                  Home
                </Button>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Waiting Room (default)
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Quiz Room</h1>
            <div className="flex items-center justify-center gap-4 mb-4">
              <span className="text-xl text-blue-100">Room Code:</span>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold font-mono text-white bg-white/10 px-4 py-2 rounded-lg">
                  {roomCode}
                </span>
                <Button
                  onClick={copyRoomCode}
                  size="sm"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Room Info */}
            <Card className="backdrop-blur-sm bg-white/10 border-white/20 text-white">
              <CardHeader>
                <CardTitle>Quiz Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-blue-200">Quiz Name:</span>
                    <span className="font-medium">{room.quizId?.quiz_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200">Questions:</span>
                    <span className="font-medium">{room.quizId?.questions_and_answers?.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Time per Question:
                    </span>
                    <span className="font-medium">{room.settings?.timePerQuestion}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200">Host:</span>
                    <span className="font-medium flex items-center gap-1">
                      <Crown className="w-4 h-4 text-yellow-400" />
                      {room.hostName}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Players */}
            <Card className="backdrop-blur-sm bg-white/10 border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  1v1 Battle Arena ({room.players?.length || 0}/2)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {room.players?.map((player) => (
                    <div key={player.playerId} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center font-bold">
                          {player.playerName.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{player.playerName}</span>
                      </div>
                      {player.playerId === room.hostId && (
                        <Badge variant="outline" className="border-yellow-400 text-yellow-400">
                          <Crown className="w-3 h-3 mr-1" />
                          Host
                        </Badge>
                      )}
                    </div>
                  ))}
                  
                  {/* Empty slots */}
                  {Array.from({ length: room.maxPlayers - (room.players?.length || 0) }).map((_, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg opacity-50">
                      <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5" />
                      </div>
                      <span className="text-gray-400">Waiting for opponent...</span>
                    </div>
                  ))}
                </div>

                {room.players?.length < 2 && (
                  <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                    <div className="flex items-center gap-2 text-orange-300">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">Waiting for your opponent to join the battle...</span>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button
                  onClick={handleLeaveRoom}
                  variant="outline"
                  className="flex-1 border-red-500/30 text-red-300 hover:bg-red-500/10"
                >
                  Leave Room
                </Button>
                {isHost && (
                  <Button
                    onClick={handleStartGame}
                    disabled={(room.players?.length || 0) < 2}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Begin Battle!
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}