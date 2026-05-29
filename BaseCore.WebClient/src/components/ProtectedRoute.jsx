import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false, userOnly = false }) => {
    const { isAuthenticated, isAdmin, isUser, loading } = useAuth();

    if (loading) {
        return (
            <div className="grid min-h-screen place-items-center bg-slate-50">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-plum-950" role="status" aria-label="Loading" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (adminOnly && !isAdmin()) {
        return <Navigate to="/login" replace />;
    }

    if (userOnly && !isUser()) {
        return <Navigate to={isAdmin() ? '/admin' : '/login'} replace />;
    }

    return children;
};

export default ProtectedRoute;
