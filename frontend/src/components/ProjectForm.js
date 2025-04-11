import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  TextField,
  Button,
  Paper,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert
} from '@mui/material';
import {
  createProject,
  updateProject,
  fetchProject,
  fetchBuildingClassifications,
  fetchClimateZones,
  fetchCompliancePathways
} from '../store/slices/projectSlice';

const ProjectForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    project,
    buildingClassifications,
    climateZones,
    compliancePathways,
    loading,
    error
  } = useSelector((state) => state.project);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    buildingClassification: '',
    climateZone: '',
    compliancePathway: '',
    buildingFabric: {
      walls: {
        external: {
          rValueByZone: {
            Zones_1_3: '',
            Zones_4_6: '',
            Zones_7_8: ''
          },
          thermalBreaks: {
            metalFramed: false
          }
        }
      },
      roof: {
        rValueByZone: {
          Zones_1_5: '',
          Zone_6: '',
          Zones_7_8: ''
        },
        solarAbsorptance: {
          max: 0.45,
          exemptZones: []
        }
      },
      glazing: {
        external: {
          shgcByZone: {
            Zones_1_3: 0,
            Zones_4_6: 0,
            Zones_7_8: 0
          },
          uValueByZone: {
            Zones_1_3: 0,
            Zones_4_6: 0,
            Zones_7_8: 0
          }
        }
      }
    }
  });

  useEffect(() => {
    dispatch(fetchBuildingClassifications());
    dispatch(fetchClimateZones());
    dispatch(fetchCompliancePathways());

    if (id) {
      dispatch(fetchProject(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (project && id) {
      setFormData(project);
    }
  }, [project, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBuildingFabricChange = (path, value) => {
    setFormData((prev) => {
      const newData = { ...prev };
      let current = newData.buildingFabric;
      const pathArray = path.split('.');
      
      for (let i = 0; i < pathArray.length - 1; i++) {
        current = current[pathArray[i]];
      }
      
      current[pathArray[pathArray.length - 1]] = value;
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await dispatch(updateProject({ id, data: formData })).unwrap();
      } else {
        await dispatch(createProject(formData)).unwrap();
      }
      navigate('/projects');
    } catch (error) {
      console.error('Failed to save project:', error);
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" mb={3}>
        {id ? 'Edit Project' : 'Create New Project'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Project Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={4}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Building Classification</InputLabel>
                <Select
                  name="buildingClassification"
                  value={formData.buildingClassification}
                  onChange={handleChange}
                  required
                >
                  {buildingClassifications.map((bc) => (
                    <MenuItem key={bc._id} value={bc._id}>
                      {bc.classType}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Climate Zone</InputLabel>
                <Select
                  name="climateZone"
                  value={formData.climateZone}
                  onChange={handleChange}
                  required
                >
                  {climateZones.map((cz) => (
                    <MenuItem key={cz._id} value={cz._id}>
                      {cz.zoneRange}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Compliance Pathway</InputLabel>
                <Select
                  name="compliancePathway"
                  value={formData.compliancePathway}
                  onChange={handleChange}
                  required
                >
                  {compliancePathways.map((cp) => (
                    <MenuItem key={cp._id} value={cp._id}>
                      {cp.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" mb={2}>
                Building Fabric
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Wall R-Value (Zones 1-3)"
                value={formData.buildingFabric.walls.external.rValueByZone.Zones_1_3}
                onChange={(e) =>
                  handleBuildingFabricChange('walls.external.rValueByZone.Zones_1_3', e.target.value)
                }
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Wall R-Value (Zones 4-6)"
                value={formData.buildingFabric.walls.external.rValueByZone.Zones_4_6}
                onChange={(e) =>
                  handleBuildingFabricChange('walls.external.rValueByZone.Zones_4_6', e.target.value)
                }
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Wall R-Value (Zones 7-8)"
                value={formData.buildingFabric.walls.external.rValueByZone.Zones_7_8}
                onChange={(e) =>
                  handleBuildingFabricChange('walls.external.rValueByZone.Zones_7_8', e.target.value)
                }
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Roof R-Value (Zones 1-5)"
                value={formData.buildingFabric.roof.rValueByZone.Zones_1_5}
                onChange={(e) =>
                  handleBuildingFabricChange('roof.rValueByZone.Zones_1_5', e.target.value)
                }
              />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" gap={2}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/projects')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {id ? 'Update Project' : 'Create Project'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default ProjectForm; 