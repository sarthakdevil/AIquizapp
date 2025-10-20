"use client";
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/nav';
import LoadingSpinner from '@/components/loader';
import { Clock, Users, Settings, Copy, CheckCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function CreateRoomPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const playerName = searchParams.get('playerName') || '';

  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState('');
  const [timePerQuestion, setTimePerQuestion] = useState('30');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchQuizzes();
  }, []);

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

  const handleCreateRoom = async () => {
    if (!selectedQuiz) {
      toast.error('Please select a quiz');
      return;
    }

    setCreating(true);
    try {
      // Generate a unique player ID (you might want to use a proper UUID library)
      const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const response = await axios.post('/api/rooms', {
        hostId: playerId,
        hostName: playerName,
        quizId: selectedQuiz,
        maxPlayers: 2, // Fixed at 2 players for 1v1 battles
        timePerQuestion: parseInt(timePerQuestion)
      });

      const { roomCode } = response.data.room;
      setRoomCode(roomCode);
      
      toast.success('Room created successfully!');
      
      // Redirect to waiting room
      setTimeout(() => {
        router.push(`/multiplayer/room/${roomCode}?playerId=${playerId}&playerName=${encodeURIComponent(playerName)}&isHost=true`);
      }, 2000);

    } catch (error) {
      console.error('Error creating room:', error);
      toast.error(error.response?.data?.message || 'Failed to create room');
    } finally {
      setCreating(false);
    }
  };

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      toast.success('Room code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy room code');
    }
  };

  if (!playerName) {
    router.push('/multiplayer');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (roomCode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <Navbar />
        <main className="container mx-auto px-4 py-16 flex items-center justify-center">
          <Card className="w-full max-w-md backdrop-blur-sm bg-white/10 border-white/20 text-white">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="bg-green-500/20 rounded-full p-4">
                  <CheckCircle className="w-12 h-12 text-green-300" />
                </div>
              </div>
              <CardTitle className="text-center text-2xl text-white">Room Created!</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <p className="text-blue-100">
                Your room has been created successfully. Share this code with your friends:
              </p>
              
              <div className="bg-white/10 rounded-lg p-6 border border-white/20">
                <Label className="text-blue-100 text-sm">Room Code</Label>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className="text-3xl font-bold font-mono tracking-wider text-white">
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

              <div className="text-sm text-blue-200">
                Redirecting to waiting room...
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Create Quiz Room</h1>
            <p className="text-blue-100">
              Welcome, <span className="font-semibold">{playerName}</span>! Set up your multiplayer quiz room.
            </p>
          </div>

          <Card className="backdrop-blur-sm bg-white/10 border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Settings className="w-5 h-5" />
                Room Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quiz Selection */}
              <div className="space-y-2">
                <Label htmlFor="quiz" className="text-blue-100">Select Quiz</Label>
                {quizzes.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-blue-200 mb-4">No quizzes available</p>
                    <Button
                      onClick={() => router.push('/create')}
                      variant="outline"
                      className="border-white/30 text-white hover:bg-white/10"
                    >
                      Create a Quiz First
                    </Button>
                  </div>
                ) : (
                  <Select value={selectedQuiz} onValueChange={setSelectedQuiz}>
                    <SelectTrigger className="bg-white/10 border-white/30 text-white">
                      <SelectValue placeholder="Choose a quiz for your room" />
                    </SelectTrigger>
                    <SelectContent>
                      {quizzes.map((quiz) => (
                        <SelectItem key={quiz._id} value={quiz._id}>
                          <div className="flex items-center gap-2">
                            <span>{quiz.quiz_name}</span>
                            <Badge variant="secondary" className="text-xs">
                              {quiz.questions_and_answers?.length || 0} questions
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Fixed to 1v1 Battle */}
              <div className="p-4 bg-blue-600/20 border border-blue-400/30 rounded-lg">
                <div className="flex items-center gap-2 text-blue-200">
                  <Users className="w-4 h-4" />
                  <span className="font-medium">1v1 Battle Mode</span>
                </div>
                <p className="text-sm text-blue-300 mt-1">
                  Challenge one opponent in an intense head-to-head quiz duel!
                </p>
              </div>

              {/* Time Per Question */}
              <div className="space-y-2">
                <Label htmlFor="timePerQuestion" className="text-blue-100 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Time Per Question (seconds)
                </Label>
                <Select value={timePerQuestion} onValueChange={setTimePerQuestion}>
                  <SelectTrigger className="bg-white/10 border-white/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 seconds</SelectItem>
                    <SelectItem value="20">20 seconds</SelectItem>
                    <SelectItem value="30">30 seconds</SelectItem>
                    <SelectItem value="45">45 seconds</SelectItem>
                    <SelectItem value="60">60 seconds</SelectItem>
                    <SelectItem value="90">90 seconds</SelectItem>
                    <SelectItem value="120">2 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Preview */}
              {selectedQuiz && (
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h4 className="font-semibold text-white mb-2">Room Preview:</h4>
                  <div className="space-y-1 text-sm text-blue-100">
                    <p>• Quiz: {quizzes.find(q => q._id === selectedQuiz)?.quiz_name}</p>
                    <p>• Questions: {quizzes.find(q => q._id === selectedQuiz)?.questions_and_answers?.length || 0}</p>
                    <p>• Mode: 1v1 Battle (2 Players)</p>
                    <p>• Time Per Question: {timePerQuestion} seconds</p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button
                onClick={() => router.push('/multiplayer')}
                variant="outline"
                className="flex-1 border-white/30 text-white hover:bg-white/10"
              >
                Back
              </Button>
              <Button
                onClick={handleCreateRoom}
                disabled={!selectedQuiz || creating}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                {creating ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner />
                    Creating...
                  </div>
                ) : (
                  'Create Room'
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}