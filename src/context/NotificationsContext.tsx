import * as ExpoNotifications from 'expo-notifications';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';

export type AppNotification = {
  id: string;
  type: 'match' | 'message' | 'like';
  title: string;
  body: string;
  profilePhoto: string;
  time: string;
  read: boolean;
};

type NotificationsContextType = {
  notifications: AppNotification[];
  unreadCount: number;
  addMatchNotification: (name: string, photo: string) => void;
  markAllRead: () => void;
};

const NotificationsContext = createContext<NotificationsContextType | null>(null);

ExpoNotifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    setupNotifications();
  }, []);

  const setupNotifications = async () => {
    try {
      if (Platform.OS === 'android') {
        await ExpoNotifications.setNotificationChannelAsync('default', {
          name: 'Medutis',
          importance: ExpoNotifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF6B9D',
        });
      }
      await ExpoNotifications.requestPermissionsAsync();
    } catch {
      // silently continue if push not available (simulator / web)
    }
  };

  const addMatchNotification = async (name: string, photo: string) => {
    const time = new Date().toLocaleTimeString('lt-LT', { hour: '2-digit', minute: '2-digit' });

    const notification: AppNotification = {
      id: Date.now().toString(),
      type: 'match',
      title: 'Naujas sutapimas! 🎉',
      body: `Jūs ir ${name} patinkate vienas kitam`,
      profilePhoto: photo,
      time,
      read: false,
    };

    setNotifications((prev) => [notification, ...prev]);

    try {
      await ExpoNotifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: { type: 'match', name },
        },
        trigger: null,
      });
    } catch {
      // silently fail if push unavailable
    }
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, addMatchNotification, markAllRead }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
}
