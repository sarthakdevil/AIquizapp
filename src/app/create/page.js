'use client';
import { useState, useEffect } from 'react';
import { Typography, Slider, TextField, Button, Alert } from '@mui/material';
import Navbar from '@/components/nav';
import { useDispatch, useSelector } from 'react-redux';
import { createQuiz} from '@/redux/slices/questionslice';

const CreateManualQuiz = () => {
  const dispatch = useDispatch();
  const { quizId, error, loading } = useSelector((state) => state.question);

  const [quizName, setQuizName] = useState('');
  const [questionCount, setQuestionCount] = useState(1);
  const [questionsAndAnswers, setQuestionsAndAnswers] = useState([{ question: '', answer: '' }]);

  // Handle slider change
  const handleQuestionCountChange = (event, value) => {
    setQuestionCount(value);
    setQuestionsAndAnswers((prev) => {
      const newQuestions = [...prev];
      if (value > newQuestions.length) {
        for (let i = newQuestions.length; i < value; i++) {
          newQuestions.push({ question: '', answer: '' });
        }
      } else {
        newQuestions.splice(value);
      }
      return newQuestions;
    });
  };

  // Handle question and answer input change
  const handleInputChange = (index, type, value) => {
    const updatedQuestions = [...questionsAndAnswers];
    updatedQuestions[index][type] = value;
    setQuestionsAndAnswers(updatedQuestions);
  };

  // Handle quiz save
  const handleSaveQuiz = () => {
    dispatch(createQuiz({ quizName, questionsAndAnswers }));
  };

  return (
    <div className="flex flex-col items-center justify-center w-[100vw]">
      <Navbar />
      <Typography variant="h4" className="mb-4 text-white relative top-8">
        Create Your Quiz
      </Typography>

      <div className="flex flex-col w-[70vw] bg-slate-300 p-6 rounded-md shadow-md relative top-10">
        <TextField
          fullWidth
          variant="outlined"
          label="Quiz Name"
          value={quizName}
          onChange={(e) => setQuizName(e.target.value)}
          className="mb-4"
        />

        <Typography variant="h6" className="mb-2">
          Number of Questions: {questionCount}
        </Typography>
        <Slider
          value={questionCount}
          onChange={handleQuestionCountChange}
          min={1}
          max={20}
          step={1}
          marks
          valueLabelDisplay="auto"
          className="mb-6"
        />

        {questionsAndAnswers.map((qa, index) => (
          <div key={index} className="mb-4">
            <Typography variant="subtitle1" className="mb-2">
              Question {index + 1}
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              label="Question"
              value={qa.question}
              onChange={(e) => handleInputChange(index, 'question', e.target.value)}
              className="mb-2"
            />
            <TextField
              fullWidth
              variant="outlined"
              label="Answer"
              value={qa.answer}
              onChange={(e) => handleInputChange(index, 'answer', e.target.value)}
            />
          </div>
        ))}

        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}

        <Button
          variant="contained"
          color="primary"
          onClick={handleSaveQuiz}
          disabled={loading}
          className="mt-6"
        >
          {loading ? "Saving..." : "Save Quiz"}
        </Button>

        {quizId && (
          <Alert severity="success" className="mt-4">
            Quiz created successfully! Your quiz ID is: <strong>{quizId}</strong>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default CreateManualQuiz;
