'use client';
import { useEffect, useState } from 'react';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import { useDispatch, useSelector } from 'react-redux';
import { analyzePdf } from '@/redux/slices/pdfslice';
import { useRouter } from 'next/navigation'; // Import useRouter

export default function Requirements({ onChange }) {
  const dispatch = useDispatch();
  const router = useRouter(); // Initialize the router
  const pdfFilename = useSelector((state) => state.upload.pdfName);
  const questionsAndAnswers = useSelector((state) => state.upload.questionsAndAnswers); // Selector to access questions
  const [questionCount, setQuestionCount] = useState(1);

  // Fast redirect if pdfFilename is not available
  if (!pdfFilename) {
    router.push('/'); // Redirect to the desired page, e.g., home page
    return null; // Return null to prevent rendering the component
  }

  const handleSliderChange = (event, newValue) => {
    setQuestionCount(newValue);
    if (onChange) onChange({ questionCount: newValue });
  };

  const handleSubmit = () => {
    if (pdfFilename) {
      console.log(pdfFilename, questionCount);
      dispatch(analyzePdf(pdfFilename, questionCount));
    }
  };

  // Check for questionsAndAnswers to redirect after analyzing
  useEffect(() => {
    if (questionsAndAnswers) {
      // Redirect to questions page if questions are available
      router.push('/questions');
    }
  }, [questionsAndAnswers, router]); // Dependency array includes questionsAndAnswers

  return (
    <div className="w-[100vw] h-[100vh] bg-[#0c0032] flex justify-center items-center">
      <div className="flex w-[70vw] h-[75vh] md:h-[35vh] bg-slate-300 justify-center items-center rounded-md align-middle">
        <div className="flex flex-col items-center justify-center p-4">
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
          <button
            className="bg-blue-950 px-10 text-white font-semibold rounded-md mt-4"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
