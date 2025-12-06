import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS, SPACING, SHADOWS } from '../utils/theme';

// Screens
import LoginScreen from '../screens/Login';
import AdminPanel from '../screens/admin/AdminPanel';

// Chat
import ChatScreen from '../screens/chat/ChatScreen';
import ChatRoomScreen from '../screens/chat/ChatRoomScreen';

// Client
import ClientScreen from '../screens/client/ClientScreen';
import AddClientScreen from '../screens/client/AddClientScreen';
import ClientDetailScreen from '../screens/client/ClientDetailScreen';

// Project
import ProjectScreen from '../screens/project/ProjectScreen';
import AddProjectScreen from '../screens/project/AddProjectScreen';
import ProjectDetailScreen from '../screens/project/ProjectDetailScreen';

// Task
import TaskScreen from '../screens/task/TaskScreen';
import AddTaskScreen from '../screens/task/AddTaskScreen';
import TaskDetailScreen from '../screens/task/TaskDetailScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Icon mapping
const TAB_ICONS = {
    Chat: { active: 'chat', inactive: 'chat-outline' },
    Client: { active: 'account-group', inactive: 'account-group-outline' },
    Project: { active: 'folder', inactive: 'folder-outline' },
    Task: { active: 'checkbox-marked-circle', inactive: 'checkbox-marked-circle-outline' },
};

// Chat Stack
const ChatStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ChatList" component={ChatScreen} />
        <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
    </Stack.Navigator>
);

// Client Stack
const ClientStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ClientList" component={ClientScreen} />
        <Stack.Screen name="AddClient" component={AddClientScreen} />
        <Stack.Screen name="ClientDetail" component={ClientDetailScreen} />
    </Stack.Navigator>
);

// Project Stack
const ProjectStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ProjectList" component={ProjectScreen} />
        <Stack.Screen name="AddProject" component={AddProjectScreen} />
        <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
    </Stack.Navigator>
);

// Task Stack
const TaskStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="TaskList" component={TaskScreen} />
        <Stack.Screen name="AddTask" component={AddTaskScreen} />
        <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
    </Stack.Navigator>
);

// Main Tab Navigator
const MainTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarActiveTintColor: COLORS.tabBarActive,
                tabBarInactiveTintColor: COLORS.tabBarInactive,
                tabBarLabelStyle: styles.tabLabel,
                tabBarIcon: ({ focused, color, size }) => {
                    const iconName = focused
                        ? TAB_ICONS[route.name].active
                        : TAB_ICONS[route.name].inactive;
                    return <Icon name={iconName} size={24} color={color} />;
                },
            })}
        >
            <Tab.Screen
                name="Chat"
                component={ChatStack}
                options={{ tabBarLabel: 'Chat' }}
            />
            <Tab.Screen
                name="Client"
                component={ClientStack}
                options={{ tabBarLabel: 'Clients' }}
            />
            <Tab.Screen
                name="Project"
                component={ProjectStack}
                options={{ tabBarLabel: 'Projects' }}
            />
            <Tab.Screen
                name="Task"
                component={TaskStack}
                options={{ tabBarLabel: 'Tasks' }}
            />
        </Tab.Navigator>
    );
};

// Main App with Header
const MainWithHeader = ({ navigation }) => {
    const { isAdmin, user, logout } = useAuth();

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
            {/* Header Bar */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.headerTitle}>Exceptionz</Text>
                    <Text style={styles.headerSubtitle}>
                        {user?.name} {isAdmin ? '• Admin' : ''}
                    </Text>
                </View>
                <View style={styles.headerRight}>
                    {isAdmin && (
                        <TouchableOpacity
                            style={styles.headerButton}
                            onPress={() => navigation.navigate('AdminPanel')}
                        >
                            <Icon name="cog" size={22} color={COLORS.textSecondary} />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        style={styles.headerButton}
                        onPress={logout}
                    >
                        <Icon name="logout" size={22} color={COLORS.error} />
                    </TouchableOpacity>
                </View>
            </View>
            <MainTabs />
        </View>
    );
};

// App Stack
const AppStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainWithHeader} />
        <Stack.Screen name="AdminPanel" component={AdminPanel} />
    </Stack.Navigator>
);

// Auth Stack
const AuthStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
);

// Main Navigator
const Navigator = () => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <Icon name="loading" size={40} color={COLORS.primary} />
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    return (
        <NavigationContainer>
            {user ? <AppStack /> : <AuthStack />}
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: COLORS.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        color: COLORS.textSecondary,
        fontSize: FONTS.sizes.md,
        marginTop: SPACING.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.xl + 20, // Extra padding for status bar
        paddingBottom: SPACING.md,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        ...SHADOWS.sm,
    },
    headerLeft: {
        flex: 1,
    },
    headerTitle: {
        fontSize: FONTS.sizes.xl,
        fontWeight: '700',
        color: COLORS.primary,
        letterSpacing: 0.5,
    },
    headerSubtitle: {
        fontSize: FONTS.sizes.sm,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    headerRight: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.backgroundLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabBar: {
        backgroundColor: COLORS.tabBarBackground,
        borderTopColor: COLORS.border,
        borderTopWidth: 1,
        height: 60,
        paddingBottom: SPACING.xs,
        paddingTop: SPACING.xs,
        ...SHADOWS.sm,
    },
    tabLabel: {
        fontSize: FONTS.sizes.xs,
        fontWeight: '600',
    },
});

export default Navigator;
