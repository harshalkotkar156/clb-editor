import { createSlice } from '@reduxjs/toolkit';

const editorSlice = createSlice({
  name: 'editor',
  initialState: {
    currentFile:  null,     // full file object currently open
    code:         '',
    language:     'cpp',
    stdin:        '',
    isSidebarOpen: true,
    isSaved:      true,     // track unsaved changes
  },
  reducers: {
    openFile: (state, action) => {
      state.currentFile = action.payload;
      state.code        = action.payload.code;
      state.language    = action.payload.language;
      state.isSaved     = true;
    },
    setCode: (state, action) => {
      state.code    = action.payload;
      state.isSaved = false;   // mark as unsaved when code changes
    },
    setLanguage:    (state, action) => { state.language    = action.payload; },
    setStdin:       (state, action) => { state.stdin       = action.payload; },
    toggleSidebar:  (state)         => { state.isSidebarOpen = !state.isSidebarOpen; },
    markSaved:      (state)         => { state.isSaved     = true; },
    clearEditor:    (state)         => {
      state.currentFile = null;
      state.code        = '';
      state.language    = 'cpp';
      state.stdin       = '';
      state.isSaved     = true;
    },
  },
});

export const {
  openFile, setCode, setLanguage, setStdin,
  toggleSidebar, markSaved, clearEditor
} = editorSlice.actions;
export default editorSlice.reducer;

export const selectCurrentFile  = (state) => state.editor.currentFile;
export const selectCode         = (state) => state.editor.code;
export const selectLanguage     = (state) => state.editor.language;
export const selectStdin        = (state) => state.editor.stdin;
export const selectIsSidebarOpen = (state) => state.editor.isSidebarOpen;
export const selectIsSaved      = (state) => state.editor.isSaved;