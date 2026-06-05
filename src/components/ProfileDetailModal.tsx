import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Profile } from '../data/mockProfiles';
import { useUnlockedPhotos } from '../hooks/useUnlockedPhotos';

const { width, height } = Dimensions.get('window');

type Props = {
  profile: Profile | null;
  matchId?: string;
  onClose: () => void;
  onLike: () => void;
  onPass: () => void;
};

export default function ProfileDetailModal({ profile, matchId, onClose, onLike, onPass }: Props) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const { isUnlocked, unlock } = useUnlockedPhotos();
  const router = useRouter();

  if (!profile) return null;

  const nextPhoto = () => {
    if (photoIndex < profile.photos.length - 1) setPhotoIndex(photoIndex + 1);
  };

  const prevPhoto = () => {
    if (photoIndex > 0) setPhotoIndex(photoIndex - 1);
  };

  const handleLike = () => {
    setPhotoIndex(0);
    onLike();
    onClose();
  };

  const handlePass = () => {
    setPhotoIndex(0);
    onPass();
    onClose();
  };

  return (
    <Modal
      visible
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Photo section */}
        <View style={styles.photoContainer}>
          <Image source={{ uri: profile.photos[photoIndex] }} style={styles.photo} />

          <TouchableOpacity style={styles.tapLeft} onPress={prevPhoto} activeOpacity={1} />
          <TouchableOpacity style={styles.tapRight} onPress={nextPhoto} activeOpacity={1} />

          {profile.photos.length > 1 && (
            <View style={styles.photoDots}>
              {profile.photos.map((_, i) => (
                <View key={i} style={[styles.dot, i === photoIndex && styles.dotActive]} />
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="chevron-down" size={22} color="#fff" />
          </TouchableOpacity>

          {/* Gradient overlay at bottom of photo */}
          <View style={styles.photoGradient} />

          {/* Name overlay on photo */}
          <View style={styles.photoOverlayInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.photoName}>{profile.name}, {profile.age}</Text>
              <View style={styles.onlineDot} />
            </View>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.9)" />
              <Text style={styles.photoLocation}>{profile.city} · {profile.distance} km</Text>
            </View>
          </View>
        </View>

        {/* Scrollable info section */}
        <ScrollView
          style={styles.infoScroll}
          contentContainerStyle={styles.infoContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="text-outline" size={16} color="#FF6B9D" />
              <Text style={styles.sectionTitle}>Apie mane</Text>
            </View>
            <Text style={styles.bio}>{profile.bio}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="sparkles-outline" size={16} color="#FF6B9D" />
              <Text style={styles.sectionTitle}>Pomėgiai</Text>
            </View>
            <View style={styles.tags}>
              {profile.interests.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
          {profile.blurredPhoto && (
            <>
              <View style={styles.divider} />
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="lock-closed-outline" size={16} color="#FF6B9D" />
                  <Text style={styles.sectionTitle}>Slapta nuotrauka</Text>
                </View>
                <View style={styles.secretPhotoWrap}>
                  <Image
                    source={{ uri: profile.blurredPhoto }}
                    style={styles.secretPhoto}
                    blurRadius={isUnlocked(profile.id) ? 0 : 22}
                  />
                  {!isUnlocked(profile.id) && (
                    <View style={styles.secretLockOverlay}>
                      <View style={styles.lockCircle}>
                        <Ionicons name="lock-closed" size={28} color="#fff" />
                      </View>
                      <Text style={styles.lockTitle}>Nuotrauka užrakinta</Text>
                      <Text style={styles.lockSub}>Paprašyk atrakinti pokalbyje</Text>
                      {matchId ? (
                        <TouchableOpacity
                          style={styles.unlockBtn}
                          onPress={() => {
                            onClose();
                            router.push(`/chat/${matchId}` as any);
                          }}
                        >
                          <Ionicons name="chatbubble-outline" size={16} color="#fff" />
                          <Text style={styles.unlockBtnText}>Eiti į pokalbį</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={styles.unlockBtn}
                          onPress={() => unlock(profile.id)}
                        >
                          <Ionicons name="lock-open-outline" size={16} color="#fff" />
                          <Text style={styles.unlockBtnText}>Siųsti prašymą</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                  {isUnlocked(profile.id) && (
                    <View style={styles.unlockedBadge}>
                      <Ionicons name="lock-open" size={12} color="#4CAF50" />
                      <Text style={styles.unlockedBadgeText}>Atrakinta</Text>
                    </View>
                  )}
                </View>
              </View>
            </>
          )}
        </ScrollView>

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.actionBtn, styles.passBtn]} onPress={handlePass}>
            <Ionicons name="close" size={30} color="#FF4458" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.likeBtn]} onPress={handleLike}>
            <Ionicons name="heart" size={30} color="#4CAF50" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF0F5',
  },
  photoContainer: {
    height: height * 0.52,
    position: 'relative',
    backgroundColor: '#000',
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  tapLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '40%',
    height: '75%',
  },
  tapRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: '60%',
    height: '75%',
  },
  photoDots: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  dotActive: {
    backgroundColor: '#fff',
    width: 20,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: 'transparent',
    // pseudo-gradient via multiple layers handled by overlay
  },
  photoOverlayInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 18,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  photoName: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#fff',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  photoLocation: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '500',
  },
  infoScroll: {
    flex: 1,
  },
  infoContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 8,
  },
  section: {
    marginBottom: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#aaa',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  bio: {
    fontSize: 15,
    color: '#555',
    lineHeight: 24,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0E0E8',
    marginVertical: 18,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#FFD0E0',
    shadowColor: '#FF6B9D',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF6B9D',
  },
  secretPhotoWrap: {
    borderRadius: 16,
    overflow: 'hidden',
    height: 200,
  },
  secretPhoto: {
    width: '100%',
    height: '100%',
  },
  secretLockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  lockCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,107,157,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  lockTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  lockSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginBottom: 4,
  },
  unlockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FF6B9D',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 22,
    marginTop: 4,
  },
  unlockBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  unlockedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  unlockedBadgeText: {
    color: '#4CAF50',
    fontWeight: '700',
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 48,
    paddingVertical: 20,
    paddingBottom: 36,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F0E0E8',
  },
  actionBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  passBtn: {},
  likeBtn: {},
});
