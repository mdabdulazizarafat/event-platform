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

export interface TicketType {
  id: number;
  event_id: number;
  name: string;
  description: string | null;
  price: string;
  currency: string;
  capacity: number | null;
  sort_order: number;
  is_active: boolean;
  sale_start: string | null;
  sale_end: string | null;
  sold_count: number;
  remaining: number | null;
  available: boolean;
  isFree: boolean;
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
  contactEmail?: string;
  contactPhone?: string;
  passType?: string;
  gate?: string;
  attendeesCount?: string;
  locationShort?: string;
  speakers?: Speaker[];
  sessions?: Session[];
  status?: string;
  capacity?: number;
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
  },
  'gregorian-quiz-club': {
    username: 'gregorian-quiz-club',
    name: 'Gregorian Quiz Club',
    avatar: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=200&h=200&fit=crop',
    bio: 'One of the oldest and most prestigious quiz clubs in the country, fostering general knowledge, debate, and intellectual growth.',
  }
};

const mockEvents: Event[] = [
  {
    slug: '6th-gregorian-knowledge-fiesta-2026',
    title: '6th Gregorian Knowledge Fiesta 2026',
    date: '28 Aug, 2026 - 29 Aug, 2026',
    time: '12:00 PM - 06:00 PM',
    location: "St. Gregory's High School & College",
    locationShort: "St. Gregory's, Dhaka",
    attendeesCount: '1.2k+',
    description: 'Learning Today, Leading Tomorrow. Behold, intellectual voyagers and paragons of erudition! The long-anticipated 6th Gregorian Knowledge Fiesta 2026 has dawned—a sophisticated crucible where pedagogy, tactical acumen, and synergistic cooperation converge.',
    thumbnail: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&h=450&fit=crop',
    hostUsername: 'gregorian-quiz-club',
    contactEmail: 'gqc@stgregorys.edu',
    contactPhone: '+880-1835-099555',
    passType: 'Standard Access',
    gate: 'Main Gate'
  },
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
    contactEmail: 'info@globaltechsummit.com',
    contactPhone: '+880-1711-000000',
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
    contactEmail: 'workshops@techhub.io',
    contactPhone: '+880-1711-111111',
    passType: 'General Admission',
    gate: 'Main Entrance • Gate A'
  },
  {
    slug: 'ui-ux-design-forum',
    title: 'UI/UX Design Systems Forum 2026',
    date: 'Dec 05, 2026',
    time: '10:00 AM - 04:00 PM',
    location: 'Creative Studio HQ, New York',
    locationShort: 'Creative HQ, NY',
    attendeesCount: '300+',
    description: 'A gathering of design leaders to discuss design systems, scaling UI, and modern branding aesthetics.',
    thumbnail: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=800&h=450&fit=crop',
    hostUsername: 'creative-studio',
    contactEmail: 'design@creativestudio.com',
    contactPhone: '+880-1711-222222',
    passType: 'Standard Access',
    gate: 'Hall C • Level 2'
  }
];

function mapBackendEventToFrontend(e: any): Event {
  return {
    slug: e.slug || '',
    title: e.title || 'Untitled Event',
    date: e.date || '',
    time: e.time || '',
    location: e.location || '',
    locationShort: (e.location || '').split(',')[0],
    attendeesCount: e.attendees_count || '1.2k+',
    description: e.description || e.title || '',
    thumbnail: e.thumbnail || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&h=450&fit=crop',
    hostUsername: e.host_username || e.hostUsername || 'gregorian-quiz-club',
    contactEmail: e.contact_email || e.contactEmail,
    contactPhone: e.contact_phone || e.contactPhone,
    status: e.status || 'PUBLISHED',
    capacity: e.capacity || 100,
    passType: 'Standard Access',
    gate: 'Main Gate',
  };
}

export async function getUpcomingEvents(): Promise<Event[]> {
  try {
    const response = await fetch('/api/v1/events');
    if (!response.ok) throw new Error('Backend response not ok');
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      return data.map(mapBackendEventToFrontend);
    }
  } catch {
    // Fallback to mockEvents if backend offline in static preview
  }
  return mockEvents;
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  try {
    const response = await fetch(`/api/v1/events/${slug}`);
    if (response.ok) {
      const data = await response.json();
      if (data && data.slug) {
        return mapBackendEventToFrontend(data);
      }
    }
  } catch {
    // Fallback to mockEvents
  }
  const event = mockEvents.find((e) => e.slug === slug);
  return event || null;
}

export async function getHostByUsername(username: string): Promise<Host | null> {
  try {
    const response = await fetch(`/api/v1/auth/users/${username}`);
    if (response.ok) {
      const data = await response.json();
      if (data && data.username) {
        return {
          username: data.username,
          name: data.name || data.username,
          avatar: data.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&h=200&fit=crop',
          bio: data.bio || 'Event Organizer on Rong Plan.',
        };
      }
    }
  } catch {
    // Fallback to mockHosts
  }
  return mockHosts[username] || null;
}

export async function getEventsByHost(hostUsername: string): Promise<Event[]> {
  try {
    const response = await fetch('/api/v1/events');
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const filtered = data.filter((e: any) => (e.host_username || e.hostUsername) === hostUsername);
        if (filtered.length > 0) {
          return filtered.map(mapBackendEventToFrontend);
        }
      }
    }
  } catch {
    // Fallback to mockEvents
  }
  return mockEvents.filter((e) => e.hostUsername === hostUsername);
}

/**
 * Fetch available ticket types for an event from the backend.
 */
export async function fetchTicketTypes(slug: string): Promise<TicketType[]> {
  try {
    const response = await fetch(`/api/v1/events/${slug}/ticket-types`);
    if (!response.ok) {
      return [];
    }
    return await response.json();
  } catch {
    return [];
  }
}

/**
 * Fetch the logged in user's registrations from the backend.
 */
export async function fetchMyRegistrations() {
  try {
    const response = await fetch(`/api/v1/tickets/my-registrations`);
    if (!response.ok) {
      return [];
    }
    return await response.json();
  } catch {
    return [];
  }
}

/**
 * Initiate payment for a paid ticket type.
 */
export async function initiatePayment(data: {
  eventSlug: string;
  ticketTypeId: number;
  userId: string;
  email: string;
  customerName: string;
  customerPhone?: string;
}): Promise<{ gatewayUrl: string; tranId: string }> {
  const response = await fetch('/api/v1/payments/initiate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.error || 'Failed to initiate payment');
  }

  return await response.json();
}

/**
 * Check payment status by transaction ID.
 */
export async function checkPaymentStatus(tranId: string) {
  const response = await fetch(`/api/v1/payments/status/${tranId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch payment status');
  }
  return await response.json();
}

/**
 * Event Activities API client functions.
 */
export interface EventActivity {
  id: number;
  event_id: number;
  name: string;
  scan_limit: number | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export async function fetchEventActivities(slug: string): Promise<EventActivity[]> {
  const response = await fetch(`/api/v1/events/${slug}/activities`);
  if (!response.ok) {
    throw new Error('Failed to load event activities');
  }
  return await response.json();
}

export async function createEventActivity(slug: string, name: string, scanLimit: number | null): Promise<EventActivity> {
  const response = await fetch(`/api/v1/events/${slug}/activities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, scanLimit })
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to create activity');
  }
  return await response.json();
}

export async function updateEventActivity(slug: string, id: number, data: { name?: string; scanLimit?: number | null; isActive?: boolean }): Promise<EventActivity> {
  const response = await fetch(`/api/v1/events/${slug}/activities/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Failed to update activity');
  }
  return await response.json();
}

export async function deactivateEventActivity(slug: string, id: number): Promise<void> {
  const response = await fetch(`/api/v1/events/${slug}/activities/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Failed to deactivate activity');
  }
}

/**
 * Scanning & Logging API client functions.
 */
export interface ScanResult {
  success: boolean;
  message: string;
  registration?: {
    id: number;
    email: string;
    userId: string;
    ticketName: string;
  };
  scannedAt?: string;
}

export async function scanTicket(slug: string, activityId: number, qrToken: string): Promise<ScanResult> {
  const response = await fetch(`/api/v1/events/${slug}/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ activityId, qrToken })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Verification failed');
  }
  return data;
}

export async function fetchScanLogs(slug: string) {
  const response = await fetch(`/api/v1/events/${slug}/scan/logs`);
  if (!response.ok) {
    throw new Error('Failed to load scan history logs');
  }
  return await response.json();
}

export async function fetchScanStats(slug: string) {
  const response = await fetch(`/api/v1/events/${slug}/scan/stats`);
  if (!response.ok) {
    throw new Error('Failed to load scanning statistics');
  }
  return await response.json();
}

/**
 * Event Team API client functions.
 */
export interface TeamMember {
  id: number;
  event_id: number;
  username: string;
  role: 'ORGANIZER' | 'MANAGER';
  invited_by: string | null;
  joined_at: string;
  name: string;
  email: string;
  avatar: string | null;
  bio: string | null;
}

export async function fetchEventTeam(slug: string): Promise<TeamMember[]> {
  const response = await fetch(`/api/v1/events/${slug}/team`);
  if (!response.ok) {
    throw new Error('Failed to load event team members');
  }
  return await response.json();
}

export async function inviteTeamMember(slug: string, username: string, role: string): Promise<TeamMember> {
  const response = await fetch(`/api/v1/events/${slug}/team`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, role })
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Failed to invite team member');
  }
  const data = await response.json();
  return data.teamMember;
}

export async function removeTeamMember(slug: string, username: string): Promise<void> {
  const response = await fetch(`/api/v1/events/${slug}/team/${username}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Failed to remove team member');
  }
}

/**
 * User Account & Admin Moderation API client functions.
 */
export async function registerAccount(data: {
  username: string;
  name: string;
  email: string;
  password: string;
  role?: 'USER' | 'ORGANIZER';
  mobile?: string;
  org?: string;
}) {
  const response = await fetch('/api/v1/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const resData = await response.json();
  if (!response.ok) {
    throw new Error(resData.error || 'Registration failed');
  }
  return resData;
}

export async function updateProfile(data: {
  name?: string;
  email?: string;
  mobile?: string;
  avatar?: string;
  bio?: string;
  org?: string;
}) {
  const response = await fetch('/api/v1/auth/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const resData = await response.json();
  if (!response.ok) {
    throw new Error(resData.error || 'Failed to update profile');
  }
  return resData;
}

export async function fetchPendingOrganizers() {
  const response = await fetch('/api/v1/admin/organizer-applications');
  if (!response.ok) {
    throw new Error('Failed to load organizer applications');
  }
  return await response.json();
}

export async function approveOrganizerApplication(username: string) {
  const response = await fetch(`/api/v1/admin/organizer-applications/${username}/approve`, {
    method: 'PUT',
  });
  const resData = await response.json();
  if (!response.ok) {
    throw new Error(resData.error || 'Failed to approve organizer');
  }
  return resData;
}

export async function rejectOrganizerApplication(username: string) {
  const response = await fetch(`/api/v1/admin/organizer-applications/${username}/reject`, {
    method: 'PUT',
  });
  const resData = await response.json();
  if (!response.ok) {
    throw new Error(resData.error || 'Failed to reject organizer');
  }
  return resData;
}

export async function fetchMyManagedEvents() {
  const response = await fetch('/api/v1/events/my-managed');
  if (!response.ok) {
    throw new Error('Failed to load managed events');
  }
  return await response.json();
}



