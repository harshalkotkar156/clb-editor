import { createSlice } from '@reduxjs/toolkit';

const filesSlice = createSlice({
  name: 'files',
  initialState: {
    files:   [],
    loading: false,
    error:   null,
  },
  reducers: {
    setFiles: (state, action) => {
      state.files   = action.payload;
      state.loading = false;
    },
    addFile: (state, action) => {
      state.files.unshift(action.payload);  // add to top
    },
    updateFile: (state, action) => {
      const idx = state.files.findIndex(f => f._id === action.payload._id);
      if (idx !== -1) state.files[idx] = action.payload;
    },
    removeFile: (state, action) => {
      state.files = state.files.filter(f => f._id !== action.payload);
    },
    setLoading: (state, action) => { state.loading = action.payload; },
    setError:   (state, action) => { state.error   = action.payload; },
  },
});

export const { setFiles, addFile, updateFile, removeFile, setLoading, setError } = filesSlice.actions;
export default filesSlice.reducer;

export const selectFiles   = (state) => state.files.files;
export const selectLoading = (state) => state.files.loading;