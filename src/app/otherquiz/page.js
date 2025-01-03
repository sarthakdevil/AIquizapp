'use client';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/loader';
import { fetchQuizzes, selectQuiz } from '@/redux/slices/questionslice';
import { Grid, Card, CardContent, Typography, Button } from '@mui/material';
import Navbar from '@/components/nav';
import QuizSearchBar from '@/components/search';

const QuizNamesPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, error, allQuizzes } = useSelector((state) => state.question);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchQuizzes());
  }, [dispatch]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const handleStartQuiz = (quizId) => {
    dispatch(selectQuiz(quizId));
    router.push(`/questions/${quizId}`);
  };

  const handleSearch = (term) => {
    setSearchTerm(term.toLowerCase());
  };

  const filteredQuizzes = allQuizzes.filter((quiz) =>
    quiz.quizName.toLowerCase().includes(searchTerm)
  );

  return (
    <div>
      <Navbar />
      <h1>All Quizzes</h1>
      <QuizSearchBar onSearch={handleSearch} /> {/* Render the search bar */}
      <Grid container spacing={3}>
        {filteredQuizzes.map((quiz) => (
          <Grid item xs={12} sm={6} md={4} key={quiz.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="div">
                  {quiz.quizName}
                </Typography>
                <Typography color="text.secondary">
                  Time: {quiz.quizTime} seconds
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  style={{ marginTop: '10px' }}
                  onClick={() => handleStartQuiz(quiz.id)}
                >
                  Play Quiz
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default QuizNamesPage;
