import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  CircularProgress,
  Alert,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DrawIcon from '@mui/icons-material/Draw';
import DownloadIcon from '@mui/icons-material/Download';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AddElectricalDetails from './AddElectricalDetails';
import {
  getProjectValues,
  createProjectValue,
  updateProjectValue,
  deleteProjectValue
} from '../features/projectValue/projectValueSlice';
import axios from 'axios';
import { fetchProject } from '../store/slices/projectSlice';
import { API_URL } from '../config';

const ElectricalValues = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { values, isLoading, error } = useSelector((state) => state.projectValue);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [editingValue, setEditingValue] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { currentProject, loading: projectLoading, error: projectError } = useSelector(state => state.project);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  const [processingFiles, setProcessingFiles] = useState(new Set());

  useEffect(() => {
    dispatch(getProjectValues(id));
    if (!currentProject || currentProject._id !== id) {
      dispatch(fetchProject(id));
    }
  }, [dispatch, id]);

  const handleAdd = async (data) => {
    console.log('ElectricalValues handleAdd called', data);
    try {
      const resultAction = await dispatch(createProjectValue({ projectId: id, valueData: data }));
      if (createProjectValue.fulfilled.match(resultAction)) {
        dispatch(getProjectValues(id));
      }
    } catch (err) {
      console.error('Error adding value:', err);
    }
  };

  const handleEdit = async (valueId, data) => {
    try {
      const resultAction = await dispatch(updateProjectValue({ 
        projectId: id, 
        valueId, 
        valueData: data 
      }));
      if (updateProjectValue.fulfilled.match(resultAction)) {
        dispatch(getProjectValues(id));
        setEditingValue(null);
      }
    } catch (err) {
      console.error('Error updating value:', err);
    }
  };

  const handleDelete = async (value) => {
    try {
      if (!value || !value._id) {
        console.error('Invalid value object:', value);
        return;
      }

      console.log('Deleting value:', value);
      const resultAction = await dispatch(deleteProjectValue({ 
        projectId: id, 
        valueId: value._id 
      }));

      if (deleteProjectValue.fulfilled.match(resultAction)) {
        // Success - the Redux slice will automatically update the state
        console.log('Successfully deleted value');
      } else if (deleteProjectValue.rejected.match(resultAction)) {
        // Show error message
        console.error('Failed to delete value:', resultAction.payload);
        setUploadError(resultAction.payload || 'Failed to delete value');
      }
    } catch (error) {
      console.error('Error in delete handler:', error);
      setUploadError(error.message || 'An error occurred while deleting');
    }
  };

  const handleEditClick = (value) => {
    setEditingValue(value);
    setOpenAddDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenAddDialog(false);
    setEditingValue(null);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file type
    if (file.type !== 'application/pdf') {
      setUploadError('Only PDF files are allowed');
      return;
    }

    // Check file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('File size must be less than 2MB');
      return;
    }

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/api/projects/${id}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      });

      // Refresh both project values and project data to show new file
      await Promise.all([
        dispatch(getProjectValues(id)),
        dispatch(fetchProject(id))
      ]);
    } catch (error) {
      setUploadError(error.response?.data?.error || 'Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  const handleFileDownload = async (filename) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/projects/${id}/files/${filename}`, {
        responseType: 'blob',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      // Optionally handle error
    }
  };

  const handleDeleteFileClick = (file) => {
    setFileToDelete(file);
    setDeleteDialogOpen(true);
  };

  const handleDeleteFileConfirm = async () => {
    if (!fileToDelete) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/projects/${id}/files/${fileToDelete.filename}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setDeleteDialogOpen(false);
      setFileToDelete(null);
      dispatch(fetchProject(id));
    } catch (error) {
      // Optionally show error
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteFileCancel = () => {
    setDeleteDialogOpen(false);
    setFileToDelete(null);
  };

  const handleAIAnalysis = async (file) => {
    setAnalyzing(true);
    setAnalysisError(null);
    setProcessingFiles(prev => new Set([...prev, file.filename]));
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/api/projects/${id}/analyze/${file.filename}`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Refresh project data to show updated analysis
      dispatch(fetchProject(id));
    } catch (error) {
      setAnalysisError(error.response?.data?.error || 'Error analyzing file');
    } finally {
      setAnalyzing(false);
      setProcessingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(file.filename);
        return newSet;
      });
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          {typeof error === 'object' ? error.message : error}
        </Alert>
      </Container>
    );
  }

  // Group values by type
  const loads = values.filter(v => v.type === 'load');
  const monitoring = values.filter(v => v.type === 'monitoring');

  return (
    <Container>
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" component="h1">
            Electrical Values
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <input
              accept="application/pdf"
              style={{ display: 'none' }}
              id="file-upload"
              type="file"
              onChange={handleFileUpload}
              disabled={uploading}
            />
            <label htmlFor="file-upload">
              <Button
                variant="contained"
                color="primary"
                component="span"
                startIcon={<PictureAsPdfIcon />}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Upload PDF'}
              </Button>
            </label>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<DrawIcon />}
              onClick={() => navigate(`/projects/${id}/diagram`)}
            >
              Draw Diagram
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setOpenAddDialog(true)}
            >
              Add Value
            </Button>
          </Box>
        </Box>
        {uploadError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {uploadError}
          </Alert>
        )}

        {/* Loads Table */}
        <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
          Loads
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Power Rating (kW)</TableCell>
                <TableCell>Voltage (V)</TableCell>
                <TableCell>Current (A)</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loads.map((load) => (
                <TableRow key={load._id}>
                  <TableCell>{load.name}</TableCell>
                  <TableCell>{load.powerRating}</TableCell>
                  <TableCell>{load.voltage}</TableCell>
                  <TableCell>{load.current}</TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleEditClick(load)}
                      color="primary"
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(load)}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Energy Monitoring Table */}
        <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
          Energy Monitoring
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Label</TableCell>
                <TableCell>Panel</TableCell>
                <TableCell>Device Type</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Connection</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {monitoring.map((monitor) => (
                <TableRow key={monitor._id}>
                  <TableCell>{monitor.label}</TableCell>
                  <TableCell>{monitor.panel}</TableCell>
                  <TableCell>{monitor.monitoringDeviceType}</TableCell>
                  <TableCell>
                    <Tooltip title={monitor.description || 'No description available'}>
                      <Typography
                        sx={{
                          maxWidth: 200,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {monitor.description || '-'}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Tooltip title={monitor.connection || 'No connection details'}>
                      <Typography
                        sx={{
                          maxWidth: 200,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {monitor.connection || '-'}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleEditClick(monitor)}
                      color="primary"
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(monitor)}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <AddElectricalDetails
        open={openAddDialog}
        onClose={handleCloseDialog}
        onSubmit={handleAdd}
        editingValue={editingValue}
        onEdit={handleEdit}
      />

      {/* Project Files Section */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Project Files
        </Typography>
        {projectLoading ? (
          <Box display="flex" justifyContent="center" p={2}>
            <CircularProgress size={24} />
          </Box>
        ) : projectError ? (
          <Alert severity="error" sx={{ mt: 2 }}>{projectError}</Alert>
        ) : currentProject && currentProject.files && currentProject.files.length > 0 ? (
          <Paper>
            <List>
              {currentProject.files.map((file) => (
                <ListItem
                  key={file.filename}
                  secondaryAction={
                    <>
                      <IconButton
                        edge="end"
                        aria-label="analyze"
                        onClick={() => handleAIAnalysis(file)}
                        disabled={analyzing || processingFiles.has(file.filename)}
                        color={processingFiles.has(file.filename) ? "disabled" : "primary"}
                        sx={{ mr: 1 }}
                      >
                        <SmartToyIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label="download"
                        onClick={() => handleFileDownload(file.filename)}
                      >
                        <DownloadIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        color="error"
                        onClick={() => handleDeleteFileClick(file)}
                        disabled={deleting}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </>
                  }
                >
                  <ListItemIcon>
                    <PictureAsPdfIcon color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {file.originalName}
                        {processingFiles.has(file.filename) && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                            <CircularProgress size={12} sx={{ mr: 1 }} />
                            Processing...
                          </Typography>
                        )}
                      </Box>
                    }
                    secondary={`Size: ${(file.size / 1024).toFixed(1)} KB • Uploaded: ${new Date(file.uploadedAt).toLocaleDateString()}`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        ) : (
          <Typography variant="body2" color="text.secondary">No files available.</Typography>
        )}
        {analysisError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {analysisError}
          </Alert>
        )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteFileCancel}
        aria-labelledby="delete-file-dialog-title"
      >
        <DialogTitle id="delete-file-dialog-title">Delete File</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the file "{fileToDelete?.originalName}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteFileCancel} disabled={deleting}>Cancel</Button>
          <Button onClick={handleDeleteFileConfirm} color="error" disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ElectricalValues; 