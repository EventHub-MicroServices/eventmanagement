import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    // Check if the user is logged in by looking for the JWT token
    const token = localStorage.getItem('token');
    
    if (!token) {
        // If no token exists, forcefully redirect them to the login page
        return <Navigate to="/login" replace />;
    }
    
    // If they are logged in, allow them to see the page!
    return children;
};

export default ProtectedRoute;
