import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, getStoredUser, getToken, clearAuthData, storeAuthData } from '../utils/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    // Load stored user on app start
    useEffect(() => {
        loadStoredUser();
    }, []);

    const loadStoredUser = async () => {
        try {
            const token = await getToken();
            const storedUser = await getStoredUser();

            if (token && storedUser) {
                setUser(storedUser);
                setIsAdmin(storedUser.role === 'admin');
                // Fetch fresh user data
                await fetchCurrentUser();
                // Fetch users list
                await fetchUsers();
            }
        } catch (error) {
            console.error('Error loading stored user:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCurrentUser = async () => {
        const result = await authAPI.getMe();
        if (result.success) {
            setUser(result.data.user);
            setIsAdmin(result.data.user.role === 'admin');
        }
    };

    const fetchUsers = async () => {
        const result = await authAPI.getUsers();
        if (result.success) {
            setUsers(result.data.users);
        }
    };

    const login = async (email, password) => {
        const result = await authAPI.login(email, password);

        if (result.success) {
            setUser(result.data.user);
            setIsAdmin(result.data.user.role === 'admin');
            await fetchUsers();
            return { success: true };
        }

        return { success: false, error: result.error };
    };

    const logout = async () => {
        await authAPI.logout();
        setUser(null);
        setUsers([]);
        setIsAdmin(false);
        return { success: true };
    };

    const createUser = async (userData) => {
        const result = await authAPI.createUser(userData);
        if (result.success) {
            await fetchUsers();
        }
        return result;
    };

    const blockUser = async (userId) => {
        const result = await authAPI.blockUser(userId);
        if (result.success) {
            await fetchUsers();
        }
        return result;
    };

    const unblockUser = async (userId) => {
        const result = await authAPI.unblockUser(userId);
        if (result.success) {
            await fetchUsers();
        }
        return result;
    };

    const deleteUser = async (userId) => {
        const result = await authAPI.deleteUser(userId);
        if (result.success) {
            await fetchUsers();
        }
        return result;
    };

    const updateUserProfile = async (updates) => {
        const result = await authAPI.updateProfile(updates);
        if (result.success) {
            setUser(result.data.user);
            await storeAuthData(await getToken(), result.data.user);
        }
        return result;
    };

    const getAllUsers = () => users;

    const getActiveUsers = () => users.filter(u => !u.isBlocked);

    const getUserById = (userId) => users.find(u => u.id === userId);

    const refreshUsers = async () => {
        await fetchUsers();
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                users,
                isLoading,
                isAdmin,
                login,
                logout,
                createUser,
                blockUser,
                unblockUser,
                deleteUser,
                updateUserProfile,
                getAllUsers,
                getActiveUsers,
                getUserById,
                refreshUsers,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
