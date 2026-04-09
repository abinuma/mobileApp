import React from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import ShopContextProvider from './src/context/ShopContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider, MD3LightTheme as DefaultTheme } from 'react-native-paper';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#000000',
    secondary: '#f3f4f6',
  },
};

export default function App() {
  return (
    <ShopContextProvider>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <AppNavigator />
          <StatusBar style="dark" />
        </PaperProvider>
      </SafeAreaProvider>
    </ShopContextProvider>
  );
}
