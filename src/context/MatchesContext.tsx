import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Profile } from '../data/mockProfiles';

export type StoredMessage = {
  id: string;
  text: string;
  photo?: string;
  reaction?: string;
  type?: 'text' | 'unlock_request' | 'unlock_reveal' | 'photo';
  fromMe: boolean;
  time: string;
  date?: string;
};

export type MatchEntry = {
  id: string;
  profile: Profile;
  messages: StoredMessage[];
  timestamp: number;
  superLiked: boolean;
};

type MatchesContextType = {
  matches: MatchEntry[];
  likeCount: number;
  swipedIds: Set<string>;
  addMatch: (profile: Profile, superLiked?: boolean) => void;
  addLike: () => void;
  updateMessages: (matchId: string, messages: StoredMessage[]) => void;
  markSwiped: (id: string) => void;
};

const MatchesContext = createContext<MatchesContextType | null>(null);

const MATCHES_KEY = 'matches';
const LIKE_COUNT_KEY = 'like_count';
const SWIPED_IDS_KEY = 'swiped_ids';

export function MatchesProvider({ children }: { children: React.ReactNode }) {
  const [matches, setMatches] = useState<MatchEntry[]>([]);
  const [likeCount, setLikeCount] = useState(0);
  const [swipedIds, setSwipedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(MATCHES_KEY),
      AsyncStorage.getItem(LIKE_COUNT_KEY),
      AsyncStorage.getItem(SWIPED_IDS_KEY),
    ]).then(([matchesRaw, likeRaw, swipedRaw]) => {
      if (matchesRaw) setMatches(JSON.parse(matchesRaw));
      if (likeRaw) setLikeCount(JSON.parse(likeRaw));
      if (swipedRaw) setSwipedIds(new Set(JSON.parse(swipedRaw)));
    });
  }, []);

  const addMatch = useCallback((profile: Profile, superLiked = false) => {
    const entry: MatchEntry = {
      id: Date.now().toString(),
      profile,
      messages: [],
      timestamp: Date.now(),
      superLiked,
    };
    setMatches((prev: MatchEntry[]) => {
      const next = [entry, ...prev];
      AsyncStorage.setItem(MATCHES_KEY, JSON.stringify(next));
      return next;
    });
    setLikeCount((prev: number) => {
      const next = prev + 1;
      AsyncStorage.setItem(LIKE_COUNT_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const addLike = useCallback(() => {
    setLikeCount((prev: number) => {
      const next = prev + 1;
      AsyncStorage.setItem(LIKE_COUNT_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const updateMessages = useCallback((matchId: string, messages: StoredMessage[]) => {
    setMatches((prev: MatchEntry[]) => {
      const next = prev.map((m: MatchEntry) => (m.id === matchId ? { ...m, messages } : m));
      AsyncStorage.setItem(MATCHES_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const markSwiped = useCallback((id: string) => {
    setSwipedIds((prev: Set<string>) => {
      const next = new Set(prev);
      next.add(id);
      AsyncStorage.setItem(SWIPED_IDS_KEY, JSON.stringify(Array.from(next)));
      return next;
    });
  }, []);

  return (
    <MatchesContext.Provider value={{ matches, likeCount, swipedIds, addMatch, addLike, updateMessages, markSwiped }}>
      {children}
    </MatchesContext.Provider>
  );
}

export function useMatches() {
  const ctx = useContext(MatchesContext);
  if (!ctx) throw new Error('useMatches must be used within MatchesProvider');
  return ctx;
}
