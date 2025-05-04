import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';
import { Block, CheckCircle } from '@mui/icons-material';
import { getUsers, revokeUserAccess, restoreUserAccess } from '../features/admin/adminSlice';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { users = [], loading = false, error = null } = useSelector((state) => state.admin || {});
  const [message, setMessage] = useState('');

  useEffect(() => {
    dispatch(getUsers());
  }, [dispatch]);

  const handleRevokeAccess = async (userId) => {
    try {
      await dispatch(revokeUserAccess(userId)).unwrap();
      setMessage('User access revoked successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.message || 'Failed to revoke access');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleRestoreAccess = async (userId) => {
    try {
      await dispatch(restoreUserAccess(userId)).unwrap();
      setMessage('User access restored successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.message || 'Failed to restore access');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      {message && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  {user.isActive ? (
                    <CheckCircle color="success" />
                  ) : (
                    <Block color="error" />
                  )}
                </TableCell>
                <TableCell>
                  {user.isActive ? (
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<Block />}
                      onClick={() => handleRevokeAccess(user._id)}
                    >
                      Revoke Access
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircle />}
                      onClick={() => handleRestoreAccess(user._id)}
                    >
                      Restore Access
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default AdminDashboard; 