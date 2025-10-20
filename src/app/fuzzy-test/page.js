"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/nav';
import { answerMatcher } from '@/utils/answerMatcher';
import { CheckCircle, AlertCircle, Zap, Target, Brain, Eye } from 'lucide-react';

export default function FuzzyMatchTestPage() {
  const [userAnswer, setUserAnswer] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [result, setResult] = useState(null);
  const [testCases, setTestCases] = useState([]);

  // Predefined test cases to demonstrate fuzzy matching
  const demoTestCases = [
    { user: 'paris', correct: 'Paris', description: 'Case difference' },
    { user: 'paaris', correct: 'Paris', description: 'Single typo' },
    { user: 'new york', correct: 'New York', description: 'Case and spacing' },
    { user: '3', correct: 'three', description: 'Number vs word' },
    { user: 'york new', correct: 'new york', description: 'Word order' },
    { user: 'javascript', correct: 'JavaScript', description: 'Capitalization' },
    { user: 'photosynthesis', correct: 'photosynthesis', description: 'Exact match' },
    { user: 'photosyntesis', correct: 'photosynthesis', description: 'Missing letter' },
    { user: 'completly wrong', correct: 'Paris', description: 'No match' },
    { user: 'einstein', correct: 'Albert Einstein', description: 'Partial match' }
  ];

  const handleTest = () => {
    if (!userAnswer || !correctAnswer) return;

    const matchResult = answerMatcher.checkAnswer(userAnswer, correctAnswer);
    setResult({
      ...matchResult,
      userAnswer,
      correctAnswer
    });
  };

  const runDemoTests = () => {
    const results = demoTestCases.map(testCase => {
      const matchResult = answerMatcher.checkAnswer(testCase.user, testCase.correct);
      return {
        ...testCase,
        result: matchResult
      };
    });
    setTestCases(results);
  };

  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case 'exact':
      case 'exact_case_insensitive':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'high':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const getMethodIcon = (method) => {
    switch (method) {
      case 'exact_match':
      case 'case_insensitive':
        return <Target className="w-4 h-4" />;
      case 'fuzzy_match':
        return <Brain className="w-4 h-4" />;
      case 'substring_match':
      case 'partial_match':
        return <Eye className="w-4 h-4" />;
      default:
        return <Zap className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">
              Fuzzy Answer Matching Demo
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Test the intelligent answer matching system that allows for typos, case differences, 
              and common variations in quiz answers.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Interactive Test */}
            <Card className="backdrop-blur-sm bg-white/10 border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-6 h-6 text-purple-300" />
                  Interactive Test
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="userAnswer" className="text-blue-100">User's Answer</Label>
                    <Input
                      id="userAnswer"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="Enter the user's answer..."
                      className="bg-white/10 border-white/30 text-white placeholder:text-blue-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="correctAnswer" className="text-blue-100">Correct Answer</Label>
                    <Input
                      id="correctAnswer"
                      value={correctAnswer}
                      onChange={(e) => setCorrectAnswer(e.target.value)}
                      placeholder="Enter the correct answer..."
                      className="bg-white/10 border-white/30 text-white placeholder:text-blue-200"
                    />
                  </div>
                  <Button
                    onClick={handleTest}
                    disabled={!userAnswer || !correctAnswer}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Test Match
                  </Button>
                </div>

                {result && (
                  <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center gap-2 mb-3">
                      {result.isMatch ? (
                        <CheckCircle className="w-6 h-6 text-green-400" />
                      ) : (
                        <AlertCircle className="w-6 h-6 text-red-400" />
                      )}
                      <span className="text-lg font-semibold">
                        {result.isMatch ? 'Match Found!' : 'No Match'}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-blue-200">Confidence:</span>
                        <Badge className={getConfidenceColor(result.confidence)}>
                          {result.confidence.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-blue-200">Method:</span>
                        <Badge variant="outline" className="border-white/30 text-white flex items-center gap-1">
                          {getMethodIcon(result.method)}
                          {result.method.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-blue-200">Match Score:</span>
                        <span className="font-mono text-white">
                          {(result.score * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Demo Test Cases */}
            <Card className="backdrop-blur-sm bg-white/10 border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-6 h-6 text-green-300" />
                  Demo Test Cases
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={runDemoTests}
                  className="w-full mb-4 bg-green-600 hover:bg-green-700 text-white"
                >
                  Run Demo Tests
                </Button>

                {testCases.length > 0 && (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {testCases.map((testCase, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border transition-all ${
                          testCase.result.isMatch
                            ? 'bg-green-500/10 border-green-500/30'
                            : 'bg-red-500/10 border-red-500/30'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {testCase.result.isMatch ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-400" />
                          )}
                          <span className="text-sm font-medium text-white">
                            {testCase.description}
                          </span>
                        </div>
                        <div className="text-xs space-y-1 text-blue-200">
                          <div>User: "<span className="text-white">{testCase.user}</span>"</div>
                          <div>Correct: "<span className="text-white">{testCase.correct}</span>"</div>
                          {testCase.result.isMatch && (
                            <div className="flex gap-2 mt-2">
                              <Badge 
                                size="sm" 
                                className={getConfidenceColor(testCase.result.confidence)}
                              >
                                {testCase.result.confidence}
                              </Badge>
                              <Badge 
                                size="sm" 
                                variant="outline" 
                                className="border-white/30 text-white text-xs"
                              >
                                {testCase.result.method.replace('_', ' ')}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Features Overview */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <Card className="backdrop-blur-sm bg-white/10 border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Brain className="w-5 h-5 text-purple-300" />
                  Smart Matching
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-blue-100">
                <p>• Handles typos and spelling mistakes</p>
                <p>• Case-insensitive matching</p>
                <p>• Number word conversions (3 ↔ three)</p>
                <p>• Word order flexibility</p>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-white/10 border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="w-5 h-5 text-green-300" />
                  Confidence Levels
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-blue-100">
                <p>• <span className="text-green-300">Exact:</span> Perfect matches</p>
                <p>• <span className="text-blue-300">High:</span> Very close matches</p>
                <p>• <span className="text-yellow-300">Medium:</span> Good matches</p>
                <p>• <span className="text-orange-300">Low:</span> Acceptable matches</p>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-white/10 border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Zap className="w-5 h-5 text-yellow-300" />
                  Real-time Feedback
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-blue-100">
                <p>• Instant match validation</p>
                <p>• Detailed match explanations</p>
                <p>• Visual confidence indicators</p>
                <p>• Match method transparency</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}