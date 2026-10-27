import { Stack } from 'expo-router';

export default function CustomersLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="CreateDistributorsModal" options={{ headerShown: false, presentation: 'modal' }} />
    </Stack>
  );
}