import { Stack } from 'expo-router';
import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { MatchesProvider } from '../src/context/MatchesContext';
import { NotificationsProvider } from '../src/context/NotificationsContext';

function AuthGuard() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    const inAuth = segments[0] === '(auth)';
    const inOnboarding = segments[0] === '(onboarding)';

    if (!user && !inAuth) {
      router.replace('/(auth)/login');
    } else if (user && !user.onboardingComplete && !inOnboarding) {
      router.replace('/(onboarding)/setup');
    } else if (user && user.onboardingComplete && (inAuth || inOnboarding)) {
      router.replace('/(tabs)');
    }
  }, [user, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF0F5' }}>
        <ActivityIndicator size="large" color="#FF6B9D" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="chat/[id]" options={{ presentation: 'card', headerShown: true, headerTitle: '', headerBackTitle: 'Atgal', headerTintColor: '#FF6B9D', headerStyle: { backgroundColor: '#fff' } }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <NotificationsProvider>
      <AuthProvider>
        <MatchesProvider>
          <AuthGuard />
        </MatchesProvider>
      </AuthProvider>
    </NotificationsProvider>
  );
}
