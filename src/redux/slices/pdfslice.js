import { createSlice } from "@reduxjs/toolkit";
import api from "@/helper/axios.js";
import toast from "react-hot-toast";

export const uploadSlice = createSlice({
  name: "upload",
  initialState: {
    loading: false,
    uploadSuccess: false,
    error: null,
    pdfName: null,
    questionsAndAnswers: null,
    successMessage: null,
  },
  reducers: {
    startUpload: (state) => {
      state.loading = true;
      state.uploadSuccess = false;
      state.error = null;
      state.successMessage = null;
    },
    uploadSuccess: (state, action) => {
      state.loading = false;
      state.uploadSuccess = true;
      state.error = null;
      state.pdfName = action.payload.filename; // Store only the PDF name
      state.successMessage = action.payload.message; // Store the server's success message
    },
    uploadFailure: (state, action) => {
      state.loading = false;
      state.uploadSuccess = false;
      state.error = action.payload;
    },
    resetUploadState: (state) => {
      state.loading = false;
      state.uploadSuccess = false;
      state.error = null;
      state.pdfName = null;
      state.successMessage = null;
      state.questionsAndAnswers = null; // Reset questions and answers
    },
    setQuestionsAndAnswers: (state, action) => {
      state.questionsAndAnswers = action.payload; // Store the analyzed questions and answers
    },
  },
});

// Export actions
export const { startUpload, uploadSuccess, uploadFailure, resetUploadState, setQuestionsAndAnswers } = uploadSlice.actions;

// Thunk to handle file upload
export const uploadFile = (file) => async (dispatch) => {
  dispatch(startUpload());
  try {
    const formData = new FormData();
    formData.append('pdf_file', file);
    formData.append('filename', file.name);

    // Send API request and store the server response
    const response = await api.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    // Dispatch the success action with filename and server's message
    dispatch(uploadSuccess({ filename: file.name, message: response.data.message }));
    toast.success("PDF uploaded successfully");
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || "File upload failed.";
    dispatch(uploadFailure(errorMessage));
    toast.error(errorMessage);
  }
};

// Thunk to analyze the uploaded PDF
export const analyzePdf = (pdfName, numQuestions) => async (dispatch) => {
  if (!pdfName) {
    toast.error("Please upload a PDF file first.");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("pdf_filename", pdfName);
    formData.append("num_ques", numQuestions);

    const response = await api.post("/analyze", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    
    // Assuming the response has the correct data structure
    if (response.data && response.data.questions_and_answers) {
      dispatch(setQuestionsAndAnswers(response.data.questions_and_answers));
      toast.success("Analysis successful!");
    } else {
      throw new Error("Unexpected response structure.");
    }

  } catch (error) {
    console.error("Analysis error:", error); // Log the error for debugging
    const errorMessage = error.response?.data?.message || error.message || "Analysis failed.";
    toast.error("unexpected error");
  }
};



export default uploadSlice.reducer;
