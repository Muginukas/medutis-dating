import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { MatchEntry, useMatches } from '../../src/context/MatchesContext';

const { width } = Dimensions.get('window');
const SLOT_SIZE = (width - 48 - 12) / 3;

const INTERESTS = [
  'Muzika', 'Kelionės', 'Sportas', 'Knygos', 'Gamta',
  'Maistas', 'Kinas', 'Šokiai', 'Fotografija', 'Žygiai',
];

const LOOKING_FOR_OPTIONS: { value: 'male' | 'female' | 'both'; label: string }[] = [
  { value: 'female', label: 'Moterys' },
  { value: 'male', label: 'Vyrai' },
  { value: 'both', label: 'Visi' },
];

function calcCompletion(user: ReturnType<typeof useAuth>['user']): number {
  if (!user) return 0;
  let score = 0;
  if (user.name) score += 20;
  if (user.photos.length > 0) score += 20;
  if (user.bio.trim().length > 10) score += 20;
  if (user.interests.length >= 3) score += 20;
  if (user.blurredPhoto) score += 20;
  return score;
}

export default function ProfileScreen() {
  const { user, logout, updateProfile } = useAuth();
  const { matches, likeCount } = useMatches();
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(user?.bio ?? '');
  const [city, setCity] = useState(user?.city ?? '');
  const [interests, setInterests] = useState<string[]>(user?.interests ?? []);
  const [lookingFor, setLookingFor] = useState<'male' | 'female' | 'both'>(user?.lookingFor ?? 'female');

  if (!user) return null;

  const completion = calcCompletion(editing
    ? { ...user, bio, city, interests, lookingFor }
    : user);

  const pickPhoto = async (index: number) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;
    const uri = result.assets[0].uri;
    const photos = [...user.photos];
    photos[index] = uri;
    await updateProfile({ photos });
  };

  const removePhoto = (index: number) => {
    const photos = user.photos.filter((_, i) => i !== index);
    updateProfile({ photos });
  };

  const pickBlurredPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;
    await updateProfile({ blurredPhoto: result.assets[0].uri });
  };

  const removeBlurredPhoto = () => updateProfile({ blurredPhoto: undefined });

  const toggleInterest = (tag: string) => {
    setInterests((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const saveProfile = async () => {
    await updateProfile({ bio, city, interests, lookingFor });
    setEditing(false);
  };

  const cancelEdit = () => {
    setBio(user.bio);
    setCity(user.city);
    setInterests(user.interests);
    setLookingFor(user.lookingFor);
    setEditing(false);
  };

  const photoSlots = Array.from({ length: 6 }, (_, i) => user.photos[i] ?? null);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Hero cover */}
        <View style={styles.hero}>
          <Image
            source={{ uri: user.photos[0] ?? 'https://i.pravatar.cc/400?img=68' }}
            style={styles.heroImage}
          />
          <View style={styles.heroGradient} />
          <View style={styles.heroContent}>
            <View style={styles.completionBadge}>
              <Text style={styles.completionText}>{completion}% pilnas</Text>
            </View>
            <Text style={styles.heroName}>{user.name}, {user.age}</Text>
            <View style={styles.heroLocation}>
              <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.9)" />
              <Text style={styles.heroCity}>{user.city}</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${completion}%` as any }]} />
            </View>
          </View>
          <TouchableOpacity
            style={styles.editHeroBtn}
            onPress={() => editing ? saveProfile() : setEditing(true)}
          >
            <Ionicons name={editing ? 'checkmark' : 'pencil'} size={18} color="#FF6B9D" />
            <Text style={styles.editHeroBtnText}>{editing ? 'Išsaugoti' : 'Redaguoti'}</Text>
          </TouchableOpacity>
          {editing && (
            <TouchableOpacity style={styles.cancelBtn} onPress={cancelEdit}>
              <Ionicons name="close" size={18} color="#888" />
            </TouchableOpacity>
          )}
        </View>

        {/* Photo grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mano nuotraukos</Text>
          <View style={styles.photoGrid}>
            {photoSlots.map((uri, i) => (
              <TouchableOpacity
                key={i}
                style={styles.photoSlot}
                onPress={() => {
                  if (uri) {
                    Alert.alert('Nuotrauka', 'Ką daryti?', [
                      { text: 'Keisti', onPress: () => pickPhoto(i) },
                      { text: 'Pašalinti', style: 'destructive', onPress: () => removePhoto(i) },
                      { text: 'Atšaukti', style: 'cancel' },
                    ]);
                  } else {
                    pickPhoto(i);
                  }
                }}
              >
                {uri ? (
                  <>
                    <Image source={{ uri }} style={styles.photoSlotImage} />
                    <View style={styles.photoSlotEditDot}>
                      <Ionicons name="camera" size={12} color="#fff" />
                    </View>
                  </>
                ) : (
                  <View style={styles.photoSlotEmpty}>
                    <Ionicons name="add" size={28} color="#ddd" />
                  </View>
                )}
              </TouchableOpacity>
            ))}

            {/* Secret / blurred photo slot */}
            <TouchableOpacity
              style={[styles.photoSlot, styles.secretSlot]}
              onPress={() => {
                if (user.blurredPhoto) {
                  Alert.alert('🔒 Slapta nuotrauka', 'Ką daryti?', [
                    { text: 'Keisti', onPress: pickBlurredPhoto },
                    { text: 'Pašalinti', style: 'destructive', onPress: removeBlurredPhoto },
                    { text: 'Atšaukti', style: 'cancel' },
                  ]);
                } else {
                  pickBlurredPhoto();
                }
              }}
            >
              {user.blurredPhoto ? (
                <>
                  <Image
                    source={{ uri: user.blurredPhoto }}
                    style={styles.photoSlotImage}
                    blurRadius={15}
                  />
                  <View style={styles.secretOverlay}>
                    <Ionicons name="lock-closed" size={16} color="#fff" />
                  </View>
                </>
              ) : (
                <View style={styles.photoSlotEmpty}>
                  <Ionicons name="lock-closed-outline" size={22} color="#FF6B9D" />
                  <Text style={styles.secretAddText}>Slapta</Text>
                </View>
              )}
              <View style={styles.secretBadge}>
                <Text style={styles.secretBadgeText}>🔒</Text>
              </View>
            </TouchableOpacity>
          </View>
          <Text style={styles.photoHint}>
            Slapta nuotrauka rodoma sulieta — atrakinama pokalbyje
          </Text>
        </View>

        {/* Bio */}
        <View style={styles.card}>
          <SectionLabel icon="text-outline" text="Apie mane" />
          {editing ? (
            <TextInput
              style={[styles.input, styles.textarea]}
              value={bio}
              onChangeText={setBio}
              multiline
              placeholder="Papasakok apie save..."
              placeholderTextColor="#ccc"
              textAlignVertical="top"
            />
          ) : (
            <Text style={styles.cardValue}>{user.bio || '—'}</Text>
          )}
        </View>

        {/* City */}
        <View style={styles.card}>
          <SectionLabel icon="location-outline" text="Miestas" />
          {editing ? (
            <TextInput
              style={styles.input}
              value={city}
              onChangeText={setCity}
              placeholder="Miestas"
              placeholderTextColor="#ccc"
            />
          ) : (
            <Text style={styles.cardValue}>{user.city || '—'}</Text>
          )}
        </View>

        {/* Interests */}
        <View style={styles.card}>
          <SectionLabel icon="sparkles-outline" text="Pomėgiai" />
          <View style={styles.tags}>
            {(editing ? INTERESTS : user.interests).map((tag) => {
              const active = (editing ? interests : user.interests).includes(tag);
              return (
                <TouchableOpacity
                  key={tag}
                  style={[styles.tag, active && styles.tagActive]}
                  onPress={() => editing && toggleInterest(tag)}
                  activeOpacity={editing ? 0.7 : 1}
                >
                  <Text style={active ? styles.tagTextActive : styles.tagText}>{tag}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Looking for */}
        <View style={styles.card}>
          <SectionLabel icon="heart-outline" text="Ieškau" />
          <View style={styles.chipRow}>
            {LOOKING_FOR_OPTIONS.map((opt) => {
              const active = (editing ? lookingFor : user.lookingFor) === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => editing && setLookingFor(opt.value)}
                  activeOpacity={editing ? 0.7 : 1}
                >
                  <Text style={active ? styles.chipTextActive : styles.chipText}>{opt.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard value={String(likeCount)} label="Patikimai" icon="heart" />
          <StatCard value={String(matches.length)} label="Sutapimai" icon="flame" />
          <StatCard value={String(matches.filter((m: MatchEntry) => m.messages.length > 0).length)} label="Pokalbiai" icon="chatbubble" />
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() =>
            Alert.alert('Atsijungti', 'Ar tikrai norite atsijungti?', [
              { text: 'Atšaukti', style: 'cancel' },
              { text: 'Atsijungti', style: 'destructive', onPress: logout },
            ])
          }
        >
          <Ionicons name="log-out-outline" size={18} color="#FF4458" />
          <Text style={styles.logoutText}>Atsijungti</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

function SectionLabel({ icon, text }: { icon: any; text: string }) {
  return (
    <View style={styles.labelRow}>
      <Ionicons name={icon} size={15} color="#FF6B9D" />
      <Text style={styles.labelText}>{text}</Text>
    </View>
  );
}

function StatCard({ value, label, icon }: { value: string; label: string; icon: any }) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={20} color="#FF6B9D" style={{ marginBottom: 6 }} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF0F5' },
  scroll: { paddingBottom: 48 },

  hero: {
    width: '100%',
    height: 300,
    position: 'relative',
    marginBottom: 20,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    backgroundImage: undefined,
    top: '40%',
  },
  heroContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  completionBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,107,157,0.9)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 8,
  },
  completionText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  heroName: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    marginBottom: 4,
  },
  heroLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  heroCity: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B9D',
    borderRadius: 2,
  },
  editHeroBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  editHeroBtnText: {
    color: '#FF6B9D',
    fontWeight: '700',
    fontSize: 13,
  },
  cancelBtn: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  section: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#aaa',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  photoSlot: {
    width: SLOT_SIZE,
    height: SLOT_SIZE * 1.3,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  photoSlotImage: {
    width: '100%',
    height: '100%',
  },
  photoSlotEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#eee',
    borderRadius: 12,
    borderStyle: 'dashed',
    gap: 2,
  },
  photoSlotEditDot: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FF6B9D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secretSlot: {
    borderWidth: 2,
    borderColor: '#FF6B9D',
    borderStyle: 'dashed',
  },
  secretOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secretBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
  },
  secretBadgeText: {
    fontSize: 14,
  },
  secretAddText: {
    fontSize: 10,
    color: '#FF6B9D',
    fontWeight: '700',
  },
  photoHint: {
    fontSize: 11,
    color: '#bbb',
    marginTop: 8,
    textAlign: 'center',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#FF6B9D',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  labelText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#aaa',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  cardValue: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
  },
  input: {
    fontSize: 15,
    color: '#333',
    borderWidth: 1.5,
    borderColor: '#F0E0E8',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#FAFAFA',
  },
  textarea: {
    height: 90,
    paddingTop: 10,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#eee',
    backgroundColor: '#FAFAFA',
  },
  tagActive: {
    backgroundColor: '#FF6B9D',
    borderColor: '#FF6B9D',
  },
  tagText: { color: '#888', fontSize: 13, fontWeight: '600' },
  tagTextActive: { color: '#fff', fontSize: 13, fontWeight: '600' },
  chipRow: {
    flexDirection: 'row',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#eee',
    backgroundColor: '#FAFAFA',
  },
  chipActive: {
    backgroundColor: '#FF6B9D',
    borderColor: '#FF6B9D',
  },
  chipText: { color: '#888', fontSize: 14, fontWeight: '600' },
  chipTextActive: { color: '#fff', fontSize: 14, fontWeight: '600' },

  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#FF6B9D',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FF6B9D',
  },
  statLabel: {
    fontSize: 11,
    color: '#aaa',
    marginTop: 2,
    fontWeight: '600',
  },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  logoutText: { color: '#FF4458', fontWeight: '700', fontSize: 15 },
});
