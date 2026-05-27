import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';
import Login from './pages/Login';
import UserHome from './pages/UserHome';
import UserMatches from './pages/UserMatches';
import Guide from './pages/Guide';
import TicketBooking from './pages/TicketBooking';
import News from './pages/News';
import Payment from './pages/Payment';
import MyTickets from './pages/MyTickets';
import Checkin from './pages/Checkin';
import {
    AdminClubs,
    AdminDashboard,
    AdminETickets,
    AdminMatches,
    AdminNews,
    AdminOrders,
    AdminPayments,
    AdminRounds,
    AdminSeasons,
    AdminStadiums,
    AdminTickets,
    AdminUsers,
} from './pages/admin/AdminPages';

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

const AdminRoute = ({ children }) => (
    <ProtectedRoute adminOnly={true}>
        <MainLayout>
            {children}
        </MainLayout>
    </ProtectedRoute>
);

function AppRoutes() {
    return (
        <Routes>
            <Route
                path="/"
                element={
                    <ProtectedRoute userOnly={true}>
                        <UserHome />
                    </ProtectedRoute>
                }
            />
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
                path="/matches"
                element={
                    <ProtectedRoute userOnly={true}>
                        <UserMatches />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/guide"
                element={
                    <ProtectedRoute userOnly={true}>
                        <Guide />
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
                    <Navigate to="/admin/dashboard" replace />
                }
            />
            <Route
                path="/admin/dashboard"
                element={
                    <AdminRoute>
                        <AdminDashboard />
                    </AdminRoute>
                }
            />
            <Route
                path="/admin/seasons"
                element={
                    <AdminRoute>
                        <AdminSeasons />
                    </AdminRoute>
                }
            />
            <Route
                path="/admin/rounds"
                element={
                    <AdminRoute>
                        <AdminRounds />
                    </AdminRoute>
                }
            />
            <Route
                path="/admin/matches"
                element={
                    <AdminRoute>
                        <AdminMatches />
                    </AdminRoute>
                }
            />
            <Route
                path="/admin/clubs"
                element={
                    <AdminRoute>
                        <AdminClubs />
                    </AdminRoute>
                }
            />
            <Route
                path="/admin/stadiums"
                element={
                    <AdminRoute>
                        <AdminStadiums />
                    </AdminRoute>
                }
            />
            <Route
                path="/admin/tickets"
                element={
                    <AdminRoute>
                        <AdminTickets />
                    </AdminRoute>
                }
            />
            <Route
                path="/admin/orders"
                element={
                    <AdminRoute>
                        <AdminOrders />
                    </AdminRoute>
                }
            />
            <Route
                path="/admin/payments"
                element={
                    <AdminRoute>
                        <AdminPayments />
                    </AdminRoute>
                }
            />
            <Route
                path="/admin/etickets"
                element={
                    <AdminRoute>
                        <AdminETickets />
                    </AdminRoute>
                }
            />
            <Route
                path="/admin/checkins"
                element={
                    <AdminRoute>
                        <Checkin />
                    </AdminRoute>
                }
            />
            <Route
                path="/admin/checkin"
                element={
                    <AdminRoute>
                        <Checkin />
                    </AdminRoute>
                }
            />
            <Route
                path="/admin/news"
                element={
                    <AdminRoute>
                        <AdminNews />
                    </AdminRoute>
                }
            />
            <Route
                path="/admin/users"
                element={
                    <AdminRoute>
                        <AdminUsers />
                    </AdminRoute>
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
