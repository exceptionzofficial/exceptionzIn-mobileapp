import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { SPACING, RADIUS, SHADOWS, FONTS } from '../utils/theme';

const LoginScreen = () => {
    const { login } = useAuth();
    const { colors, isDark } = useTheme();
    const styles = useMemo(() => getStyles(colors), [colors]);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        if (!email.trim()) {
            Alert.alert('Error', 'Please enter your email');
            return;
        }
        if (!password.trim()) {
            Alert.alert('Error', 'Please enter your password');
            return;
        }

        setIsLoading(true);
        const result = await login(email.trim(), password);
        setIsLoading(false);

        if (!result.success) {
            Alert.alert('Login Failed', result.error || 'Invalid credentials');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar
                barStyle={isDark ? 'light-content' : 'dark-content'}
                backgroundColor={colors.background}
            />
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={styles.content}>
                    {/* Logo Section */}
                    <View style={styles.logoContainer}>
                        <View style={styles.logoBox}>
                            <Icon name="briefcase-check" size={48} color={colors.primary} />
                        </View>
                        <Text style={styles.appTitle}>Exceptionz</Text>
                        <Text style={styles.appSubtitle}>Internal Team Portal</Text>
                    </View>

                    {/* Login Form */}
                    <View style={styles.formContainer}>
                        <Text style={styles.welcomeText}>Welcome back</Text>
                        <Text style={styles.instructionText}>Sign in to continue</Text>

                        {/* Email Input */}
                        <View style={styles.inputContainer}>
                            <Icon name="email-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Email address"
                                placeholderTextColor={colors.textMuted}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>

                        {/* Password Input */}
                        <View style={styles.inputContainer}>
                            <Icon name="lock-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                placeholderTextColor={colors.textMuted}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity
                                style={styles.eyeButton}
                                onPress={() => setShowPassword(!showPassword)}
                            >
                                <Icon
                                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                    size={20}
                                    color={colors.textMuted}
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Login Button */}
                        <TouchableOpacity
                            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                            onPress={handleLogin}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Text style={styles.loginButtonText}>Signing in...</Text>
                            ) : (
                                <>
                                    <Text style={styles.loginButtonText}>Sign In</Text>
                                    <Icon name="arrow-right" size={20} color={colors.white} />
                                </>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Icon name="shield-check" size={16} color={colors.textMuted} />
                        <Text style={styles.footerText}>Secure login for team members only</Text>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const getStyles = (colors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    keyboardView: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: SPACING.xl,
        justifyContent: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: SPACING.xxxl,
    },
    logoBox: {
        width: 80,
        height: 80,
        borderRadius: RADIUS.xl,
        backgroundColor: colors.primary + '15',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.lg,
    },
    appTitle: {
        fontSize: FONTS.sizes.xxxl,
        fontWeight: '700',
        color: colors.text,
        letterSpacing: 1,
    },
    appSubtitle: {
        fontSize: FONTS.sizes.md,
        color: colors.textSecondary,
        marginTop: SPACING.xs,
    },
    formContainer: {
        backgroundColor: colors.backgroundCard,
        borderRadius: RADIUS.xl,
        padding: SPACING.xl,
        ...SHADOWS.lg,
        shadowColor: colors.primary, // Add subtle glow based on primary color
    },
    welcomeText: {
        fontSize: FONTS.sizes.xxl,
        fontWeight: '700',
        color: colors.text,
        marginBottom: SPACING.xs,
    },
    instructionText: {
        fontSize: FONTS.sizes.md,
        color: colors.textSecondary,
        marginBottom: SPACING.xl,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.backgroundLight,
        borderRadius: RADIUS.md,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    inputIcon: {
        paddingLeft: SPACING.lg,
    },
    input: {
        flex: 1,
        padding: SPACING.lg,
        fontSize: FONTS.sizes.md,
        color: colors.text,
    },
    eyeButton: {
        padding: SPACING.lg,
    },
    loginButton: {
        backgroundColor: colors.primary,
        borderRadius: RADIUS.md,
        padding: SPACING.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.sm,
        marginTop: SPACING.md,
    },
    loginButtonDisabled: {
        opacity: 0.7,
    },
    loginButtonText: {
        color: colors.white,
        fontSize: FONTS.sizes.lg,
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: SPACING.xxxl,
        gap: SPACING.sm,
    },
    footerText: {
        fontSize: FONTS.sizes.sm,
        color: colors.textMuted,
    },
});

export default LoginScreen;
