import React, { createContext, useContext, useState } from 'react';

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

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const addMatchNotification = (name: string, photo: string) => {
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
    setNotifications((prev: AppNotification[]) => [notification, ...prev]);
  };

  const markAllRead = () => {
    setNotifications((prev: AppNotification[]) => prev.map((n) => ({ ...n, read: true })));
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
