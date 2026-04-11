import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
    // 1. First, check if they are even logged in
    const token = localStorage.getItem('token');
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // 2. Look at their database profile that we saved during login!
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            // 3. If they are actually an admin, let them in!
            if (user.role === 'admin') {
                return children;
            }
        } catch (e) {
            console.error("Failed to parse user data");
        }
    }

    // 4. If they are logged in but NOT an admin, kick them back to the event catalog
    return <Navigate to="/events" replace />;
};

export default AdminRoute;
