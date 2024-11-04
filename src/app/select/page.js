'use client';
import { useEffect, useState } from 'react';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import { useDispatch, useSelector } from 'react-redux';
import { analyzePdf } from '@/redux/slices/pdfslice';
import { useRouter } from 'next/navigation';
import { TextField } from '@mui/material';

export default function Requirements({ onChange }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const pdfFilename = useSelector((state) => state.upload.pdfName);
  const questionsAndAnswers = useSelector((state) => state.upload.questionsAndAnswers);
  const [questionCount, setQuestionCount] = useState(1);
  const [time, setTime] = useState(''); // State for time limit
  const [quizName, setQuizName] = useState(''); // State for quiz name

  if (!pdfFilename) {
    router.push('/');
    return null;
  }

  // Handle slider change
  const handleSliderChange = (event, newValue) => {
    setQuestionCount(newValue);
    if (onChange) onChange({ questionCount: newValue });
  };

  // Handle time input change
  const handleTimeChange = (e) => {
    setTime(e.target.value);
  };

  // Handle quiz name change
  const handleQuizNameChange = (e) => {
    setQuizName(e.target.value);
  };

  // Handle submit with FormData
  const handleSubmit = () => {
    if (pdfFilename) {
      console.log(pdfFilename, quizName, questionCount, time);

      // Prepare the payload
      const payload = {
        pdfFilename: pdfFilename,
        quizName: quizName || 'Untitled Quiz', // Default name if none is provided
        numQuestions: questionCount,
        time: time || null, // Set to null if time is not provided
      };

      // Dispatch the analyzePdf action
      dispatch(analyzePdf(payload));
    }
  };

  // Redirect to questions page if questionsAndAnswers are available
  useEffect(() => {
    if (questionsAndAnswers) {
      router.push('/questions');
    }
  }, [questionsAndAnswers, router]);

  return (
    <div className="flex w-[70vw] h-[75vh] md:h-[55vh] bg-slate-300 justify-center items-center rounded-md align-middle">
      <div className="flex flex-col items-center justify-center p-4">
        <Typography variant="h6" className="mb-4">
          Quiz Name
        </Typography>
        <TextField
          variant="outlined"
          placeholder="Enter quiz name"
          value={quizName}
          onChange={handleQuizNameChange}
          sx={{
            width: 200,
            marginBottom: 2,
          }}
        />
        
        <Typography variant="h6" className="mb-4">
          How many questions do you want?
        </Typography>
        <Slider
          value={questionCount}
          onChange={handleSliderChange}
          min={1}
          max={10}
          step={1}
          valueLabelDisplay="auto"
        />
        <Typography variant="body1" className="mt-2">
          Selected: {questionCount} question{questionCount > 1 ? 's' : ''}
        </Typography>
        <div>
          <Typography variant="body2" className="mr-4 mt-2">
            Time limit (leave blank if none)
          </Typography>
          <TextField
            variant="outlined"
            placeholder="Time"
            value={time}
            onChange={handleTimeChange}
            sx={{
              width: 200,
              marginTop: 1,
            }}
          />
        </div>
        <button
          className="bg-blue-950 px-10 text-white font-semibold rounded-md mt-4"
          onClick={handleSubmit}
        >
          Submit
        </button>
      </div>
    </div>
  );
}
