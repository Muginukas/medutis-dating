import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const KEY = 'super_likes';
const DAILY_LIMIT = 3;

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

export function useSuperLikes() {
  const [remaining, setRemaining] = useState(DAILY_LIMIT);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((raw: string | null) => {
      if (!raw) return;
      const data = JSON.parse(raw) as { remaining: number; lastReset: string };
      if (data.lastReset !== todayStr()) {
        setRemaining(DAILY_LIMIT);
        AsyncStorage.setItem(KEY, JSON.stringify({ remaining: DAILY_LIMIT, lastReset: todayStr() }));
      } else {
        setRemaining(data.remaining);
      }
    });
  }, []);

  const useSuperLike = useCallback((): boolean => {
    if (remaining <= 0) return false;
    const next = remaining - 1;
    setRemaining(next);
    AsyncStorage.setItem(KEY, JSON.stringify({ remaining: next, lastReset: todayStr() }));
    return true;
  }, [remaining]);

  return { remaining, useSuperLike };
}
