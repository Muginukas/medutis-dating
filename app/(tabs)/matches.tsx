import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MOCK_MATCHES, MOCK_PROFILES, Match } from '../../src/data/mockProfiles';

export default function MatchesScreen() {
  const router = useRouter();

  const newMatches = MOCK_PROFILES.slice(0, 3);

  const renderMatch = ({ item }: { item: Match }) => (
    <TouchableOpacity
      style={styles.matchRow}
      onPress={() => router.push(`/chat/${item.id}` as any)}
    >
      <View style={styles.avatarWrap}>
        <Image source={{ uri: item.profile.photos[0] }} style={styles.avatar} />
        <View style={styles.onlineDot} />
      </View>
      <View style={styles.matchInfo}>
        <Text style={styles.matchName}>{item.profile.name}, {item.profile.age}</Text>
        <Text style={styles.lastMsg} numberOfLines={1}>{item.lastMessage}</Text>
      </View>
      <View style={styles.matchMeta}>
        <Text style={styles.time}>{item.lastMessageTime}</Text>
        {!!item.unread && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.unread}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pokalbiai</Text>
        <TouchableOpacity>
          <Ionicons name="search-outline" size={22} color="#FF6B9D" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nauji sutapimai</Text>
        <FlatList
          horizontal
          data={newMatches}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.newMatch}>
              <Image source={{ uri: item.photos[0] }} style={styles.newMatchAvatar} />
              <View style={styles.newMatchBadge}>
                <Ionicons name="heart" size={10} color="#fff" />
              </View>
              <Text style={styles.newMatchName}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Žinutės</Text>
        <FlatList
          data={MOCK_MATCHES}
          keyExtractor={(item) => item.id}
          renderItem={renderMatch}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          scrollEnabled={false}
        />
      </View>
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
  badge: {
    backgroundColor: '#FF6B9D',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  separator: {
    height: 1,
    backgroundColor: '#F5F5F5',
    marginLeft: 90,
  },
});
