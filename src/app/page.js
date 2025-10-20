"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import PdfDropzone from "@/components/pdf-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Navbar from "@/components/nav"
import LoadingSpinner from "@/components/loader"
import { uploadFile, resetUploadState } from "@/redux/slices/pdfslice"

export default function Home() {
  const router = useRouter()
  const dispatch = useDispatch()
  const [selectedFile, setSelectedFile] = useState(null)
  const [fileName, setFileName] = useState("Upload PDF file")
  const { loading, uploadSuccess, pdfName, error } = useSelector((state) => state.upload)

  const handleSelect = (file) => {
    if (file) {
      setSelectedFile(file)
      setFileName(file.name)
      console.log("Selected file:", file)
    }
  }

  const handleSubmit = () => {
    if (!selectedFile) return
    dispatch(uploadFile(selectedFile))
    // Don't redirect immediately - let useEffect handle it after successful upload
  }

  // Handle redirect after successful upload
  useEffect(() => {
    if (uploadSuccess && pdfName) {
      setTimeout(() => {
        router.push("/select")
      }, 1000) // Small delay to show success state
    }
  }, [uploadSuccess, pdfName, router])

  // Reset upload state when component mounts
  useEffect(() => {
    dispatch(resetUploadState())
  }, [dispatch])

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-indigo-700">
      <Navbar />
      <main className="container mx-auto px-4 py-16 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Upload PDF</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <PdfDropzone onFileSelected={handleSelect} />
            <p className="text-sm text-gray-600 truncate text-center" aria-live="polite">
              {fileName}
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            {error && (
              <div className="w-full p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}
            <Button
              onClick={handleSubmit}
              disabled={!selectedFile || loading || uploadSuccess}
              className={`w-full text-white transition-colors ${
                uploadSuccess 
                  ? "bg-green-600 hover:bg-green-700" 
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner />
                  Uploading...
                </div>
              ) : uploadSuccess ? (
                <div className="flex items-center gap-2">
                  ✓ Upload Complete! Redirecting...
                </div>
              ) : (
                "Submit"
              )}
            </Button>
            <Button
              onClick={() => router.push("/multiplayer")}
              variant="outline"
              className="w-full border-indigo-300 text-indigo-600 hover:bg-indigo-50"
            >
              Play Multiplayer
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}