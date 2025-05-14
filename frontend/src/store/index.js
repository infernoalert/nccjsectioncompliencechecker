import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import projectReducer from './slices/projectSlice';
import EnergyMonitorReducer from './slices/energy_monitor_reportSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        user: userReducer,
        project: projectReducer,
        EnergyMonitor: EnergyMonitorReducer
    },
}); 