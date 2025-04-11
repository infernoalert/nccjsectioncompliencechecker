import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ roles = [] }) => {
    const { isAuthenticated, user } = useSelector((state) => state.auth);

    // Check if user is authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    // Check if route requires specific roles
    if (roles.length > 0 && !roles.includes(user.role)) {
        return <Navigate to="/" />;
    }

    return <Outlet />;
};

export default PrivateRoute; 