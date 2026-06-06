import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { MatchEntry, useMatches } from '../../src/context/MatchesContext';
import { Profile, MOCK_PROFILES } from '../../src/data/mockProfiles';

function usePendingLikesCount() {
  const { swipedIds } = useMatches();
  return MOCK_PROFILES.filter((p: Profile) => !swipedIds.has(p.id)).length;
}

export default function TabsLayout() {
  const { matches } = useMatches();
  const pendingLikes = usePendingLikesCount();
  const unreadMatches = matches.filter((m: MatchEntry) => m.messages.length === 0).length;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF6B9D',
        tabBarInactiveTintColor: '#bbb',
        tabBarStyle: {
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          backgroundColor: '#fff',
          paddingBottom: 8,
          height: 62,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Atrasti',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <Ionicons name="flame" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="likes"
        options={{
          title: 'Patiko',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <Ionicons name="heart" size={size} color={color} />,
          tabBarBadge: pendingLikes > 0 ? pendingLikes : undefined,
          tabBarBadgeStyle: { backgroundColor: '#FF6B9D', fontSize: 10 },
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          title: 'Pokalbiai',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <Ionicons name="chatbubbles" size={size} color={color} />,
          tabBarBadge: unreadMatches > 0 ? unreadMatches : undefined,
          tabBarBadgeStyle: { backgroundColor: '#FF6B9D', fontSize: 10 },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profilis',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <Ionicons name="person-circle" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
