import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  Alert,
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

const INTERESTS = ['Muzika', 'Kelionės', 'Sportas', 'Knygos', 'Gamta', 'Maistas', 'Kinas', 'Šokiai', 'Fotografija', 'Žygiai'];

export default function ProfileScreen() {
  const { user, logout, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(user?.bio ?? '');
  const [city, setCity] = useState(user?.city ?? '');
  const [interests, setInterests] = useState<string[]>(user?.interests ?? []);

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      await updateProfile({ photos: [result.assets[0].uri, ...(user?.photos.slice(1) ?? [])] });
    }
  };

  const toggleInterest = (tag: string) => {
    setInterests((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const saveProfile = async () => {
    await updateProfile({ bio, city, interests });
    setEditing(false);
  };

  if (!user) return null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Mano profilis</Text>
          <TouchableOpacity onPress={() => (editing ? saveProfile() : setEditing(true))}>
            <View style={styles.editBtn}>
              <Ionicons name={editing ? 'checkmark' : 'pencil'} size={18} color="#FF6B9D" />
              <Text style={styles.editBtnText}>{editing ? 'Išsaugoti' : 'Redaguoti'}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.photoWrap} onPress={editing ? pickPhoto : undefined}>
          <Image source={{ uri: user.photos[0] }} style={styles.photo} />
          {editing && (
            <View style={styles.photoOverlay}>
              <Ionicons name="camera" size={28} color="#fff" />
              <Text style={styles.photoOverlayText}>Keisti nuotrauką</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.name}>{user.name}, {user.age}</Text>

        <View style={styles.card}>
          <Label icon="location-outline" text="Miestas" />
          {editing ? (
            <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="Miestas" />
          ) : (
            <Text style={styles.value}>{user.city}</Text>
          )}
        </View>

        <View style={styles.card}>
          <Label icon="text-outline" text="Apie mane" />
          {editing ? (
            <TextInput
              style={[styles.input, styles.textarea]}
              value={bio}
              onChangeText={setBio}
              multiline
              placeholder="Papasakok apie save..."
              textAlignVertical="top"
            />
          ) : (
            <Text style={styles.value}>{user.bio}</Text>
          )}
        </View>

        <View style={styles.card}>
          <Label icon="sparkles-outline" text="Pomėgiai" />
          <View style={styles.tags}>
            {(editing ? INTERESTS : user.interests).map((tag) => (
              <TouchableOpacity
                key={tag}
                style={[styles.tag, (editing ? interests : user.interests).includes(tag) && styles.tagActive]}
                onPress={() => editing && toggleInterest(tag)}
              >
                <Text style={[(editing ? interests : user.interests).includes(tag) ? styles.tagTextActive : styles.tagText]}>
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.statsRow}>
          <Stat value="42" label="Patikimai" />
          <Stat value="7" label="Sutapimai" />
          <Stat value="3" label="Pokalbiai" />
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={() => Alert.alert('Atsijungti', 'Ar tikrai norite atsijungti?', [
          { text: 'Atšaukti', style: 'cancel' },
          { text: 'Atsijungti', style: 'destructive', onPress: logout },
        ])}>
          <Ionicons name="log-out-outline" size={18} color="#FF4458" />
          <Text style={styles.logoutText}>Atsijungti</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function Label({ icon, text }: { icon: any; text: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
      <Ionicons name={icon} size={16} color="#FF6B9D" />
      <Text style={{ fontSize: 12, fontWeight: '700', color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.8 }}>{text}</Text>
    </View>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF0F5' },
  scroll: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  title: { fontSize: 26, fontWeight: '800', color: '#333' },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: '#FF6B9D' },
  editBtnText: { color: '#FF6B9D', fontWeight: '700', fontSize: 13 },
  photoWrap: { alignSelf: 'center', marginBottom: 16 },
  photo: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: '#FF6B9D' },
  photoOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 60, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', gap: 4 },
  photoOverlayText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  name: { textAlign: 'center', fontSize: 22, fontWeight: '700', color: '#333', marginBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#FF6B9D', shadowOpacity: 0.05, shadowRadius: 8, elevation: 1 },
  input: { fontSize: 15, color: '#333', borderWidth: 1, borderColor: '#eee', borderRadius: 10, padding: 10, backgroundColor: '#FAFAFA' },
  textarea: { height: 90, paddingTop: 10 },
  value: { fontSize: 15, color: '#555', lineHeight: 22 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5, borderColor: '#eee', backgroundColor: '#FAFAFA' },
  tagActive: { backgroundColor: '#FF6B9D', borderColor: '#FF6B9D' },
  tagText: { color: '#888', fontSize: 13, fontWeight: '600' },
  tagTextActive: { color: '#fff', fontSize: 13, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  stat: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center', shadowColor: '#FF6B9D', shadowOpacity: 0.05, shadowRadius: 6, elevation: 1 },
  statValue: { fontSize: 24, fontWeight: '800', color: '#FF6B9D' },
  statLabel: { fontSize: 12, color: '#aaa', marginTop: 2, fontWeight: '600' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 },
  logoutText: { color: '#FF4458', fontWeight: '700', fontSize: 15 },
});
