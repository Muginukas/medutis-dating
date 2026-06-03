import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Profile } from '../data/mockProfiles';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.35;

type Props = {
  profile: Profile;
  onLike: () => void;
  onPass: () => void;
  onInfo?: () => void;
  isTop: boolean;
};

export default function SwipeCard({ profile, onLike, onPass, onInfo, isTop }: Props) {
  const position = useRef(new Animated.ValueXY()).current;
  const [photoIndex, setPhotoIndex] = useState(0);

  const rotate = position.x.interpolate({
    inputRange: [-width, 0, width],
    outputRange: ['-25deg', '0deg', '25deg'],
    extrapolate: 'clamp',
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, SWIPE_THRESHOLD / 2],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const passOpacity = position.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD / 2, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gesture) =>
        isTop && (Math.abs(gesture.dx) > 5 || Math.abs(gesture.dy) > 5),
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          Animated.timing(position, {
            toValue: { x: width + 100, y: gesture.dy },
            duration: 250,
            useNativeDriver: false,
          }).start(onLike);
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          Animated.timing(position, {
            toValue: { x: -width - 100, y: gesture.dy },
            duration: 250,
            useNativeDriver: false,
          }).start(onPass);
        } else {
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const animatedStyle = isTop
    ? { transform: [...position.getTranslateTransform(), { rotate }] }
    : {};

  const nextPhoto = () => {
    if (photoIndex < profile.photos.length - 1) setPhotoIndex(photoIndex + 1);
  };

  const prevPhoto = () => {
    if (photoIndex > 0) setPhotoIndex(photoIndex - 1);
  };

  return (
    <Animated.View style={[styles.card, animatedStyle]} {...(isTop ? panResponder.panHandlers : {})}>
      <Image source={{ uri: profile.photos[photoIndex] }} style={styles.photo} />

      {profile.photos.length > 1 && (
        <View style={styles.photoDots}>
          {profile.photos.map((_, i) => (
            <View key={i} style={[styles.dot, i === photoIndex && styles.dotActive]} />
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.tapLeft} onPress={prevPhoto} activeOpacity={1} />
      <TouchableOpacity style={styles.tapRight} onPress={nextPhoto} activeOpacity={1} />

      {isTop && (
        <>
          <Animated.View style={[styles.badge, styles.likeBadge, { opacity: likeOpacity }]}>
            <Text style={styles.likeText}>PATINKA</Text>
          </Animated.View>
          <Animated.View style={[styles.badge, styles.passBadge, { opacity: passOpacity }]}>
            <Text style={styles.passText}>PRALEISTI</Text>
          </Animated.View>
        </>
      )}

      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{profile.name}, {profile.age}</Text>
          <View style={styles.onlineDot} />
          <View style={{ flex: 1 }} />
          {onInfo && (
            <TouchableOpacity style={styles.infoBtn} onPress={onInfo}>
              <Ionicons name="information-circle" size={28} color="rgba(255,255,255,0.9)" />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.85)" />
          <Text style={styles.location}>{profile.city} · {profile.distance} km</Text>
        </View>
        <Text style={styles.bio} numberOfLines={2}>{profile.bio}</Text>
        <View style={styles.tags}>
          {profile.interests.slice(0, 3).map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: width - 24,
    height: height * 0.63,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoDots: {
    position: 'absolute',
    top: 12,
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
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: {
    backgroundColor: '#fff',
    width: 20,
  },
  tapLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '40%',
    height: '100%',
  },
  tapRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: '60%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 50,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 3,
  },
  likeBadge: {
    left: 20,
    borderColor: '#4CAF50',
    transform: [{ rotate: '-15deg' }],
  },
  passBadge: {
    right: 20,
    borderColor: '#FF4458',
    transform: [{ rotate: '15deg' }],
  },
  likeText: {
    color: '#4CAF50',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 2,
  },
  passText: {
    color: '#FF4458',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 2,
  },
  info: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 24,
    backgroundColor: 'transparent',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  infoBtn: {
    padding: 2,
  },
  name: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.4)',
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
    gap: 3,
    marginBottom: 6,
  },
  location: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
  },
  bio: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    marginBottom: 10,
    lineHeight: 20,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  tagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
