"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Typography from "@mui/material/Typography"
import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"
import { useSelector } from "react-redux"
import { Clock, CheckCircle } from "lucide-react"

export default function Questions() {
  const router = useRouter()
  const questionsData = useSelector((state) => state.upload.questionsAndAnswers)
  const quizTime = useSelector((state) => state.upload.quizTime)
  const quizName = useSelector((state) => state.upload.quiz_name)
  const [userAnswers, setUserAnswers] = useState({})
  const [error, setError] = useState(null)
  const [showAnswers, setShowAnswers] = useState(false)
  const [timeLeft, setTimeLeft] = useState(quizTime)

  useEffect(() => {
    if (!questionsData) {
      router.push("/")
    } else {
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
      setShowAnswers(true)
    } catch (error) {
      console.error("Error submitting answers:", error)
      setError("An error occurred while submitting your answers.")
      router.push("/")
    }
  }

  if (!questionsData) {
    return null
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
              <Typography variant="body1" className="font-semibold text-gray-800 mb-2">
                {index + 1}. {qa.question}
              </Typography>
              {!showAnswers ? (
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Type your answer here"
                  onChange={(e) => handleChange(qa.question, e.target.value)}
                  multiline
                  rows={2}
                  className="bg-white"
                />
              ) : (
                <div className="mt-2 p-3 bg-green-50 rounded border border-green-200">
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-1" />
                    <Typography variant="body2" className="text-gray-700">
                      {qa.answer}
                    </Typography>
                  </div>
                </div>
              )}
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

