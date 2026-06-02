import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Dimensions,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import SwipeCard from '../../src/components/SwipeCard';
import { MOCK_PROFILES, Profile } from '../../src/data/mockProfiles';

const { width } = Dimensions.get('window');

export default function DiscoverScreen() {
  const [profiles, setProfiles] = useState<Profile[]>(MOCK_PROFILES);
  const [matchModal, setMatchModal] = useState<Profile | null>(null);

  const handleLike = () => {
    const liked = profiles[profiles.length - 1];
    setProfiles((prev) => prev.slice(0, -1));
    if (Math.random() > 0.4) {
      setMatchModal(liked);
    }
  };

  const handlePass = () => {
    setProfiles((prev) => prev.slice(0, -1));
  };

  const handleLikeBtn = () => handleLike();
  const handlePassBtn = () => handlePass();
  const handleSuperLike = () => handleLike();

  const empty = profiles.length === 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>🍯 Medutis</Text>
        <TouchableOpacity style={styles.filterBtn}>
          <Ionicons name="options-outline" size={22} color="#FF6B9D" />
        </TouchableOpacity>
      </View>

      <View style={styles.deck}>
        {empty ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🌸</Text>
            <Text style={styles.emptyTitle}>Tai viskas kol kas!</Text>
            <Text style={styles.emptyText}>Grįžkite vėliau – nauji profiliai laukia</Text>
            <TouchableOpacity style={styles.resetBtn} onPress={() => setProfiles(MOCK_PROFILES)}>
              <Text style={styles.resetBtnText}>Pradėti iš naujo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          profiles.map((profile, index) => {
            const isTop = index === profiles.length - 1;
            return (
              <SwipeCard
                key={profile.id}
                profile={profile}
                onLike={handleLike}
                onPass={handlePass}
                isTop={isTop}
              />
            );
          })
        )}
      </View>

      {!empty && (
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.actionBtn, styles.passBtn]} onPress={handlePassBtn}>
            <Ionicons name="close" size={28} color="#FF4458" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.superBtn]} onPress={handleSuperLike}>
            <Ionicons name="star" size={22} color="#00C2FF" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.likeBtn]} onPress={handleLikeBtn}>
            <Ionicons name="heart" size={28} color="#4CAF50" />
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={!!matchModal} transparent animationType="fade">
        <View style={styles.matchOverlay}>
          <View style={styles.matchCard}>
            <Text style={styles.matchEmoji}>🎉</Text>
            <Text style={styles.matchTitle}>Tai sutapimas!</Text>
            <Text style={styles.matchSub}>
              Jūs ir <Text style={{ fontWeight: '700' }}>{matchModal?.name}</Text> patinkate vienas kitam
            </Text>
            <TouchableOpacity style={styles.matchBtn} onPress={() => setMatchModal(null)}>
              <Text style={styles.matchBtnText}>Siųsti žinutę</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setMatchModal(null)}>
              <Text style={styles.matchSkip}>Tęsti naršymą</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingVertical: 12,
  },
  logo: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FF6B9D',
  },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B9D',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  deck: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingVertical: 20,
    paddingBottom: 28,
  },
  actionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
    backgroundColor: '#fff',
  },
  passBtn: {
    width: 60,
    height: 60,
  },
  likeBtn: {
    width: 60,
    height: 60,
  },
  superBtn: {
    width: 48,
    height: 48,
  },
  empty: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  resetBtn: {
    backgroundColor: '#FF6B9D',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 30,
  },
  resetBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  matchOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    width: width - 48,
    alignItems: 'center',
    shadowColor: '#FF6B9D',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  matchEmoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  matchTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FF6B9D',
    marginBottom: 8,
  },
  matchSub: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  matchBtn: {
    backgroundColor: '#FF6B9D',
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 30,
    marginBottom: 14,
    width: '100%',
    alignItems: 'center',
  },
  matchBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  matchSkip: {
    color: '#aaa',
    fontSize: 14,
  },
});
