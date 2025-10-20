"use client";
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/nav';
import LoadingSpinner from '@/components/loader';
import { FileText, Play, CheckCircle, Trophy, Users, Timer } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function MCQTestPage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await axios.get('/api/quizzes');
      setQuizzes(response.data.quizzes || []);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      toast.error('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaySolo = (quiz) => {
    // Store quiz data in Redux and navigate to questions page
    const quizData = {
      pdf_name: quiz.pdf_name,
      quiz_name: quiz.quiz_name,
      questions_and_answers: quiz.questions_and_answers,
      quiz_time: quiz.quiz_time
    };
    
    // You would dispatch to Redux here
    localStorage.setItem('currentQuiz', JSON.stringify(quizData));
    router.push('/questions');
  };

  const handlePlayMultiplayer = (quiz) => {
    // Navigate to multiplayer with quiz ID
    router.push(`/multiplayer/create?quizId=${quiz._id}`);
  };

  const handlePreview = (quiz) => {
    setSelectedQuiz(quiz);
    setShowPreview(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (showPreview && selectedQuiz) {
    const mcqQuestions = selectedQuiz.questions_and_answers.filter(q => q.options);
    const textQuestions = selectedQuiz.questions_and_answers.filter(q => !q.options);

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <Button 
                onClick={() => setShowPreview(false)}
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
              >
                ← Back
              </Button>
              <div>
                <h1 className="text-4xl font-bold text-white">{selectedQuiz.quiz_name}</h1>
                <p className="text-blue-200">Quiz Preview - {selectedQuiz.questions_and_answers.length} Questions</p>
              </div>
            </div>

            {/* Quiz Stats */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <Card className="backdrop-blur-sm bg-white/10 border-white/20 text-white">
                <CardContent className="p-4 text-center">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
                  <div className="text-2xl font-bold text-green-300">{mcqQuestions.length}</div>
                  <div className="text-sm text-blue-200">Multiple Choice</div>
                </CardContent>
              </Card>
              <Card className="backdrop-blur-sm bg-white/10 border-white/20 text-white">
                <CardContent className="p-4 text-center">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                  <div className="text-2xl font-bold text-blue-300">{textQuestions.length}</div>
                  <div className="text-sm text-blue-200">Text Answer</div>
                </CardContent>
              </Card>
              <Card className="backdrop-blur-sm bg-white/10 border-white/20 text-white">
                <CardContent className="p-4 text-center">
                  <Timer className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                  <div className="text-2xl font-bold text-yellow-300">{selectedQuiz.quiz_time}s</div>
                  <div className="text-sm text-blue-200">Time Limit</div>
                </CardContent>
              </Card>
            </div>

            {/* Questions Preview */}
            <div className="space-y-6">
              {selectedQuiz.questions_and_answers.map((qa, index) => (
                <Card key={index} className="backdrop-blur-sm bg-white/10 border-white/20 text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      <span className="flex-1">{qa.question}</span>
                      <Badge className={`${
                        qa.options 
                          ? 'bg-purple-100 text-purple-800 border-purple-200' 
                          : 'bg-blue-100 text-blue-800 border-blue-200'
                      }`}>
                        {qa.options ? '🔄 MCQ' : '📝 Text'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {qa.options ? (
                      // Multiple Choice Preview
                      <div className="space-y-2">
                        {Object.entries(qa.options).map(([letter, option]) => (
                          <div 
                            key={letter} 
                            className={`flex items-center gap-3 p-3 rounded-lg ${
                              letter === qa.correct_answer 
                                ? 'bg-green-500/20 border border-green-500/30' 
                                : 'bg-white/5 border border-white/10'
                            }`}
                          >
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                              letter === qa.correct_answer 
                                ? 'bg-green-500 text-white' 
                                : 'bg-white/20 text-white'
                            }`}>
                              {letter}
                            </div>
                            <span className={letter === qa.correct_answer ? 'text-green-300 font-medium' : 'text-blue-100'}>
                              {option}
                            </span>
                            {letter === qa.correct_answer && (
                              <CheckCircle className="w-5 h-5 text-green-400 ml-auto" />
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      // Text Answer Preview
                      <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <div className="text-sm text-blue-200 mb-1">Correct Answer:</div>
                        <div className="text-green-300 font-medium">{qa.answer}</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8 justify-center">
              <Button
                onClick={() => handlePlaySolo(selectedQuiz)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
              >
                <Play className="w-5 h-5 mr-2" />
                Play Solo
              </Button>
              <Button
                onClick={() => handlePlayMultiplayer(selectedQuiz)}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
              >
                <Users className="w-5 h-5 mr-2" />
                Play Multiplayer
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">
              🎯 Multiple Choice Quiz Tests
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Test the new multiple-choice question format with enhanced scoring and interactive gameplay.
              Experience both solo and multiplayer modes with intelligent answer matching.
            </p>
          </div>

          {quizzes.length === 0 ? (
            <Card className="backdrop-blur-sm bg-white/10 border-white/20 text-white text-center p-12">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-50 text-blue-300" />
              <h3 className="text-2xl font-bold mb-2">No Quizzes Available</h3>
              <p className="text-blue-200 mb-4">Create your first quiz from a PDF to test the new MCQ format!</p>
              <Button
                onClick={() => router.push('/create')}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Create New Quiz
              </Button>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {quizzes.map((quiz, index) => {
                const mcqCount = quiz.questions_and_answers?.filter(q => q.options)?.length || 0;
                const textCount = (quiz.questions_and_answers?.length || 0) - mcqCount;
                
                return (
                  <Card key={quiz._id || index} className="backdrop-blur-sm bg-white/10 border-white/20 text-white hover:bg-white/15 transition-all duration-200">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl text-white mb-2 line-clamp-2">
                            {quiz.quiz_name}
                          </CardTitle>
                          <p className="text-blue-200 text-sm">{quiz.pdf_name}</p>
                        </div>
                        <Trophy className="w-6 h-6 text-yellow-400 flex-shrink-0 ml-2" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Quiz Stats */}
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <div className="text-lg font-bold text-green-300">{mcqCount}</div>
                          <div className="text-xs text-blue-200">MCQ</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-blue-300">{textCount}</div>
                          <div className="text-xs text-blue-200">Text</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-yellow-300">{quiz.quiz_time}s</div>
                          <div className="text-xs text-blue-200">Time</div>
                        </div>
                      </div>

                      {/* Format Indicators */}
                      <div className="flex gap-1 justify-center">
                        {mcqCount > 0 && (
                          <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs">
                            🔄 Multiple Choice
                          </Badge>
                        )}
                        {textCount > 0 && (
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                            📝 Text Answer
                          </Badge>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2">
                        <Button
                          onClick={() => handlePreview(quiz)}
                          variant="outline"
                          className="w-full border-white/30 text-white hover:bg-white/10"
                        >
                          Preview Questions
                        </Button>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            onClick={() => handlePlaySolo(quiz)}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Solo
                          </Button>
                          <Button
                            onClick={() => handlePlayMultiplayer(quiz)}
                            className="bg-green-600 hover:bg-green-700 text-white text-sm"
                          >
                            <Users className="w-4 h-4 mr-1" />
                            Multi
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}