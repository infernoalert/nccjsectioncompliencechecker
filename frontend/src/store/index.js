import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import projectReducer from './slices/projectSlice';
import lightingPowerReducer from './slices/lighting_power_reportSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        user: userReducer,
        project: projectReducer,
        lightingPower: lightingPowerReducer
    },
}); 