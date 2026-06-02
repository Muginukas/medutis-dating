export type Profile = {
  id: string;
  name: string;
  age: number;
  bio: string;
  photos: string[];
  city: string;
  interests: string[];
  distance: number;
};

export const MOCK_PROFILES: Profile[] = [
  {
    id: '1',
    name: 'Agnė',
    age: 24,
    bio: 'Myliu gamtą, knygeles ir šokoladinį tortą 🍫 Ieškau nuoširdaus žmogaus.',
    photos: [
      'https://i.pravatar.cc/600?img=47',
      'https://i.pravatar.cc/600?img=48',
    ],
    city: 'Vilnius',
    interests: ['Knygos', 'Gamta', 'Kepimas', 'Jogos'],
    distance: 3,
  },
  {
    id: '2',
    name: 'Rūta',
    age: 26,
    bio: 'Architektė, mėgstanti keliauti po Europą ✈️ Virkau žiūrėdama "Hachiko".',
    photos: [
      'https://i.pravatar.cc/600?img=44',
      'https://i.pravatar.cc/600?img=45',
    ],
    city: 'Kaunas',
    interests: ['Kelionės', 'Architektūra', 'Vinas', 'Filmai'],
    distance: 98,
  },
  {
    id: '3',
    name: 'Gabija',
    age: 22,
    bio: 'Studentė, kuri dienomis mokosi, o vakarais šoka salsa 💃',
    photos: [
      'https://i.pravatar.cc/600?img=39',
      'https://i.pravatar.cc/600?img=40',
    ],
    city: 'Klaipėda',
    interests: ['Šokiai', 'Muzika', 'Jūra', 'Sportas'],
    distance: 310,
  },
  {
    id: '4',
    name: 'Monika',
    age: 29,
    bio: 'Gydytoja su aistra maratonams 🏃‍♀️ Ieškau žmogaus, kuriam nebaisu ryte keltis.',
    photos: [
      'https://i.pravatar.cc/600?img=36',
      'https://i.pravatar.cc/600?img=37',
    ],
    city: 'Vilnius',
    interests: ['Bėgimas', 'Medicina', 'Sveikata', 'Gamta'],
    distance: 7,
  },
  {
    id: '5',
    name: 'Ieva',
    age: 25,
    bio: 'Fotografė, kuri mato grožį visur 📷 Kava be cukraus, muzika garsiai.',
    photos: [
      'https://i.pravatar.cc/600?img=32',
      'https://i.pravatar.cc/600?img=33',
    ],
    city: 'Vilnius',
    interests: ['Fotografija', 'Menas', 'Kava', 'Muzika'],
    distance: 2,
  },
  {
    id: '6',
    name: 'Eglė',
    age: 28,
    bio: 'IT projektų vadovė dieną, virėja vakare 🍜 Mėgstu žygius ir šunis.',
    photos: [
      'https://i.pravatar.cc/600?img=25',
      'https://i.pravatar.cc/600?img=26',
    ],
    city: 'Šiauliai',
    interests: ['Technologijos', 'Maistas', 'Žygiai', 'Šunys'],
    distance: 214,
  },
];

export type Match = {
  id: string;
  profile: Profile;
  lastMessage?: string;
  lastMessageTime?: string;
  unread?: number;
};

export const MOCK_MATCHES: Match[] = [
  {
    id: 'm1',
    profile: MOCK_PROFILES[4],
    lastMessage: 'Sveiki! Kaip sekasi? 😊',
    lastMessageTime: '14:32',
    unread: 1,
  },
  {
    id: 'm2',
    profile: MOCK_PROFILES[0],
    lastMessage: 'Ar mėgsti kavą?',
    lastMessageTime: 'Vakar',
    unread: 0,
  },
  {
    id: 'm3',
    profile: MOCK_PROFILES[3],
    lastMessage: 'Puiku! Susitikime šeštadienį 🎉',
    lastMessageTime: 'Pr.',
    unread: 0,
  },
];

export type Message = {
  id: string;
  text: string;
  fromMe: boolean;
  time: string;
};

export const MOCK_MESSAGES: Record<string, Message[]> = {
  m1: [
    { id: '1', text: 'Sveiki! Kaip sekasi? 😊', fromMe: false, time: '14:32' },
  ],
  m2: [
    { id: '1', text: 'Labas! Patiko tavo profilis 😊', fromMe: true, time: '10:00' },
    { id: '2', text: 'Ačiū! Tavo taip pat 🌸', fromMe: false, time: '10:05' },
    { id: '3', text: 'Ar mėgsti kavą?', fromMe: false, time: 'Vakar' },
  ],
  m3: [
    { id: '1', text: 'Labas 👋', fromMe: true, time: 'Pr.' },
    { id: '2', text: 'Ei, labas!', fromMe: false, time: 'Pr.' },
    { id: '3', text: 'Gal susitiktume savaitgalį?', fromMe: true, time: 'Pr.' },
    { id: '4', text: 'Puiku! Susitikime šeštadienį 🎉', fromMe: false, time: 'Pr.' },
  ],
};
