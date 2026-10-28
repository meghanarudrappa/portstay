import { Stack } from 'expo-router';

export default function SuppliersLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="CreateSuppliersModal" options={{ headerShown: false, presentation: 'modal' }} />
    </Stack>
  );
}