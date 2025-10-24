"use client";
import { useState, useEffect, use, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePeer } from '@/contexts/PeerContext';
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
  Send,
  Wifi,
  WifiOff
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function PeerRoomPage({ params }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const resolvedParams = use(params);
  const roomType = resolvedParams.roomCode; // 'create' or peer ID to join
  const playerName = searchParams.get('playerName') || '';
  
  const {
    peerId,
    connected,
    isHost,
    gameState,
    currentQuestion,
    questionIndex,
    playerScores,
    quiz,
    connectionQuality,
    connectToPeer,
    startGame,
    submitAnswer,
    becomeHost,
    leaveGame
  } = usePeer();

  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState('');
  const [opponentPeerId, setOpponentPeerId] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const [userAnswer, setUserAnswer] = useState('');
  const [hasAnswered, setHasAnswered] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [progressionStatus, setProgressionStatus] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [timerStartTime, setTimerStartTime] = useState(null);

  // Initialize based on room type
  useEffect(() => {
    if (roomType === 'create') {
      // Host creates a new room
      becomeHost();
      fetchQuizzes();
    } else {
      // Guest joins existing room
      if (peerId && roomType !== 'create') {
        connectToPeer(roomType);
      }
    }
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [roomType, peerId, becomeHost, connectToPeer]);

  // Fetch available quizzes
  const fetchQuizzes = async () => {
    try {
      const response = await axios.get('/api/quizzes');
      setQuizzes(response.data);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      toast.error('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = useCallback(() => {
    if (hasAnswered) return;
    
    const timeToAnswer = 30 - timeLeft;
    console.log('Room: Submitting answer', { userAnswer, timeToAnswer, questionIndex });
    
    const result = submitAnswer(userAnswer, timeToAnswer);
    
    if (result) {
      setHasAnswered(true);
      setProgressionStatus(isHost ? 'Waiting for opponent...' : 'Waiting for host...');
      
      if (result.isCorrect) {
        toast.success('Correct! 🎉');
      } else {
        toast.error(`Wrong! Correct: ${result.correctAnswer}`);
      }
    }
  }, [hasAnswered, timeLeft, userAnswer, submitAnswer, questionIndex, isHost]);

  const handleStartGame = () => {
    if (!selectedQuiz || !connected) {
      toast.error('Please select a quiz and wait for opponent');
      return;
    }
    
    const quiz = quizzes.find(q => q._id === selectedQuiz);
    startGame(quiz);
    toast.success('Game started!');
  };

  // Game timer - using performance-based timing to handle inactive tabs
  useEffect(() => {
    if (gameState === 'playing' && !hasAnswered && currentQuestion) {
      if (!timerStartTime) {
        setTimerStartTime(Date.now());
        setTimeLeft(30);
      }
      
      const interval = setInterval(() => {
        if (timerStartTime) {
          const elapsed = Math.floor((Date.now() - timerStartTime) / 1000);
          const newTimeLeft = Math.max(0, 30 - elapsed);
          
          setTimeLeft(newTimeLeft);
          
          if (newTimeLeft <= 0 && !hasAnswered) {
            handleSubmitAnswer();
          }
        }
      }, 100); // Check every 100ms for better accuracy
      
      return () => clearInterval(interval);
    }
  }, [gameState, hasAnswered, currentQuestion, timerStartTime, handleSubmitAnswer]);

  // Reset for new question
  useEffect(() => {
    if (currentQuestion) {
      console.log('Room: New question loaded', { questionIndex, question: currentQuestion.question });
      setTimeLeft(30);
      setTimerStartTime(Date.now()); // Reset timer start time for new question
      setUserAnswer('');
      setHasAnswered(false);
      setQuestionLoading(false);
      setProgressionStatus('');
      
      // Notify user if tab is inactive
      if (!isVisible && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(`Quiz Battle - Question ${questionIndex + 1}`, {
          body: 'New question is ready! Switch back to the quiz.',
          icon: '/favicon.ico'
        });
      }
    }
  }, [currentQuestion, questionIndex, isVisible]);

  // Listen for progression status updates
  useEffect(() => {
    if (hasAnswered && !isHost) {
      setProgressionStatus('Waiting for opponent...');
    } else if (hasAnswered && isHost) {
      setProgressionStatus('Waiting for opponent to answer...');
    }
  }, [hasAnswered, isHost]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = !document.hidden;
      setIsVisible(visible);
      
      if (visible && gameState === 'playing' && timerStartTime) {
        // Recalculate timer when tab becomes active
        const elapsed = Math.floor((Date.now() - timerStartTime) / 1000);
        const newTimeLeft = Math.max(0, 30 - elapsed);
        console.log('Room: Tab became active, recalculating timer', { elapsed, newTimeLeft });
        setTimeLeft(newTimeLeft);
        
        if (newTimeLeft <= 0 && !hasAnswered) {
          handleSubmitAnswer();
        }
      }
      
      console.log('Room: Visibility changed', { visible, gameState });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [gameState, timerStartTime, hasAnswered, handleSubmitAnswer]);

  const handleJoinRoom = () => {
    if (opponentPeerId) {
      connectToPeer(opponentPeerId);
    }
  };

  const copyPeerId = async () => {
    try {
      await navigator.clipboard.writeText(peerId);
      setCopied(true);
      toast.success('Room ID copied! Share with your opponent.');
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      toast.error('Failed to copy room ID');
    }
  };

  const handleLeaveRoom = () => {
    leaveGame();
    router.push('/multiplayer');
  };

  // Loading state
  if (!peerId || (roomType === 'create' && loading)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <Card className="backdrop-blur-sm bg-white/10 border-white/20 text-white p-8">
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-4">Initializing P2P connection...</p>
          </div>
        </Card>
      </div>
    );
  }

  // Game playing state
  if (gameState === 'playing' && currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-blue-900 to-purple-900">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          {/* Game Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center items-center gap-4 mb-4">
              <div className="flex items-center gap-2 text-white">
                <Timer className="w-5 h-5" />
                <span className={`text-2xl font-bold ${!isVisible ? 'text-red-400' : ''}`}>
                  {timeLeft}s
                </span>
                {!isVisible && (
                  <Badge variant="destructive" className="ml-2">
                    Tab Inactive
                  </Badge>
                )}
              </div>
              <Badge className="bg-blue-600">
                Question {questionIndex + 1} / {quiz?.questions_and_answers?.length}
              </Badge>
            </div>
            
            {/* Scores */}
            <div className="flex justify-center gap-8 mb-6">
              <div className="text-center">
                <p className="text-blue-200">You ({isHost ? 'Host' : 'Guest'})</p>
                <p className="text-2xl font-bold text-white">
                  {isHost ? playerScores.host : playerScores.guest}
                </p>
              </div>
              <div className="text-center">
                <p className="text-blue-200">Opponent ({isHost ? 'Guest' : 'Host'})</p>
                <p className="text-2xl font-bold text-white">
                  {isHost ? playerScores.guest : playerScores.host}
                </p>
              </div>
            </div>

            {/* Progression Status */}
            {progressionStatus && (
              <div className="text-center mb-4">
                <Badge variant="secondary" className="bg-yellow-600/20 text-yellow-200 animate-pulse">
                  {progressionStatus}
                </Badge>
              </div>
            )}

            {questionLoading && (
              <div className="text-center mb-4">
                <Badge variant="secondary" className="bg-blue-600/20 text-blue-200">
                  Loading next question...
                </Badge>
              </div>
            )}

            {/* Connection Quality Warning */}
            {connectionQuality === 'poor' && (
              <div className="text-center mb-4">
                <Badge variant="destructive" className="animate-pulse">
                  Poor connection - answers may be delayed
                </Badge>
              </div>
            )}
          </div>

          {/* Question */}
          <Card className="backdrop-blur-sm bg-white/10 border-white/20 text-white max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-xl text-center">
                {currentQuestion?.question || 'Loading question...'}
              </CardTitle>
            </CardHeader>
            
            {currentQuestion.options && (Array.isArray(currentQuestion.options) || typeof currentQuestion.options === 'object') ? (
              // Multiple choice
              <CardContent className="space-y-4">
                {(Array.isArray(currentQuestion.options) 
                  ? currentQuestion.options.map((option, index) => ({ letter: String.fromCharCode(65 + index), option }))
                  : Object.entries(currentQuestion.options).map(([letter, option]) => ({ letter, option }))
                ).map(({ letter, option }) => {
                  return (
                    <Button
                      key={letter}
                      variant={userAnswer === letter ? "default" : "outline"}
                      className="w-full p-4 h-auto justify-start text-left"
                      onClick={() => !hasAnswered && setUserAnswer(letter)}
                      disabled={hasAnswered}
                    >
                      <span className="font-bold mr-3">{letter}.</span>
                      {option}
                    </Button>
                  );
                })}
              </CardContent>
            ) : (
              // Text input
              <CardContent>
                <Input
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Enter your answer..."
                  disabled={hasAnswered}
                  className="bg-white/10 border-white/30 text-white"
                />
              </CardContent>
            )}
            
            <CardFooter>
              <Button
                onClick={handleSubmitAnswer}
                disabled={!userAnswer || hasAnswered}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {hasAnswered ? 'Answer Submitted' : 'Submit Answer'}
              </Button>
            </CardFooter>
          </Card>
        </main>
      </div>
    );
  }

  // Game finished state
  if (gameState === 'finished') {
    const myScore = isHost ? playerScores.host : playerScores.guest;
    const opponentScore = isHost ? playerScores.guest : playerScores.host;
    const isWinner = myScore > opponentScore;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Card className="backdrop-blur-sm bg-white/10 border-white/20 text-white max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center text-3xl">
                <Trophy className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
                {isWinner ? '🎉 Victory!' : '💪 Good Fight!'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-6xl font-bold mb-2">
                  {myScore} - {opponentScore}
                </div>
                <p className="text-blue-200">Final Score</p>
              </div>
              
              <div className="flex justify-center gap-4">
                <Button onClick={() => router.push('/multiplayer')} className="flex-1">
                  New Battle
                </Button>
                <Button onClick={handleLeaveRoom} variant="outline" className="flex-1">
                  Leave Room
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Waiting room / Setup
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            {isHost ? '🎮 Host Battle Room' : '⚔️ Join Battle'}
          </h1>
          <div className="flex items-center justify-center gap-2 text-blue-200">
            {connected ? (
              <>
                {connectionQuality === 'good' && <Wifi className="w-5 h-5 text-green-400" />}
                {connectionQuality === 'fair' && <Wifi className="w-5 h-5 text-yellow-400" />}
                {connectionQuality === 'poor' && <WifiOff className="w-5 h-5 text-red-400" />}
                <span className={
                  connectionQuality === 'good' ? 'text-green-400' :
                  connectionQuality === 'fair' ? 'text-yellow-400' :
                  connectionQuality === 'poor' ? 'text-red-400' : 'text-blue-200'
                }>
                  {connectionQuality === 'good' ? 'Excellent' :
                   connectionQuality === 'fair' ? 'Good' :
                   connectionQuality === 'poor' ? 'Poor' : 'Connecting...'}
                </span>
              </>
            ) : (
              <>
                <WifiOff className="w-5 h-5" />
                <span>Disconnected</span>
              </>
            )}
          </div>
        </div>

        {isHost ? (
          // Host setup
          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Quiz Selection */}
            <Card className="backdrop-blur-sm bg-white/10 border-white/20 text-white">
              <CardHeader>
                <CardTitle>Select Quiz</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {quizzes.map((quiz) => (
                    <Button
                      key={quiz._id}
                      variant={selectedQuiz === quiz._id ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => setSelectedQuiz(quiz._id)}
                    >
                      {quiz.quiz_name} ({quiz.questions_and_answers?.length || 0} questions)
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Room Info */}
            <Card className="backdrop-blur-sm bg-white/10 border-white/20 text-white">
              <CardHeader>
                <CardTitle>Room Setup</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-600/20 border border-blue-400/30 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Room ID:</span>
                    <Button onClick={copyPeerId} size="sm" variant="outline">
                      {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="font-mono text-sm break-all">{peerId}</p>
                  <p className="text-xs text-blue-300 mt-2">
                    Share this ID with your opponent
                  </p>
                </div>

                <div className="text-center">
                  <div className="flex items-center gap-2 justify-center mb-2">
                    <Users className="w-5 h-5" />
                    <span>Status: {connected ? 'Opponent Connected!' : 'Waiting for opponent...'}</span>
                  </div>
                  
                  {connected && selectedQuiz && (
                    <Button onClick={handleStartGame} className="bg-green-600 hover:bg-green-700">
                      <Play className="w-4 h-4 mr-2" />
                      Start Battle!
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Guest connection
          <Card className="backdrop-blur-sm bg-white/10 border-white/20 text-white max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center">Connect to Battle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!connected ? (
                <>
                  <div className="text-center">
                    <p className="text-blue-200 mb-4">
                      Connecting to room: <span className="font-mono">{roomType}</span>
                    </p>
                    <LoadingSpinner />
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <CheckCircle className="w-16 h-16 mx-auto text-green-400 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Connected!</h3>
                  <p className="text-blue-200">Waiting for host to start the battle...</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={handleLeaveRoom} variant="outline" className="w-full">
                Leave Room
              </Button>
            </CardFooter>
          </Card>
        )}
      </main>
    </div>
  );
}