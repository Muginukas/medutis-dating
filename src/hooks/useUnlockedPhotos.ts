import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const KEY = 'unlocked_photos';

export function useUnlockedPhotos() {
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((raw) => {
      if (raw) setUnlocked(new Set(JSON.parse(raw)));
    });
  }, []);

  const isUnlocked = useCallback((id: string) => unlocked.has(id), [unlocked]);

  const unlock = useCallback(async (id: string) => {
    setUnlocked((prev) => {
      const next = new Set(prev);
      next.add(id);
      AsyncStorage.setItem(KEY, JSON.stringify(Array.from(next)));
      return next;
    });
  }, []);

  return { isUnlocked, unlock };
}
