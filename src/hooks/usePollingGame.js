// Vercel-compatible polling hook to replace Socket.IO
// src/hooks/usePollingGame.js

import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

export const usePollingGame = (roomCode, playerId) => {
  const [room, setRoom] = useState(null);
  const [gameState, setGameState] = useState('waiting');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  
  const lastUpdateRef = useRef(0);
  const pollingIntervalRef = useRef(null);
  const isActiveRef = useRef(true);

  // Poll for room updates
  const pollRoomState = useCallback(async () => {
    if (!roomCode || !isActiveRef.current) return;

    try {
      const response = await axios.get(`/api/rooms/realtime`, {
        params: {
          roomCode,
          lastUpdate: lastUpdateRef.current
        }
      });

      if (response.data.hasUpdates) {
        setRoom(response.data.room);
        setGameState(response.data.room.gameState);
        lastUpdateRef.current = response.data.timestamp;
        
        // Set current question if in progress
        if (response.data.room.gameState === 'in-progress' && response.data.room.quiz) {
          const questionIndex = response.data.room.currentQuestionIndex;
          const question = response.data.room.quiz.questions_and_answers[questionIndex];
          setCurrentQuestion(question);
        }
      }
      
      setConnected(true);
      setError(null);
    } catch (err) {
      console.error('Polling error:', err);
      setError(err.message);
      setConnected(false);
    }
  }, [roomCode]);

  // Start polling
  useEffect(() => {
    if (!roomCode) return;

    isActiveRef.current = true;
    
    // Initial poll
    pollRoomState();
    
    // Set up polling interval (every 2 seconds)
    pollingIntervalRef.current = setInterval(pollRoomState, 2000);

    return () => {
      isActiveRef.current = false;
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [roomCode, pollRoomState]);

  // Game actions
  const startGame = useCallback(async () => {
    try {
      const response = await axios.post('/api/rooms/realtime', {
        action: 'start-game',
        roomCode,
        playerId
      });
      
      if (response.data.currentQuestion) {
        setCurrentQuestion(response.data.currentQuestion);
        setGameState('in-progress');
      }
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to start game');
    }
  }, [roomCode, playerId]);

  const submitAnswer = useCallback(async (questionIndex, answer, timeToAnswer) => {
    try {
      const response = await axios.post('/api/rooms/realtime', {
        action: 'submit-answer',
        roomCode,
        playerId,
        data: { questionIndex, answer, timeToAnswer }
      });
      
      // If both players answered and there's a next question
      if (response.data.nextQuestion) {
        setCurrentQuestion(response.data.nextQuestion);
      } else if (response.data.bothAnswered) {
        setGameState('finished');
        setCurrentQuestion(null);
      }
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to submit answer');
    }
  }, [roomCode, playerId]);

  const joinRoom = useCallback(async (playerName) => {
    try {
      await axios.post('/api/rooms/join', {
        roomCode,
        playerId,
        playerName
      });
      
      // Start polling after successful join
      pollRoomState();
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to join room');
    }
  }, [roomCode, playerId, pollRoomState]);

  const leaveRoom = useCallback(async () => {
    isActiveRef.current = false;
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    try {
      await axios.delete('/api/rooms/join', {
        params: { roomCode, playerId }
      });
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  }, [roomCode, playerId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isActiveRef.current = false;
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  return {
    room,
    gameState,
    currentQuestion,
    connected,
    error,
    startGame,
    submitAnswer,
    joinRoom,
    leaveRoom
  };
};