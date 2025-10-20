"use client"

import { useEffect } from "react"
import { useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Navbar from "@/components/nav"
import { Users, User, Play, Clock, FileText } from "lucide-react"

export default function QuizReady() {
  const router = useRouter()
  const questionsAndAnswers = useSelector((state) => state.upload.questionsAndAnswers)
  const quizName = useSelector((state) => state.upload.quiz_name)
  const quizTime = useSelector((state) => state.upload.quizTime)

  useEffect(() => {
    if (!questionsAndAnswers) {
      router.push("/")
    }
  }, [questionsAndAnswers, router])

  const handleSinglePlayer = () => {
    router.push("/questions")
  }

  const handleMultiplayer = () => {
    router.push("/multiplayer")
  }

  if (!questionsAndAnswers) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-indigo-700">
      <Navbar />
      <main className="container mx-auto px-4 py-16 flex items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 p-3 rounded-full">
                <FileText className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-gray-800 mb-2">
              Quiz Ready!
            </CardTitle>
            <p className="text-gray-600">
              Your quiz has been successfully created from the PDF
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Quiz Info */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <span className="font-semibold">Quiz Name:</span>
                <span className="text-gray-700">{quizName || "Untitled Quiz"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Play className="w-5 h-5 text-indigo-600" />
                <span className="font-semibold">Questions:</span>
                <span className="text-gray-700">{questionsAndAnswers.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                <span className="font-semibold">Time Limit:</span>
                <span className="text-gray-700">
                  {typeof quizTime === 'number' ? `${quizTime} seconds` : quizTime || "No time limit"}
                </span>
              </div>
            </div>

            {/* Play Options */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-center text-gray-800">
                How would you like to play?
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Single Player Option */}
                <Card className="border-2 border-gray-200 hover:border-indigo-300 transition-colors cursor-pointer group"
                      onClick={handleSinglePlayer}>
                  <CardContent className="p-6 text-center">
                    <div className="bg-indigo-100 group-hover:bg-indigo-200 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center transition-colors">
                      <User className="w-8 h-8 text-indigo-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Single Player</h4>
                    <p className="text-gray-600 text-sm">
                      Play the quiz by yourself at your own pace
                    </p>
                  </CardContent>
                </Card>

                {/* Multiplayer Option */}
                <Card className="border-2 border-gray-200 hover:border-green-300 transition-colors cursor-pointer group"
                      onClick={handleMultiplayer}>
                  <CardContent className="p-6 text-center">
                    <div className="bg-green-100 group-hover:bg-green-200 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center transition-colors">
                      <Users className="w-8 h-8 text-green-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Multiplayer</h4>
                    <p className="text-gray-600 text-sm">
                      Play with friends or join others online
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
              <Button
                onClick={handleSinglePlayer}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4" />
                Play Solo
              </Button>
              <Button
                onClick={handleMultiplayer}
                variant="outline"
                className="w-full border-green-500 text-green-600 hover:bg-green-50 flex items-center justify-center gap-2"
              >
                <Users className="w-4 h-4" />
                Play Multiplayer
              </Button>
            </div>
            
            <Button
              onClick={() => router.push("/")}
              variant="ghost"
              className="w-full text-gray-600 hover:text-gray-800"
            >
              Back to Home
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}