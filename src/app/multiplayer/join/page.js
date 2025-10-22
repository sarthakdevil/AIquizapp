"use client";
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/nav';
import LoadingSpinner from '@/components/loader';
import { Users, Clock, GamepadIcon, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

function JoinRoomContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomCode = searchParams.get('roomCode') || '';
  const playerName = searchParams.get('playerName') || '';

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!roomCode || !playerName) {
      router.push('/multiplayer');
      return;
    }
    fetchRoomDetails();
  }, [roomCode, playerName]);

  const fetchRoomDetails = async () => {
    try {
      const response = await axios.get(`/api/rooms?roomCode=${roomCode}`);
      setRoom(response.data.room);
      setError('');
    } catch (error) {
      console.error('Error fetching room:', error);
      setError(error.response?.data?.message || 'Room not found');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    setJoining(true);
    try {
      // Generate a unique player ID
      const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const response = await axios.post('/api/rooms/join', {
        roomCode,
        playerId,
        playerName
      });

      toast.success('Successfully joined room!');
      
      // Redirect to waiting room
      router.push(`/multiplayer/room/${roomCode}?playerId=${playerId}&playerName=${encodeURIComponent(playerName)}&isHost=false`);

    } catch (error) {
      console.error('Error joining room:', error);
      const errorMessage = error.response?.data?.message || 'Failed to join room';
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setJoining(false);
    }
  };

  if (!roomCode || !playerName) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <Navbar />
        <main className="container mx-auto px-4 py-16 flex items-center justify-center">
          <Card className="w-full max-w-md backdrop-blur-sm bg-white/10 border-white/20 text-white">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="bg-red-500/20 rounded-full p-4">
                  <AlertCircle className="w-12 h-12 text-red-300" />
                </div>
              </div>
              <CardTitle className="text-center text-2xl text-white">Room Not Available</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-blue-100">
                {error}
              </p>
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <p className="text-sm text-blue-200">
                  Room Code: <span className="font-mono font-bold">{roomCode}</span>
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button
                onClick={() => router.push('/multiplayer')}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Try Another Room
              </Button>
            </CardFooter>
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
            <h1 className="text-4xl font-bold text-white mb-4">Join Quiz Room</h1>
            <p className="text-blue-100">
              Welcome, <span className="font-semibold">{playerName}</span>! You're about to join a quiz room.
            </p>
          </div>

          <Card className="backdrop-blur-sm bg-white/10 border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <GamepadIcon className="w-5 h-5" />
                Room Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Room Info */}
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-blue-200 text-sm">Room Code</p>
                    <p className="text-2xl font-bold font-mono">{room.roomCode}</p>
                  </div>
                  <div>
                    <p className="text-blue-200 text-sm">Status</p>
                    <Badge 
                      variant={room.gameState === 'waiting' ? 'default' : 'destructive'}
                      className="text-sm"
                    >
                      {room.gameState === 'waiting' ? 'Waiting for Players' : 
                       room.gameState === 'in-progress' ? 'Game in Progress' : 'Finished'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Quiz Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Quiz Information</h3>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-200">Quiz Name:</span>
                    <span className="font-medium">{room.quizId.quiz_name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-200">Questions:</span>
                    <span className="font-medium">{room.quizId.questions_and_answers.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-200 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Time per Question:
                    </span>
                    <span className="font-medium">{room.settings.timePerQuestion} seconds</span>
                  </div>
                </div>
              </div>

              {/* Players Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Players ({room.players.length}/{room.maxPlayers})
                </h3>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="space-y-2">
                    {room.players.map((player, index) => (
                      <div key={player.playerId} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold">
                            {player.playerName.charAt(0).toUpperCase()}
                          </div>
                          <span>{player.playerName}</span>
                        </div>
                        {player.playerId === room.hostId && (
                          <Badge variant="outline" className="text-xs border-yellow-400 text-yellow-400">
                            Host
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Room Status Messages */}
              {room.gameState !== 'waiting' && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-300">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">
                      {room.gameState === 'in-progress' 
                        ? 'This game is already in progress' 
                        : 'This game has finished'}
                    </span>
                  </div>
                </div>
              )}

              {room.players.length >= room.maxPlayers && (
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-orange-300">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">This room is full</span>
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
                onClick={handleJoinRoom}
                disabled={
                  joining || 
                  room.gameState !== 'waiting' || 
                  room.players.length >= room.maxPlayers ||
                  room.players.some(p => p.playerName === playerName)
                }
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                {joining ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner />
                    Joining...
                  </div>
                ) : (
                  room.gameState !== 'waiting' 
                    ? 'Cannot Join' 
                    : room.players.length >= room.maxPlayers
                    ? 'Room Full'
                    : room.players.some(p => p.playerName === playerName)
                    ? 'Name Taken'
                    : 'Join Room'
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function JoinRoomPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    }>
      <JoinRoomContent />
    </Suspense>
  );
}