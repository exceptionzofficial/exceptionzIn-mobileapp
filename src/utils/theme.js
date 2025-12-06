// Professional Light Theme for Exceptionz App

export const COLORS = {
    // Primary Colors
    primary: '#2563EB', // Blue
    primaryDark: '#1D4ED8',
    primaryLight: '#3B82F6',

    // Background Colors
    background: '#F8FAFC',
    backgroundCard: '#FFFFFF',
    backgroundLight: '#F1F5F9',
    backgroundDark: '#E2E8F0',

    // Text Colors
    text: '#1E293B',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    textLight: '#CBD5E1',

    // Accent Colors
    accent: '#0EA5E9', // Sky blue
    accentLight: '#38BDF8',

    // Status Colors
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',

    // Client Status Colors
    newLead: '#8B5CF6', // Purple
    contacted: '#F59E0B', // Amber
    qualified: '#3B82F6', // Blue
    converted: '#10B981', // Green
    lost: '#EF4444', // Red

    // Border Colors
    border: '#E2E8F0',
    borderDark: '#CBD5E1',

    // Tab Bar
    tabBarBackground: '#FFFFFF',
    tabBarActive: '#2563EB',
    tabBarInactive: '#94A3B8',

    // Overlay
    overlay: 'rgba(0, 0, 0, 0.5)',

    // White
    white: '#FFFFFF',
    black: '#000000',
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
    },
    weights: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
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
};

export const RADIUS = {
    sm: 6,
    md: 10,
    lg: 14,
    xl: 18,
    full: 9999,
};

export const SHADOWS = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
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
    input: {
        backgroundColor: COLORS.backgroundLight,
        borderRadius: RADIUS.md,
        padding: SPACING.lg,
        color: COLORS.text,
        fontSize: FONTS.sizes.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    button: {
        backgroundColor: COLORS.primary,
        borderRadius: RADIUS.md,
        padding: SPACING.lg,
        alignItems: 'center',
    },
    buttonText: {
        color: COLORS.white,
        fontSize: FONTS.sizes.md,
        fontWeight: FONTS.weights.semibold,
    },
};
