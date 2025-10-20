"use client";
import { useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/nav";
import { useRouter } from "next/navigation";
import { Bug, Database, FileText } from "lucide-react";

export default function ReduxDebugPage() {
  const router = useRouter();
  
  // Get all Redux state data
  const questionsData = useSelector((state) => state.upload?.questionsAndAnswers);
  const quizTime = useSelector((state) => state.upload?.quizTime);
  const quizName = useSelector((state) => state.upload?.quiz_name);
  const pdfData = useSelector((state) => state.upload?.pdfData);
  const wholeState = useSelector((state) => state);

  // Get localStorage data
  const localStorageQuiz = typeof window !== 'undefined' 
    ? localStorage.getItem('currentQuiz')
    : null;
  
  let parsedLocalStorageQuiz = null;
  if (localStorageQuiz) {
    try {
      parsedLocalStorageQuiz = JSON.parse(localStorageQuiz);
    } catch (error) {
      console.error('Error parsing localStorage quiz:', error);
    }
  }

  const clearLocalStorage = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentQuiz');
      location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-2">
              <Bug className="w-8 h-8" />
              Redux State Debugger
            </h1>
            <p className="text-blue-200">Debug quiz data storage and identify issues</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Redux State */}
            <Card className="backdrop-blur-sm bg-white/10 border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-400" />
                  Redux Store State
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-green-300 mb-2">Questions Data:</h4>
                    <div className="bg-black/20 rounded p-3 text-sm font-mono">
                      {questionsData ? (
                        <div>
                          <p className="text-green-400">✓ Available</p>
                          <p>Questions: {questionsData.questions_and_answers?.length || 0}</p>
                          <p>Quiz Name: {questionsData.quiz_name || 'N/A'}</p>
                        </div>
                      ) : (
                        <p className="text-red-400">❌ Not available</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-yellow-300 mb-2">Quiz Time:</h4>
                    <div className="bg-black/20 rounded p-3 text-sm">
                      {quizTime ? (
                        <span className="text-green-400">✓ {quizTime} seconds</span>
                      ) : (
                        <span className="text-red-400">❌ Not set</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-purple-300 mb-2">Quiz Name:</h4>
                    <div className="bg-black/20 rounded p-3 text-sm">
                      {quizName ? (
                        <span className="text-green-400">✓ {quizName}</span>
                      ) : (
                        <span className="text-red-400">❌ Not set</span>
                      )}
                    </div>
                  </div>

                  <details className="mt-4">
                    <summary className="cursor-pointer text-blue-300 hover:text-blue-200">
                      Full Redux State (click to expand)
                    </summary>
                    <pre className="bg-black/40 rounded p-3 mt-2 text-xs overflow-auto max-h-64">
                      {JSON.stringify(wholeState, null, 2)}
                    </pre>
                  </details>
                </div>
              </CardContent>
            </Card>

            {/* Local Storage */}
            <Card className="backdrop-blur-sm bg-white/10 border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-400" />
                  Local Storage Fallback
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-green-300 mb-2">Stored Quiz:</h4>
                  <div className="bg-black/20 rounded p-3 text-sm">
                    {parsedLocalStorageQuiz ? (
                      <div>
                        <p className="text-green-400">✓ Available in localStorage</p>
                        <p>Quiz: {parsedLocalStorageQuiz.quiz_name}</p>
                        <p>Questions: {parsedLocalStorageQuiz.questions_and_answers?.length || 0}</p>
                        <p>Time: {parsedLocalStorageQuiz.quiz_time}s</p>
                        
                        {parsedLocalStorageQuiz.questions_and_answers?.[0] && (
                          <div className="mt-2 p-2 bg-white/10 rounded">
                            <p className="text-xs text-blue-200">First Question Preview:</p>
                            <p className="text-xs">{parsedLocalStorageQuiz.questions_and_answers[0].question}</p>
                            {parsedLocalStorageQuiz.questions_and_answers[0].options && (
                              <p className="text-xs text-purple-300">✓ Multiple Choice Format</p>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-red-400">❌ No data in localStorage</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={clearLocalStorage}
                    variant="outline"
                    className="w-full border-red-500/30 text-red-300 hover:bg-red-500/10"
                  >
                    Clear Local Storage
                  </Button>
                  
                  {parsedLocalStorageQuiz && (
                    <Button
                      onClick={() => {
                        // Load from localStorage and try to play
                        router.push('/questions');
                      }}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      Try Playing from localStorage
                    </Button>
                  )}
                </div>

                <details className="mt-4">
                  <summary className="cursor-pointer text-orange-300 hover:text-orange-200">
                    Full localStorage Data (click to expand)
                  </summary>
                  <pre className="bg-black/40 rounded p-3 mt-2 text-xs overflow-auto max-h-64">
                    {localStorageQuiz || 'null'}
                  </pre>
                </details>
              </CardContent>
            </Card>
          </div>

          {/* Solutions */}
          <Card className="backdrop-blur-sm bg-white/10 border-white/20 text-white mt-6">
            <CardHeader>
              <CardTitle>🛠️ Troubleshooting Solutions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-green-300 mb-2">If Redux is Empty:</h4>
                  <ul className="space-y-1 text-sm text-blue-200">
                    <li>• Navigate to /create and generate a new quiz</li>
                    <li>• Check if Redux store is properly connected</li>
                    <li>• Verify quiz creation workflow</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-orange-300 mb-2">If localStorage Has Data:</h4>
                  <ul className="space-y-1 text-sm text-blue-200">
                    <li>• Use the "Try Playing" button above</li>
                    <li>• Data should load automatically in /questions</li>
                    <li>• Consider implementing Redux hydration</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="flex gap-4 mt-6 justify-center">
            <Button
              onClick={() => router.push('/create')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Create New Quiz
            </Button>
            <Button
              onClick={() => router.push('/mcq-test')}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Test MCQ Format
            </Button>
            <Button
              onClick={() => router.push('/question-test')}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Test Question Generation
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}