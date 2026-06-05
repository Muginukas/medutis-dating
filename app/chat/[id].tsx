import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MOCK_MATCHES, MOCK_MESSAGES } from '../../src/data/mockProfiles';
import { useUnlockedPhotos } from '../../src/hooks/useUnlockedPhotos';

type Message = {
  id: string;
  text: string;
  photo?: string;
  type?: 'text' | 'unlock_request' | 'unlock_reveal';
  fromMe: boolean;
  time: string;
};

function now() {
  return new Date().toLocaleTimeString('lt-LT', { hour: '2-digit', minute: '2-digit' });
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const match = MOCK_MATCHES.find((m) => m.id === id);
  const { isUnlocked, unlock } = useUnlockedPhotos();

  const initialMessages: Message[] = (MOCK_MESSAGES[id] ?? []).map((m) => ({
    ...m,
    type: 'text' as const,
  }));
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [text, setText] = useState('');
  const [unlockPending, setUnlockPending] = useState(false);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    if (match) {
      router.setParams({ title: match.profile.name });
    }
  }, [match]);

  const scrollToBottom = () =>
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);

  const send = () => {
    if (!text.trim()) return;
    const msg: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      type: 'text',
      fromMe: true,
      time: now(),
    };
    setMessages((prev: Message[]) => [...prev, msg]);
    setText('');
    scrollToBottom();
  };

  const requestUnlock = () => {
    if (!match?.profile.blurredPhoto || unlockPending) return;
    setUnlockPending(true);

    const requestMsg: Message = {
      id: Date.now().toString(),
      text: '🔓 Prašymas atrakinti slaptą nuotrauką',
      type: 'unlock_request',
      fromMe: true,
      time: now(),
    };
    setMessages((prev: Message[]) => [...prev, requestMsg]);
    scrollToBottom();

    setTimeout(() => {
      const revealMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: '✨ Nuotrauka atrakinta!',
        photo: match.profile.blurredPhoto,
        type: 'unlock_reveal',
        fromMe: false,
        time: now(),
      };
      setMessages((prev: Message[]) => [...prev, revealMsg]);
      unlock(match.profile.id);
      setUnlockPending(false);
      scrollToBottom();
    }, 1500);
  };

  if (!match) return null;

  const profileUnlocked = isUnlocked(match.profile.id);
  const showUnlockBtn = !!match.profile.blurredPhoto && !profileUnlocked && !unlockPending;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#FF6B9D" />
        </TouchableOpacity>
        <Image source={{ uri: match.profile.photos[0] }} style={styles.headerAvatar} />
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{match.profile.name}</Text>
          <Text style={styles.headerStatus}>Online</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={22} color="#888" />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        onLayout={() => listRef.current?.scrollToEnd({ animated: false })}
        renderItem={({ item }) => <MessageBubble item={item} />}
        ListEmptyComponent={
          <View style={styles.emptyChat}>
            <Image source={{ uri: match.profile.photos[0] }} style={styles.emptyChatAvatar} />
            <Text style={styles.emptyChatName}>{match.profile.name}</Text>
            <Text style={styles.emptyChatHint}>Parašyk pirmą žinutę! 💬</Text>
          </View>
        }
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inputRow}>
          {showUnlockBtn && (
            <TouchableOpacity style={styles.unlockIconBtn} onPress={requestUnlock}>
              <Ionicons name="lock-open-outline" size={20} color="#FF6B9D" />
            </TouchableOpacity>
          )}
          {unlockPending && (
            <View style={styles.unlockIconBtn}>
              <Ionicons name="hourglass-outline" size={20} color="#aaa" />
            </View>
          )}
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Rašyti žinutę..."
            placeholderTextColor="#bbb"
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={send}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
            onPress={send}
            disabled={!text.trim()}
          >
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function MessageBubble({ item }: { item: Message }) {
  if (item.type === 'unlock_request') {
    return (
      <View style={styles.unlockRequestBubble}>
        <Ionicons name="lock-open-outline" size={16} color="#FF6B9D" />
        <Text style={styles.unlockRequestText}>{item.text}</Text>
        <Text style={styles.unlockRequestTime}>{item.time}</Text>
      </View>
    );
  }

  if (item.type === 'unlock_reveal') {
    return (
      <View style={styles.unlockRevealWrap}>
        {item.photo && (
          <Image source={{ uri: item.photo }} style={styles.unlockRevealPhoto} />
        )}
        <View style={styles.unlockRevealFooter}>
          <Ionicons name="lock-open" size={14} color="#4CAF50" />
          <Text style={styles.unlockRevealText}>{item.text}</Text>
        </View>
        <Text style={styles.unlockRevealTime}>{item.time}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.bubble, item.fromMe ? styles.myBubble : styles.theirBubble]}>
      <Text style={[styles.bubbleText, item.fromMe && styles.myBubbleText]}>{item.text}</Text>
      <Text style={[styles.bubbleTime, item.fromMe && styles.myBubbleTime]}>{item.time}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF0F5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5E6EA',
  },
  backBtn: { padding: 4 },
  headerAvatar: { width: 42, height: 42, borderRadius: 21, borderWidth: 2, borderColor: '#FF6B9D' },
  headerInfo: { flex: 1 },
  headerName: { fontSize: 16, fontWeight: '700', color: '#333' },
  headerStatus: { fontSize: 12, color: '#4CAF50', fontWeight: '600' },
  messageList: { padding: 16, gap: 8, flexGrow: 1 },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    marginBottom: 4,
  },
  myBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#FF6B9D',
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  bubbleText: { fontSize: 15, color: '#333', lineHeight: 21 },
  myBubbleText: { color: '#fff' },
  bubbleTime: { fontSize: 10, color: '#aaa', marginTop: 3, alignSelf: 'flex-end' },
  myBubbleTime: { color: 'rgba(255,255,255,0.7)' },

  unlockRequestBubble: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF0F5',
    borderWidth: 1.5,
    borderColor: '#FF6B9D',
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 4,
    maxWidth: '85%',
  },
  unlockRequestText: {
    flex: 1,
    color: '#FF6B9D',
    fontWeight: '600',
    fontSize: 14,
  },
  unlockRequestTime: {
    fontSize: 10,
    color: '#FFB8D1',
  },

  unlockRevealWrap: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
    maxWidth: '75%',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  unlockRevealPhoto: {
    width: 220,
    height: 280,
  },
  unlockRevealFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  unlockRevealText: {
    color: '#4CAF50',
    fontWeight: '700',
    fontSize: 13,
  },
  unlockRevealTime: {
    fontSize: 10,
    color: '#aaa',
    paddingHorizontal: 12,
    paddingBottom: 8,
    paddingTop: 2,
  },

  emptyChat: { flex: 1, alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyChatAvatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: '#FF6B9D', marginBottom: 8 },
  emptyChatName: { fontSize: 18, fontWeight: '700', color: '#333' },
  emptyChatHint: { fontSize: 14, color: '#aaa' },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F5E6EA',
  },
  unlockIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF0F5',
    borderWidth: 1.5,
    borderColor: '#FFD0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#FFF0F5',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#333',
    maxHeight: 120,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FF6B9D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#FFB8D1' },
});
