"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/nav';
import LoadingSpinner from '@/components/loader';
import { FileText, Target, AlertCircle, CheckCircle, Calculator } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function QuestionGenerationTestPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState("Upload PDF file");
  const [numQuestions, setNumQuestions] = useState('5');
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
      console.log("Selected file:", file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a PDF file first');
      return;
    }

    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append('pdf_file', selectedFile);
      formData.append('filename', selectedFile.name);

      const response = await axios.post('http://localhost:8000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.msg === 'success') {
        setUploadedFileName(selectedFile.name);
        toast.success('PDF uploaded successfully!');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload PDF. Make sure the Python backend is running.');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleTestGeneration = async () => {
    if (!uploadedFileName) {
      toast.error('Please upload a PDF file first');
      return;
    }

    if (!numQuestions || parseInt(numQuestions) < 1) {
      toast.error('Please enter a valid number of questions');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('pdf_filename', uploadedFileName);
      formData.append('num_ques', numQuestions);

      const response = await axios.post('http://localhost:8000/debug-questions', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResult(response.data);
      
      if (response.data.success) {
        toast.success(`Generated ${response.data.generated_questions} questions!`);
      } else {
        toast.warning('Question generation completed with issues');
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Failed to generate questions. Make sure the Python backend is running.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-teal-900 to-blue-900">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">
              Question Generation Test
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Test the improved question generation that creates exactly the number of questions you request 
              (not per section/chunk of the PDF).
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Upload and Settings */}
            <Card className="backdrop-blur-sm bg-white/10 border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-6 h-6 text-green-300" />
                  Upload & Configure
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* File Upload */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="pdfUpload" className="text-blue-100">PDF File</Label>
                    <div className="flex gap-2">
                      <Input
                        id="pdfUpload"
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <Label 
                        htmlFor="pdfUpload" 
                        className="flex-1 cursor-pointer bg-white/10 border border-white/30 rounded-md px-3 py-2 text-white hover:bg-white/20 transition-colors"
                      >
                        {fileName}
                      </Label>
                      <Button
                        onClick={handleUpload}
                        disabled={!selectedFile || uploadLoading}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {uploadLoading ? <LoadingSpinner /> : 'Upload'}
                      </Button>
                    </div>
                    {uploadedFileName && (
                      <div className="flex items-center gap-2 text-green-300 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        Uploaded: {uploadedFileName}
                      </div>
                    )}
                  </div>

                  {/* Number of Questions */}
                  <div className="space-y-2">
                    <Label htmlFor="numQuestions" className="text-blue-100">
                      Number of Questions (Total)
                    </Label>
                    <Input
                      id="numQuestions"
                      type="number"
                      min="1"
                      max="50"
                      value={numQuestions}
                      onChange={(e) => setNumQuestions(e.target.value)}
                      className="bg-white/10 border-white/30 text-white placeholder:text-blue-200"
                      placeholder="Enter total number of questions"
                    />
                  </div>

                  <Button
                    onClick={handleTestGeneration}
                    disabled={!uploadedFileName || loading || !numQuestions}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <LoadingSpinner />
                        Generating Questions...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Test Question Generation
                      </div>
                    )}
                  </Button>
                </div>

                {/* How It Works */}
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <Calculator className="w-4 h-4" />
                    How the Fix Works:
                  </h4>
                  <div className="space-y-2 text-sm text-blue-100">
                    <div className="flex gap-2">
                      <span className="text-red-300">❌ Before:</span>
                      <span>Generated {numQuestions || 'N'} questions per PDF section/chunk</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-green-300">✅ After:</span>
                      <span>Generates exactly {numQuestions || 'N'} questions total from entire PDF</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            <Card className="backdrop-blur-sm bg-white/10 border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-6 h-6 text-blue-300" />
                  Generation Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result ? (
                  <div className="space-y-4">
                    {/* Summary */}
                    <div className={`p-4 rounded-lg border ${
                      result.success 
                        ? 'bg-green-500/10 border-green-500/30' 
                        : 'bg-red-500/10 border-red-500/30'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        {result.success ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-400" />
                        )}
                        <span className="font-semibold">
                          {result.success ? 'Success!' : 'Issues Detected'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-blue-200">Requested:</span>
                          <span className="ml-2 font-bold">{result.requested_questions}</span>
                        </div>
                        <div>
                          <span className="text-blue-200">Generated:</span>
                          <span className="ml-2 font-bold">{result.generated_questions}</span>
                        </div>
                      </div>
                      <p className="text-xs text-blue-200 mt-2">{result.message}</p>
                    </div>

                    {/* Accuracy Badge */}
                    <div className="flex justify-center">
                      <Badge 
                        className={`text-lg px-4 py-2 ${
                          result.generated_questions === result.requested_questions
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : result.generated_questions >= result.requested_questions * 0.8
                            ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                            : 'bg-red-100 text-red-800 border-red-200'
                        }`}
                      >
                        {result.generated_questions === result.requested_questions 
                          ? '🎯 Perfect Match!' 
                          : `${Math.round((result.generated_questions / result.requested_questions) * 100)}% Accuracy`
                        }
                      </Badge>
                    </div>

                    {/* Questions Preview */}
                    {result.questions_preview && result.questions_preview.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-white">Questions Preview:</h4>
                          <Badge className={`text-xs ${
                            result.format === 'multiple_choice' 
                              ? 'bg-purple-100 text-purple-800 border-purple-200'
                              : 'bg-blue-100 text-blue-800 border-blue-200'
                          }`}>
                            {result.format === 'multiple_choice' ? '🔄 Multiple Choice' : '📝 Simple Q&A'}
                          </Badge>
                        </div>
                        <div className="space-y-3 max-h-80 overflow-y-auto">
                          {result.questions_preview.map((qa, index) => (
                            <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                              <div className="mb-3">
                                <span className="text-blue-200 font-medium">Q{index + 1}:</span>
                                <span className="ml-2 text-white text-sm">{qa.question}</span>
                              </div>
                              
                              {qa.options ? (
                                // Multiple Choice Format
                                <div className="space-y-2">
                                  {Object.entries(qa.options).map(([letter, option]) => (
                                    <div 
                                      key={letter} 
                                      className={`flex items-center gap-2 text-sm p-2 rounded ${
                                        letter === qa.correct_answer 
                                          ? 'bg-green-500/20 border border-green-500/30' 
                                          : 'bg-white/5'
                                      }`}
                                    >
                                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                        letter === qa.correct_answer 
                                          ? 'bg-green-500 text-white' 
                                          : 'bg-white/10 text-blue-200'
                                      }`}>
                                        {letter}
                                      </span>
                                      <span className={letter === qa.correct_answer ? 'text-green-300 font-medium' : 'text-blue-100'}>
                                        {option}
                                      </span>
                                      {letter === qa.correct_answer && (
                                        <CheckCircle className="w-4 h-4 text-green-400 ml-auto" />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                // Simple Q&A Format
                                <div className="text-sm mt-2">
                                  <span className="text-green-200">A:</span>
                                  <span className="ml-2 text-green-300 font-medium">{qa.answer}</span>
                                </div>
                              )}
                            </div>
                          ))}
                          {result.generated_questions > 3 && (
                            <div className="text-center text-blue-300 text-sm py-2">
                              ... and {result.generated_questions - 3} more questions
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-blue-200">
                    <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Upload a PDF and test question generation to see results here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Technical Explanation */}
          <div className="mt-12">
            <Card className="backdrop-blur-sm bg-white/10 border-white/20 text-white">
              <CardHeader>
                <CardTitle>🔧 Advanced Three-Stage Pipeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h4 className="font-semibold text-blue-300 mb-2 flex items-center gap-2">
                      <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
                      Chunk Generation
                    </h4>
                    <div className="space-y-1 text-xs text-blue-100">
                      <p>• Split large PDFs into smart chunks</p>
                      <p>• Generate questions from each section</p>
                      <p>• Collect candidate questions (~2× requested)</p>
                      <p>• Ensures full document coverage</p>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h4 className="font-semibold text-purple-300 mb-2 flex items-center gap-2">
                      <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
                      Smart Selection
                    </h4>
                    <div className="space-y-1 text-xs text-blue-100">
                      <p>• AI curates best questions from candidates</p>
                      <p>• Removes duplicates and low-quality items</p>
                      <p>• Ensures topic diversity and clarity</p>
                      <p>• Selects exactly N questions requested</p>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h4 className="font-semibold text-green-300 mb-2 flex items-center gap-2">
                      <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
                      MCQ Creation
                    </h4>
                    <div className="space-y-1 text-xs text-blue-100">
                      <p>• Converts to multiple-choice format</p>
                      <p>• Creates 4 plausible options per question</p>
                      <p>• Randomizes correct answer position</p>
                      <p>• Professional quiz experience</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg p-4 border border-green-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-green-400" />
                    <span className="font-semibold text-green-300">Key Advantages:</span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-100">
                    <div className="space-y-1">
                      <p>✅ <strong>Large PDF Support:</strong> Handles documents of any size</p>
                      <p>✅ <strong>Quality Control:</strong> AI-curated question selection</p>
                      <p>✅ <strong>Full Coverage:</strong> Questions from entire document</p>
                    </div>
                    <div className="space-y-1">
                      <p>✅ <strong>Exact Count:</strong> Precisely N questions as requested</p>
                      <p>✅ <strong>Multiple Choice:</strong> Professional quiz format</p>
                      <p>✅ <strong>Smart Options:</strong> Plausible distractors generated</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <p className="text-center text-blue-100">
                    <strong>Test the Pipeline:</strong> Upload any PDF and see the three-stage process in action. 
                    Get exactly {numQuestions || 'N'} high-quality multiple-choice questions from your entire document!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}