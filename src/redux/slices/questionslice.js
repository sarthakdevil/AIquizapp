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
    const response = await api.get("/quizzes"); // Fetch from /api/quizzes
    console.log('Redux: Raw API response:', response.data);
    
    // Normalize quizzes: ensure each question has MCQ options and a correct_answer (A-D)
    const normalizeQuiz = (quiz) => {
      const qas = Array.isArray(quiz.questions_and_answers) ? quiz.questions_and_answers : [];

      // Collect existing answers to use as plausible distractors
      const existingAnswers = qas.map(q => q.answer).filter(Boolean);

      const normalizedQAs = qas.map((q, idx) => {
        // If options already present and valid, keep them
        if (Array.isArray(q.options) && q.options.length === 4 && q.correct_answer) {
          return q;
        }

        // Build options: include the correct answer then try to pick 3 distractors
        const correct = q.answer || q.correct_answer || '';
        const options = [];

        // Use correct answer as one option
        options.push(correct);

        // Add distractors from other existing answers in quiz
        for (let a of existingAnswers) {
          if (options.length >= 4) break;
          if (!a) continue;
          if (a === correct) continue;
          if (!options.includes(a)) options.push(a);
        }

        // If still missing, add generic placeholders based on question index
        const genericDistractors = ['Option X', 'Option Y', 'Option Z', 'None'];
        let gi = 0;
        while (options.length < 4) {
          const cand = genericDistractors[gi % genericDistractors.length] + (gi > 0 ? ` ${gi}` : '');
          if (!options.includes(cand)) options.push(cand);
          gi++;
        }

        // Shuffle options to avoid always placing correct first
        for (let i = options.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [options[i], options[j]] = [options[j], options[i]];
        }

        // Determine correct_answer letter (A-D)
        const correctIndex = options.findIndex(o => o === correct);
        const correctLetter = correctIndex >= 0 ? String.fromCharCode(65 + correctIndex) : 'A';

        return {
          question: q.question || `Question ${idx + 1}`,
          options,
          correct_answer: correctLetter,
          answer: options[correctIndex >= 0 ? correctIndex : 0]
        };
      });

      return {
        ...quiz,
        questions_and_answers: normalizedQAs
      };
    };

    const quizzes = response.data.map((quiz) => ({
      id: quiz._id,
      quizName: quiz.quiz_name,
      questionsAndAnswers: normalizeQuiz(quiz).questions_and_answers,
      questionCount: normalizeQuiz(quiz).questions_and_answers.length,
      createdAt: quiz.createdAt,
      updatedAt: quiz.updatedAt
    }));
    
    console.log('Redux: Processed quizzes:', quizzes);
    dispatch(loadQuizzesSuccess(quizzes)); // Dispatch the full quizzes
    toast.success("Quizzes loaded successfully!");
  } catch (error) {
    console.error('Redux: Error fetching quizzes:', error);
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
