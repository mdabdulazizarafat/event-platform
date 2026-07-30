'use client';

import React, { useState } from 'react';
import { Typography, Card, Form, Input, Button, Switch, Avatar, Select, message, Tag, Modal, Spin } from 'antd';
import { 
  User, 
  Settings as SettingsIcon, 
  Bell, 
  MapPin, 
  Users,
  Edit,
  Trash2,
  Mail,
  Lock,
  UserPlus,
  Phone
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchEventTeam, inviteTeamMember, removeTeamMember, TeamMember } from '@/lib/api';

const { Title, Paragraph } = Typography;

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('General');

  // Event & Team states
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [inviteUsername, setInviteUsername] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviting, setInviting] = useState(false);

  // Load events on mount
  React.useEffect(() => {
    async function loadEvents() {
      try {
        const res = await fetch('/api/v1/events');
        if (res.ok) {
          const data = await res.json();
          const hostEvents = data.filter((e: any) => e.host_username === user?.username);
          setEvents(hostEvents);
          if (hostEvents.length > 0) {
            setSelectedEvent(hostEvents[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load events', err);
      }
    }
    if (user) {
      loadEvents();
    }
  }, [user]);

  // Load team when selected event changes
  React.useEffect(() => {
    async function loadTeam() {
      if (!selectedEvent) return;
      setLoadingTeam(true);
      try {
        const members = await fetchEventTeam(selectedEvent.slug);
        setTeam(members);
      } catch (err: any) {
        console.warn('Failed to load team:', err.message);
      } finally {
        setLoadingTeam(false);
      }
    }
    loadTeam();
  }, [selectedEvent]);

  const handleInvite = async () => {
    if (!inviteUsername.trim() || !selectedEvent) return;
    setInviting(true);
    try {
      const newMember = await inviteTeamMember(selectedEvent.slug, inviteUsername.trim());
      // Avoid duplicate rendering
      setTeam((prev) => {
        if (prev.some(m => m.username === newMember.username)) return prev;
        return [...prev, newMember];
      });
      message.success(`Successfully invited "${inviteUsername}" to the team.`);
      setIsInviteModalOpen(false);
      setInviteUsername('');
    } catch (err: any) {
      message.error(err.message || 'Invitation failed.');
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (username: string) => {
    if (!selectedEvent) return;
    try {
      await removeTeamMember(selectedEvent.slug, username);
      setTeam((prev) => prev.filter((m) => m.username !== username));
      message.success(`Removed "${username}" from the team.`);
    } catch (err: any) {
      message.error(err.message || 'Failed to remove member.');
    }
  };

  const [savingEvent, setSavingEvent] = useState(false);
  const [eventFormValues, setEventFormValues] = useState<any>({
    title: '',
    date: '',
    time: '',
    contactEmail: '',
    contactPhone: '',
    location: ''
  });

  // Bind event details when selectedEvent changes
  React.useEffect(() => {
    if (selectedEvent) {
      setEventFormValues({
        title: selectedEvent.title,
        date: selectedEvent.date,
        time: selectedEvent.time,
        contactEmail: selectedEvent.contact_email || '',
        contactPhone: selectedEvent.contact_phone || '',
        location: selectedEvent.location
      });
    }
  }, [selectedEvent]);

  const handleSaveEvent = async () => {
    if (!selectedEvent) return;
    setSavingEvent(true);
    try {
      const res = await fetch(`/api/v1/events/${selectedEvent.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: eventFormValues.title,
          date: eventFormValues.date,
          time: eventFormValues.time,
          contactEmail: eventFormValues.contactEmail,
          contactPhone: eventFormValues.contactPhone,
          location: eventFormValues.location
        })
      });
      if (res.ok) {
        const data = await res.json();
        setEvents(prev => prev.map(e => e.slug === selectedEvent.slug ? data.event : e));
        setSelectedEvent(data.event);
        message.success('Event configurations updated successfully.');
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update event details.');
      }
    } catch (err: any) {
      message.error(err.message);
    } finally {
      setSavingEvent(false);
    }
  };

  const onFinish = (values: any) => {
    message.success('Settings saved successfully.');
  };

  return (
    <div className="space-y-6">
      {/* Workspace Preferences Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="col-span-1 md:col-span-3">
          <h3 className="font-heading text-3xl font-extrabold text-foreground mb-2">Workspace Preferences</h3>
          <p className="text-sm text-on-surface-variant m-0">Manage your profile, event configurations, and team permissions in one centralized dashboard.</p>
        </div>
        <div className="flex items-end justify-end">
          <div className="bg-surface-container-high rounded-xl p-1 flex gap-1 border border-outline-variant/30">
            {['General', 'Security', 'Billing'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-xs font-bold rounded-lg border-none transition-all cursor-pointer ${
                  activeTab === tab
                    ? 'bg-white text-primary shadow-sm font-extrabold'
                    : 'text-on-surface-variant hover:bg-white/40'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bento Grid layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Profile Settings Left column */}
        <section className="col-span-12 lg:col-span-5 bg-white rounded-xl border border-outline-variant p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
            <h4 className="font-heading text-base font-bold text-foreground flex items-center gap-2 m-0">
              <User className="text-primary" size={20} />
              <span>Profile Settings</span>
            </h4>
            <button className="text-primary font-bold text-xs border-none bg-transparent hover:underline cursor-pointer">Save Changes</button>
          </div>

          <div className="flex flex-col items-center py-4 bg-surface-container-low rounded-xl border border-outline-variant/20">
            <Avatar size={96} src={user?.avatar} className="shadow-lg border-4 border-white mb-2" />
            <button className="text-primary font-bold text-xs border-none bg-transparent hover:underline cursor-pointer">Update Photo</button>
          </div>

          <Form layout="vertical" initialValues={{ name: user?.name, email: user?.email, bio: user?.bio || 'Senior Event Strategist with 12+ years experience in large-scale tech conferences and regional summits.' }} onFinish={onFinish} className="space-y-4">
            <Form.Item label={<span className="font-bold text-on-surface-variant text-xs">Full Name</span>} name="name">
              <Input className="h-10 rounded-lg" />
            </Form.Item>
            <Form.Item label={<span className="font-bold text-on-surface-variant text-xs">Email Address</span>} name="email">
              <Input className="h-10 rounded-lg" disabled />
            </Form.Item>
            <Form.Item label={<span className="font-bold text-on-surface-variant text-xs">Professional Bio</span>} name="bio">
              <Input.TextArea rows={4} className="rounded-lg" />
            </Form.Item>
          </Form>
        </section>

        {/* Right Configuration & Preferences Column */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-6">
          {/* Event Configuration */}
          <section className="bg-white rounded-xl border border-outline-variant p-6">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4 mb-6">
              <h4 className="font-heading text-base font-bold text-foreground flex items-center gap-2 m-0">
                <SettingsIcon className="text-primary" size={20} />
                <span>Event Configuration</span>
              </h4>
              <Button type="primary" size="small" onClick={handleSaveEvent} loading={savingEvent} disabled={!selectedEvent} className="font-bold text-xs bg-primary">
                Save
              </Button>
            </div>

            {events.length > 1 && (
              <div className="mb-4">
                <label className="block font-bold text-on-surface-variant text-xs mb-1.5">Select Event Workspace</label>
                <Select
                  value={selectedEvent?.slug}
                  onChange={(slug) => setSelectedEvent(events.find(e => e.slug === slug))}
                  className="w-full h-10 rounded-lg"
                >
                  {events.map((e) => (
                    <Select.Option key={e.id} value={e.slug}>{e.title}</Select.Option>
                  ))}
                </Select>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block font-bold text-on-surface-variant text-xs mb-1.5">Event Name</label>
                <Input 
                  value={eventFormValues.title} 
                  onChange={(e) => setEventFormValues({ ...eventFormValues, title: e.target.value })} 
                  className="h-10 rounded-lg" 
                  disabled={!selectedEvent}
                />
              </div>
              <div>
                <label className="block font-bold text-on-surface-variant text-xs mb-1.5">Date</label>
                <Input 
                  value={eventFormValues.date} 
                  onChange={(e) => setEventFormValues({ ...eventFormValues, date: e.target.value })} 
                  className="h-10 rounded-lg" 
                  disabled={!selectedEvent}
                />
              </div>
              <div>
                <label className="block font-bold text-on-surface-variant text-xs mb-1.5">Time / Timezone</label>
                <Input 
                  value={eventFormValues.time} 
                  onChange={(e) => setEventFormValues({ ...eventFormValues, time: e.target.value })} 
                  className="h-10 rounded-lg" 
                  placeholder="e.g. 09:00 AM - 05:00 PM" 
                  disabled={!selectedEvent}
                />
              </div>
              <div>
                <label className="block font-bold text-on-surface-variant text-xs mb-1.5">Contact Email</label>
                <Input 
                  prefix={<Mail className="text-on-surface-variant" size={16} />} 
                  value={eventFormValues.contactEmail} 
                  onChange={(e) => setEventFormValues({ ...eventFormValues, contactEmail: e.target.value })} 
                  placeholder="e.g. info@event.com" 
                  className="h-10 rounded-lg" 
                  disabled={!selectedEvent}
                />
              </div>
              <div>
                <label className="block font-bold text-on-surface-variant text-xs mb-1.5">Contact Phone</label>
                <Input 
                  prefix={<Phone className="text-on-surface-variant" size={16} />} 
                  value={eventFormValues.contactPhone} 
                  onChange={(e) => setEventFormValues({ ...eventFormValues, contactPhone: e.target.value })} 
                  placeholder="e.g. +880-1711-000000" 
                  className="h-10 rounded-lg" 
                  disabled={!selectedEvent}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block font-bold text-on-surface-variant text-xs mb-1.5">Venue / Platform Location</label>
                <Input 
                  prefix={<MapPin className="text-on-surface-variant" size={16} />} 
                  value={eventFormValues.location} 
                  onChange={(e) => setEventFormValues({ ...eventFormValues, location: e.target.value })} 
                  placeholder="Venue address" 
                  className="h-10 rounded-lg" 
                  disabled={!selectedEvent}
                />
              </div>
            </div>
          </section>

          {/* Notifications toggles */}
          <section className="bg-white rounded-xl border border-outline-variant p-6">
            <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-4 mb-6">
              <Bell className="text-primary" size={20} />
              <h4 className="font-heading text-base font-bold text-foreground m-0">Notification Preferences</h4>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-foreground m-0">New Registrations</p>
                  <p className="text-[11px] text-on-surface-variant m-0 mt-0.5">Alert when a new participant signs up for the event.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-foreground m-0">Session Changes</p>
                  <p className="text-[11px] text-on-surface-variant m-0 mt-0.5">Notify me if a speaker or schedule detail is modified.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-foreground m-0">System Alerts</p>
                  <p className="text-[11px] text-on-surface-variant m-0 mt-0.5">Critical platform updates and maintenance notices.</p>
                </div>
                <Switch />
              </div>
            </div>
          </section>
        </div>

        {/* Team Management list */}
        <section className="col-span-12 bg-white rounded-xl border border-outline-variant p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="font-heading text-base font-bold text-foreground flex items-center gap-2 m-0">
                <Users className="text-primary" size={20} />
                <span>Team Management</span>
              </h4>
              <p className="text-xs text-on-surface-variant m-0 mt-1">Manage roles and permissions for event collaborators.</p>
            </div>
            <button 
              onClick={() => setIsInviteModalOpen(true)}
              disabled={!selectedEvent}
              className="bg-primary text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:shadow-lg transition-all border-none cursor-pointer text-xs disabled:opacity-50"
            >
              <UserPlus size={14} />
              <span>Invite Member</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            {loadingTeam ? (
              <div className="flex justify-center py-8">
                <Spin />
              </div>
            ) : team.length === 0 ? (
              <div className="text-center py-8 text-on-surface-variant/60 italic text-xs">
                No team members registered. The event organizer is the sole manager.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/50">
                    <th className="pb-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Member</th>
                    <th className="pb-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Role</th>
                    <th className="pb-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Joined</th>
                    <th className="pb-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30">
                  {team.map((member) => (
                    <tr key={member.username} className="hover:bg-surface-container-low transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <Avatar src={member.avatar || undefined} className="bg-primary-container text-white font-bold">
                            {member.name ? member.name.charAt(0).toUpperCase() : member.username.charAt(0).toUpperCase()}
                          </Avatar>
                          <div>
                            <p className="text-xs font-bold text-foreground m-0">{member.name || member.username}</p>
                            <p className="text-[10px] text-on-surface-variant m-0 mt-0.5">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <Tag color={member.role === 'ORGANIZER' ? 'blue' : 'green'} className="font-bold text-[10px]">
                          {member.role}
                        </Tag>
                      </td>
                      <td className="py-3 text-[11px] text-on-surface-variant">
                        {new Date(member.joined_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-right">
                        {member.role !== 'ORGANIZER' && (
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleRemoveMember(member.username)}
                              className="p-1 hover:bg-error-container/20 rounded transition-colors text-error border-none bg-transparent cursor-pointer"
                              title="Remove member"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>

      {/* Danger Zone */}
      <Card className="rounded-2xl border border-red-200 shadow-sm bg-red-50/10" styles={{ body: { padding: '24px' } }}>
        <Title level={5} className="!m-0 text-error font-bold mb-2">Sign Out</Title>
        <Paragraph className="text-on-surface-variant text-xs mb-4">End your current session and return to the login page.</Paragraph>
        <Button danger onClick={() => { logout(); window.location.href = '/login'; }} className="h-10 rounded-lg font-bold px-6">
          Sign Out
        </Button>
      </Card>

      {/* Invite Member Modal */}
      <Modal
        title={<span className="font-heading font-extrabold text-lg">Invite Event Manager</span>}
        open={isInviteModalOpen}
        onCancel={() => { setIsInviteModalOpen(false); setInviteUsername(''); }}
        footer={[
          <Button key="cancel" onClick={() => { setIsInviteModalOpen(false); setInviteUsername(''); }}>
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={inviting} 
            onClick={handleInvite}
            className="bg-primary"
            disabled={!inviteUsername.trim()}
          >
            Invite
          </Button>
        ]}
        centered
      >
        <div className="space-y-4 py-2">
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Invite an existing host on the platform to help manage registrations, scan tickets, and run checkpoints at your event.
          </p>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1.5">Username/ID</label>
            <Input 
              value={inviteUsername} 
              onChange={(e) => setInviteUsername(e.target.value)} 
              placeholder="e.g. volunteer-user"
              className="h-10 rounded-lg"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
