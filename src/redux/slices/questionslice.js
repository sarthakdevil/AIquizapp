import { createSlice } from "@reduxjs/toolkit";
import api from "@/helper/inneraxios.js";
import toast from "react-hot-toast";

export const questionsSlice = createSlice({
  name: "questions",
  initialState: {
    loading: false,
    error: null,
    allQuizNames: [],
  },
  reducers: {
    startLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    loadQuizNamesSuccess: (state, action) => {
      state.loading = false;
      state.allQuizNames = action.payload; // Store all quiz names
      state.error = null;
    },
    loadQuizNamesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    resetQuestionsState: (state) => {
      state.loading = false;
      state.error = null;
      state.allQuizNames = [];
    },
  },
});

// Export actions
export const { startLoading, loadQuizNamesSuccess, loadQuizNamesFailure, resetQuestionsState } = questionsSlice.actions;

// Thunk to fetch all quiz names from the backend
export const fetchQuizNames = () => async (dispatch) => {
  dispatch(startLoading());
  try {
    const response = await api.get("/quizzes"); // Adjust your API endpoint
    dispatch(loadQuizNamesSuccess(response.data.quizNames)); // Assuming response.data has quizNames
    toast.success("Quiz names loaded successfully!");
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to load quiz names.";
    dispatch(loadQuizNamesFailure(errorMessage));
    toast.error(errorMessage);
  }
};

export default questionsSlice.reducer;
