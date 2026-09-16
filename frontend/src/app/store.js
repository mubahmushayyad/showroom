import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../redux/users/userSlice';

export const store = configureStore({
  reducer: {
    users: userReducer,
  },
});
