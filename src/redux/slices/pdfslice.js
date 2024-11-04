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
    quizTime: null, // Add quiz time to the state
    successMessage: null,
    quiz_name: '',
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
      state.quizTime = null; // Reset quiz time
    },
    setQuestionsAndAnswers: (state, action) => {
      state.questionsAndAnswers = action.payload; // Store the analyzed questions and answers
    },
    setQuizTime: (state, action) => {
      state.quizTime = action.payload; // Store quiz time
    },
    setQuizName(state, action) { // New action for quiz name
      state.quiz_name = action.payload;
    },
  },
});

// Export actions
export const { 
  startUpload, 
  uploadSuccess, 
  uploadFailure, 
  resetUploadState, 
  setQuestionsAndAnswers,
  setQuizTime,
  setQuizName 
} = uploadSlice.actions;

export const uploadFile = (file) => async (dispatch) => {
  dispatch(startUpload());
  try {
    const formData = new FormData();
    formData.append('pdf_file', file);
    formData.append('filename', file.name);

    const response = await api.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    dispatch(uploadSuccess({ filename: file.name, message: response.data.message }));
    toast.success("PDF uploaded successfully");
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || "File upload failed.";
    dispatch(uploadFailure(errorMessage));
    toast.error(errorMessage);
  }
};
export const analyzePdf = (payload) => async (dispatch) => {
  if (!payload.pdfFilename) {
    toast.error("Please upload a PDF file first.");
    return;
  }

  try {
    const formdata = new FormData();
    formdata.append("pdf_filename", payload.pdfFilename);
    formdata.append("quiz_name", payload.quizName);
    formdata.append("num_ques", payload.numQuestions);
    if (payload.time) {
      formdata.append("time", payload.time); // Append time only if it's provided
    }

    const response = await api.post("/analyze", formdata, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.data && response.data.questions_and_answers) {
      dispatch(setQuestionsAndAnswers(response.data.questions_and_answers));
      // Check and dispatch quiz time
      if (response.data.quiz_time) {
        dispatch(setQuizTime(response.data.quiz_time)); // Dispatch the quiz time
      }
      // Dispatch quiz name from the top level of the response
      if (response.data.quiz_name) {
        dispatch(setQuizName(response.data.quiz_name));
      }
      toast.success("Analysis successful!");
    } else {
      throw new Error("Unexpected response structure.");
    }

  } catch (error) {
    console.error("Analysis error:", error);
    const errorMessage = error.response?.data?.message || error.message || "Analysis failed.";
    toast.error(errorMessage);
  }
};


export default uploadSlice.reducer;
