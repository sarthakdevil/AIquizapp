'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useSelector } from 'react-redux';

export default function Questions() {
  const router = useRouter();
  const questionsData = useSelector((state) => state.upload.questionsAndAnswers);
  const [userAnswers, setUserAnswers] = useState({});
  const [error, setError] = useState(null);
  const [showAnswers, setShowAnswers] = useState(false);

  useEffect(() => {
    if (!questionsData) {
      router.push('/');
    }
  }, [questionsData, router]);

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

  return (
    <div className="flex flex-col w-[70vw] bg-slate-300 p-6 rounded-md shadow-md relative top-10">
      <Typography variant="h5" className="mb-4">Answer the Questions</Typography>
      
      {error && (
        <Typography variant="body1" className="text-red-600 mb-4">
          {error}
        </Typography>
      )}

      {questionsData.questions_and_answers.map((qa, index) => (
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
              {qa.answer}
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
  );
}

