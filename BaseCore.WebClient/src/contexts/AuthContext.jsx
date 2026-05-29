import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginWithCredentials } from '../services/authService';
import {
    clearAuthSession,
    getRoleFromUser,
    getStoredUser,
    isAdminRole,
    isUserRole,
} from '../utils/auth';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = getStoredUser();
        setUser(storedUser);
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const { userData, role } = await loginWithCredentials(username, password);
            setUser(userData);

            return { success: true, role };
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Login failed';
            return { success: false, message };
        }
    };

    const logout = () => {
        clearAuthSession();
        setUser(null);
    };

    const isAdmin = () => {
        return isAdminRole(getRoleFromUser(user));
    };

    const isUser = () => {
        return isUserRole(getRoleFromUser(user));
    };

    const value = {
        user,
        login,
        logout,
        isAdmin,
        isUser,
        role: getRoleFromUser(user),
        isAuthenticated: !!user,
        loading,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
