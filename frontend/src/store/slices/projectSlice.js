import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance with auth token
const axiosWithAuth = (token) => {
  if (!token) {
    throw new Error('No authentication token available');
  }
  return axios.create({
    baseURL: API_URL,
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

// Async thunks
export const fetchProjects = createAsyncThunk(
  'project/fetchProjects',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      if (!auth.token) {
        return rejectWithValue('No authentication token available');
      }
      console.log('Making API request with token:', auth.token);
      const response = await axiosWithAuth(auth.token).get('/projects');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching projects:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchProject = createAsyncThunk(
  'project/fetchProject',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      if (!auth.token) {
        return rejectWithValue('No authentication token available');
      }
      const response = await axiosWithAuth(auth.token).get(`/projects/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const createProject = createAsyncThunk(
  'project/createProject',
  async (projectData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      if (!auth.token) {
        return rejectWithValue('No authentication token available');
      }
      const response = await axiosWithAuth(auth.token).post('/projects', projectData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const updateProject = createAsyncThunk(
  'project/updateProject',
  async ({ id, data }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      if (!auth.token) {
        return rejectWithValue('No authentication token available');
      }
      const response = await axiosWithAuth(auth.token).put(`/projects/${id}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const deleteProject = createAsyncThunk(
  'project/deleteProject',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      if (!auth.token) {
        return rejectWithValue('No authentication token available');
      }
      await axiosWithAuth(auth.token).delete(`/projects/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const checkCompliance = createAsyncThunk(
  'project/checkCompliance',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      if (!auth.token) {
        return rejectWithValue('No authentication token available');
      }
      const response = await axiosWithAuth(auth.token).post(`/projects/${id}/check-compliance`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchBuildingClassifications = createAsyncThunk(
  'project/fetchBuildingClassifications',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      if (!auth.token) {
        return rejectWithValue('No authentication token available');
      }
      const response = await axiosWithAuth(auth.token).get('/building-classes');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchClimateZones = createAsyncThunk(
  'project/fetchClimateZones',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      if (!auth.token) {
        return rejectWithValue('No authentication token available');
      }
      const response = await axiosWithAuth(auth.token).get('/climate-zones');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchCompliancePathways = createAsyncThunk(
  'project/fetchCompliancePathways',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      if (!auth.token) {
        return rejectWithValue('No authentication token available');
      }
      const response = await axiosWithAuth(auth.token).get('/compliance-pathways');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

// Fetch building types
export const fetchBuildingTypes = createAsyncThunk(
  'project/fetchBuildingTypes',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      if (!auth.token) {
        return rejectWithValue('No authentication token available');
      }
      const response = await axiosWithAuth(auth.token).get('/projects/building-types');
      
      // Ensure we have valid data before returning
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      } else {
        return rejectWithValue('Invalid response format from server');
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch building types');
    }
  }
);

export const fetchLocations = createAsyncThunk(
  'project/fetchLocations',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      if (!auth.token) {
        return rejectWithValue('No authentication token available');
      }
      const response = await axiosWithAuth(auth.token).get('/projects/locations');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const generateReport = createAsyncThunk(
  'project/generateReport',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      if (!auth.token) {
        return rejectWithValue('No authentication token available');
      }
      const response = await axiosWithAuth(auth.token).get(`/projects/${id}/report`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

const initialState = {
  projects: [],
  currentProject: null,
  buildingTypes: [],
  buildingClassifications: [],
  climateZones: [],
  compliancePathways: [],
  locations: [],
  loading: false,
  error: null,
  report: null
};

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Projects
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Single Project
      .addCase(fetchProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProject.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProject = action.payload;
      })
      .addCase(fetchProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Project
      .addCase(createProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects.push(action.payload);
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Project
      .addCase(updateProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.projects.findIndex(project => project._id === action.payload._id);
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
        if (state.currentProject?._id === action.payload._id) {
          state.currentProject = action.payload;
        }
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Project
      .addCase(deleteProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = state.projects.filter(project => project._id !== action.payload);
        if (state.currentProject?._id === action.payload) {
          state.currentProject = null;
        }
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Check Compliance
      .addCase(checkCompliance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkCompliance.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.projects.findIndex(project => project._id === action.payload._id);
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
        if (state.currentProject?._id === action.payload._id) {
          state.currentProject = action.payload;
        }
      })
      .addCase(checkCompliance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Building Classifications
      .addCase(fetchBuildingClassifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBuildingClassifications.fulfilled, (state, action) => {
        state.loading = false;
        state.buildingClassifications = action.payload;
      })
      .addCase(fetchBuildingClassifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Climate Zones
      .addCase(fetchClimateZones.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClimateZones.fulfilled, (state, action) => {
        state.loading = false;
        state.climateZones = action.payload;
      })
      .addCase(fetchClimateZones.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Compliance Pathways
      .addCase(fetchCompliancePathways.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompliancePathways.fulfilled, (state, action) => {
        state.loading = false;
        state.compliancePathways = action.payload;
      })
      .addCase(fetchCompliancePathways.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Building Types
      .addCase(fetchBuildingTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBuildingTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.buildingTypes = action.payload;
      })
      .addCase(fetchBuildingTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Locations
      .addCase(fetchLocations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLocations.fulfilled, (state, action) => {
        state.loading = false;
        state.locations = action.payload;
      })
      .addCase(fetchLocations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Generate Report
      .addCase(generateReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateReport.fulfilled, (state, action) => {
        state.loading = false;
        state.report = action.payload;
      })
      .addCase(generateReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError } = projectSlice.actions;
export default projectSlice.reducer; 