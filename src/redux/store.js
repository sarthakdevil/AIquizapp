import { configureStore } from "@reduxjs/toolkit";
import uploadReducer from "./slices/pdfslice"

export const store = configureStore({
  reducer: {
    upload: uploadReducer,
  },
});
