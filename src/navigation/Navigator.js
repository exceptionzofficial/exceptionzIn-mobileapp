import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS, SPACING, SHADOWS, GRADIENTS } from '../utils/theme';
import LoadingSpinner from '../components/LoadingSpinner';

// Screens
import LoginScreen from '../screens/Login';
import AdminPanel from '../screens/admin/AdminPanel';

// Chat
import ChatScreen from '../screens/chat/ChatScreen';
import ChatRoomScreen from '../screens/chat/ChatRoomScreen';

// Client (Leads)
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

// Profile
import ProfileScreen from '../screens/profile/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createMaterialTopTabNavigator();

// Tab Icon mapping - Updated order: Leads, Tasks, Chat, Projects, Profile
const TAB_ICONS = {
    Leads: { active: 'account-group', inactive: 'account-group-outline' },
    Tasks: { active: 'checkbox-marked-circle', inactive: 'checkbox-marked-circle-outline' },
    Chat: { active: 'chat', inactive: 'chat-outline' },
    Projects: { active: 'folder', inactive: 'folder-outline' },
    Profile: { active: 'account-circle', inactive: 'account-circle-outline' },
};

// Chat Stack
const ChatStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ChatList" component={ChatScreen} />
        <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
    </Stack.Navigator>
);

// Leads (Client) Stack
const LeadsStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="LeadsList" component={ClientScreen} />
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

// Profile Stack
const ProfileStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ProfileMain" component={ProfileScreen} />
    </Stack.Navigator>
);

// Custom Gradient Tab Bar
const CustomTabBar = ({ state, descriptors, navigation }) => {
    return (
        <LinearGradient
            colors={['#1E3A8A', '#1E40AF', '#0891B2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientTabBar}
        >
            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const label = options.tabBarLabel || route.name;
                const isFocused = state.index === index;

                const iconName = isFocused
                    ? TAB_ICONS[route.name].active
                    : TAB_ICONS[route.name].inactive;

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name);
                    }
                };

                return (
                    <TouchableOpacity
                        key={route.key}
                        style={styles.tabItem}
                        onPress={onPress}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.tabIconContainer, isFocused && styles.tabIconContainerActive]}>
                            <Icon
                                name={iconName}
                                size={22}
                                color={isFocused ? COLORS.white : 'rgba(255, 255, 255, 0.6)'}
                            />
                        </View>
                        <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
                            {label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </LinearGradient>
    );
};

// Main Tab Navigator - Order: Leads, Tasks, Chat (center), Projects, Profile
const MainTabs = () => {
    return (
        <Tab.Navigator
            initialRouteName="Chat"
            tabBarPosition="bottom"
            tabBar={props => <CustomTabBar {...props} />}
            screenOptions={{
                swipeEnabled: true,
                animationEnabled: true,
            }}
        >
            <Tab.Screen name="Leads" component={LeadsStack} options={{ tabBarLabel: 'Leads' }} />
            <Tab.Screen name="Tasks" component={TaskStack} options={{ tabBarLabel: 'Tasks' }} />
            <Tab.Screen name="Chat" component={ChatStack} options={{ tabBarLabel: 'Chat' }} />
            <Tab.Screen name="Projects" component={ProjectStack} options={{ tabBarLabel: 'Projects' }} />
            <Tab.Screen name="Profile" component={ProfileStack} options={{ tabBarLabel: 'Profile' }} />
        </Tab.Navigator>
    );
};

// Main App with Gradient Header
const MainWithHeader = ({ navigation }) => {
    const { isAdmin, user } = useAuth();

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            {/* Gradient Header */}
            <LinearGradient
                colors={GRADIENTS.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.headerTitle}>EXCEPTIONZ</Text>
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
                                <Icon name="cog" size={22} color={COLORS.white} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </LinearGradient>

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
            <LinearGradient
                colors={GRADIENTS.splash}
                style={styles.loadingContainer}
            >
                <LoadingSpinner size={60} />
                <Text style={styles.loadingText}>Loading...</Text>
            </LinearGradient>
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
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        color: COLORS.white,
        fontSize: FONTS.sizes.md,
        marginTop: SPACING.lg,
        fontWeight: '500',
    },
    // Gradient Header
    header: {
        paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + SPACING.md : SPACING.xl + 20,
        paddingBottom: SPACING.md,
        paddingHorizontal: SPACING.lg,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerLeft: {
        flex: 1,
    },
    headerTitle: {
        fontSize: FONTS.sizes.xl,
        fontWeight: '800',
        color: COLORS.white,
        letterSpacing: 2,
    },
    headerSubtitle: {
        fontSize: FONTS.sizes.sm,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 2,
    },
    headerRight: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    headerButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Gradient Tab Bar
    gradientTabBar: {
        flexDirection: 'row',
        paddingBottom: SPACING.md,
        paddingTop: SPACING.sm,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        marginTop: -20,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: SPACING.xs,
    },
    tabIconContainer: {
        width: 44,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabIconContainerActive: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    tabLabel: {
        fontSize: FONTS.sizes.xs,
        color: 'rgba(255, 255, 255, 0.6)',
        marginTop: 2,
    },
    tabLabelActive: {
        color: COLORS.white,
        fontWeight: '600',
    },
});

export default Navigator;
