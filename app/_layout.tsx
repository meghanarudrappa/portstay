import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { requestAllPermissions } from '@/utils/permissions';
import { View, ActivityIndicator } from 'react-native';

import { useColorScheme } from '@/hooks/useColorScheme';
import { SessionProvider, useSession } from '@/context/ContextSession';

SplashScreen.preventAutoHideAsync();

// This inner component runs safely inside the SessionProvider context
function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const { sessionData, getSessionDetails } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();
  
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    const initialize = async () => {
      try {
        // Now safely accesses session logic within the provider context wrapper
        await getSessionDetails();
        
        if (loaded) {
          await SplashScreen.hideAsync();
          const { allGranted } = await requestAllPermissions();
          if (!allGranted) {
            console.log('Some permissions were not granted');
          }
          setIsInitialized(true);
          setTimeout(() => {
            setIsLoading(false);
          }, 100);
        }
      } catch (error) {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initialize();
  }, [loaded]);

  // Handle automatic app routing redirection blocks
  useEffect(() => {
    if (isInitialized && !isLoading) {
      if (sessionData?.loginId) {
        // If logged in, push user immediately to the fresh home dashboard
        router.replace('/dashboard');
      } else {
        // If not logged in, drop them gracefully onto your entry screen
        router.replace('/(tabs)');
      }
    }
  }, [isInitialized, isLoading, sessionData]);

  if (!loaded || isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }}>
        <ActivityIndicator size="large" color={colorScheme === 'dark' ? '#fff' : '#435ffd'} />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      {/* <Stack.Screen name="login" options={{ headerShown: false }} /> */}
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

// Master Layout Shell Wrapper
export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SessionProvider>
        <RootLayoutContent />
      </SessionProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}