import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { MatchEntry, StoredMessage, useMatches } from '../../src/context/MatchesContext';
import { MOCK_MATCHES, MOCK_MESSAGES } from '../../src/data/mockProfiles';
import { useUnlockedPhotos } from '../../src/hooks/useUnlockedPhotos';

type Message = StoredMessage & { date?: string };

type DateSeparator = {
  type: 'date_separator';
  id: string;
  date: string;
};

type TypingItem = { type: 'typing'; id: string };

type ChatItem = Message | DateSeparator | TypingItem;

const AUTO_REPLIES = [
  'Labai įdomu! 😊',
  'Papasakok daugiau!',
  'Wow, tikrai? 🤩',
  'Haha, man taip pat! 😄',
  'Super! 🌸',
  'Sutinku su tavimi 😌',
  'Tai nuostabu! ✨',
  'Puiku! 🎉',
];

const REACTIONS = ['❤️', '😂', '😮', '👍'];

function nowTime() {
  return new Date().toLocaleTimeString('lt-LT', { hour: '2-digit', minute: '2-digit' });
}

function todayIso() {
  return new Date().toISOString().split('T')[0];
}

function dateLabel(iso: string): string {
  const today = todayIso();
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (iso === today) return 'Šiandien';
  if (iso === yesterday) return 'Vakar';
  const d = new Date(iso);
  return d.toLocaleDateString('lt-LT', { month: 'short', day: 'numeric' });
}

function buildChatItems(messages: Message[], showTyping: boolean): ChatItem[] {
  const items: ChatItem[] = [];
  let lastDate = '';
  for (const msg of messages) {
    const msgDate = (msg as any).date ?? todayIso();
    if (msgDate !== lastDate) {
      items.push({ type: 'date_separator', id: `sep-${msgDate}-${lastDate}`, date: msgDate });
      lastDate = msgDate;
    }
    items.push(msg);
  }
  if (showTyping) {
    items.push({ type: 'typing', id: 'typing-indicator' });
  }
  return items;
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { matches, updateMessages } = useMatches();
  const { isUnlocked, unlock } = useUnlockedPhotos();

  const realMatch = matches.find((m: MatchEntry) => m.id === id);
  const mockMatch = MOCK_MATCHES.find((m) => m.id === id);
  const matchProfile = realMatch?.profile ?? mockMatch?.profile;

  const getInitialMessages = (): Message[] => {
    if (realMatch && realMatch.messages.length > 0) {
      return realMatch.messages as Message[];
    }
    if (mockMatch) {
      return (MOCK_MESSAGES[id] ?? []).map((m) => ({
        ...m,
        type: 'text' as const,
        date: todayIso(),
      }));
    }
    return [];
  };

  const [messages, setMessages] = useState<Message[]>(getInitialMessages);
  const [text, setText] = useState('');
  const [unlockPending, setUnlockPending] = useState(false);
  const [typingVisible, setTypingVisible] = useState(false);
  const [reactionPickerFor, setReactionPickerFor] = useState<string | null>(null);
  const listRef = useRef<FlatList>(null);
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (matchProfile) router.setParams({ title: matchProfile.name });
  }, [matchProfile]);

  useEffect(() => {
    if (!typingVisible) {
      dot1.setValue(0); dot2.setValue(0); dot3.setValue(0);
      return;
    }
    const makeDotAnim = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.delay(Math.max(0, 600 - delay)),
        ])
      );
    const a1 = makeDotAnim(dot1, 0);
    const a2 = makeDotAnim(dot2, 200);
    const a3 = makeDotAnim(dot3, 400);
    a1.start(); a2.start(); a3.start();
    return () => { a1.stop(); a2.stop(); a3.stop(); };
  }, [typingVisible]);

  const persist = (updated: Message[]) => {
    if (realMatch) updateMessages(id, updated as StoredMessage[]);
  };

  const scrollToBottom = () =>
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);

  const send = () => {
    if (!text.trim()) return;
    const msg: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      type: 'text',
      fromMe: true,
      time: nowTime(),
      date: todayIso(),
    };
    const updated = [...messages, msg];
    setMessages(updated);
    persist(updated);
    setText('');
    scrollToBottom();
    scheduleAutoReply(updated);
  };

  const scheduleAutoReply = (current: Message[]) => {
    setTypingVisible(true);
    setTimeout(() => {
      setTypingVisible(false);
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        text: AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)],
        type: 'text',
        fromMe: false,
        time: nowTime(),
        date: todayIso(),
      };
      const updated = [...current, reply];
      setMessages(updated);
      persist(updated);
      scrollToBottom();
    }, 2000);
  };

  const sendPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;
    const msg: Message = {
      id: Date.now().toString(),
      text: '',
      photo: result.assets[0].uri,
      type: 'photo',
      fromMe: true,
      time: nowTime(),
      date: todayIso(),
    };
    const updated = [...messages, msg];
    setMessages(updated);
    persist(updated);
    scrollToBottom();
  };

  const requestUnlock = () => {
    if (!matchProfile?.blurredPhoto || unlockPending) return;
    setUnlockPending(true);
    const requestMsg: Message = {
      id: Date.now().toString(),
      text: '🔓 Prašymas atrakinti slaptą nuotrauką',
      type: 'unlock_request',
      fromMe: true,
      time: nowTime(),
      date: todayIso(),
    };
    const afterRequest = [...messages, requestMsg];
    setMessages(afterRequest);
    persist(afterRequest);
    scrollToBottom();

    setTimeout(() => {
      const revealMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: '✨ Nuotrauka atrakinta!',
        photo: matchProfile.blurredPhoto,
        type: 'unlock_reveal',
        fromMe: false,
        time: nowTime(),
        date: todayIso(),
      };
      const afterReveal = [...afterRequest, revealMsg];
      setMessages(afterReveal);
      persist(afterReveal);
      unlock(matchProfile.id);
      setUnlockPending(false);
      scrollToBottom();
    }, 1500);
  };

  const toggleReaction = (msgId: string, emoji: string) => {
    setReactionPickerFor(null);
    const updated = messages.map((m: Message) =>
      m.id === msgId ? { ...m, reaction: m.reaction === emoji ? undefined : emoji } : m
    );
    setMessages(updated);
    persist(updated);
  };

  if (!matchProfile) return null;

  const profileUnlocked = isUnlocked(matchProfile.id);
  const showUnlockBtn = !!matchProfile.blurredPhoto && !profileUnlocked && !unlockPending;
  const chatItems = buildChatItems(messages, typingVisible);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#FF6B9D" />
        </TouchableOpacity>
        <Image source={{ uri: matchProfile.photos[0] }} style={styles.headerAvatar} />
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{matchProfile.name}</Text>
          <Text style={styles.headerStatus}>Online</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={22} color="#888" />
        </TouchableOpacity>
      </View>

      <TouchableWithoutFeedback onPress={() => setReactionPickerFor(null)}>
        <FlatList
          ref={listRef}
          data={chatItems}
          keyExtractor={(item: ChatItem) => item.id}
          contentContainerStyle={styles.messageList}
          onLayout={() => listRef.current?.scrollToEnd({ animated: false })}
          renderItem={({ item }: { item: ChatItem }) => {
            if (item.type === 'date_separator') {
              return (
                <View style={styles.dateSepWrap}>
                  <Text style={styles.dateSepText}>{dateLabel((item as DateSeparator).date)}</Text>
                </View>
              );
            }
            if (item.type === 'typing') {
              return (
                <View style={styles.typingWrap}>
                  {[dot1, dot2, dot3].map((dot, i) => (
                    <Animated.View
                      key={i}
                      style={[
                        styles.typingDot,
                        {
                          opacity: dot,
                          transform: [{ translateY: dot.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) }],
                        },
                      ]}
                    />
                  ))}
                </View>
              );
            }
            return (
              <MessageBubble
                item={item as Message}
                reactionPickerFor={reactionPickerFor}
                setReactionPickerFor={setReactionPickerFor}
                toggleReaction={toggleReaction}
              />
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <Image source={{ uri: matchProfile.photos[0] }} style={styles.emptyChatAvatar} />
              <Text style={styles.emptyChatName}>{matchProfile.name}</Text>
              <Text style={styles.emptyChatHint}>Parašyk pirmą žinutę! 💬</Text>
            </View>
          }
        />
      </TouchableWithoutFeedback>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inputRow}>
          <TouchableOpacity style={styles.iconBtn} onPress={sendPhoto}>
            <Ionicons name="camera-outline" size={20} color="#FF6B9D" />
          </TouchableOpacity>
          {showUnlockBtn && (
            <TouchableOpacity style={styles.iconBtn} onPress={requestUnlock}>
              <Ionicons name="lock-open-outline" size={20} color="#FF6B9D" />
            </TouchableOpacity>
          )}
          {unlockPending && (
            <View style={styles.iconBtn}>
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

type BubbleProps = {
  item: Message;
  reactionPickerFor: string | null;
  setReactionPickerFor: (id: string | null) => void;
  toggleReaction: (msgId: string, emoji: string) => void;
};

function MessageBubble({ item, reactionPickerFor, setReactionPickerFor, toggleReaction }: BubbleProps) {
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
        {item.photo && <Image source={{ uri: item.photo }} style={styles.unlockRevealPhoto} />}
        <View style={styles.unlockRevealFooter}>
          <Ionicons name="lock-open" size={14} color="#4CAF50" />
          <Text style={styles.unlockRevealText}>{item.text}</Text>
        </View>
        <Text style={styles.unlockRevealTime}>{item.time}</Text>
      </View>
    );
  }

  if (item.type === 'photo' && item.photo) {
    return (
      <View style={[styles.photoBubble, item.fromMe ? styles.photoBubbleMine : styles.photoBubbleTheirs]}>
        <Image source={{ uri: item.photo }} style={styles.photoBubbleImg} />
        <Text style={[styles.bubbleTime, item.fromMe ? styles.myBubbleTime : undefined, styles.photoBubbleTime]}>
          {item.time}
        </Text>
        {item.reaction && (
          <View style={[styles.reactionBadge, item.fromMe ? styles.reactionMine : styles.reactionTheirs]}>
            <Text style={styles.reactionText}>{item.reaction}</Text>
          </View>
        )}
      </View>
    );
  }

  const showPicker = reactionPickerFor === item.id;
  return (
    <View style={{ marginBottom: 2 }}>
      <TouchableOpacity
        onLongPress={() => setReactionPickerFor(showPicker ? null : item.id)}
        activeOpacity={0.85}
        style={[styles.bubble, item.fromMe ? styles.myBubble : styles.theirBubble]}
      >
        <Text style={[styles.bubbleText, item.fromMe && styles.myBubbleText]}>{item.text}</Text>
        <Text style={[styles.bubbleTime, item.fromMe && styles.myBubbleTime]}>{item.time}</Text>
      </TouchableOpacity>
      {item.reaction && (
        <View style={[styles.reactionBadge, item.fromMe ? styles.reactionMine : styles.reactionTheirs]}>
          <Text style={styles.reactionText}>{item.reaction}</Text>
        </View>
      )}
      {showPicker && (
        <View style={[styles.reactionPicker, item.fromMe ? styles.reactionPickerMine : styles.reactionPickerTheirs]}>
          {REACTIONS.map((emoji) => (
            <TouchableOpacity key={emoji} onPress={() => toggleReaction(item.id, emoji)} style={styles.reactionOption}>
              <Text style={{ fontSize: 22 }}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
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

  dateSepWrap: {
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.07)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginVertical: 10,
  },
  dateSepText: { fontSize: 11, color: '#888', fontWeight: '600' },

  typingWrap: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff',
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#bbb',
  },

  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
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

  reactionBadge: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 2,
    marginBottom: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignSelf: 'flex-start',
  },
  reactionMine: { alignSelf: 'flex-end', marginRight: 4 },
  reactionTheirs: { alignSelf: 'flex-start', marginLeft: 4 },
  reactionText: { fontSize: 14 },
  reactionPicker: {
    flexDirection: 'row',
    gap: 4,
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  reactionPickerMine: { alignSelf: 'flex-end' },
  reactionPickerTheirs: { alignSelf: 'flex-start' },
  reactionOption: { padding: 4 },

  photoBubble: {
    maxWidth: '70%',
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 2,
    backgroundColor: '#fff',
  },
  photoBubbleMine: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  photoBubbleTheirs: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  photoBubbleImg: { width: 200, height: 240 },
  photoBubbleTime: { paddingHorizontal: 8, paddingBottom: 6, marginTop: 0 },

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
  unlockRequestText: { flex: 1, color: '#FF6B9D', fontWeight: '600', fontSize: 14 },
  unlockRequestTime: { fontSize: 10, color: '#FFB8D1' },

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
  unlockRevealPhoto: { width: 220, height: 280 },
  unlockRevealFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  unlockRevealText: { color: '#4CAF50', fontWeight: '700', fontSize: 13 },
  unlockRevealTime: { fontSize: 10, color: '#aaa', paddingHorizontal: 12, paddingBottom: 8, paddingTop: 2 },

  emptyChat: { flex: 1, alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyChatAvatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: '#FF6B9D', marginBottom: 8 },
  emptyChatName: { fontSize: 18, fontWeight: '700', color: '#333' },
  emptyChatHint: { fontSize: 14, color: '#aaa' },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F5E6EA',
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
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
