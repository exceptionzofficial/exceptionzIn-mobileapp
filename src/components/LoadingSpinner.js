import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, GRADIENTS } from '../utils/theme';

const LoadingSpinner = ({ size = 50, color = COLORS.primary }) => {
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        // Rotation animation
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 1200,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();

        // Pulse animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 0.8,
                    duration: 600,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const rotation = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    width: size,
                    height: size,
                    transform: [{ rotate: rotation }, { scale: scaleAnim }],
                },
            ]}
        >
            <LinearGradient
                colors={GRADIENTS.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.spinner, { width: size, height: size, borderRadius: size / 2 }]}
            >
                <View style={[styles.innerCircle, { width: size - 8, height: size - 8, borderRadius: (size - 8) / 2 }]} />
            </LinearGradient>
        </Animated.View>
    );
};

// Full screen loading overlay
export const LoadingOverlay = ({ visible, message = 'Loading...' }) => {
    if (!visible) return null;

    return (
        <View style={styles.overlay}>
            <View style={styles.loadingCard}>
                <LoadingSpinner size={60} />
                <Animated.Text style={styles.loadingText}>{message}</Animated.Text>
            </View>
        </View>
    );
};

// Inline loading for lists
export const InlineLoading = () => (
    <View style={styles.inlineContainer}>
        <LoadingSpinner size={32} />
    </View>
);

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    spinner: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    innerCircle: {
        backgroundColor: COLORS.white,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
    },
    loadingCard: {
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 10,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 14,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    inlineContainer: {
        padding: 20,
        alignItems: 'center',
    },
});

export default LoadingSpinner;
