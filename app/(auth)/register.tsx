import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../src/context/AuthContext';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !age || !email || !password) {
      Alert.alert('Klaida', 'Užpildykite visus laukus');
      return;
    }
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 18 || ageNum > 99) {
      Alert.alert('Klaida', 'Amžius turi būti nuo 18 iki 99');
      return;
    }
    setLoading(true);
    try {
      await register(email, password, name, ageNum);
    } catch {
      Alert.alert('Klaida', 'Registracija nepavyko');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color="#FF6B9D" />
            </TouchableOpacity>
          </Link>
          <Text style={styles.title}>Sukurti profilį</Text>
          <View style={{ width: 40 }} />
        </View>

        <Text style={styles.emoji}>🍯</Text>
        <Text style={styles.subtitle}>Prisijunk prie Medutis bendruomenės</Text>

        <View style={styles.form}>
          <Field icon="person-outline" placeholder="Vardas" value={name} onChangeText={setName} />
          <Field icon="calendar-outline" placeholder="Amžius" value={age} onChangeText={setAge} keyboardType="number-pad" />
          <Field icon="mail-outline" placeholder="El. paštas" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <Field icon="lock-closed-outline" placeholder="Slaptažodis" value={password} onChangeText={setPassword} secureTextEntry />

          <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading}>
            <Text style={styles.btnText}>{loading ? 'Kuriamas profilis...' : 'Registruotis 🎉'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.terms}>Registruodamiesi sutinkate su mūsų Privatumo politika</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ icon, ...props }: any) {
  return (
    <View style={styles.inputWrap}>
      <Ionicons name={icon} size={20} color="#aaa" style={{ marginRight: 10 }} />
      <TextInput style={styles.input} placeholderTextColor="#bbb" {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#FFF0F5',
    padding: 24,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 48,
    marginBottom: 24,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  emoji: {
    fontSize: 52,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#888',
    marginBottom: 32,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    gap: 12,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 54,
    shadowColor: '#FF6B9D',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  btn: {
    backgroundColor: '#FF6B9D',
    borderRadius: 14,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    shadowColor: '#FF6B9D',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  btnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  terms: {
    marginTop: 24,
    fontSize: 12,
    color: '#bbb',
    textAlign: 'center',
  },
});
