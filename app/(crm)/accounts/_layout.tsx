import { Stack } from 'expo-router';

export default function AccountsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="CreateAccountModal" options={{ headerShown: false, presentation: 'modal' }} />
    </Stack>
  );
}