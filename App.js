import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AuthProvider } from './src/context/AuthContext';
import { DataProvider } from './src/context/DataContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import Navigator from './src/navigation/Navigator';
import SplashScreen from './src/screens/SplashScreen';

const AppContent = ({ onSplashFinish, showSplash }) => {
  const { colors, isDark } = useTheme();

  if (showSplash) {
    return <SplashScreen onFinish={onSplashFinish} />;
  }

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
        translucent={false}
      />
      <AuthProvider>
        <DataProvider>
          <Navigator />
        </DataProvider>
      </AuthProvider>
    </>
  );
};

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppContent
            showSplash={showSplash}
            onSplashFinish={() => setShowSplash(false)}
          />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
