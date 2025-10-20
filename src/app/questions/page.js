"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Typography from "@mui/material/Typography"
import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"
import { useSelector } from "react-redux"
import { Clock, CheckCircle, AlertCircle } from "lucide-react"

export default function Questions() {
  const router = useRouter()
  const questionsData = useSelector((state) => state.upload.questionsAndAnswers)
  const quizTime = useSelector((state) => state.upload.quizTime)
  const quizName = useSelector((state) => state.upload.quiz_name)
  const [userAnswers, setUserAnswers] = useState({})
  const [answerResults, setAnswerResults] = useState({})
  const [error, setError] = useState(null)
  const [showAnswers, setShowAnswers] = useState(false)
  const [timeLeft, setTimeLeft] = useState(quizTime)

  useEffect(() => {
    // Check if questionsData exists and has questions
    if (!questionsData || !questionsData.questions_and_answers || questionsData.questions_and_answers.length === 0) {
      // Try to load from localStorage as fallback
      const storedQuiz = localStorage.getItem('currentQuiz');
      if (storedQuiz) {
        try {
          const parsedQuiz = JSON.parse(storedQuiz);
          // You would dispatch this to Redux here
          console.log('Loading quiz from localStorage:', parsedQuiz);
        } catch (error) {
          console.error('Error parsing stored quiz:', error);
          router.push("/");
          return;
        }
      } else {
        router.push("/");
        return;
      }
    } else {
      setTimeLeft(quizTime || 300); // Default 5 minutes if no time specified
    }

    const handleBackNavigation = (event) => {
      event.preventDefault()
      router.push("/")
    }

    window.addEventListener("popstate", handleBackNavigation)

    return () => {
      window.removeEventListener("popstate", handleBackNavigation)
    }
  }, [questionsData, quizTime, router])

  useEffect(() => {
    if (timeLeft > 0 && !showAnswers) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    } else if (timeLeft === 0) {
      handleSubmit()
    }
  }, [timeLeft, showAnswers])

  const handleChange = (question, value) => {
    setUserAnswers((prev) => ({ ...prev, [question]: value }))
  }

  const handleSubmit = async () => {
    try {
      console.log("User Answers:", userAnswers)
      
      // Check answers - handle both multiple choice and text answers
      const results = {}
      
      // Safety check
      if (!questionsData?.questions_and_answers) {
        console.error('No questions data available for submission');
        setError('Quiz data is missing. Please reload the page.');
        return;
      }
      
      questionsData.questions_and_answers.forEach((qa, index) => {
        const userAnswer = userAnswers[qa.question] || ""
        
        // All questions are now MCQ format from the 3-stage pipeline
        const isCorrect = userAnswer === qa.correct_answer
        results[qa.question] = {
          isMatch: isCorrect,
          method: 'multiple_choice',
          confidence: isCorrect ? 'exact' : 'none',
          correctAnswer: qa.correct_answer,
          correctAnswerText: qa.options[qa.correct_answer],
          userAnswer: userAnswer,
          userAnswerText: qa.options[userAnswer] || 'No selection'
        }
      })
      
      setAnswerResults(results)
      setShowAnswers(true)
    } catch (error) {
      console.error("Error submitting answers:", error)
      setError("An error occurred while submitting your answers.")
      router.push("/")
    }
  }

  // Show loading or redirect if no questions data
  if (!questionsData || !questionsData.questions_and_answers || questionsData.questions_and_answers.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">No Quiz Data Available</h2>
          <p className="mb-6">Please create or select a quiz to start playing.</p>
          <Button
            onClick={() => router.push('/')}
            className="bg-white text-blue-600 hover:bg-gray-100"
          >
            Go Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Typography variant="h3" className="text-white text-center mb-8 font-bold">
          {quizName || "Quiz"}
        </Typography>
        <div className="bg-white rounded-lg shadow-xl p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <Typography variant="h5" className="text-gray-800 font-semibold">
              Answer the Questions
            </Typography>
            <div className="flex items-center text-gray-600">
              <Clock className="w-5 h-5 mr-2" />
              <Typography variant="body1">Time Left: {timeLeft} seconds</Typography>
            </div>
          </div>

          {error && (
            <Typography variant="body1" className="text-red-600 mb-4 p-3 bg-red-100 rounded">
              {error}
            </Typography>
          )}

          {questionsData.questions_and_answers.map((qa, index) => (
            <div key={index} className="mb-6 p-4 bg-gray-50 rounded-lg">
              <Typography variant="body1" className="font-semibold text-gray-800 mb-4">
                {index + 1}. {qa.question}
              </Typography>
              
              {/* Multiple Choice Questions (All questions are now MCQ format) */}
              <div>
                {!showAnswers ? (
                  <div className="space-y-3">
                    {Object.entries(qa.options).map(([letter, option]) => (
                      <div
                        key={letter}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                          userAnswers[qa.question] === letter
                            ? 'bg-blue-100 border-blue-500 shadow-md'
                            : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                        onClick={() => handleChange(qa.question, letter)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            userAnswers[qa.question] === letter
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            {letter}
                          </div>
                          <span className="text-gray-800">{option}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(qa.options).map(([letter, option]) => {
                      const isCorrect = letter === qa.correct_answer;
                      const wasSelected = userAnswers[qa.question] === letter;
                      const isUserCorrect = userAnswers[qa.question] === qa.correct_answer;
                      
                      return (
                        <div
                          key={letter}
                          className={`p-3 rounded-lg border-2 ${
                            isCorrect
                              ? 'bg-green-100 border-green-500'
                              : wasSelected && !isUserCorrect
                              ? 'bg-red-100 border-red-500'
                              : 'bg-gray-100 border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              isCorrect
                                ? 'bg-green-500 text-white'
                                : wasSelected && !isUserCorrect
                                ? 'bg-red-500 text-white'
                                : 'bg-gray-300 text-gray-600'
                            }`}>
                              {letter}
                            </div>
                            <span className="flex-1 text-gray-800">{option}</span>
                            {isCorrect && <CheckCircle className="w-6 h-6 text-green-600" />}
                            {wasSelected && !isUserCorrect && <AlertCircle className="w-6 h-6 text-red-600" />}
                          </div>
                        </div>
                      );
                    })}
                    
                    <div className={`p-3 mt-4 rounded border ${
                      answerResults[qa.question]?.isMatch 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-start">
                        {answerResults[qa.question]?.isMatch ? (
                          <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-1" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-500 mr-2 mt-1" />
                        )}
                        <div className="flex-1">
                          <Typography variant="body2" className="text-gray-700 font-medium">
                            {answerResults[qa.question]?.isMatch ? 'Correct! 🎯' : 'Incorrect ❌'}
                          </Typography>
                          <Typography variant="body2" className="text-gray-600 text-sm">
                            Your choice: {userAnswers[qa.question] ? `${userAnswers[qa.question]}) ${qa.options[userAnswers[qa.question]]}` : 'No answer'}
                          </Typography>
                          <Typography variant="body2" className="text-gray-700">
                            Correct answer: {qa.correct_answer}) {qa.options[qa.correct_answer]}
                          </Typography>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {!showAnswers && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              className="w-full py-3 mt-4 bg-blue-600 hover:bg-blue-700 transition-colors duration-300"
            >
              Submit Answers
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

