import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = '/api/projects';

// Create axios instance with auth token
const axiosWithAuth = (token) => {
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
  async (_, { getState }) => {
    const { auth } = getState();
    const response = await axiosWithAuth(auth.token).get('/');
    return response.data;
  }
);

export const fetchProject = createAsyncThunk(
  'project/fetchProject',
  async (id, { getState }) => {
    const { auth } = getState();
    const response = await axiosWithAuth(auth.token).get(`/${id}`);
    return response.data;
  }
);

export const createProject = createAsyncThunk(
  'project/createProject',
  async (projectData, { getState }) => {
    const { auth } = getState();
    const response = await axiosWithAuth(auth.token).post('/', projectData);
    return response.data;
  }
);

export const updateProject = createAsyncThunk(
  'project/updateProject',
  async ({ id, data }, { getState }) => {
    const { auth } = getState();
    const response = await axiosWithAuth(auth.token).put(`/${id}`, data);
    return response.data;
  }
);

export const deleteProject = createAsyncThunk(
  'project/deleteProject',
  async (id, { getState }) => {
    const { auth } = getState();
    await axiosWithAuth(auth.token).delete(`/${id}`);
    return id;
  }
);

export const checkCompliance = createAsyncThunk(
  'project/checkCompliance',
  async (id, { getState }) => {
    const { auth } = getState();
    const response = await axiosWithAuth(auth.token).post(`/${id}/check-compliance`);
    return response.data;
  }
);

export const fetchBuildingClassifications = createAsyncThunk(
  'project/fetchBuildingClassifications',
  async (_, { getState }) => {
    const { auth } = getState();
    const response = await axiosWithAuth(auth.token).get('/building-classifications');
    return response.data;
  }
);

export const fetchClimateZones = createAsyncThunk(
  'project/fetchClimateZones',
  async (_, { getState }) => {
    const { auth } = getState();
    const response = await axiosWithAuth(auth.token).get('/climate-zones');
    return response.data;
  }
);

export const fetchCompliancePathways = createAsyncThunk(
  'project/fetchCompliancePathways',
  async (_, { getState }) => {
    const { auth } = getState();
    const response = await axiosWithAuth(auth.token).get('/compliance-pathways');
    return response.data;
  }
);

const initialState = {
  projects: [],
  project: null,
  buildingClassifications: [],
  climateZones: [],
  compliancePathways: [],
  loading: false,
  error: null
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
        state.error = action.error.message;
      })
      // Fetch Single Project
      .addCase(fetchProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProject.fulfilled, (state, action) => {
        state.loading = false;
        state.project = action.payload;
      })
      .addCase(fetchProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
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
        state.error = action.error.message;
      })
      // Update Project
      .addCase(updateProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = state.projects.map((project) =>
          project._id === action.payload._id ? action.payload : project
        );
        state.project = action.payload;
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Delete Project
      .addCase(deleteProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = state.projects.filter((project) => project._id !== action.payload);
        state.project = null;
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Check Compliance
      .addCase(checkCompliance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkCompliance.fulfilled, (state, action) => {
        state.loading = false;
        if (state.project) {
          state.project.complianceResults = action.payload;
        }
      })
      .addCase(checkCompliance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
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
        state.error = action.error.message;
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
        state.error = action.error.message;
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
        state.error = action.error.message;
      });
  }
});

export const { clearError } = projectSlice.actions;
export default projectSlice.reducer; 