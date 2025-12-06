import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    Animated,
    Dimensions,
    StatusBar,
} from 'react-native';
import { COLORS, FONTS, SPACING, GRADIENTS } from '../utils/theme';

const { width, height } = Dimensions.get('window');

// Force dark splash screen for premium feel
const SPLASH_BG = '#0F172A';

const SplashScreen = ({ onFinish }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // ... (Animation logic remains the same)
        // Start animations
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.05,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        const timer = setTimeout(() => {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
            }).start(() => {
                if (onFinish) onFinish();
            });
        }, 2500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={SPLASH_BG} translucent />

            {/* Background Gradient Effect */}
            <View style={styles.gradientOverlay}>
                <View style={styles.gradientCircle1} />
                <View style={styles.gradientCircle2} />
                <View style={styles.gradientCircle3} />
            </View>

            {/* Logo Container */}
            <Animated.View
                style={[
                    styles.logoContainer,
                    {
                        opacity: fadeAnim,
                        transform: [
                            { scale: Animated.multiply(scaleAnim, pulseAnim) },
                            { translateY: slideAnim },
                        ],
                    },
                ]}
            >
                <View style={styles.logoGlow}>
                    <Image
                        source={require('../assets/logo-nobg.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>
            </Animated.View>

            {/* Brand Name */}
            <Animated.View
                style={[
                    styles.brandContainer,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                    },
                ]}
            >
                <Text style={styles.brandName}>EXCEPTIONZ</Text>
                <Text style={styles.tagline}>Internal Project Manager</Text>
            </Animated.View>

            {/* Bottom Decoration */}
            <Animated.View style={[styles.bottomDecor, { opacity: fadeAnim }]}>
                <View style={styles.decorLine} />
                <Text style={styles.versionText}>v1.0.0</Text>
                <View style={styles.decorLine} />
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: SPLASH_BG,
        alignItems: 'center',
        justifyContent: 'center',
    },
    gradientOverlay: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
    },
    gradientCircle1: {
        position: 'absolute',
        width: width * 1.5,
        height: width * 1.5,
        borderRadius: width * 0.75,
        backgroundColor: 'rgba(8, 145, 178, 0.15)',
        top: -width * 0.5,
        right: -width * 0.5,
    },
    gradientCircle2: {
        position: 'absolute',
        width: width * 1.2,
        height: width * 1.2,
        borderRadius: width * 0.6,
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
        bottom: -width * 0.3,
        left: -width * 0.4,
    },
    gradientCircle3: {
        position: 'absolute',
        width: width * 0.8,
        height: width * 0.8,
        borderRadius: width * 0.4,
        backgroundColor: 'rgba(249, 115, 22, 0.08)',
        top: height * 0.3,
        left: -width * 0.2,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    logoGlow: {
        padding: SPACING.lg,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        shadowColor: '#06B6D4',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 30,
        elevation: 10,
    },
    logo: {
        width: 140,
        height: 140,
    },
    brandContainer: {
        alignItems: 'center',
        marginTop: SPACING.xl,
    },
    brandName: {
        fontSize: FONTS.sizes.title,
        fontWeight: '800',
        color: COLORS.white,
        letterSpacing: 4,
        textShadowColor: 'rgba(6, 182, 212, 0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 10,
    },
    tagline: {
        fontSize: FONTS.sizes.md,
        color: 'rgba(255, 255, 255, 0.7)',
        marginTop: SPACING.sm,
        letterSpacing: 1,
    },
    bottomDecor: {
        position: 'absolute',
        bottom: 50,
        flexDirection: 'row',
        alignItems: 'center',
    },
    decorLine: {
        width: 40,
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    versionText: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: FONTS.sizes.xs,
        marginHorizontal: SPACING.md,
    },
});

export default SplashScreen;
