import { configureStore } from '@reduxjs/toolkit';
import projectReducer from '../features/project/projectSlice';
import projectValueReducer from '../features/projectValue/projectValueSlice';

export const store = configureStore({
  reducer: {
    project: projectReducer,
    projectValue: projectValueReducer,
  },
}); 