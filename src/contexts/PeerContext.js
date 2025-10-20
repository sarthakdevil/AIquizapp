"use client";
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import Peer from 'peerjs';

const PeerContext = createContext();

export const usePeer = () => {
  const context = useContext(PeerContext);
  if (!context) {
    throw new Error('usePeer must be used within a PeerProvider');
  }
  return context;
};

export const PeerProvider = ({ children }) => {
  const [peer, setPeer] = useState(null);
  const [peerId, setPeerId] = useState('');
  const [connection, setConnection] = useState(null);
  const [connected, setConnected] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [gameState, setGameState] = useState('waiting');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [playerScores, setPlayerScores] = useState({ host: 0, guest: 0 });
  const [quiz, setQuiz] = useState(null);
  const [messages, setMessages] = useState([]);
  const [answersReceived, setAnswersReceived] = useState({ host: false, guest: false });
  const [lastHeartbeat, setLastHeartbeat] = useState(Date.now());

  // Handle question progression when both players have answered
  useEffect(() => {
    console.log('PeerContext: Checking progression -', { 
      answersReceived, 
      isHost, 
      gameState, 
      questionIndex, 
      totalQuestions: quiz?.questions_and_answers?.length,
      currentScores: playerScores
    });
    
    if (answersReceived.host && answersReceived.guest && isHost && gameState === 'playing') {
      console.log('PeerContext: Both players answered, host starting progression timer');
      
      // Send progression status to guest immediately
      if (connection && connected) {
        const statusMessage = { 
          type: 'progression-status', 
          payload: { 
            status: 'both-answered',
            nextIn: 3000,
            currentScores: playerScores
          }, 
          timestamp: Date.now() 
        };
        connection.send(statusMessage);
        console.log('Sent progression status:', statusMessage);
      }
      
      const timer = setTimeout(() => {
        if (questionIndex + 1 < quiz?.questions_and_answers?.length) {
          // Move to next question
          const nextIndex = questionIndex + 1;
          console.log('PeerContext: Moving to next question', { nextIndex, currentScores: playerScores });
          
          setQuestionIndex(nextIndex);
          setCurrentQuestion(quiz.questions_and_answers[nextIndex]);
          setAnswersReceived({ host: false, guest: false });
          
          // Send message to peer with synced scores
          if (connection && connected) {
            const message = { 
              type: 'next-question', 
              payload: { 
                questionIndex: nextIndex,
                scores: playerScores // Sync scores with next question
              }, 
              timestamp: Date.now() 
            };
            connection.send(message);
            console.log('Sent message:', message);
          }
        } else {
          // End game
          console.log('PeerContext: No more questions, ending game');
          setGameState('finished');
          
          // Send game end message with final scores
          if (connection && connected) {
            const message = { 
              type: 'game-end', 
              payload: { 
                finalScores: playerScores 
              }, 
              timestamp: Date.now() 
            };
            connection.send(message);
            console.log('Sent message:', message);
          }
        }
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [answersReceived, isHost, gameState, questionIndex, quiz, connection, connected, playerScores]);

  // Initialize PeerJS
  useEffect(() => {
    const peerInstance = new Peer({
      // Use default PeerJS cloud service (no CORS issues)
      debug: 2
    });

    peerInstance.on('open', (id) => {
      console.log('Peer ID:', id);
      setPeerId(id);
    });

    peerInstance.on('connection', (conn) => {
      console.log('Incoming connection from:', conn.peer);
      setConnection(conn);
      setupConnectionHandlers(conn);
    });

    peerInstance.on('error', (error) => {
      console.error('Peer error:', error);
    });

    setPeer(peerInstance);

    return () => {
      if (peerInstance) {
        peerInstance.destroy();
      }
    };
  }, []);

  // Heartbeat system to monitor connection health
  useEffect(() => {
    if (connection && connected && gameState === 'playing') {
      const heartbeatInterval = setInterval(() => {
        const heartbeatMsg = {
          type: 'heartbeat',
          payload: { timestamp: Date.now() },
          timestamp: Date.now()
        };
        connection.send(heartbeatMsg);
        
        // Check if we haven't received a heartbeat recently
        if (Date.now() - lastHeartbeat > 10000) { // 10 second timeout
          console.warn('PeerContext: Connection seems inactive, no recent heartbeat');
        }
      }, 3000); // Send heartbeat every 3 seconds

      return () => clearInterval(heartbeatInterval);
    }
  }, [connection, connected, gameState, lastHeartbeat]);

  // Setup connection handlers
  const setupConnectionHandlers = useCallback((conn) => {
    conn.on('open', () => {
      console.log('Connection opened');
      setConnected(true);
    });

    conn.on('data', (data) => {
      console.log('Received data:', data);
      handleIncomingMessage(data);
    });

    conn.on('close', () => {
      console.log('Connection closed');
      setConnected(false);
      setGameState('disconnected');
    });

    conn.on('error', (error) => {
      console.error('Connection error:', error);
    });
  }, []);

  // Handle incoming messages
  const handleIncomingMessage = useCallback((data) => {
    const { type, payload } = data;
    
    switch (type) {
      case 'game-start':
        setGameState('playing');
        setQuiz(payload.quiz);
        setCurrentQuestion(payload.quiz.questions_and_answers[0]);
        setQuestionIndex(0);
        break;
        
      case 'answer-submitted':
        // Handle opponent's answer
        const { playerId, answer, isCorrect, timeToAnswer, points, newScore } = payload;
        console.log('PeerContext: Received opponent answer', { playerId, answer, isCorrect, points, newScore });
        
        // Update opponent's score directly with the new score
        if (typeof newScore === 'number') {
          console.log('PeerContext: Syncing opponent score', { playerId, newScore });
          setPlayerScores(prev => ({
            ...prev,
            [playerId]: newScore
          }));
        } else {
          // Fallback to calculating score
          updateScore(playerId, isCorrect, timeToAnswer);
        }
        
        // Mark that this player has answered
        setAnswersReceived(prev => {
          const updated = { ...prev, [playerId]: true };
          console.log('PeerContext: Updated answers after opponent submission', updated);
          return updated;
        });
        break;
        
      case 'next-question':
        const { questionIndex: nextIndex, scores: syncedScores } = payload;
        console.log('PeerContext: Received next-question message', { nextIndex, syncedScores });
        
        if (nextIndex < quiz?.questions_and_answers?.length) {
          setQuestionIndex(nextIndex);
          setCurrentQuestion(quiz.questions_and_answers[nextIndex]);
          // Reset answer tracking for new question
          setAnswersReceived({ host: false, guest: false });
          
          // Sync scores before moving to next question
          if (syncedScores) {
            console.log('PeerContext: Syncing scores before next question', syncedScores);
            setPlayerScores(syncedScores);
          }
        }
        break;
        
      case 'progression-status':
        const { status, nextIn, currentScores } = payload;
        console.log('PeerContext: Received progression status', { status, nextIn, currentScores });
        
        // Sync scores during progression
        if (currentScores) {
          setPlayerScores(currentScores);
        }
        break;
        
      case 'game-end':
        const { finalScores } = payload;
        console.log('PeerContext: Game ended, syncing final scores', finalScores);
        
        // Sync final scores before ending game
        if (finalScores) {
          setPlayerScores(finalScores);
        }
        
        setGameState('finished');
        break;
        
      case 'heartbeat':
        // Update last heartbeat timestamp
        setLastHeartbeat(Date.now());
        console.log('PeerContext: Heartbeat received');
        break;
        
      case 'player-joined':
        setGameState('ready');
        break;
        
      default:
        console.log('Unknown message type:', type);
    }
    
    setMessages(prev => [...prev, data]);
  }, [quiz]);

  // Connect to another peer
  const connectToPeer = useCallback((targetPeerId) => {
    if (!peer) return;
    
    const conn = peer.connect(targetPeerId);
    setConnection(conn);
    setupConnectionHandlers(conn);
    setIsHost(false);
    
    // Send join message
    conn.on('open', () => {
      const message = { 
        type: 'player-joined', 
        payload: { peerId }, 
        timestamp: Date.now() 
      };
      conn.send(message);
      console.log('Sent message:', message);
    });
  }, [peer, peerId, setupConnectionHandlers]);

  // Start game (host only)
  const startGame = useCallback((selectedQuiz) => {
    if (!isHost || !connected) return;
    
    setQuiz(selectedQuiz);
    setGameState('playing');
    setCurrentQuestion(selectedQuiz.questions_and_answers[0]);
    setQuestionIndex(0);
    setAnswersReceived({ host: false, guest: false }); // Reset answer tracking
    
    // Send game start message
    if (connection && connected) {
      const message = { 
        type: 'game-start', 
        payload: { quiz: selectedQuiz }, 
        timestamp: Date.now() 
      };
      connection.send(message);
      console.log('Sent message:', message);
    }
  }, [isHost, connected, connection]);

  // Submit answer
  const submitAnswer = useCallback((answer, timeToAnswer) => {
    if (!currentQuestion) return;
    
    const isCorrect = answer === currentQuestion.correct_answer;
    const playerId = isHost ? 'host' : 'guest';
    
    console.log('PeerContext: submitAnswer called', { playerId, answer, isCorrect, questionIndex });
    
    // Calculate points
    const timeBonus = Math.max(0, 30 - timeToAnswer);
    const points = isCorrect ? 100 + timeBonus : 0;
    
    // Update local score and get new score state
    let newPlayerScores;
    setPlayerScores(prev => {
      newPlayerScores = {
        ...prev,
        [playerId]: prev[playerId] + points
      };
      return newPlayerScores;
    });
    
    // Mark that current player has answered
    setAnswersReceived(prev => {
      const updated = { ...prev, [playerId]: true };
      console.log('PeerContext: Updated answers received', updated);
      return updated;
    });
    
    // Send to peer with score information - use timeout to ensure state is updated
    setTimeout(() => {
      if (connection && connected) {
        const message = { 
          type: 'answer-submitted', 
          payload: {
            playerId,
            answer,
            isCorrect,
            timeToAnswer,
            questionIndex,
            points,
            newScore: (playerScores[playerId] || 0) + points // Send the new score directly
          }, 
          timestamp: Date.now() 
        };
        connection.send(message);
        console.log('Sent message:', message);
      }
    }, 50);
    
    return { isCorrect, correctAnswer: currentQuestion.correct_answer };
  }, [currentQuestion, isHost, questionIndex, connection, connected, playerScores]);

  // Update player scores
  const updateScore = useCallback((playerId, isCorrect, timeToAnswer) => {
    if (isCorrect) {
      const timeBonus = Math.max(0, 30 - timeToAnswer); // Assume 30s per question
      const points = 100 + timeBonus;
      
      setPlayerScores(prev => ({
        ...prev,
        [playerId]: prev[playerId] + points
      }));
    }
  }, []);

  // Become host
  const becomeHost = useCallback(() => {
    setIsHost(true);
    setGameState('waiting');
  }, []);

  // Leave game
  const leaveGame = useCallback(() => {
    if (connection) {
      connection.close();
    }
    setConnection(null);
    setConnected(false);
    setGameState('waiting');
    setIsHost(false);
    setCurrentQuestion(null);
    setQuestionIndex(0);
    setPlayerScores({ host: 0, guest: 0 });
    setQuiz(null);
    setAnswersReceived({ host: false, guest: false });
  }, [connection]);

  const value = {
    peer,
    peerId,
    connection,
    connected,
    isHost,
    gameState,
    currentQuestion,
    questionIndex,
    playerScores,
    quiz,
    messages,
    connectToPeer,
    startGame,
    submitAnswer,
    becomeHost,
    leaveGame
  };

  return (
    <PeerContext.Provider value={value}>
      {children}
    </PeerContext.Provider>
  );
};