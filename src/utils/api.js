import AsyncStorage from '@react-native-async-storage/async-storage';

// Change this to your server IP when running backend
// For Android emulator use 10.0.2.2 for localhost
// For physical device, use your computer's IP address
const BASE_URL = 'https://6f2bfc127c65.ngrok-free.app/api';
// const BASE_URL = 'https://exception-z.com/api';


// Storage keys
const TOKEN_KEY = '@exceptionz_token';
const USER_KEY = '@exceptionz_user';

// Store token and user data
export const storeAuthData = async (token, user) => {
    try {
        await AsyncStorage.setItem(TOKEN_KEY, token);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
        return true;
    } catch (error) {
        console.error('Error storing auth data:', error);
        return false;
    }
};

// Get stored token
export const getToken = async () => {
    try {
        return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
        console.error('Error getting token:', error);
        return null;
    }
};

// Get stored user
export const getStoredUser = async () => {
    try {
        const user = await AsyncStorage.getItem(USER_KEY);
        return user ? JSON.parse(user) : null;
    } catch (error) {
        console.error('Error getting user:', error);
        return null;
    }
};

// Clear auth data (logout)
export const clearAuthData = async () => {
    try {
        await AsyncStorage.removeItem(TOKEN_KEY);
        await AsyncStorage.removeItem(USER_KEY);
        return true;
    } catch (error) {
        console.error('Error clearing auth data:', error);
        return false;
    }
};

// Generic API request handler
const apiRequest = async (endpoint, options = {}) => {
    const token = await getToken();

    const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Request failed');
        }

        return { success: true, data };
    } catch (error) {
        console.error(`API Error [${endpoint}]:`, error.message);
        return { success: false, error: error.message };
    }
};

// ============ AUTH API ============

export const authAPI = {
    login: async (email, password) => {
        const result = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });

        if (result.success) {
            await storeAuthData(result.data.token, result.data.user);
        }

        return result;
    },

    logout: async () => {
        await clearAuthData();
        return { success: true };
    },

    getMe: () => apiRequest('/auth/me'),

    updateProfile: (updates) => apiRequest('/auth/me', {
        method: 'PUT',
        body: JSON.stringify(updates),
    }),

    getUsers: () => apiRequest('/auth/users'),

    createUser: (userData) => apiRequest('/auth/users', {
        method: 'POST',
        body: JSON.stringify(userData),
    }),

    blockUser: (userId) => apiRequest(`/auth/users/${userId}/block`, {
        method: 'PUT',
    }),

    unblockUser: (userId) => apiRequest(`/auth/users/${userId}/unblock`, {
        method: 'PUT',
    }),

    deleteUser: (userId) => apiRequest(`/auth/users/${userId}`, {
        method: 'DELETE',
    }),
};

// ============ CLIENTS API ============

export const clientsAPI = {
    getAll: () => apiRequest('/clients'),

    getOne: (id) => apiRequest(`/clients/${id}`),

    create: (clientData) => apiRequest('/clients', {
        method: 'POST',
        body: JSON.stringify(clientData),
    }),

    update: (id, updates) => apiRequest(`/clients/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
    }),

    delete: (id) => apiRequest(`/clients/${id}`, {
        method: 'DELETE',
    }),

    addNote: (id, text) => apiRequest(`/clients/${id}/notes`, {
        method: 'POST',
        body: JSON.stringify({ text }),
    }),
};

// ============ PROJECTS API ============

export const projectsAPI = {
    getAll: () => apiRequest('/projects'),

    getOne: (id) => apiRequest(`/projects/${id}`),

    create: (projectData) => apiRequest('/projects', {
        method: 'POST',
        body: JSON.stringify(projectData),
    }),

    update: (id, updates) => apiRequest(`/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
    }),

    delete: (id) => apiRequest(`/projects/${id}`, {
        method: 'DELETE',
    }),

    addModule: (id, moduleData) => apiRequest(`/projects/${id}/modules`, {
        method: 'POST',
        body: JSON.stringify(moduleData),
    }),

    updateModule: (projectId, moduleId, updates) => apiRequest(`/projects/${projectId}/modules/${moduleId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
    }),

    // Financials
    updateFinancials: (id, financials) => apiRequest(`/projects/${id}/financials`, {
        method: 'PUT',
        body: JSON.stringify(financials),
    }),

    // Documents
    addDocument: (id, docData) => apiRequest(`/projects/${id}/documents`, {
        method: 'POST',
        body: JSON.stringify(docData),
    }),

    deleteDocument: (projectId, docId) => apiRequest(`/projects/${projectId}/documents/${docId}`, {
        method: 'DELETE',
    }),

    // Activities
    addActivity: (id, activityData) => apiRequest(`/projects/${id}/activities`, {
        method: 'POST',
        body: JSON.stringify(activityData),
    }),
};

// ============ TASKS API ============

export const tasksAPI = {
    getAll: () => apiRequest('/tasks'),

    getMyTasks: () => apiRequest('/tasks/my'),

    getOne: (id) => apiRequest(`/tasks/${id}`),

    getByProject: (projectId) => apiRequest(`/tasks/project/${projectId}`),

    create: (taskData) => apiRequest('/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
    }),

    update: (id, updates) => apiRequest(`/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
    }),

    delete: (id) => apiRequest(`/tasks/${id}`, {
        method: 'DELETE',
    }),

    addComment: (id, text) => apiRequest(`/tasks/${id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ text }),
    }),
};

// ============ HEALTH CHECK ============

export const checkServerHealth = async () => {
    try {
        const response = await fetch(`${BASE_URL}/health`);
        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        return { success: false, error: 'Server not reachable' };
    }
};

export default {
    auth: authAPI,
    clients: clientsAPI,
    projects: projectsAPI,
    tasks: tasksAPI,
    checkServerHealth,
};
