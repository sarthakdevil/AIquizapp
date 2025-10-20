"use client"

import { useState } from "react"
import { Typography, Slider, TextField, Button, Alert, Select, MenuItem, FormControl, InputLabel } from "@mui/material"
import Navbar from "@/components/nav"
import { useDispatch, useSelector } from "react-redux"
import { createQuiz } from "@/redux/slices/questionslice"
import { Save } from "lucide-react"

const CreateManualQuiz = () => {
  const dispatch = useDispatch()
  const { quizId, error, loading } = useSelector((state) => state.question)

  const [quizName, setQuizName] = useState("")
  const [questionCount, setQuestionCount] = useState(1)
  const [questionsAndAnswers, setQuestionsAndAnswers] = useState([
    { 
      question: "", 
      options: { A: "", B: "", C: "", D: "" }, 
      correct_answer: "A",
      answer: ""
    }
  ])

  const handleQuestionCountChange = (event, value) => {
    setQuestionCount(value)
    setQuestionsAndAnswers((prev) => {
      const newQuestions = [...prev]
      if (value > newQuestions.length) {
        for (let i = newQuestions.length; i < value; i++) {
          newQuestions.push({ 
            question: "", 
            options: { A: "", B: "", C: "", D: "" }, 
            correct_answer: "A",
            answer: ""
          })
        }
      } else {
        newQuestions.splice(value)
      }
      return newQuestions
    })
  }

  const handleInputChange = (index, type, value) => {
    const updatedQuestions = [...questionsAndAnswers]
    if (type.startsWith('option_')) {
      const optionKey = type.split('_')[1] // Gets A, B, C, or D
      updatedQuestions[index].options[optionKey] = value
      // Update the answer field when correct option changes
      if (updatedQuestions[index].correct_answer === optionKey) {
        updatedQuestions[index].answer = value
      }
    } else if (type === 'correct_answer') {
      updatedQuestions[index].correct_answer = value
      updatedQuestions[index].answer = updatedQuestions[index].options[value]
    } else {
      updatedQuestions[index][type] = value
    }
    setQuestionsAndAnswers(updatedQuestions)
  }

  const handleSaveQuiz = () => {
    dispatch(createQuiz({ quizName, questionsAndAnswers }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Typography variant="h3" className="text-white text-center mb-8 font-bold">
          Create Your Quiz
        </Typography>

        <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8">
          <TextField
            fullWidth
            variant="outlined"
            label="Quiz Name"
            value={quizName}
            onChange={(e) => setQuizName(e.target.value)}
            className="mb-6"
          />

          <div className="mb-6">
            <Typography variant="h6" className="mb-2 text-gray-700">
              Number of Questions: {questionCount}
            </Typography>
            <Slider
              value={questionCount}
              onChange={handleQuestionCountChange}
              min={1}
              max={20}
              step={1}
              marks
              valueLabelDisplay="auto"
              className="text-blue-600"
            />
          </div>

          {questionsAndAnswers.map((qa, index) => (
            <div key={index} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <Typography variant="subtitle1" className="mb-2 font-semibold text-gray-700">
                Question {index + 1}
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                label="Question"
                value={qa.question}
                onChange={(e) => handleInputChange(index, "question", e.target.value)}
                className="mb-3"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Option A"
                  value={qa.options.A}
                  onChange={(e) => handleInputChange(index, "option_A", e.target.value)}
                />
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Option B"
                  value={qa.options.B}
                  onChange={(e) => handleInputChange(index, "option_B", e.target.value)}
                />
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Option C"
                  value={qa.options.C}
                  onChange={(e) => handleInputChange(index, "option_C", e.target.value)}
                />
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Option D"
                  value={qa.options.D}
                  onChange={(e) => handleInputChange(index, "option_D", e.target.value)}
                />
              </div>
              
              <FormControl fullWidth variant="outlined">
                <InputLabel>Correct Answer</InputLabel>
                <Select
                  value={qa.correct_answer}
                  onChange={(e) => handleInputChange(index, "correct_answer", e.target.value)}
                  label="Correct Answer"
                >
                  <MenuItem value="A">A: {qa.options.A || 'Option A'}</MenuItem>
                  <MenuItem value="B">B: {qa.options.B || 'Option B'}</MenuItem>
                  <MenuItem value="C">C: {qa.options.C || 'Option C'}</MenuItem>
                  <MenuItem value="D">D: {qa.options.D || 'Option D'}</MenuItem>
                </Select>
              </FormControl>
            </div>
          ))}

          {error && (
            <Alert severity="error" className="mb-4">
              {error}
            </Alert>
          )}

          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveQuiz}
            disabled={loading}
            className="w-full py-3 mt-6 bg-blue-600 hover:bg-blue-700 transition-colors duration-300"
            startIcon={<Save />}
          >
            {loading ? "Saving..." : "Save Quiz"}
          </Button>

          {quizId && (
            <Alert severity="success" className="mt-4">
              Quiz created successfully! Your quiz ID is: <strong>{quizId}</strong>
            </Alert>
          )}
        </div>
      </div>
    </div>
  )
}

export default CreateManualQuiz

