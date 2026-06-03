import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppNotification } from '../context/NotificationsContext';

type Props = {
  visible: boolean;
  notifications: AppNotification[];
  onClose: () => void;
};

export default function NotificationDrawer({ visible, notifications, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.title}>Pranešimai</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color="#888" />
          </TouchableOpacity>
        </View>

        {notifications.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="notifications-outline" size={52} color="#e0e0e0" />
            <Text style={styles.emptyTitle}>Pranešimų nėra</Text>
            <Text style={styles.emptyText}>Naujus sutapimus ir žinutes pamatysite čia</Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            renderItem={({ item }) => <NotificationItem item={item} />}
          />
        )}
      </View>
      </View>
    </Modal>
  );
}

function NotificationItem({ item }: { item: AppNotification }) {
  const iconName =
    item.type === 'match' ? 'heart' : item.type === 'message' ? 'chatbubble' : 'star';
  const iconColor =
    item.type === 'match' ? '#FF6B9D' : item.type === 'message' ? '#00C2FF' : '#FFD700';

  return (
    <View style={[styles.item, !item.read && styles.itemUnread]}>
      <View style={styles.avatarWrap}>
        <Image source={{ uri: item.profilePhoto }} style={styles.avatar} />
        <View style={[styles.typeBadge, { backgroundColor: iconColor }]}>
          <Ionicons name={iconName as any} size={10} color="#fff" />
        </View>
      </View>
      <View style={styles.content}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemBody}>{item.body}</Text>
        <Text style={styles.itemTime}>{item.time}</Text>
      </View>
      {!item.read && <View style={styles.unreadDot} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 12,
    maxHeight: '80%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#eee',
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#333',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 52,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ccc',
  },
  emptyText: {
    fontSize: 13,
    color: '#ddd',
    textAlign: 'center',
  },
  list: {
    paddingBottom: 8,
  },
  separator: {
    height: 1,
    backgroundColor: '#F8F0F3',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 14,
    borderRadius: 12,
  },
  itemUnread: {
    backgroundColor: '#FFF5F8',
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  typeBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  content: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  itemBody: {
    fontSize: 13,
    color: '#888',
    lineHeight: 18,
    marginBottom: 3,
  },
  itemTime: {
    fontSize: 11,
    color: '#bbb',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B9D',
  },
});
