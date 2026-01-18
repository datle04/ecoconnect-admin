
import { createSlice } from '@reduxjs/toolkit';


const tokenFromStorage = localStorage.getItem('admin_token');
const userFromStorage = localStorage.getItem('admin_user') 
  ? JSON.parse(localStorage.getItem('admin_user')) 
  : null;

const initialState = {
  token: tokenFromStorage,
  user: userFromStorage,
  isAuthenticated: !!tokenFromStorage,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      
      
      localStorage.setItem('admin_token', action.payload.token);
      localStorage.setItem('admin_user', JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      
      
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;