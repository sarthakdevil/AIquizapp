"use client"
import { useCallback, useRef, useState } from "react"
import { FileUp } from "lucide-react"

export default function PdfDropzone({
  onFileSelected,
  accept = "application/pdf",
  ariaLabel = "Drag and drop a PDF file here, or click to browse",
}) {
  const inputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState(null)

  const openFileDialog = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const validateAndSelect = useCallback(
    (file) => {
      if (!file) return
      // Validate MIME type or fallback to extension check
      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
      if (!isPdf) {
        setError("Please select a valid PDF file.")
        return
      }
      setError(null)
      onFileSelected(file)
    },
    [onFileSelected],
  )

  const handleInputChange = useCallback(
    (e) => {
      const file = e.target.files?.[0]
      validateAndSelect(file)
    },
    [validateAndSelect],
  )

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
      const file = e.dataTransfer.files?.[0]
      validateAndSelect(file)
    },
    [validateAndSelect],
  )

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        openFileDialog()
      }
    },
    [openFileDialog],
  )

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        id="pdf-drop-input"
        type="file"
        accept={accept}
        className="sr-only"
        onChange={handleInputChange}
      />
      <div
        role="button"
        tabIndex={0}
        aria-label={ariaLabel}
        onClick={openFileDialog}
        onKeyDown={handleKeyDown}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={[
          "flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-6 text-center",
          "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50",
          // use original page colors: indigo + neutrals
          "bg-white text-gray-700 border-indigo-300 hover:bg-indigo-50 hover:border-indigo-500",
          isDragging ? "border-indigo-600 bg-indigo-50" : "",
        ].join(" ")}
      >
        <FileUp className="w-16 h-16 text-indigo-600 animate-bounce" aria-hidden="true" />
        <div className="space-y-1">
          <p className="font-medium text-gray-700">Drag and drop your PDF here</p>
          <p className="text-sm text-gray-600">or click to browse your device</p>
        </div>
        <p className="text-xs text-gray-500">Only PDF files are supported</p>
      </div>
      {error ? (
        <p className="mt-2 text-sm text-gray-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
