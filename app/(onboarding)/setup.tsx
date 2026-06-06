import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../src/context/AuthContext';

const { width } = Dimensions.get('window');

const INTERESTS = [
  'Muzika', 'Kelionės', 'Sportas', 'Knygos', 'Gamta',
  'Maistas', 'Kinas', 'Šokiai', 'Fotografija', 'Žygiai',
];

const GENDER_OPTIONS: { value: 'male' | 'female' | 'other'; label: string }[] = [
  { value: 'male', label: 'Vyras' },
  { value: 'female', label: 'Moteris' },
  { value: 'other', label: 'Kita' },
];

const LOOKING_FOR_OPTIONS: { value: 'male' | 'female' | 'both'; label: string }[] = [
  { value: 'female', label: 'Moterys' },
  { value: 'male', label: 'Vyrai' },
  { value: 'both', label: 'Visi' },
];

export default function OnboardingSetup() {
  const { updateProfile } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const [photo, setPhoto] = useState<string | null>(null);
  const [city, setCity] = useState('');
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [lookingFor, setLookingFor] = useState<'male' | 'female' | 'both'>('both');

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhoto(result.assets[0].uri);
    }
  };

  const toggleInterest = (tag: string) => {
    setInterests((prev: string[]) =>
      prev.includes(tag) ? prev.filter((t: string) => t !== tag) : [...prev, tag]
    );
  };

  const next = () => {
    if (step < 4) setStep((step + 1) as 1 | 2 | 3 | 4);
  };

  const back = () => {
    if (step > 1) setStep((step - 1) as 1 | 2 | 3 | 4);
  };

  const finish = async () => {
    const updates: Record<string, unknown> = {
      city,
      bio,
      interests,
      gender,
      lookingFor,
      onboardingComplete: true,
    };
    if (photo) updates.photos = [photo];
    await updateProfile(updates as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Progress dots */}
        <View style={styles.dotsRow}>
          {[1, 2, 3, 4].map((s) => (
            <View key={s} style={[styles.dot, s === step && styles.dotActive]} />
          ))}
        </View>

        {step === 1 && (
          <ScrollView contentContainerStyle={styles.stepContent}>
            <Text style={styles.stepTitle}>Pridėk nuotrauką</Text>
            <Text style={styles.stepSub}>Pirmasis įspūdis svarbus! 📸</Text>
            <TouchableOpacity style={styles.photoPicker} onPress={pickPhoto}>
              {photo ? (
                <Image source={{ uri: photo }} style={styles.photoPreview} />
              ) : (
                <View style={styles.photoEmpty}>
                  <Ionicons name="camera-outline" size={40} color="#FFB8D1" />
                  <Text style={styles.photoEmptyText}>Pasirinkti nuotrauką</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.pickBtn} onPress={pickPhoto}>
              <Ionicons name="image-outline" size={18} color="#fff" />
              <Text style={styles.pickBtnText}>Įkelti nuotrauką</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {step === 2 && (
          <ScrollView contentContainerStyle={styles.stepContent} keyboardShouldPersistTaps="handled">
            <Text style={styles.stepTitle}>Papasakok apie save</Text>
            <Text style={styles.stepSub}>Tegul kiti žino, koks tu esi ✨</Text>

            <View style={styles.inputWrap}>
              <Ionicons name="location-outline" size={18} color="#FF6B9D" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={city}
                onChangeText={setCity}
                placeholder="Tavo miestas"
                placeholderTextColor="#ccc"
              />
            </View>

            <View style={[styles.inputWrap, styles.textareaWrap]}>
              <TextInput
                style={[styles.input, styles.textarea]}
                value={bio}
                onChangeText={(t: string) => setBio(t.slice(0, 200))}
                placeholder="Trumpai apie save... Ką mėgsti? Ko ieškai?"
                placeholderTextColor="#ccc"
                multiline
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{bio.length}/200</Text>
            </View>
          </ScrollView>
        )}

        {step === 3 && (
          <ScrollView contentContainerStyle={styles.stepContent}>
            <Text style={styles.stepTitle}>Kokie tavo pomėgiai?</Text>
            <Text style={styles.stepSub}>Pasirink iki 10 pomėgių 🎯</Text>
            <Text style={styles.selectedCount}>{interests.length} / 10 pasirinkta</Text>
            <View style={styles.tagsGrid}>
              {INTERESTS.map((tag) => {
                const active = interests.includes(tag);
                return (
                  <TouchableOpacity
                    key={tag}
                    style={[styles.tag, active && styles.tagActive]}
                    onPress={() => toggleInterest(tag)}
                  >
                    <Text style={active ? styles.tagTextActive : styles.tagText}>{tag}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        )}

        {step === 4 && (
          <ScrollView contentContainerStyle={styles.stepContent}>
            <Text style={styles.stepTitle}>Ką ieškai?</Text>
            <Text style={styles.stepSub}>Surask savo puselę 💕</Text>

            <Text style={styles.groupLabel}>Aš esu</Text>
            <View style={styles.chipRow}>
              {GENDER_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.chip, gender === opt.value && styles.chipActive]}
                  onPress={() => setGender(opt.value)}
                >
                  <Text style={gender === opt.value ? styles.chipTextActive : styles.chipText}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.groupLabel}>Ieškau</Text>
            <View style={styles.chipRow}>
              {LOOKING_FOR_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.chip, lookingFor === opt.value && styles.chipActive]}
                  onPress={() => setLookingFor(opt.value)}
                >
                  <Text style={lookingFor === opt.value ? styles.chipTextActive : styles.chipText}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}

        {/* Bottom nav */}
        <View style={styles.navRow}>
          {step > 1 ? (
            <TouchableOpacity style={styles.backBtn} onPress={back}>
              <Ionicons name="arrow-back" size={20} color="#FF6B9D" />
            </TouchableOpacity>
          ) : (
            <View style={styles.backBtn} />
          )}

          {step < 4 ? (
            <View style={styles.navRight}>
              <TouchableOpacity onPress={finish}>
                <Text style={styles.skipText}>Praleisti</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.nextBtn} onPress={next}>
                <Text style={styles.nextBtnText}>Toliau</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.finishBtn} onPress={finish}>
              <Text style={styles.finishBtnText}>Pradėti! 🚀</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF0F5' },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 20,
    paddingBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFD0E0',
  },
  dotActive: {
    backgroundColor: '#FF6B9D',
    width: 24,
  },
  stepContent: {
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 16,
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#333',
    marginBottom: 6,
    textAlign: 'center',
  },
  stepSub: {
    fontSize: 15,
    color: '#aaa',
    marginBottom: 28,
    textAlign: 'center',
  },
  photoPicker: {
    width: width * 0.55,
    height: width * 0.55,
    borderRadius: (width * 0.55) / 2,
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#FF6B9D',
    borderStyle: 'dashed',
    overflow: 'hidden',
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
  },
  photoEmpty: {
    alignItems: 'center',
    gap: 8,
  },
  photoEmptyText: {
    color: '#FFB8D1',
    fontSize: 13,
    fontWeight: '600',
  },
  pickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FF6B9D',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 30,
    marginBottom: 8,
  },
  pickBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  inputWrap: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#F0E0E8',
    marginBottom: 14,
    paddingHorizontal: 14,
  },
  textareaWrap: {
    alignItems: 'flex-start',
    paddingTop: 12,
    paddingBottom: 8,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    paddingVertical: 14,
  },
  textarea: {
    height: 110,
    paddingTop: 0,
    paddingBottom: 24,
  },
  charCount: {
    position: 'absolute',
    bottom: 8,
    right: 14,
    fontSize: 11,
    color: '#ccc',
  },
  selectedCount: {
    fontSize: 13,
    color: '#aaa',
    marginBottom: 16,
    fontWeight: '600',
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    width: '100%',
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#F0E0E8',
    backgroundColor: '#fff',
  },
  tagActive: {
    backgroundColor: '#FF6B9D',
    borderColor: '#FF6B9D',
  },
  tagText: { color: '#888', fontSize: 14, fontWeight: '600' },
  tagTextActive: { color: '#fff', fontSize: 14, fontWeight: '600' },
  groupLabel: {
    alignSelf: 'flex-start',
    fontSize: 12,
    fontWeight: '700',
    color: '#aaa',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 8,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#F0E0E8',
    backgroundColor: '#fff',
  },
  chipActive: {
    backgroundColor: '#FF6B9D',
    borderColor: '#FF6B9D',
  },
  chipText: { color: '#888', fontSize: 14, fontWeight: '600' },
  chipTextActive: { color: '#fff', fontSize: 14, fontWeight: '600' },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 28,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F5EEF2',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF0F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  skipText: {
    color: '#bbb',
    fontSize: 14,
    fontWeight: '600',
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FF6B9D',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
  },
  nextBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  finishBtn: {
    flex: 1,
    marginLeft: 16,
    backgroundColor: '#FF6B9D',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
  },
  finishBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 17,
  },
});
