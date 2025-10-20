"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Typography from "@mui/material/Typography"
import Button from "@mui/material/Button"
import Radio from "@mui/material/Radio"
import RadioGroup from "@mui/material/RadioGroup"
import FormControlLabel from "@mui/material/FormControlLabel"
import FormControl from "@mui/material/FormControl"
import { useSelector } from "react-redux"
import { Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

export default function Questions() {
  const router = useRouter()
  const currentQuiz = useSelector((state) => state.question.currentQuiz)
  const [userAnswers, setUserAnswers] = useState({})
  const [error, setError] = useState(null)
  const [showAnswers, setShowAnswers] = useState(false)
  const [timeLeft, setTimeLeft] = useState(currentQuiz?.quizTime || 0)
  const [score, setScore] = useState(0)

  useEffect(() => {
    if (!currentQuiz) {
      router.push("/")
    } else {
      // Handle quiz_time which can be a number or string like "No time specified"
      const quizTime = typeof currentQuiz.quizTime === 'number' ? currentQuiz.quizTime : 0
      setTimeLeft(quizTime)
    }

    const handleBackNavigation = (event) => {
      event.preventDefault()
      router.push("/")
    }

    window.addEventListener("popstate", handleBackNavigation)

    return () => {
      window.removeEventListener("popstate", handleBackNavigation)
    }
  }, [currentQuiz, router])

  useEffect(() => {
    // Only start timer if timeLeft > 0 and quiz has a numeric time limit
    const hasTimeLimit = typeof currentQuiz?.quizTime === 'number' && currentQuiz.quizTime > 0
    if (timeLeft > 0 && !showAnswers && hasTimeLimit) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    } else if (timeLeft === 0 && hasTimeLimit) {
      // Only auto-submit if there was actually a numeric time limit
      handleSubmit()
    }
  }, [timeLeft, showAnswers, currentQuiz?.quizTime])

  const handleChange = (questionIndex, selectedOption) => {
    setUserAnswers((prev) => ({ ...prev, [questionIndex]: selectedOption }))
  }

  const calculateScore = () => {
    let correctAnswers = 0
    currentQuiz.questionsAndAnswers.forEach((qa, index) => {
      if (userAnswers[index] === qa.correct_answer) {
        correctAnswers++
      }
    })
    setScore(correctAnswers)
    return correctAnswers
  }

  const handleSubmit = async () => {
    try {
      const finalScore = calculateScore()
      console.log("User Answers:", userAnswers)
      console.log("Score:", finalScore, "/", currentQuiz.questionsAndAnswers.length)
      setShowAnswers(true)
    } catch (error) {
      console.error("Error submitting answers:", error)
      setError("An error occurred while submitting your answers.")
      router.push("/")
    }
  }

  if (!currentQuiz) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Typography variant="h3" className="text-white text-center mb-8 font-bold">
          {currentQuiz.quizName || "Quiz"}
        </Typography>
        <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <Typography variant="h5" className="text-gray-800 font-semibold">
              Answer the Questions
            </Typography>
            <div className={`flex items-center text-gray-600 px-4 py-2 rounded-full ${
              typeof currentQuiz?.quizTime === 'number' && currentQuiz.quizTime > 0 ? 'bg-blue-100' : 'bg-green-100'
            }`}>
              <Clock className={`w-5 h-5 mr-2 ${
                typeof currentQuiz?.quizTime === 'number' && currentQuiz.quizTime > 0 ? 'text-blue-600' : 'text-green-600'
              }`} />
              <Typography variant="body1" className="font-medium">
                {typeof currentQuiz?.quizTime === 'number' && currentQuiz.quizTime > 0
                  ? `Time Left: ${timeLeft} seconds`
                  : currentQuiz?.quizTime || "No time limit"
                }
              </Typography>
            </div>
          </div>

          {error && (
            <div className="flex items-center bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
              <AlertTriangle className="w-5 h-5 mr-2" />
              <Typography variant="body1">{error}</Typography>
            </div>
          )}

          {showAnswers && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Typography variant="h6" className="text-center text-blue-800 font-bold">
                Quiz Results: {score} out of {currentQuiz.questionsAndAnswers.length} correct
              </Typography>
              <Typography variant="body2" className="text-center text-gray-600">
                Score: {Math.round((score / currentQuiz.questionsAndAnswers.length) * 100)}%
              </Typography>
            </div>
          )}

          {currentQuiz.questionsAndAnswers.map((qa, index) => {
            const userAnswer = userAnswers[index]
            const isCorrect = userAnswer === qa.correct_answer
            const hasAnswered = userAnswer !== undefined

            return (
              <div key={index} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <Typography variant="body1" className="font-semibold text-gray-800 mb-4">
                  {index + 1}. {qa.question}
                </Typography>
                
                {!showAnswers ? (
                  <FormControl component="fieldset" className="w-full">
                    <RadioGroup
                      value={userAnswer || ""}
                      onChange={(e) => handleChange(index, e.target.value)}
                    >
                      {qa.options && Object.entries(qa.options).map(([optionLetter, optionText]) => {
                        return (
                          <FormControlLabel
                            key={optionLetter}
                            value={optionLetter}
                            control={<Radio color="primary" />}
                            label={`${optionLetter}. ${optionText}`}
                            className="mb-2 ml-0"
                            sx={{
                              '& .MuiFormControlLabel-label': {
                                fontSize: '0.95rem',
                                color: '#374151'
                              }
                            }}
                          />
                        )
                      })}
                    </RadioGroup>
                  </FormControl>
                ) : (
                  <div className="space-y-2">
                    {qa.options && Object.entries(qa.options).map(([optionLetter, optionText]) => {
                      const isThisCorrect = optionLetter === qa.correct_answer
                      const isUserChoice = optionLetter === userAnswer
                      
                      let bgColor = "bg-gray-100"
                      let textColor = "text-gray-700"
                      let icon = null
                      
                      if (isThisCorrect) {
                        bgColor = "bg-green-100 border-green-300"
                        textColor = "text-green-800"
                        icon = <CheckCircle className="w-5 h-5 text-green-500" />
                      } else if (isUserChoice && !isThisCorrect) {
                        bgColor = "bg-red-100 border-red-300"
                        textColor = "text-red-800"
                        icon = <XCircle className="w-5 h-5 text-red-500" />
                      }
                      
                      return (
                        <div
                          key={optionLetter}
                          className={`p-3 rounded border ${bgColor} ${textColor} flex items-start`}
                        >
                          {icon && <div className="mr-2 mt-0.5">{icon}</div>}
                          <Typography variant="body2" className="flex-1">
                            {optionLetter}. {optionText}
                          </Typography>
                        </div>
                      )
                    })}
                    
                    {!hasAnswered && (
                      <div className="p-3 bg-yellow-50 border border-yellow-300 rounded">
                        <Typography variant="body2" className="text-yellow-800">
                          No answer selected
                        </Typography>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}

          {!showAnswers ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              className="w-full py-3 mt-4 bg-blue-600 hover:bg-blue-700 transition-colors duration-300"
            >
              Submit Answers
            </Button>
          ) : (
            <div className="mt-6 flex flex-col gap-3">
              <Button
                variant="contained"
                color="primary"
                onClick={() => router.push("/")}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 transition-colors duration-300"
              >
                Back to Home
              </Button>
              <Button
                variant="outlined"
                onClick={() => router.push("/select")}
                className="w-full py-3 border-blue-600 text-blue-600 hover:bg-blue-50 transition-colors duration-300"
              >
                Take Another Quiz
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

