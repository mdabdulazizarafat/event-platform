export interface Speaker {
  name: string;
  role: string;
  avatar: string;
}

export interface Session {
  time: string;
  room: string;
  title: string;
  description: string;
  speakerAvatar?: string;
}

export interface Event {
  slug: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  thumbnail: string;
  hostUsername: string;
  passType?: string;
  gate?: string;
  attendeesCount?: string;
  locationShort?: string;
  speakers?: Speaker[];
  sessions?: Session[];
}

export interface Host {
  username: string;
  name: string;
  avatar: string;
  bio: string;
}

const mockHosts: Record<string, Host> = {
  'tech-hub': {
    username: 'tech-hub',
    name: 'Tech Hub Community',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&h=200&fit=crop',
    bio: 'Fostering tech innovation and developer growth. Host of the annual Global Tech Summit, DevCon, and monthly workshops.',
  },
  'creative-studio': {
    username: 'creative-studio',
    name: 'Creative Studio Co.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&h=200&fit=crop',
    bio: 'A collective of designers, writers, and product builders designing the future. Sharing design systems and product knowledge.',
  }
};

const mockEvents: Event[] = [
  {
    slug: 'global-tech-summit',
    title: 'Global Tech Summit 2026',
    date: 'Oct 24-26, 2026',
    time: '09:00 AM - 05:00 PM',
    location: 'Convention Center, San Francisco',
    locationShort: 'SF North Conv.',
    attendeesCount: '2.5k+',
    description: 'The Global Tech Summit is the premier gathering for software engineers, product managers, and tech executives. Join us for 3 days of inspiring keynotes, deep-dive technical sessions, and unmatched networking opportunities as we explore the future of AI, cloud architecture, and open-source ecosystems.',
    thumbnail: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&h=450&fit=crop',
    hostUsername: 'tech-hub',
    passType: 'VIP Access',
    gate: 'South Hall • B2',
    speakers: [
      { name: 'Dr. Elena Rodriguez', role: 'Director of AI Design @ TechCore', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300&h=375&fit=crop' },
      { name: 'Marcus Thorne', role: 'VP of Product, FutureFoundry', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=300&h=375&fit=crop' }
    ],
    sessions: [
      { time: '09:00 AM', room: 'Grand Hall', title: 'Opening Keynote: The Generative Era', description: 'Exploring how generative tools redefine the creative process.', speakerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=100&h=100&fit=crop' }
    ]
  },
  {
    slug: 'react-advanced-workshop',
    title: 'React 19 & Next.js 16 Masterclass',
    date: 'Nov 12, 2026',
    time: '01:00 PM - 06:00 PM',
    location: 'Tech Hub Headquarters, Boston',
    locationShort: 'Tech Hub HQ',
    attendeesCount: '150+',
    description: 'Master React Server Components, Server Actions, the new React Compiler, and advanced state management techniques.',
    thumbnail: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=800&h=450&fit=crop',
    hostUsername: 'tech-hub',
    passType: 'General Admission',
    gate: 'Main Entrance • Gate A'
  }
];

export async function getEventBySlug(slug: string): Promise<Event | null> {
  await new Promise((resolve) => setTimeout(resolve, 50));
  const event = mockEvents.find((e) => e.slug === slug);
  return event || null;
}

export async function getHostByUsername(username: string): Promise<Host | null> {
  await new Promise((resolve) => setTimeout(resolve, 50));
  return mockHosts[username] || null;
}

export async function getEventsByHost(hostUsername: string): Promise<Event[]> {
  await new Promise((resolve) => setTimeout(resolve, 50));
  return mockEvents.filter((e) => e.hostUsername === hostUsername);
}
