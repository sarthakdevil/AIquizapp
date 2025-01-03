'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useSelector } from 'react-redux';

export default function Questions() {
  const router = useRouter();
  const currentQuiz = useSelector((state) => state.question.currentQuiz);
  const [userAnswers, setUserAnswers] = useState({});
  const [error, setError] = useState(null);
  const [showAnswers, setShowAnswers] = useState(false);
  const [timeLeft, setTimeLeft] = useState(currentQuiz?.quizTime || 0);

  useEffect(() => {
    if (!currentQuiz) {
      router.push('/'); // Redirect to home if no quiz is selected
    } else {
      setTimeLeft(currentQuiz.quizTime); // Set the quiz time from the current quiz
    }

    const handleBackNavigation = (event) => {
      event.preventDefault();
      router.push('/'); // Redirect to home page on back navigation
    };

    // Listen for back navigation
    window.addEventListener('popstate', handleBackNavigation);

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener('popstate', handleBackNavigation);
    };
  }, [currentQuiz, router]);

  useEffect(() => {
    if (timeLeft > 0 && !showAnswers) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      handleSubmit(); // Auto-submit when time is up
    }
  }, [timeLeft, showAnswers]);

  const handleChange = (question, value) => {
    setUserAnswers((prev) => ({ ...prev, [question]: value }));
  };

  const handleSubmit = async () => {
    try {
      console.log('User Answers:', userAnswers);
      setShowAnswers(true);
    } catch (error) {
      console.error('Error submitting answers:', error);
      setError('An error occurred while submitting your answers.');
      router.push('/');
    }
  };

  if (!currentQuiz) {
    return null; // Prevent rendering if currentQuiz is not available
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <Typography variant="h4" className="mb-4 text-white relative top-8">
        {currentQuiz.quizName || 'Quiz'} {/* Display current quiz name */}
      </Typography>
      <div className="flex flex-col w-[70vw] bg-slate-300 p-6 rounded-md shadow-md relative top-10">
        <Typography variant="h5" className="mb-4">Answer the Questions</Typography>

        <Typography variant="h6" className="mb-4">
          Time Left: {timeLeft} seconds
        </Typography>
        
        {error && (
          <Typography variant="body1" className="text-red-600 mb-4">
            {error}
          </Typography>
        )}

        {currentQuiz.questionsAndAnswers.map((qa, index) => (
          <div key={index} className="mb-4">
            <Typography variant="body1" className="font-semibold">
              {qa.question}
            </Typography>
            {!showAnswers ? (
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Type your answer here"
                onChange={(e) => handleChange(qa.question, e.target.value)}
                rows={2}
              />
            ) : (
              <Typography variant="body2" className="mt-2">
                Correct Answer: {qa.answer}
              </Typography>
            )}
          </div>
        ))}

        {!showAnswers && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
          >
            Submit Answers
          </Button>
        )}
      </div>
    </div>
  );
}
