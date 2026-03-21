import { createSlice } from '@reduxjs/toolkit';

// load token from localStorage on app start
const tokenFromStorage = localStorage.getItem('token');
const userFromStorage  = localStorage.getItem('user')
  ? JSON.parse(localStorage.getItem('user'))
  : null;

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:  userFromStorage,   
    token: tokenFromStorage, 
    isAuthenticated: !!tokenFromStorage
  },
  reducers: {
    // called after OAuth callback — stores token + user
    loginSuccess: (state, action) => {
      const { token, user } = action.payload;
      state.token           = token;
      state.user            = user;
      state.isAuthenticated = true;

      // persist to localStorage so user stays logged in on refresh
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    },

    // called on logout
    logout: (state) => {
      state.token           = null;
      state.user            = null;
      state.isAuthenticated = false;

      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;


export const selectUser  = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;