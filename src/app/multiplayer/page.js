"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Navbar from '@/components/nav';
import { Users, GamepadIcon, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MultiplayerPage() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');

  const handleCreateRoom = () => {
    if (!playerName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    router.push(`/multiplayer/peer-room/create?playerName=${encodeURIComponent(playerName.trim())}`);
  };

  const handleJoinRoom = () => {
    if (!playerName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!roomCode.trim()) {
      toast.error('Please enter a room ID');
      return;
    }
    router.push(`/multiplayer/peer-room/${encodeURIComponent(roomCode.trim())}?playerName=${encodeURIComponent(playerName.trim())}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-full p-6">
              <Users className="w-16 h-16 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            1v1 Quiz Battle
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Challenge a friend in an intense head-to-head quiz duel! Create a room or join an existing one for epic 1v1 battles.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Player Name Input */}
          <div className="md:col-span-2">
            <Card className="backdrop-blur-sm bg-white/10 border-white/20 text-white">
              <CardHeader>
                <CardTitle className="text-center text-white">Enter Your Name</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="playerName" className="text-blue-100">Your Name</Label>
                  <Input
                    id="playerName"
                    type="text"
                    placeholder="Enter your display name"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="bg-white/10 border-white/30 text-white placeholder:text-blue-200"
                    maxLength={20}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Create Room */}
          <Card className="backdrop-blur-sm bg-white/10 border-white/20 text-white hover:bg-white/15 transition-all duration-300">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="bg-green-500/20 rounded-full p-4">
                  <Plus className="w-8 h-8 text-green-300" />
                </div>
              </div>
              <CardTitle className="text-center text-white">Create Room</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-100 text-center mb-6">
                Start a new quiz room and invite friends to join using a room code.
              </p>
              <div className="space-y-4">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h4 className="font-semibold text-white mb-2">Features:</h4>
                  <ul className="text-sm text-blue-100 space-y-1">
                    <li>• Choose from existing quizzes</li>
                    <li>• Real-time multiplayer gameplay</li>
                    <li>• Customizable time limits</li>
                    <li>• Live scoring and results</li>
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleCreateRoom}
                disabled={!playerName.trim()}
                className="w-full bg-green-600 hover:bg-green-700 text-white border-0"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Room
              </Button>
            </CardFooter>
          </Card>

          {/* Join Room */}
          <Card className="backdrop-blur-sm bg-white/10 border-white/20 text-white hover:bg-white/15 transition-all duration-300">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="bg-blue-500/20 rounded-full p-4">
                  <GamepadIcon className="w-8 h-8 text-blue-300" />
                </div>
              </div>
              <CardTitle className="text-center text-white">Join Room</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-100 text-center mb-6">
                Enter a room code to join an existing quiz game with your friends.
              </p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="roomCode" className="text-blue-100">Room ID</Label>
                  <Input
                    id="roomCode"
                    type="text"
                    placeholder="Enter room ID from host"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value)}
                    className="bg-white/10 border-white/30 text-white placeholder:text-blue-200 text-sm font-mono"
                  />
                </div>
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <p className="text-xs text-blue-200 text-center">
                    Ask the host for their unique Room ID (Peer ID)
                  </p>
</div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleJoinRoom}
                disabled={!playerName.trim() || !roomCode.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0"
              >
                <GamepadIcon className="w-4 h-4 mr-2" />
                Join Room
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-12 text-center">
          <div className="inline-flex gap-4">
            <Button
              onClick={() => router.push('/create')}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
            >
              Create New Quiz First
            </Button>
            <Button
              onClick={() => router.push('/')}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
            >
              Back to Single Player
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}