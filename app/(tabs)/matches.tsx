import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MatchEntry, useMatches } from '../../src/context/MatchesContext';

function timeSince(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'Dabar';
  if (mins < 60) return `${mins} min.`;
  if (hours < 24) return `${hours} val.`;
  return `${days} d.`;
}

export default function MatchesScreen() {
  const router = useRouter();
  const { matches } = useMatches();

  const newMatches = matches.filter((m: MatchEntry) => m.messages.length === 0);
  const conversations = matches
    .filter((m: MatchEntry) => m.messages.length > 0)
    .sort((a: MatchEntry, b: MatchEntry) => b.timestamp - a.timestamp);

  const renderConversation = ({ item }: { item: MatchEntry }) => {
    const lastMsg = item.messages[item.messages.length - 1];
    return (
      <TouchableOpacity
        style={styles.matchRow}
        onPress={() => router.push(`/chat/${item.id}` as any)}
      >
        <View style={styles.avatarWrap}>
          <Image source={{ uri: item.profile.photos[0] }} style={styles.avatar} />
          <View style={styles.onlineDot} />
          {item.superLiked && (
            <View style={styles.superLikedBadge}>
              <Text style={styles.superLikedText}>⭐</Text>
            </View>
          )}
        </View>
        <View style={styles.matchInfo}>
          <Text style={styles.matchName}>{item.profile.name}, {item.profile.age}</Text>
          <Text style={styles.lastMsg} numberOfLines={1}>
            {lastMsg?.type === 'photo' ? '📷 Nuotrauka' : lastMsg?.text ?? ''}
          </Text>
        </View>
        <View style={styles.matchMeta}>
          <Text style={styles.time}>{timeSince(item.timestamp)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pokalbiai</Text>
        <TouchableOpacity>
          <Ionicons name="search-outline" size={22} color="#FF6B9D" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {newMatches.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nauji sutapimai</Text>
            <FlatList
              horizontal
              data={newMatches}
              keyExtractor={(item: MatchEntry) => item.id}
              showsHorizontalScrollIndicator={false}
              scrollEnabled
              contentContainerStyle={{ paddingHorizontal: 16, gap: 16 }}
              renderItem={({ item }: { item: MatchEntry }) => (
                <TouchableOpacity
                  style={styles.newMatch}
                  onPress={() => router.push(`/chat/${item.id}` as any)}
                >
                  <View style={styles.newMatchAvatarWrap}>
                    <Image source={{ uri: item.profile.photos[0] }} style={styles.newMatchAvatar} />
                    {item.superLiked && (
                      <View style={styles.superStarBadge}>
                        <Text style={{ fontSize: 10 }}>⭐</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.newMatchBadge}>
                    <Ionicons name="heart" size={10} color="#fff" />
                  </View>
                  <Text style={styles.newMatchName}>{item.profile.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {conversations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Žinutės</Text>
            <FlatList
              data={conversations}
              keyExtractor={(item: MatchEntry) => item.id}
              renderItem={renderConversation}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              scrollEnabled={false}
            />
          </View>
        )}

        {matches.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="chatbubbles-outline" size={64} color="#FFD0E0" />
            <Text style={styles.emptyTitle}>Kol kas nėra pokalbių</Text>
            <Text style={styles.emptySub}>Pradėk naršyti ir rask sutapimų! 🔥</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF0F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#333',
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#aaa',
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  newMatch: {
    alignItems: 'center',
  },
  newMatchAvatarWrap: {
    position: 'relative',
  },
  newMatchAvatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 3,
    borderColor: '#FF6B9D',
  },
  newMatchBadge: {
    position: 'absolute',
    bottom: 22,
    right: 0,
    backgroundColor: '#FF6B9D',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF0F5',
  },
  superStarBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#fff',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFD0E0',
  },
  newMatchName: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontWeight: '600',
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    gap: 14,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#fff',
  },
  superLikedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#fff',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFD0E0',
  },
  superLikedText: {
    fontSize: 10,
  },
  matchInfo: {
    flex: 1,
  },
  matchName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 3,
  },
  lastMsg: {
    fontSize: 14,
    color: '#888',
  },
  matchMeta: {
    alignItems: 'flex-end',
    gap: 6,
  },
  time: {
    fontSize: 12,
    color: '#bbb',
  },
  separator: {
    height: 1,
    backgroundColor: '#F5F5F5',
    marginLeft: 90,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 10,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  emptySub: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
  },
});
