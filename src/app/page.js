"use client"
import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import { uploadFile } from "@/redux/slices/pdfslice"
import LoadingSpinner from "@/components/loader"
import Navbar from "@/components/nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileUp, Upload } from "lucide-react"

export default function Home() {
  const router = useRouter()
  const [selectedFile, setSelectedFile] = useState(null)
  const [fileName, setFileName] = useState("Upload PDF file")
  const dispatch = useDispatch()
  const { loading } = useSelector((state) => state.upload)

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setFileName(file.name)
      console.log("Selected file:", file)
    }
  }

  const handleSubmit = () => {
    if (!selectedFile) return
    dispatch(uploadFile(selectedFile))
    router.push("/select")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-indigo-700">
      <Navbar />
      <main className="container mx-auto px-4 py-16 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Upload PDF</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <FileUp className="w-16 h-16 text-indigo-600 animate-bounce" />
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <Label htmlFor="pdfUpload" className="cursor-pointer">
                    <div className="flex items-center space-x-2 bg-indigo-100 hover:bg-indigo-200 transition-colors duration-200 px-4 py-2 rounded-md">
                      <Upload className="w-5 h-5 text-indigo-600" />
                      <span className="text-indigo-600 font-medium">Choose File</span>
                    </div>
                  </Label>
                  <Input
                    id="pdfUpload"
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <p className="text-sm text-gray-600 truncate max-w-[200px]">{fileName}</p>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button
              onClick={handleSubmit}
              disabled={!selectedFile || loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Submit
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}

