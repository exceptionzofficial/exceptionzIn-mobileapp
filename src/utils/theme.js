// Premium Professional Theme for Exceptionz App
// Modern gradient-inspired color palette

export const COLORS = {
    // Primary Gradient Colors (Deep Blue to Teal)
    primary: '#1E40AF', // Deep Royal Blue
    primaryDark: '#1E3A8A',
    primaryLight: '#3B82F6',
    primaryGradientStart: '#1E40AF',
    primaryGradientEnd: '#0891B2',

    // Secondary Accent (Vibrant Coral/Orange)
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

    // Accent Colors
    accent: '#06B6D4', // Cyan
    accentLight: '#22D3EE',
    accentDark: '#0891B2',

    // Status Colors (Vibrant)
    success: '#059669', // Emerald
    successLight: '#10B981',
    error: '#DC2626', // Red
    errorLight: '#EF4444',
    warning: '#D97706', // Amber
    warningLight: '#F59E0B',
    info: '#2563EB', // Blue
    infoLight: '#3B82F6',

    // Client Status Colors (Premium)
    newLead: '#7C3AED', // Violet
    contacted: '#D97706', // Amber
    qualified: '#2563EB', // Blue
    converted: '#059669', // Emerald
    lost: '#DC2626', // Red

    // Project Status Colors
    planning: '#6366F1', // Indigo
    inProgress: '#F59E0B', // Amber
    review: '#8B5CF6', // Purple
    completed: '#059669', // Emerald
    finishing: '#0891B2', // Cyan

    // Border Colors
    border: '#E2E8F0',
    borderDark: '#CBD5E1',
    borderLight: '#F1F5F9',

    // Tab Bar
    tabBarBackground: '#FFFFFF',
    tabBarActive: '#1E40AF',
    tabBarInactive: '#94A3B8',

    // Overlay
    overlay: 'rgba(15, 23, 42, 0.6)',
    overlayLight: 'rgba(15, 23, 42, 0.3)',

    // Splash Screen
    splashBackground: '#1E40AF',
    splashGradientStart: '#1E3A8A',
    splashGradientMiddle: '#1E40AF',
    splashGradientEnd: '#0891B2',

    // Base
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
};

export const GRADIENTS = {
    primary: ['#1E3A8A', '#1E40AF', '#0891B2'],
    secondary: ['#EA580C', '#F97316', '#FB923C'],
    success: ['#047857', '#059669', '#10B981'],
    splash: ['#0F172A', '#1E3A8A', '#1E40AF'],
    card: ['#FFFFFF', '#F8FAFC'],
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
        shadowColor: '#1E40AF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    md: {
        shadowColor: '#1E40AF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 4,
    },
    lg: {
        shadowColor: '#1E40AF',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
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
        backgroundColor: COLORS.background,
    },
    card: {
        backgroundColor: COLORS.backgroundCard,
        borderRadius: RADIUS.lg,
        padding: SPACING.lg,
        ...SHADOWS.md,
    },
    cardPremium: {
        backgroundColor: COLORS.backgroundCard,
        borderRadius: RADIUS.xl,
        padding: SPACING.xl,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        ...SHADOWS.lg,
    },
    input: {
        backgroundColor: COLORS.backgroundLight,
        borderRadius: RADIUS.md,
        padding: SPACING.lg,
        color: COLORS.text,
        fontSize: FONTS.sizes.md,
        borderWidth: 1.5,
        borderColor: COLORS.border,
    },
    inputFocused: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.white,
    },
    button: {
        backgroundColor: COLORS.primary,
        borderRadius: RADIUS.md,
        padding: SPACING.lg,
        alignItems: 'center',
        ...SHADOWS.sm,
    },
    buttonSecondary: {
        backgroundColor: COLORS.secondary,
        borderRadius: RADIUS.md,
        padding: SPACING.lg,
        alignItems: 'center',
        ...SHADOWS.sm,
    },
    buttonText: {
        color: COLORS.white,
        fontSize: FONTS.sizes.md,
        fontWeight: FONTS.weights.semibold,
    },
    gradientButton: {
        borderRadius: RADIUS.md,
        padding: SPACING.lg,
        alignItems: 'center',
    },
};
