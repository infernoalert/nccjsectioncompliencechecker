import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import projectReducer from './slices/projectSlice';
import EnergyMonitorReducer from './slices/energy_monitor_reportSlice';
import J7LightingReducer from './slices/j7lighting_reportSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        user: userReducer,
        project: projectReducer,
        EnergyMonitor: EnergyMonitorReducer,
        J7Lighting: J7LightingReducer
    },
}); 