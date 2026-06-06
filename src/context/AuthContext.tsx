import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

export type UserProfile = {
  id: string;
  name: string;
  age: number;
  bio: string;
  photos: string[];
  blurredPhoto?: string;
  city: string;
  interests: string[];
  gender: 'male' | 'female' | 'other';
  lookingFor: 'male' | 'female' | 'both';
  onboardingComplete?: boolean;
};

type AuthContextType = {
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, age: number) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

const DEMO_USER: UserProfile = {
  id: 'me',
  name: 'Tomas',
  age: 27,
  bio: 'Mėgstu keliauti, gamtą ir gerą kavą ☕',
  photos: ['https://i.pravatar.cc/400?img=68'],
  blurredPhoto: 'https://i.pravatar.cc/400?img=69',
  city: 'Vilnius',
  interests: ['Kelionės', 'Fotografija', 'Muzika', 'Sportas'],
  gender: 'male',
  lookingFor: 'female',
  onboardingComplete: true,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('user').then((data) => {
      if (data) setUser(JSON.parse(data));
      setIsLoading(false);
    });
  }, []);

  const login = async (_email: string, _password: string) => {
    await AsyncStorage.setItem('user', JSON.stringify(DEMO_USER));
    setUser(DEMO_USER);
  };

  const register = async (_email: string, _password: string, name: string, age: number) => {
    const newUser: UserProfile = { ...DEMO_USER, id: Date.now().toString(), name, age, onboardingComplete: false };
    await AsyncStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('user');
    setUser(null);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    await AsyncStorage.setItem('user', JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
