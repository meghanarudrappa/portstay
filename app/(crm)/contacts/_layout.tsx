import { Stack } from 'expo-router';

export default function ContactsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="CreateContactModal" options={{ headerShown: false, presentation: 'modal' }} />
    </Stack>
  );
}