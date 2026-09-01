import { Stack } from 'expo-router';

export default function LeadsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="CreateLeadModal" options={{ headerShown: false, presentation: 'modal' }} />
    </Stack>
  );
}