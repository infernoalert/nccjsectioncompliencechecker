import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { uploadFile, deleteFile, downloadFile } from '../store/slices/projectSlice';
import { formatFileSize } from '../utils/formatUtils';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = ['application/pdf'];

const FileUpload = ({ projectId, files = [], onFilesChange, onError }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pendingFiles, setPendingFiles] = useState([]);

  const validateFile = (file) => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      throw new Error('Only PDF files are allowed');
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File size must be less than 10MB');
    }
  };

  const handleFileSelect = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    try {
      setError(null);
      validateFile(selectedFile);

      if (!projectId) {
        // For new projects, store files locally until project is created
        setPendingFiles(prev => [...prev, selectedFile]);
        onFilesChange([...files, { 
          originalName: selectedFile.name,
          size: selectedFile.size,
          type: selectedFile.type,
          isPending: true,
          file: selectedFile // Store the actual file object
        }]);
      } else {
        // For existing projects, upload immediately
        setLoading(true);
        const result = await dispatch(uploadFile({ projectId, file: selectedFile })).unwrap();
        onFilesChange([...files, result]);
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to upload file';
      setError(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setLoading(false);
      event.target.value = null; // Reset file input
    }
  };

  const handleDelete = async (fileId, index) => {
    try {
      setError(null);
      
      if (!projectId) {
        // For new projects, remove from pending files
        setPendingFiles(prev => prev.filter((_, i) => i !== index));
        onFilesChange(files.filter((_, i) => i !== index));
      } else {
        // For existing projects, delete from server
        setLoading(true);
        await dispatch(deleteFile({ projectId, fileId })).unwrap();
        onFilesChange(files.filter(file => file._id !== fileId));
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to delete file';
      setError(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (fileId, fileName) => {
    if (!projectId) {
      // For new projects, download from pending files
      const file = pendingFiles.find(f => f.name === fileName);
      if (file) {
        const url = window.URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
      return;
    }

    try {
      setError(null);
      setLoading(true);
      await dispatch(downloadFile({ projectId, fileId })).unwrap();
    } catch (err) {
      const errorMessage = err.message || 'Failed to download file';
      setError(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        id="file-upload"
        disabled={loading}
      />
      <label htmlFor="file-upload">
        <Button
          component="span"
          variant="contained"
          startIcon={<UploadIcon />}
          disabled={loading}
        >
          Upload PDF
        </Button>
      </label>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {files.length > 0 && (
        <Paper sx={{ mt: 2 }}>
          <List>
            {files.map((file, index) => (
              <ListItem key={file._id || index}>
                <ListItemText
                  primary={file.originalName || file.name}
                  secondary={`Size: ${formatFileSize(file.size)}`}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="download"
                    onClick={() => handleDownload(file._id, file.originalName || file.name)}
                    disabled={loading}
                  >
                    <DownloadIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDelete(file._id, index)}
                    disabled={loading}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {loading && (
        <Box display="flex" justifyContent="center" mt={2}>
          <CircularProgress size={24} />
        </Box>
      )}

      {files.length === 0 && !loading && (
        <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
          No files uploaded yet. Upload PDF documents related to this project.
        </Typography>
      )}
    </Box>
  );
};

export default FileUpload; 