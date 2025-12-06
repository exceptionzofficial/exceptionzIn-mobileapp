import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions, StyleSheet } from 'react-native';
import { COLORS } from '../utils/theme';

const { width, height } = Dimensions.get('window');
const STAR_COUNT = 50;

const Star = ({ delay, duration, size, initialX, initialY }) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateX = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const twinkle = () => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(opacity, {
                        toValue: 1,
                        duration: duration * 0.5,
                        delay,
                        useNativeDriver: true,
                    }),
                    Animated.timing(opacity, {
                        toValue: 0.2,
                        duration: duration * 0.5,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        };

        const drift = () => {
            Animated.loop(
                Animated.sequence([
                    Animated.parallel([
                        Animated.timing(translateX, {
                            toValue: Math.random() * 20 - 10,
                            duration: duration * 2,
                            useNativeDriver: true,
                        }),
                        Animated.timing(translateY, {
                            toValue: Math.random() * 20 - 10,
                            duration: duration * 2,
                            useNativeDriver: true,
                        }),
                    ]),
                    Animated.parallel([
                        Animated.timing(translateX, {
                            toValue: 0,
                            duration: duration * 2,
                            useNativeDriver: true,
                        }),
                        Animated.timing(translateY, {
                            toValue: 0,
                            duration: duration * 2,
                            useNativeDriver: true,
                        }),
                    ]),
                ])
            ).start();
        };

        twinkle();
        drift();
    }, []);

    return (
        <Animated.View
            style={[
                styles.star,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    left: initialX,
                    top: initialY,
                    opacity,
                    transform: [{ translateX }, { translateY }],
                },
            ]}
        />
    );
};

const StarBackground = ({ children }) => {
    const stars = useRef(
        Array.from({ length: STAR_COUNT }, (_, i) => ({
            id: i,
            delay: Math.random() * 2000,
            duration: 2000 + Math.random() * 3000,
            size: 1 + Math.random() * 3,
            initialX: Math.random() * width,
            initialY: Math.random() * height,
        }))
    ).current;

    return (
        <View style={styles.container}>
            <View style={styles.starsContainer}>
                {stars.map((star) => (
                    <Star key={star.id} {...star} />
                ))}
            </View>
            <View style={styles.content}>{children}</View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    starsContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    star: {
        position: 'absolute',
        backgroundColor: COLORS.star,
        shadowColor: COLORS.star,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
        elevation: 2,
    },
    content: {
        flex: 1,
    },
});

export default StarBackground;
