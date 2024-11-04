'use client'
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import LoadingSpinner from '@/components/loader';
import { fetchQuizNames } from '@/redux/slices/questionslice';

const QuizNamesPage = () => {
  const dispatch = useDispatch();
  const { loading, error, allQuizNames } = useSelector((state) => state.question);

  useEffect(() => {
    dispatch(fetchQuizNames());
  }, [dispatch]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Quiz Names</h1>
      <ul>
        {allQuizNames.map((quizName, index) => (
          <li key={index}>{quizName}</li>
        ))}
      </ul>
    </div>
  );
};

export default QuizNamesPage;
