import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme, Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LIGHT_COLORS, DARK_COLORS, GRADIENTS } from '../utils/theme';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Default to system scheme or light
    const systemScheme = useColorScheme();
    const [theme, setTheme] = useState(systemScheme || 'light');
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('user_theme');
            if (savedTheme) {
                setTheme(savedTheme);
            }
        } catch (error) {
            console.log('Error loading theme:', error);
        } finally {
            setIsLoaded(true);
        }
    };

    const updateTheme = async (newTheme) => {
        try {
            setTheme(newTheme);
            await AsyncStorage.setItem('user_theme', newTheme);
        } catch (error) {
            console.log('Error saving theme:', error);
        }
    };

    const toggleTheme = () => {
        updateTheme(theme === 'light' ? 'dark' : 'light');
    };

    const colors = theme === 'dark' ? DARK_COLORS : LIGHT_COLORS;

    // Dynamic gradients based on current palette
    const dynamicGradients = {
        ...GRADIENTS,
        primary: [colors.primaryGradientStart, colors.primaryDark, colors.primaryGradientEnd],
        background: [colors.backgroundGradientStart, colors.background, colors.backgroundGradientEnd],
        card: theme === 'dark' ? GRADIENTS.darkCard : GRADIENTS.card,
    };

    // Prevent rendering until theme is loaded to avoid flash
    if (!isLoaded) {
        return null;
    }

    return (
        <ThemeContext.Provider value={{
            theme,
            isDark: theme === 'dark',
            colors,
            gradients: dynamicGradients,
            setTheme: updateTheme,
            toggleTheme
        }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
