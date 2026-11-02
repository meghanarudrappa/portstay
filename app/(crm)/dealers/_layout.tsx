import { Stack } from 'expo-router';

export default function DealersLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="CreateDealersModal" options={{ headerShown: false, presentation: 'modal' }} />
    </Stack>
  );
}