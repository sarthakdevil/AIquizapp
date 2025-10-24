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
  const [syncBuffer, setSyncBuffer] = useState(0); // Buffer time to ensure synchronization
  const [connectionQuality, setConnectionQuality] = useState('unknown'); // 'good', 'fair', 'poor', 'unknown'
  const [pendingMessages, setPendingMessages] = useState(new Map()); // Track message acknowledgments
  const [messageSequence, setMessageSequence] = useState(0);
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
        const sequenceId = messageSequence;
        setMessageSequence(prev => prev + 1);

        const statusMessage = {
          type: 'progression-status',
          payload: {
            status: 'both-answered',
            nextIn: 3000,
            currentScores: playerScores,
            questionIndex
          },
          sequenceId,
          timestamp: Date.now()
        };

        // Track pending message
        setPendingMessages(prev => new Map(prev).set(sequenceId, {
          message: statusMessage,
          retries: 0,
          sentAt: Date.now()
        }));

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
            const sequenceId = messageSequence;
            setMessageSequence(prev => prev + 1);

            const message = {
              type: 'next-question',
              payload: {
                questionIndex: nextIndex,
                scores: playerScores // Sync scores with next question
              },
              sequenceId,
              timestamp: Date.now()
            };

            // Track pending message
            setPendingMessages(prev => new Map(prev).set(sequenceId, {
              message,
              retries: 0,
              sentAt: Date.now()
            }));

            connection.send(message);
            console.log('Sent message:', message);
          }
        } else {
          // End game
          console.log('PeerContext: No more questions, ending game');
          setGameState('finished');

          // Send game end message with final scores
          if (connection && connected) {
            const sequenceId = messageSequence;
            setMessageSequence(prev => prev + 1);

            const message = {
              type: 'game-end',
              payload: {
                finalScores: playerScores
              },
              sequenceId,
              timestamp: Date.now()
            };

            // Track pending message
            setPendingMessages(prev => new Map(prev).set(sequenceId, {
              message,
              retries: 0,
              sentAt: Date.now()
            }));

            connection.send(message);
            console.log('Sent message:', message);
          }
        }
      }, 3000 + syncBuffer); // Add sync buffer based on connection quality      return () => clearTimeout(timer);
    }
  }, [answersReceived, isHost, gameState, questionIndex, quiz, connection, connected, playerScores, messageSequence, syncBuffer]);

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
        const now = Date.now();
        const timeSinceLastHeartbeat = now - lastHeartbeat;

        // Update connection quality based on heartbeat timing
        if (timeSinceLastHeartbeat < 5000) {
          setConnectionQuality('good');
          setSyncBuffer(0); // No extra buffer for good connections
        } else if (timeSinceLastHeartbeat < 10000) {
          setConnectionQuality('fair');
          setSyncBuffer(1000); // 1 second extra buffer
        } else {
          setConnectionQuality('poor');
          setSyncBuffer(2000); // 2 seconds extra buffer
        }

        const heartbeatMsg = {
          type: 'heartbeat',
          payload: { timestamp: now },
          timestamp: now
        };
        connection.send(heartbeatMsg);

        // Check if we haven't received a heartbeat recently
        if (timeSinceLastHeartbeat > 15000) { // 15 second timeout
          console.warn('PeerContext: Connection seems inactive, no recent heartbeat');
          setConnectionQuality('poor');
        }
      }, 3000); // Send heartbeat every 3 seconds

      return () => clearInterval(heartbeatInterval);
    } else {
      setConnectionQuality('unknown');
    }
  }, [connection, connected, gameState, lastHeartbeat]);

  // Retry pending messages
  useEffect(() => {
    const retryInterval = setInterval(() => {
      setPendingMessages(prev => {
        const newMap = new Map();
        const now = Date.now();

        prev.forEach((pending, sequenceId) => {
          if (now - pending.sentAt > 5000 && pending.retries < 3) { // Retry after 5 seconds, max 3 retries
            if (connection && connected) {
              console.log('PeerContext: Retrying message', { sequenceId, retries: pending.retries + 1 });
              connection.send(pending.message);

              newMap.set(sequenceId, {
                ...pending,
                retries: pending.retries + 1,
                sentAt: now
              });
            } else {
              // Keep pending if no connection
              newMap.set(sequenceId, pending);
            }
          } else if (pending.retries >= 3) {
            console.warn('PeerContext: Message failed after 3 retries', { sequenceId, message: pending.message });
          } else {
            // Keep pending
            newMap.set(sequenceId, pending);
          }
        });

        return newMap;
      });
    }, 2000); // Check every 2 seconds

    return () => clearInterval(retryInterval);
  }, [connection, connected]);

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
    const { type, payload, sequenceId } = data;

    // Send acknowledgment for sequenced messages
    if (sequenceId !== undefined && connection && connected) {
      const ackMessage = {
        type: 'ack',
        sequenceId,
        timestamp: Date.now()
      };
      connection.send(ackMessage);

      // Remove from pending messages if it was tracked
      setPendingMessages(prev => {
        const newMap = new Map(prev);
        newMap.delete(sequenceId);
        return newMap;
      });
    }

    switch (type) {
      case 'ack':
        // Remove acknowledged message from pending
        setPendingMessages(prev => {
          const newMap = new Map(prev);
          newMap.delete(data.sequenceId);
          return newMap;
        });
        break;

      case 'game-start':
        setGameState('playing');
        setQuiz(payload.quiz);
        setCurrentQuestion(payload.quiz.questions_and_answers[0]);
        setQuestionIndex(0);
        setAnswersReceived({ host: false, guest: false }); // Reset answer tracking
        break;

      case 'answer-submitted':
        // Handle opponent's answer
        const { playerId, answer, isCorrect, timeToAnswer, points, newScore, questionIndex: submittedQuestionIndex } = payload;
        console.log('PeerContext: Received opponent answer', { playerId, answer, isCorrect, points, newScore, submittedQuestionIndex });

        // Only process answer if it's for the current question
        if (submittedQuestionIndex === questionIndex) {
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
        } else {
          console.log('PeerContext: Ignoring answer for different question', { submittedQuestionIndex, currentQuestionIndex: questionIndex });
        }
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
        const { status, nextIn, currentScores, questionIndex: statusQuestionIndex } = payload;
        console.log('PeerContext: Received progression status', { status, nextIn, currentScores, statusQuestionIndex });

        // Only process if it's for the current question
        if (statusQuestionIndex === questionIndex) {
          // Sync scores during progression
          if (currentScores) {
            setPlayerScores(currentScores);
          }
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
  }, [quiz, questionIndex, connection, connected]);

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
      const sequenceId = messageSequence;
      setMessageSequence(prev => prev + 1);

      const message = {
        type: 'game-start',
        payload: { quiz: selectedQuiz },
        sequenceId,
        timestamp: Date.now()
      };

      // Track pending message
      setPendingMessages(prev => new Map(prev).set(sequenceId, {
        message,
        retries: 0,
        sentAt: Date.now()
      }));

      connection.send(message);
      console.log('Sent message:', message);
    }
  }, [isHost, connected, connection, messageSequence]);

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

    // Send to peer with score information and sequencing
    if (connection && connected) {
      const sequenceId = messageSequence;
      setMessageSequence(prev => prev + 1);

      const message = {
        type: 'answer-submitted',
        payload: {
          playerId,
          answer,
          isCorrect,
          timeToAnswer,
          questionIndex,
          points,
          newScore: newPlayerScores[playerId]
        },
        sequenceId,
        timestamp: Date.now()
      };

      // Track pending message
      setPendingMessages(prev => new Map(prev).set(sequenceId, {
        message,
        retries: 0,
        sentAt: Date.now()
      }));

      connection.send(message);
      console.log('Sent message:', message);
    }

    return { isCorrect, correctAnswer: currentQuestion.correct_answer };
  }, [currentQuestion, isHost, questionIndex, connection, connected, playerScores, messageSequence]);

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
    setPendingMessages(new Map()); // Clear pending messages
    setMessageSequence(0); // Reset sequence
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
    connectionQuality,
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