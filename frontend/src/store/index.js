import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import projectReducer from './slices/projectSlice';
import electricalReducer from './slices/elec_reportSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        user: userReducer,
        project: projectReducer,
        electrical: electricalReducer
    },
}); 