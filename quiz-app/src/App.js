import React, { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import axios from 'axios';

const App = () => {
  const [quizId, setQuizId] = useState('');
  const [userId, setUserId] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const stompClientRef = useRef(null);
  const inactivityTimeoutRef = useRef(null);

  const resetInactivityTimeout = () => {
    clearTimeout(inactivityTimeoutRef.current);
    inactivityTimeoutRef.current = setTimeout(() => {
      if (stompClientRef.current) {
        stompClientRef.current.disconnect(() => console.log('Disconnected due to inactivity'));
        stompClientRef.current = null;
      }
    }, 300000);
  };

  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/quiz');
    const client = Stomp.over(socket);

    client.connect({}, () => {
      console.log('Connected to WebSocket');
      stompClientRef.current = client;
      resetInactivityTimeout();
    }, (error) => {
      console.error('WebSocket connection error:', error);
    });

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.disconnect(() => console.log('Disconnected from WebSocket'));
      }
      clearTimeout(inactivityTimeoutRef.current); // Clear inactivity timeout on cleanup
    };
  }, []);

  useEffect(() => {
    const handleUserActivity = () => resetInactivityTimeout();

    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keypress', handleUserActivity);

    return () => {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keypress', handleUserActivity);
    };
  }, []);

  const joinQuiz = () => {
    axios.post('/api/quiz/join', { quizId, userId })
      .then(() => {
        console.log('Joined quiz successfully');

        axios.get(`/api/quiz/leaderboard/${quizId}`)
          .then((response) => {
            const initialLeaderboard = response.data;
            setLeaderboard(Object.entries(initialLeaderboard).sort((a, b) => b[1] - a[1]));
          })
          .catch((error) => console.error('Error fetching leaderboard:', error));

        stompClientRef.current.subscribe(`/topic/leaderboard/${quizId}`, (message) => {
          const updatedLeaderboard = JSON.parse(message.body);
          setLeaderboard(Object.entries(updatedLeaderboard).sort((a, b) => b[1] - a[1]));
        });
      })
      .catch((error) => console.error('Error joining quiz:', error));
  };

  const submitAnswer = (isCorrect) => {
    resetInactivityTimeout();
    axios.post('/api/quiz/answer', { quizId, userId, correct: isCorrect })
      .then(() => console.log('Answer submitted'))
      .catch((error) => console.error('Error submitting answer:', error));
  };

  return (
    <div>
      <h1>Real-Time Quiz App</h1>
      <div>
        <input
          type="text"
          placeholder="Quiz ID"
          value={quizId}
          onChange={(e) => setQuizId(e.target.value)}
        />
        <input
          type="text"
          placeholder="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        <button onClick={joinQuiz}>Join Quiz</button>
      </div>
      <div>
        <button onClick={() => submitAnswer(true)}>Submit Correct Answer</button>
        <button onClick={() => submitAnswer(false)}>Submit Wrong Answer</button>
      </div>
      <h2>Leaderboard</h2>
      <ul>
        {leaderboard.map(([user, score]) => (
          <li key={user}>{user}: {score}</li>
        ))}
      </ul>
    </div>
  );
};

export default App;
