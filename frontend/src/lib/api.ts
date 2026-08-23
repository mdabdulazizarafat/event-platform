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
  is_team?: boolean;
  max_team_size?: number;
}

export interface Event {
  id?: number;
  slug: string;
  title: string;
  is_registered?: boolean;
  is_team_member?: boolean;
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
  form_tshirt_size?: boolean;
  form_reference?: boolean;
  form_transaction_id?: boolean;
  is_private?: boolean;
  event_for?: string;
  student_category?: string;
}

export interface Host {
  username: string;
  name: string;
  avatar: string;
  bio: string;
}


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
    id: e.id,
    is_registered: e.is_registered,
    is_team_member: e.is_team_member,
  };
}

export async function getUpcomingEvents(): Promise<Event[]> {
  try {
    const response = await fetch('/api/v1/events');
    if (!response.ok) throw new Error('Backend response not ok');
    const data = await response.json();
    const eventsArray = Array.isArray(data) ? data : (data.data || data.events || []);
    if (eventsArray.length > 0) {
      return eventsArray.map(mapBackendEventToFrontend);
    }
  } catch {
    // Return empty on error
  }
  return [];
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
    // Error fetching event
  }
  return null;
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
    // Error fetching host
  }
  return null;
}

export async function getEventsByHost(hostUsername: string): Promise<Event[]> {
  try {
    const response = await fetch('/api/v1/events');
    if (response.ok) {
      const data = await response.json();
      const eventsArray = Array.isArray(data) ? data : (data.data || data.events || []);
      if (eventsArray.length > 0) {
        const filtered = eventsArray.filter((e: any) => (e.host_username || e.hostUsername) === hostUsername);
        if (filtered.length > 0) {
          return filtered.map(mapBackendEventToFrontend);
        }
      }
    }
  } catch {
    // Error fetching events
  }
  return [];
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
  jobTitle?: string;
  organization?: string;
  tshirtSize?: string;
  reference?: string;
  transactionId?: string;
  teamName?: string;
  teamMembers?: string[];
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

/**
 * Schedule API client functions.
 */
export interface ScheduleItem {
  id: number;
  event_slug: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  room: string;
  speaker: string;
  status: string;
}

export async function fetchSchedules(slug: string): Promise<ScheduleItem[]> {
  const response = await fetch(`/api/v1/events/${slug}/schedules`);
  if (!response.ok) {
    return [];
  }
  return await response.json();
}

export async function createSchedule(slug: string, data: Omit<ScheduleItem, 'id' | 'event_slug' | 'status'>): Promise<ScheduleItem> {
  const response = await fetch(`/api/v1/events/${slug}/schedules`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Failed to create schedule');
  }
  return await response.json();
}

export async function deleteSchedule(slug: string, id: number): Promise<void> {
  const response = await fetch(`/api/v1/events/${slug}/schedules/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Failed to delete schedule');
  }
}

// --- Certificate API ---

export async function fetchCertificateTemplate(slug: string) {
  const response = await fetch(`/api/v1/certificates/${slug}/template`);
  if (!response.ok) {
    if (response.status === 404) return null;
    const err = await response.json();
    throw new Error(err.error || 'Failed to fetch certificate template');
  }
  return await response.json();
}

export async function upsertCertificateTemplate(slug: string, data: { template_url: string, sending_time?: string }) {
  const response = await fetch(`/api/v1/certificates/${slug}/template`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Failed to save certificate template');
  }
  return await response.json();
}

export async function fetchEventCertificates(slug: string) {
  const response = await fetch(`/api/v1/certificates/${slug}`);
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Failed to fetch event certificates');
  }
  return await response.json();
}

export async function issueCertificate(slug: string, data: any) {
  const response = await fetch(`/api/v1/certificates/${slug}/issue`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Failed to issue certificate');
  }
  return await response.json();
}
