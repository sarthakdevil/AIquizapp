"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import { analyzePdf } from "@/redux/slices/pdfslice"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

export default function Requirements({ onChange }) {
  const dispatch = useDispatch()
  const router = useRouter()
  const pdfFilename = useSelector((state) => state.upload.pdfName)
  const questionsAndAnswers = useSelector((state) => state.upload.questionsAndAnswers)
  const [questionCount, setQuestionCount] = useState(1)
  const [time, setTime] = useState("")
  const [quizName, setQuizName] = useState("")

  useEffect(() => {
    if (!pdfFilename) {
      router.push("/")
    }
  }, [pdfFilename, router])

  useEffect(() => {
    if (questionsAndAnswers) {
      router.push("/questions")
    }
  }, [questionsAndAnswers, router])

  const handleSliderChange = (newValue) => {
    const value = newValue[0]
    setQuestionCount(value)
    if (onChange) onChange({ questionCount: value })
  }

  const handleTimeChange = (e) => {
    setTime(e.target.value)
  }

  const handleQuizNameChange = (e) => {
    setQuizName(e.target.value)
  }

  const handleSubmit = () => {
    if (pdfFilename) {
      console.log(pdfFilename, quizName, questionCount, time)

      const payload = {
        pdfFilename: pdfFilename,
        quizName: quizName || "Untitled Quiz",
        numQuestions: questionCount,
        time: time || null,
      }

      dispatch(analyzePdf(payload))
    }
  }

  if (!pdfFilename) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-indigo-700 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Quiz Requirements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="quizName">Quiz Name</Label>
            <Input id="quizName" placeholder="Enter quiz name" value={quizName} onChange={handleQuizNameChange} />
          </div>

          <div className="space-y-2">
            <Label>Number of Questions</Label>
            <Slider value={[questionCount]} onValueChange={handleSliderChange} max={10} step={1} className="w-full" />
            <p className="text-sm text-gray-500 text-center">
              Selected: {questionCount} question{questionCount > 1 ? "s" : ""}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeLimit">Time Limit (minutes, optional)</Label>
            <Input
              id="timeLimit"
              type="number"
              placeholder="Enter time limit"
              value={time}
              onChange={handleTimeChange}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit} className="w-full">
            Generate Quiz
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

Requirements.metadata = {
  title: "Quiz Requirements",
  description: "Set the requirements for your quiz",
}