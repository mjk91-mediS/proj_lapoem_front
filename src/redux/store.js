import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';

const store = configureStore({
  // 5. store에 slide 등록
  reducer: {
    auth: authReducer,
  },
});

export default store;
