import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';
import UserList from './components/UserList';
import CreateUser from './components/CreateUser';
import Login from './components/Login';
import Register from './components/Register';
import PrivateRoute from './components/PrivateRoute';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from './store/slices/authSlice';

// Navbar component
const Navbar = () => {
    const dispatch = useDispatch();
    const { isAuthenticated, user } = useSelector((state) => state.auth);

    const handleLogout = () => {
        dispatch(logout());
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    User Management
                </Typography>
                {isAuthenticated ? (
                    <>
                        <Typography variant="body1" sx={{ mr: 2 }}>
                            {user?.username} ({user?.role})
                        </Typography>
                        {user?.role === 'admin' && (
                            <>
                                <Button color="inherit" component={Link} to="/">
                                    Users
                                </Button>
                                <Button color="inherit" component={Link} to="/create">
                                    Create User
                                </Button>
                            </>
                        )}
                        <Button color="inherit" onClick={handleLogout}>
                            Logout
                        </Button>
                    </>
                ) : (
                    <>
                        <Button color="inherit" component={Link} to="/login">
                            Login
                        </Button>
                        <Button color="inherit" component={Link} to="/register">
                            Register
                        </Button>
                    </>
                )}
            </Toolbar>
        </AppBar>
    );
};

function App() {
    return (
        <Provider store={store}>
            <Router>
                <Navbar />
                <Container sx={{ mt: 4 }}>
                    <Routes>
                        {/* Public routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* Protected routes */}
                        <Route element={<PrivateRoute roles={['admin']} />}>
                            <Route path="/" element={<UserList />} />
                            <Route path="/create" element={<CreateUser />} />
                        </Route>

                        {/* Redirect to home if no route matches */}
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </Container>
            </Router>
        </Provider>
    );
}

export default App;
