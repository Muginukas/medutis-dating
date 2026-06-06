import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useMatches } from '../../src/context/MatchesContext';
import { useNotifications } from '../../src/context/NotificationsContext';
import { MOCK_PROFILES, Profile } from '../../src/data/mockProfiles';

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - 48) / 2;

export default function LikesScreen() {
  const { swipedIds, addMatch } = useMatches();
  const { addMatchNotification } = useNotifications();
  const router = useRouter();
  const [pendingLikes, setPendingLikes] = useState<Profile[]>([]);

  useEffect(() => {
    const unswiped = MOCK_PROFILES.filter((p) => !swipedIds.has(p.id));
    setPendingLikes(unswiped);
  }, [swipedIds]);

  const handleLikeBack = (profile: Profile) => {
    addMatch(profile, false);
    addMatchNotification(profile.name, profile.photos[0]);
    setPendingLikes((prev: Profile[]) => prev.filter((p: Profile) => p.id !== profile.id));
    router.push('/(tabs)/matches');
  };

  if (pendingLikes.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Kas tave pamilo ❤️</Text>
        </View>
        <View style={styles.empty}>
          <Ionicons name="heart-outline" size={64} color="#FFD0E0" />
          <Text style={styles.emptyTitle}>Kol kas niekas</Text>
          <Text style={styles.emptySub}>Grįžkite vėliau — nauji žmonės pamils 💕</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Kas tave pamilo ❤️</Text>
        <Text style={styles.subtitle}>{pendingLikes.length} žmonių patikote jums</Text>
      </View>

      <FlatList
        data={pendingLikes}
        keyExtractor={(item: Profile) => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        renderItem={({ item }: { item: Profile }) => (
          <View style={styles.card}>
            <Image
              source={{ uri: item.photos[0] }}
              style={styles.cardPhoto}
              blurRadius={18}
            />
            <View style={styles.lockOverlay}>
              <View style={styles.lockCircle}>
                <Ionicons name="lock-closed" size={22} color="#fff" />
              </View>
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardName}>{item.name}, {item.age}</Text>
              <Text style={styles.cardCity}>{item.city}</Text>
              <TouchableOpacity
                style={styles.likeBackBtn}
                onPress={() => handleLikeBack(item)}
              >
                <Ionicons name="heart" size={14} color="#fff" />
                <Text style={styles.likeBackText}>Patikti atgal</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF0F5' },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 2,
  },
  grid: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  row: {
    gap: 16,
    marginBottom: 16,
  },
  card: {
    width: CARD_SIZE,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#FF6B9D',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#FFD0E0',
  },
  cardPhoto: {
    width: '100%',
    height: CARD_SIZE * 1.2,
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: CARD_SIZE * 1.2,
    backgroundColor: 'rgba(255,107,157,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,107,157,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    padding: 10,
    gap: 2,
  },
  cardName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  cardCity: {
    fontSize: 12,
    color: '#aaa',
    marginBottom: 6,
  },
  likeBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#FF6B9D',
    borderRadius: 20,
    paddingVertical: 7,
  },
  likeBackText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    lineHeight: 20,
  },
});
