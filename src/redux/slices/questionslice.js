import { createSlice } from "@reduxjs/toolkit";
import api from "@/helper/inneraxios.js";
import toast from "react-hot-toast";

export const questionsSlice = createSlice({
  name: "questions",
  initialState: {
    loading: false,
    error: null,
    allQuizzes: [], // Store full quiz data
    currentQuiz: null, // Store selected quiz data
    createdQuizId: null, // Store the ID of newly created quiz
  },
  reducers: {
    startLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    loadQuizzesSuccess: (state, action) => {
      state.loading = false;
      state.allQuizzes = action.payload; // Store full quiz data
      state.error = null;
    },
    loadQuizzesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setCurrentQuiz: (state, action) => {
      state.currentQuiz = action.payload; // Set the selected quiz as the current quiz
    },
    resetQuestionsState: (state) => {
      state.loading = false;
      state.error = null;
      state.allQuizzes = [];
      state.currentQuiz = null;
      state.createdQuizId = null;
    },
    setCreatedQuizId: (state, action) => {
      state.createdQuizId = action.payload; // Set created quiz ID
    },
  },
});

// Export actions
export const {
  startLoading,
  loadQuizzesSuccess,
  loadQuizzesFailure,
  setCurrentQuiz,
  resetQuestionsState,
  setCreatedQuizId,
} = questionsSlice.actions;

// Thunk to fetch all quizzes from the backend
export const fetchQuizzes = () => async (dispatch) => {
  dispatch(startLoading());
  try {
    const response = await api.get("/quizzes"); // Adjust your API endpoint
    const quizzes = response.data.map((quiz) => ({
      id: quiz._id, // MongoDB ObjectID
      pdfName: quiz.pdf_name,
      quizName: quiz.quiz_name,
      quizTime: quiz.quiz_time,
      questionsAndAnswers: quiz.questions_and_answers.questions_and_answers, // Array of question-answer pairs
    }));
    dispatch(loadQuizzesSuccess(quizzes)); // Dispatch the full quizzes
    toast.success("Quizzes loaded successfully!");
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to load quizzes.";
    dispatch(loadQuizzesFailure(errorMessage));
    toast.error(errorMessage);
  }
};

// Thunk to set the current quiz based on quiz ID
export const selectQuiz = (quizId) => (dispatch, getState) => {
  const { allQuizzes } = getState().question;
  const selectedQuiz = allQuizzes.find((quiz) => quiz.id === quizId);
  dispatch(setCurrentQuiz(selectedQuiz));
};

// Thunk to create a new quiz
export const createQuiz = (payload) => async (dispatch) => {
  dispatch(startLoading());
  try {
    const response = await api.post("/create", payload);
    dispatch(setCreatedQuizId(response.data.quizId)); // Assuming response contains quiz ID
    toast.success("Quiz created successfully!");
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to create quiz.";
    dispatch(loadQuizzesFailure(errorMessage));
    toast.error(errorMessage);
  }
};

export default questionsSlice.reducer;
