"use client";
import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socketUrl = process.env.NODE_ENV === 'production' 
      ? 'https://a-iquizapp.vercel.app' 
      : 'http://localhost:3000';
    
    const socketInstance = io(socketUrl, {
      path: '/api/socket',
      transports: ['websocket', 'polling']
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id);
      setConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });

    socketInstance.on('error', (error) => {
      console.error('Socket error:', error);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.close();
    };
  }, []);

  const joinRoom = (roomCode, playerId, playerName) => {
    if (socket) {
      socket.emit('join-room', { roomCode, playerId, playerName });
    }
  };

  const startGame = (roomCode, hostId) => {
    if (socket) {
      socket.emit('start-game', { roomCode, hostId });
    }
  };

  const submitAnswer = (roomCode, playerId, questionIndex, answer, timeToAnswer) => {
    if (socket) {
      socket.emit('submit-answer', { roomCode, playerId, questionIndex, answer, timeToAnswer });
    }
  };

  const leaveRoom = (roomCode, playerId) => {
    if (socket) {
      socket.emit('leave-room', { roomCode, playerId });
    }
  };

  const value = {
    socket,
    connected,
    joinRoom,
    startGame,
    submitAnswer,
    leaveRoom
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};