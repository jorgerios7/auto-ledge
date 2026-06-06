import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './src/context/AppContext';
import { ObdProvider } from './src/context/ObdContext';
import { CustomToast } from './src/components/CustomToast';
import { MainAppNavigator } from './src/components/MainAppNavigator';
import CustomSplashScreen from './src/screens/SplashScreen';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    async function prepare() {
      try {

        await new Promise(resolve => setTimeout(resolve, 2000));
        await SplashScreen.hideAsync();
      } catch (e) {

        console.warn('Erro ao ocultar splash nativo:', e);
      }
    }

    prepare();
  }, []);

  return (
    <SafeAreaProvider>
      <AppProvider>
        <ObdProvider>
          {showSplash ? (
            <CustomSplashScreen onFinish={() => setShowSplash(false)} />
          ) : (
            <MainAppNavigator />
          )}
          <CustomToast />
        </ObdProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}