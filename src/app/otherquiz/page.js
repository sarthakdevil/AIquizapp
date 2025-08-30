"use client";
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import { fetchQuizzes, selectQuiz } from "@/redux/slices/questionslice"
import LoadingSpinner from "@/components/loader"
import Navbar from "@/components/nav"
import QuizSearchBar from "@/components/search"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const QuizNamesPage = () => {
  const dispatch = useDispatch()
  const router = useRouter()
  const { loading, error, allQuizzes } = useSelector((state) => state.question)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    dispatch(fetchQuizzes())
  }, [dispatch])

  const handleStartQuiz = (quizId) => {
    dispatch(selectQuiz(quizId))
    router.push(`/questions/${quizId}`)
  }

  const handleSearch = (term) => {
    setSearchTerm(term.toLowerCase())
  }

  const filteredQuizzes = allQuizzes.filter((quiz) => quiz.quizName.toLowerCase().includes(searchTerm))

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-900 to-indigo-700">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-900 to-indigo-700">
        <Card className="w-full max-w-md">
          <CardContent>
            <p className="text-center text-red-500">Error: {error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-indigo-700">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white text-center mb-8">All Quizzes</h1>
        <div className="mb-6">
          <QuizSearchBar onSearch={handleSearch} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => (
            <Card key={quiz.id} className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-indigo-700">{quiz.quizName}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Time: {quiz.quizTime} seconds</p>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                  onClick={() => handleStartQuiz(quiz.id)}
                >
                  Play Quiz
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}

export default QuizNamesPage

