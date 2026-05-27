import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';
import Login from './pages/Login';
import UserHome from './pages/UserHome';
import TicketBooking from './pages/TicketBooking';
import News from './pages/News';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Payment from './pages/Payment';
import MyTickets from './pages/MyTickets';
import Checkin from './pages/Checkin';

// Wrapper to redirect authenticated users away from login
const PublicRoute = ({ children }) => {
    const { isAuthenticated, isAdmin, loading } = useAuth();

    if (loading) {
        return (
            <div className="grid min-h-screen place-items-center bg-slate-50">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-plum-950" role="status" aria-label="Loading" />
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to={isAdmin() ? '/admin' : '/user'} replace />;
    }

    return children;
};

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route
                path="/user"
                element={
                    <ProtectedRoute userOnly={true}>
                        <UserHome />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/tickets/:matchSlug"
                element={
                    <ProtectedRoute userOnly={true}>
                        <TicketBooking />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/payments/:orderId"
                element={
                    <ProtectedRoute userOnly={true}>
                        <Payment />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/my-tickets"
                element={
                    <ProtectedRoute userOnly={true}>
                        <MyTickets />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/news"
                element={
                    <ProtectedRoute userOnly={true}>
                        <News />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/login"
                element={
                    <PublicRoute>
                        <Login />
                    </PublicRoute>
                }
            />
            <Route
                path="/admin"
                element={
                    <ProtectedRoute adminOnly={true}>
                        <MainLayout>
                            <Dashboard />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/users"
                element={
                    <ProtectedRoute adminOnly={true}>
                        <MainLayout>
                            <Users />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/checkin"
                element={
                    <ProtectedRoute adminOnly={true}>
                        <MainLayout>
                            <Checkin />
                        </MainLayout>
                    </ProtectedRoute>
                }
            />
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </Router>
    );
}

export default App;
