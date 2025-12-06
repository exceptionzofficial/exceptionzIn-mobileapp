import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { clientsAPI, projectsAPI, tasksAPI } from '../utils/api';
import { useAuth } from './AuthContext';

const DataContext = createContext({});

// Keys for local chat storage (chat is still local)
const MESSAGES_KEY = '@exceptionz_messages';

export const DataProvider = ({ children }) => {
    const { user } = useAuth();

    const [clients, setClients] = useState([]);
    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load all data when user logs in
    useEffect(() => {
        if (user) {
            loadAllData();
        } else {
            // Clear data on logout
            setClients([]);
            setProjects([]);
            setTasks([]);
            setMessages([]);
        }
    }, [user]);

    const loadAllData = async () => {
        setIsLoading(true);
        try {
            await Promise.all([
                fetchClients(),
                fetchProjects(),
                fetchTasks(),
                loadMessages(),
            ]);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // ============ CLIENTS ============

    const fetchClients = async () => {
        const result = await clientsAPI.getAll();
        if (result.success) {
            setClients(result.data.clients);
        }
    };

    const addClient = async (clientData) => {
        const result = await clientsAPI.create(clientData);
        if (result.success) {
            setClients(prev => [result.data.client, ...prev]);
        }
        return result;
    };

    const updateClient = async (clientId, updates) => {
        const result = await clientsAPI.update(clientId, updates);
        if (result.success) {
            setClients(prev => prev.map(c => c.id === clientId ? result.data.client : c));
        }
        return result;
    };

    const deleteClient = async (clientId) => {
        const result = await clientsAPI.delete(clientId);
        if (result.success) {
            setClients(prev => prev.filter(c => c.id !== clientId));
        }
        return result;
    };

    const addClientNote = async (clientId, noteText) => {
        const result = await clientsAPI.addNote(clientId, noteText);
        if (result.success) {
            // Refresh client to get updated notes
            const clientResult = await clientsAPI.getOne(clientId);
            if (clientResult.success) {
                setClients(prev => prev.map(c => c.id === clientId ? clientResult.data.client : c));
            }
        }
        return result;
    };

    const getClientById = (clientId) => clients.find(c => c.id === clientId);

    // ============ PROJECTS ============

    const fetchProjects = async () => {
        const result = await projectsAPI.getAll();
        if (result.success) {
            setProjects(result.data.projects);
        }
    };

    const addProject = async (projectData) => {
        const result = await projectsAPI.create(projectData);
        if (result.success) {
            setProjects(prev => [result.data.project, ...prev]);
        }
        return result;
    };

    const updateProject = async (projectId, updates) => {
        const result = await projectsAPI.update(projectId, updates);
        if (result.success) {
            setProjects(prev => prev.map(p => p.id === projectId ? result.data.project : p));
        }
        return result;
    };

    const deleteProject = async (projectId) => {
        const result = await projectsAPI.delete(projectId);
        if (result.success) {
            setProjects(prev => prev.filter(p => p.id !== projectId));
        }
        return result;
    };

    const addProjectModule = async (projectId, moduleData) => {
        const result = await projectsAPI.addModule(projectId, moduleData);
        if (result.success) {
            // Refresh project to get updated modules
            const projectResult = await projectsAPI.getOne(projectId);
            if (projectResult.success) {
                setProjects(prev => prev.map(p => p.id === projectId ? projectResult.data.project : p));
            }
        }
        return result;
    };

    const updateProjectModule = async (projectId, moduleId, updates) => {
        const result = await projectsAPI.updateModule(projectId, moduleId, updates);
        if (result.success) {
            // Refresh project to get updated modules
            const projectResult = await projectsAPI.getOne(projectId);
            if (projectResult.success) {
                setProjects(prev => prev.map(p => p.id === projectId ? projectResult.data.project : p));
            }
        }
        return result;
    };

    const getProjectById = (projectId) => projects.find(p => p.id === projectId);

    // ============ TASKS ============

    const fetchTasks = async () => {
        const result = await tasksAPI.getAll();
        if (result.success) {
            setTasks(result.data.tasks);
        }
    };

    const addTask = async (taskData) => {
        const result = await tasksAPI.create(taskData);
        if (result.success) {
            setTasks(prev => [result.data.task, ...prev]);
        }
        return result;
    };

    const updateTask = async (taskId, updates) => {
        const result = await tasksAPI.update(taskId, updates);
        if (result.success) {
            setTasks(prev => prev.map(t => t.id === taskId ? result.data.task : t));
        }
        return result;
    };

    const deleteTask = async (taskId) => {
        const result = await tasksAPI.delete(taskId);
        if (result.success) {
            setTasks(prev => prev.filter(t => t.id !== taskId));
        }
        return result;
    };

    const addTaskComment = async (taskId, commentText) => {
        const result = await tasksAPI.addComment(taskId, commentText);
        if (result.success) {
            // Refresh task to get updated comments
            const taskResult = await tasksAPI.getOne(taskId);
            if (taskResult.success) {
                setTasks(prev => prev.map(t => t.id === taskId ? taskResult.data.task : t));
            }
        }
        return result;
    };

    const getTaskById = (taskId) => tasks.find(t => t.id === taskId);

    // ============ MESSAGES (Local Storage - Chat Feature Later) ============

    const loadMessages = async () => {
        try {
            const stored = await AsyncStorage.getItem(MESSAGES_KEY);
            if (stored) {
                setMessages(JSON.parse(stored));
            }
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };

    const saveMessages = async (newMessages) => {
        try {
            await AsyncStorage.setItem(MESSAGES_KEY, JSON.stringify(newMessages));
            setMessages(newMessages);
        } catch (error) {
            console.error('Error saving messages:', error);
        }
    };

    const sendMessage = async (toUserId, text) => {
        if (!user || !text.trim()) return { success: false, error: 'Invalid message' };

        const newMessage = {
            id: `msg_${Date.now()}`,
            fromUserId: user.id,
            toUserId,
            text: text.trim(),
            timestamp: new Date().toISOString(),
            read: false,
        };

        const updated = [...messages, newMessage];
        await saveMessages(updated);
        return { success: true, message: newMessage };
    };

    const getConversation = (userId) => {
        if (!user) return [];
        return messages
            .filter(m =>
                (m.fromUserId === user.id && m.toUserId === userId) ||
                (m.fromUserId === userId && m.toUserId === user.id)
            )
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    };

    const getUnreadCount = (userId) => {
        if (!user) return 0;
        return messages.filter(m =>
            m.fromUserId === userId &&
            m.toUserId === user.id &&
            !m.read
        ).length;
    };

    const markMessagesAsRead = async (userId) => {
        if (!user) return;

        const updated = messages.map(m => {
            if (m.fromUserId === userId && m.toUserId === user.id && !m.read) {
                return { ...m, read: true };
            }
            return m;
        });

        await saveMessages(updated);
    };

    const getLastMessage = (userId) => {
        const conversation = getConversation(userId);
        return conversation.length > 0 ? conversation[conversation.length - 1] : null;
    };

    // ============ REFRESH FUNCTIONS ============

    const refreshClients = () => fetchClients();
    const refreshProjects = () => fetchProjects();
    const refreshTasks = () => fetchTasks();
    const refreshAll = () => loadAllData();

    return (
        <DataContext.Provider
            value={{
                // State
                clients,
                projects,
                tasks,
                messages,
                isLoading,

                // Clients
                addClient,
                updateClient,
                deleteClient,
                addClientNote,
                getClientById,
                refreshClients,

                // Projects
                addProject,
                updateProject,
                deleteProject,
                addProjectModule,
                updateProjectModule,
                getProjectById,
                refreshProjects,

                // Tasks
                addTask,
                updateTask,
                deleteTask,
                addTaskComment,
                getTaskById,
                refreshTasks,

                // Messages (local)
                sendMessage,
                getConversation,
                getUnreadCount,
                markMessagesAsRead,
                getLastMessage,

                // Refresh all
                refreshAll,
            }}
        >
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => useContext(DataContext);
