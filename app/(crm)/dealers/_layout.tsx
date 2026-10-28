import { Stack } from 'expo-router';

export default function DealersandResellersLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="CreateDealersandResellersModal" options={{ headerShown: false, presentation: 'modal' }} />
    </Stack>
  );
}