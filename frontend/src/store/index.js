
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import filesReducer from '../features/files/filesSlice';
import editorReducer from '../features/editor/editorSlice';
import executionReducer from '../features/execution/executionSlice';

export const store = configureStore({
  reducer: {
    auth:      authReducer,
    files:     filesReducer,
    editor:    editorReducer,
    execution: executionReducer,
  },
});