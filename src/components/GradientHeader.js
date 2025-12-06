import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import { SPACING, FONTS } from '../utils/theme';

const GradientHeader = ({
    title,
    onBack,
    rightIcon,
    onRightPress,
    subtitle,
    showBack = true,
}) => {
    const { colors, gradients } = useTheme();

    return (
        <LinearGradient
            colors={gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.container}
        >
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            <View style={styles.content}>
                {/* Left - Back Button */}
                <View style={styles.leftSection}>
                    {showBack && onBack && (
                        <TouchableOpacity style={styles.backButton} onPress={onBack}>
                            <Icon name="arrow-left" size={24} color={colors.white} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Center - Title */}
                <View style={styles.centerSection}>
                    <Text style={[styles.title, { color: colors.white }]} numberOfLines={1}>{title}</Text>
                    {subtitle && (
                        <Text style={[styles.subtitle, { color: 'rgba(255, 255, 255, 0.7)' }]} numberOfLines={1}>{subtitle}</Text>
                    )}
                </View>

                {/* Right - Action Button */}
                <View style={styles.rightSection}>
                    {rightIcon && (
                        <TouchableOpacity style={styles.actionButton} onPress={onRightPress}>
                            <Icon name={rightIcon} size={22} color={colors.white} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 44,
        paddingBottom: SPACING.md,
        paddingHorizontal: SPACING.lg,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 44,
    },
    leftSection: {
        width: 44,
    },
    centerSection: {
        flex: 1,
        alignItems: 'center',
    },
    rightSection: {
        width: 44,
        alignItems: 'flex-end',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: FONTS.sizes.lg,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: FONTS.sizes.xs,
        marginTop: 2,
    },
    actionButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default GradientHeader;
