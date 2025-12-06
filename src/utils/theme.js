// Premium Professional Theme for Exceptionz App
// Modern gradient-inspired color palette

export const LIGHT_COLORS = {
    // Primary Gradient Colors
    primary: '#1E40AF', // Deep Royal Blue
    primaryDark: '#1E3A8A',
    primaryLight: '#3B82F6',
    primaryGradientStart: '#1E40AF',
    primaryGradientEnd: '#0891B2',

    // Secondary Accent
    secondary: '#F97316',
    secondaryLight: '#FB923C',
    secondaryDark: '#EA580C',

    // Background Colors
    background: '#F8FAFC',
    backgroundCard: '#FFFFFF',
    backgroundLight: '#F1F5F9',
    backgroundDark: '#E2E8F0',
    backgroundGradientStart: '#1E40AF',
    backgroundGradientEnd: '#0E7490',

    // Text Colors
    text: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    textLight: '#CBD5E1',
    textOnPrimary: '#FFFFFF',

    // Status Colors
    success: '#059669',
    error: '#DC2626',
    warning: '#D97706',
    info: '#2563EB',

    // Border
    border: '#E2E8F0',
    borderDark: '#CBD5E1',
    borderLight: '#F1F5F9',

    // Tab Bar
    tabBarBackground: '#FFFFFF',
    tabBarActive: '#1E40AF',
    tabBarInactive: '#94A3B8',

    // Components
    inputBackground: '#F1F5F9',
    overlay: 'rgba(15, 23, 42, 0.6)',

    // Base
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
};

export const DARK_COLORS = {
    // Primary Gradient Colors
    primary: '#3B82F6', // Lighter Blue for Dark Mode
    primaryDark: '#1E40AF',
    primaryLight: '#60A5FA',
    primaryGradientStart: '#1E3A8A',
    primaryGradientEnd: '#0E7490',

    // Secondary Accent
    secondary: '#FB923C',
    secondaryLight: '#FDBA74',
    secondaryDark: '#F97316',

    // Background Colors
    background: '#0F172A', // Slate 900
    backgroundCard: '#1E293B', // Slate 800
    backgroundLight: '#334155', // Slate 700
    backgroundDark: '#020617', // Slate 950
    backgroundGradientStart: '#0F172A',
    backgroundGradientEnd: '#1E293B',

    // Text Colors
    text: '#F8FAFC', // Slate 50
    textSecondary: '#CBD5E1', // Slate 300
    textMuted: '#94A3B8', // Slate 400
    textLight: '#64748B', // Slate 500
    textOnPrimary: '#FFFFFF',

    // Status Colors
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',

    // Border
    border: '#334155',
    borderDark: '#475569',
    borderLight: '#1E293B',

    // Tab Bar
    tabBarBackground: '#1E293B',
    tabBarActive: '#60A5FA',
    tabBarInactive: '#64748B',

    // Components
    inputBackground: '#334155',
    overlay: 'rgba(0, 0, 0, 0.8)',

    // Base
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
};

// Legacy support
export const COLORS = LIGHT_COLORS;

export const GRADIENTS = {
    primary: ['#1E3A8A', '#1E40AF', '#0891B2'],
    secondary: ['#EA580C', '#F97316', '#FB923C'],
    success: ['#047857', '#059669', '#10B981'],
    splash: ['#0F172A', '#1E3A8A', '#1E40AF'],
    card: ['#FFFFFF', '#F8FAFC'],
    darkCard: ['#1E293B', '#0F172A'],
};

export const FONTS = {
    sizes: {
        xs: 11,
        sm: 13,
        md: 15,
        lg: 17,
        xl: 20,
        xxl: 24,
        xxxl: 32,
        title: 40,
    },
    weights: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
    },
};

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    huge: 48,
};

export const RADIUS = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    full: 9999,
};

export const SHADOWS = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
    glow: {
        shadowColor: '#0891B2',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 10,
    },
};

export const commonStyles = {
    container: {
        flex: 1,
    },
    // ... rest of the common styles remain similar but we will use them dynamically in components
};

