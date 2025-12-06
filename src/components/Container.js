import React from 'react';
import { View, StatusBar, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../utils/theme';

// Simple container component that replaces StarBackground
// Provides proper safe area handling and status bar configuration
const Container = ({ children, style, edges = ['top', 'left', 'right'] }) => {
    return (
        <SafeAreaView style={[styles.container, style]} edges={edges}>
            <StatusBar
                barStyle="dark-content"
                backgroundColor={COLORS.background}
                translucent={false}
            />
            {children}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
});

export default Container;
