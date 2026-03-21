import { createSlice } from '@reduxjs/toolkit';

const executionSlice = createSlice({
  name: 'execution',
  initialState: {
    jobId:         null,
    status:        null,   // queued | running | completed | failed
    stdout:        '',
    stderr:        '',
    exitCode:      null,
    executionTime: null,
    isPolling:     false,
  },
  reducers: {
    submitJob: (state, action) => {
      state.jobId     = action.payload;
      state.status    = 'queued';
      state.stdout    = '';
      state.stderr    = '';
      state.exitCode  = null;
      state.isPolling = true;
    },
    updateStatus: (state, action) => {
      state.status = action.payload;
    },
    setResult: (state, action) => {
      state.status        = action.payload.status;
      state.stdout        = action.payload.stdout;
      state.stderr        = action.payload.stderr;
      state.exitCode      = action.payload.exitCode;
      state.executionTime = action.payload.executionTime;
      state.isPolling     = false;
    },
    resetExecution: (state) => {
      state.jobId         = null;
      state.status        = null;
      state.stdout        = '';
      state.stderr        = '';
      state.exitCode      = null;
      state.executionTime = null;
      state.isPolling     = false;
    },
  },
});

export const { submitJob, updateStatus, setResult, resetExecution } = executionSlice.actions;
export default executionSlice.reducer;

export const selectExecution  = (state) => state.execution;
export const selectIsPolling  = (state) => state.execution.isPolling;
export const selectJobStatus  = (state) => state.execution.status;