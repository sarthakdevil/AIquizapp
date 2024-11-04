import { configureStore } from "@reduxjs/toolkit";
import uploadReducer from "./slices/pdfslice"
import questionsReducer from "./slices/questionslice"

export const store = configureStore({
  reducer: {
    upload: uploadReducer,
    question:questionsReducer
  },
});
