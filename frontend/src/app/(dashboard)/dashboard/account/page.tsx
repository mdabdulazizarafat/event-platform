'use client';

import React, { useState, useEffect } from 'react';
import { Typography, Card, Form, Input, Switch, Avatar, Select, Tag, Modal, Spin, Badge, App } from 'antd';
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
  Phone,
  Scan,
  Shield,
  FileText,
  Calendar,
  Layers,
  ArrowRight,
  ClipboardList
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchEventTeam, inviteTeamMember, removeTeamMember, TeamMember, fetchMyManagedEvents } from '@/lib/api';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import AvatarCropper from '@/components/ui/AvatarCropper';

const { Title, Paragraph } = Typography;

export default function AccountPage() {
  const { message } = App.useApp();
  const { user, updateUserProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('Overview');

  // Profile Form States
  const [profileForm] = Form.useForm();
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperImageSrc, setCropperImageSrc] = useState('');

  // Security Form States
  const [securityForm] = Form.useForm();

  // Organizer: Event & Team states
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [inviteUsername, setInviteUsername] = useState('');
  const [inviteRole, setInviteRole] = useState<'ORGANIZER' | 'SCANNER'>('SCANNER');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [savingEvent, setSavingEvent] = useState(false);
  const [eventFormValues, setEventFormValues] = useState<any>({
    title: '',
    date: '',
    time: '',
    contactEmail: '',
    contactPhone: '',
    location: ''
  });

  // Event Manager States
  const [managedEvents, setManagedEvents] = useState<any[]>([]);
  const [loadingManagedEvents, setLoadingManagedEvents] = useState(false);

  // Admin / Super Admin Hub States
  const [pendingApplications, setPendingApplications] = useState<any[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Check roles
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isAdmin = user?.role === 'ADMIN';
  const isPlatformAdmin = isSuperAdmin || isAdmin;
  const isOrganizer = user?.role === 'ORGANIZER';

  // Load user profile details on mount
  useEffect(() => {
    if (user) {
      profileForm.setFieldsValue({
        name: user.name,
        email: user.email,
        mobile: user.mobile || '',
        org: user.org || '',
        bio: user.bio || ''
      });
    }
  }, [user, profileForm]);

  // Load events and applications depending on roles
  useEffect(() => {
    async function loadOrganizerEvents() {
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
        console.error('Failed to load host events:', err);
      }
    }

    async function loadManagerEvents() {
      setLoadingManagedEvents(true);
      try {
        const data = await fetchMyManagedEvents();
        setManagedEvents(data);
      } catch (err) {
        console.error('Failed to load managed events:', err);
      } finally {
        setLoadingManagedEvents(false);
      }
    }

    async function loadAdminData() {
      setLoadingApps(true);
      try {
        const res = await fetch('/api/v1/admin/organizer-applications');
        if (res.ok) {
          const data = await res.json();
          setPendingApplications(data);
        }
      } catch (err) {
        console.error('Failed to load organizer applications:', err);
      } finally {
        setLoadingApps(false);
      }

      if (isSuperAdmin) {
        setLoadingLogs(true);
        try {
          const res = await fetch('/api/v1/admin/logs');
          if (res.ok) {
            const data = await res.json();
            setAuditLogs(data.slice(0, 5)); // show recent 5 logs
          }
        } catch (err) {
          console.error('Failed to load audit logs:', err);
        } finally {
          setLoadingLogs(false);
        }
      }
    }

    if (user) {
      if (isOrganizer) {
        loadOrganizerEvents();
      }
      // Always load managed events if the user might be set as manager in some event
      loadManagerEvents();

      if (isPlatformAdmin) {
        loadAdminData();
      }
    }
  }, [user, isOrganizer, isPlatformAdmin, isSuperAdmin]);

  // Load team when selected organizer event changes
  useEffect(() => {
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

  // Bind event details when selectedEvent changes
  useEffect(() => {
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

  const handleUpdateProfile = async (values: any) => {
    setUpdatingProfile(true);
    try {
      const success = await updateUserProfile(values);
      if (success) {
        // no additional message needed, context shows one
      }
    } catch (err: any) {
      message.error(err.message || 'Profile update failed.');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Clear the input value so the same file can be selected again
    e.target.value = '';

    // Check size < 5MB (let cropper handle larger images nicely before upload)
    if (file.size > 5 * 1024 * 1024) {
      message.error('File size must be less than 5MB');
      return;
    }

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setCropperImageSrc(reader.result as string);
        setCropperOpen(true);
      };
    } catch (error) {
      message.error({ content: 'Error reading file', key: 'avatar-upload' });
    }
  };

  const handleCropperSave = async (base64WebP: string) => {
    try {
      setCropperOpen(false);
      message.loading({ content: 'Uploading avatar...', key: 'avatar-upload' });
      
      const res = await fetch('/api/v1/auth/upload-avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64WebP })
      });
        
      if (res.ok) {
        const { url } = await res.json();
        const success = await updateUserProfile({ avatar: url });
        if (success) {
          message.success({ content: 'Avatar updated successfully!', key: 'avatar-upload' });
        } else {
          message.error({ content: 'Failed to update profile with avatar', key: 'avatar-upload' });
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        message.error({ content: errData.error || 'Failed to upload avatar to server', key: 'avatar-upload' });
      }
    } catch (error) {
      message.error({ content: 'Error reading file', key: 'avatar-upload' });
    }
  };

  const handleInvite = async () => {
    if (!inviteUsername.trim() || !selectedEvent) return;
    setInviting(true);
    try {
      const newMember = await inviteTeamMember(selectedEvent.slug, inviteUsername.trim(), inviteRole);
      setTeam((prev) => {
        if (prev.some(m => m.username === newMember.username)) return prev;
        return [...prev, newMember];
      });
      message.success(`Successfully invited "${inviteUsername}" as ${inviteRole === 'ORGANIZER' ? 'Co-Organizer' : 'Event Scanner'}.`);
      setIsInviteModalOpen(false);
      setInviteUsername('');
      setInviteRole('SCANNER');
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
      message.success(`Removed "${username}" from the event team.`);
    } catch (err: any) {
      message.error(err.message || 'Failed to remove member.');
    }
  };

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

  const handleApproveApplication = async (username: string) => {
    try {
      const res = await fetch(`/api/v1/admin/organizer-applications/${username}/approve`, { method: 'PUT' });
      if (res.ok) {
        message.success(`Organizer application for "${username}" approved.`);
        setPendingApplications(prev => prev.filter(app => app.username !== username));
      } else {
        const err = await res.json();
        message.error(err.error || 'Failed to approve application.');
      }
    } catch {
      message.error('Action failed.');
    }
  };

  const handleRejectApplication = async (username: string) => {
    try {
      const res = await fetch(`/api/v1/admin/organizer-applications/${username}/reject`, { method: 'PUT' });
      if (res.ok) {
        message.success(`Organizer application for "${username}" rejected.`);
        setPendingApplications(prev => prev.filter(app => app.username !== username));
      } else {
        const err = await res.json();
        message.error(err.error || 'Failed to reject application.');
      }
    } catch {
      message.error('Action failed.');
    }
  };

  const getRoleBadgeColor = () => {
    switch (user?.role) {
      case 'SUPER_ADMIN': return 'red';
      case 'ADMIN': return 'orange';
      case 'ORGANIZER': return 'blue';
      default: return 'green';
    }
  };

  return (
    <div className="space-y-6">
      {/* Account Settings Header */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant/30 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-heading text-3xl font-extrabold text-foreground leading-none m-0">
              Account Overview
            </h2>
            <Badge 
              count={user?.role?.replace('_', ' ')} 
              style={{ backgroundColor: `var(--${getRoleBadgeColor() === 'red' ? 'error' : getRoleBadgeColor() === 'orange' ? 'tertiary' : getRoleBadgeColor()})` }} 
              className="ml-2 font-bold font-mono"
            />
          </div>
          <p className="text-on-surface-variant text-sm mt-1.5 mb-0">
            View your access profile credentials, modify details, and manage authorization levels.
          </p>
        </div>

        <div className="bg-surface-container-high rounded-xl p-1 flex gap-1 border border-outline-variant/30">
          {['Overview', 'Security', 'Preferences'].map((tab) => (
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
      </section>

      {/* Main Grid Options */}
      {activeTab === 'Overview' && (
        <div className="grid grid-cols-12 gap-6">
          {/* User Profile Info Card (Left 4 Columns) */}
          <section className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            <div className="bento-card p-8 flex flex-col items-center text-center relative">
              <div className="relative group">
                <Avatar size={120} src={user?.avatar || undefined} className="shadow-md border-4 border-white bg-primary-container text-white font-bold text-4xl flex items-center justify-center">
                  {user?.name?.charAt(0).toUpperCase()}
                </Avatar>
                <label className="absolute bottom-2 right-2 bg-primary text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-primary/90 transition-all z-10">
                  <Edit size={16} />
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </label>
              </div>
              <h3 className="font-heading text-xl font-bold text-foreground mt-4 mb-1">{user?.name}</h3>
              <p className="text-sm text-on-surface-variant font-medium mb-1">
                {user?.role?.replace('_', ' ') || 'Participant'}
              </p>
              {user?.org && <p className="text-xs text-on-surface-variant/80 mb-0">{user.org}</p>}
            </div>

            {/* Quick Stats or extra sidebar info could go here */}
          </section>

          {/* Right Role-Based Views (Right 8 Columns) */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
            
            <section className="bento-card p-8">
              <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4 mb-6">
                <h4 className="font-heading text-lg font-bold text-foreground flex items-center gap-2 m-0">
                  <User className="text-primary" size={24} />
                  <span>Personal Information</span>
                </h4>
                <button 
                  onClick={() => profileForm.submit()}
                  disabled={updatingProfile}
                  className="bg-primary text-white font-bold text-sm px-5 py-2 rounded-lg border-none cursor-pointer disabled:opacity-50 hover:bg-primary/90 transition-colors shadow-sm"
                >
                  {updatingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

              <Form 
                form={profileForm}
                layout="vertical" 
                onFinish={handleUpdateProfile} 
                className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4"
                requiredMark={false}
              >
                <Form.Item label={<span className="font-semibold text-on-surface-variant text-sm">Full Name</span>} name="name" rules={[{ required: true, message: 'Name is required' }]}>
                  <Input className="h-12 rounded-xl bg-surface-container-low border-outline-variant/50 focus:bg-white" />
                </Form.Item>
                <Form.Item label={<span className="font-semibold text-on-surface-variant text-sm">Email Address</span>} name="email">
                  <Input className="h-12 rounded-xl bg-surface-container-low border-outline-variant/50 text-on-surface-variant/70" disabled suffix={<Tag color="green" className="m-0 border-none rounded">Verified</Tag>} />
                </Form.Item>
                <Form.Item label={<span className="font-semibold text-on-surface-variant text-sm">Mobile Number</span>} name="mobile">
                  <Input className="h-12 rounded-xl bg-surface-container-low border-outline-variant/50 focus:bg-white" />
                </Form.Item>
                <Form.Item label={<span className="font-semibold text-on-surface-variant text-sm">Organization</span>} name="org">
                  <Input className="h-12 rounded-xl bg-surface-container-low border-outline-variant/50 focus:bg-white" />
                </Form.Item>
                <Form.Item label={<span className="font-semibold text-on-surface-variant text-sm">Professional Bio</span>} name="bio" className="md:col-span-2">
                  <Input.TextArea rows={4} className="rounded-xl bg-surface-container-low border-outline-variant/50 focus:bg-white py-3" />
                </Form.Item>
              </Form>
            </section>
            
            {/* 1. SUPER ADMIN / ADMIN Platform Moderation panel */}
            {isPlatformAdmin && (
              <section className="bento-card p-6 space-y-6">
                <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-4 mb-2">
                  <Shield className="text-primary" size={20} />
                  <h4 className="font-heading text-base font-bold text-foreground m-0">Platform Administration</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {isSuperAdmin && (
                    <Link href="/dashboard/admin/accounts">
                      <div className="p-4 rounded-xl border border-outline-variant/50 hover:bg-surface-container-low transition-colors cursor-pointer flex justify-between items-center">
                        <div>
                          <p className="text-xs font-bold text-foreground m-0">User Accounts Directory</p>
                          <p className="text-[10px] text-on-surface-variant m-0 mt-0.5">Moderate roles and permissions.</p>
                        </div>
                        <ArrowRight size={16} className="text-primary" />
                      </div>
                    </Link>
                  )}
                  <Link href="/dashboard/admin/events">
                    <div className="p-4 rounded-xl border border-outline-variant/50 hover:bg-surface-container-low transition-colors cursor-pointer flex justify-between items-center">
                      <div>
                        <p className="text-xs font-bold text-foreground m-0">Events Moderation Directory</p>
                        <p className="text-[10px] text-on-surface-variant m-0 mt-0.5">Moderate/Delete platform events.</p>
                      </div>
                      <ArrowRight size={16} className="text-primary" />
                    </div>
                  </Link>
                </div>

                {/* Pending Applications count / moderation */}
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Pending Organizers Applications</span>
                    <Tag color={pendingApplications.length > 0 ? 'red' : 'green'} className="font-bold text-[10px]">{pendingApplications.length} Application(s)</Tag>
                  </div>

                  {loadingApps ? (
                    <div className="py-4 text-center"><Spin size="small" /></div>
                  ) : pendingApplications.length === 0 ? (
                    <div className="text-center py-4 bg-surface-container-low rounded-xl border border-outline-variant/20 text-xs italic text-on-surface-variant/70">
                      No organizer applications pending.
                    </div>
                  ) : (
                    <div className="divide-y divide-outline-variant/30 max-h-[220px] overflow-y-auto pr-1">
                      {pendingApplications.map((app) => (
                        <div key={app.username} className="py-3 flex justify-between items-center gap-2">
                          <div>
                            <p className="text-xs font-bold text-foreground m-0">{app.name || app.username}</p>
                            <p className="text-[9px] text-on-surface-variant m-0">Email: {app.email} {app.org ? `• Org: ${app.org}` : ''}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleApproveApplication(app.username)}>Approve</Button>
                            <Button size="sm" variant="danger" onClick={() => handleRejectApplication(app.username)}>Reject</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Audit Logs for Super Admin */}
                {isSuperAdmin && (
                  <div className="space-y-3 pt-2 border-t border-outline-variant/30">
                    <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1">
                      <ClipboardList size={14} /> Recent Audit Trails
                    </span>
                    {loadingLogs ? (
                      <div className="py-4 text-center"><Spin size="small" /></div>
                    ) : auditLogs.length === 0 ? (
                      <div className="text-center py-4 bg-surface-container-low rounded-xl border border-outline-variant/20 text-xs italic text-on-surface-variant/70">
                        No recent actions recorded.
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[200px] overflow-y-auto">
                        {auditLogs.map((log) => (
                          <div key={log.id} className="p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/20 flex flex-col sm:flex-row justify-between sm:items-center gap-1.5 text-[11px]">
                            <div>
                              <span className="font-bold text-foreground">{log.admin_username}</span>
                              <span className="text-on-surface-variant"> performed </span>
                              <span className="font-semibold text-primary font-mono">{log.action}</span>
                              {log.target_type && (
                                <>
                                  <span className="text-on-surface-variant"> on {log.target_type} </span>
                                  <span className="font-mono text-foreground font-semibold">({log.target_id})</span>
                                </>
                              )}
                            </div>
                            <span className="text-[10px] text-on-surface-variant/60 whitespace-nowrap">
                              {new Date(log.created_at).toLocaleTimeString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </section>
            )}

            {/* 2. EVENT MANAGER: Scanners listing page */}
            {managedEvents.length > 0 && (
              <section className="bento-card p-6 space-y-4">
                <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-4 mb-2">
                  <Scan className="text-primary" size={20} />
                  <h4 className="font-heading text-base font-bold text-foreground m-0">My Gate Scanning Clearances</h4>
                </div>
                <p className="text-xs text-on-surface-variant m-0">
                  You are registered as a local manager for the following events. Access the door-side ticket QR scanner checkpoints:
                </p>

                {loadingManagedEvents ? (
                  <div className="py-4 text-center"><Spin /></div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {managedEvents.map((evt) => (
                      <div key={evt.id} className="p-4 rounded-xl border border-outline-variant/60 flex justify-between items-center bg-surface-container-low">
                        <div>
                          <h5 className="font-heading text-sm font-bold text-foreground m-0 leading-tight">{evt.title}</h5>
                          <div className="flex gap-2 items-center mt-1 text-[10px] text-on-surface-variant uppercase font-semibold">
                            <Calendar size={11} />
                            <span>{evt.date} • {evt.time}</span>
                          </div>
                        </div>
                        <Link href={`/dashboard/scanner?event=${evt.slug}`}>
                          <button className="bg-primary text-white hover:opacity-95 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all border-none cursor-pointer">
                            <Scan size={14} /> Scan Checkpoint
                          </button>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* 3. ORGANIZER: Event Management & Teams */}
            {isOrganizer && (
              <>
                <section className="bento-card p-6">
                  <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4 mb-6">
                    <h4 className="font-heading text-base font-bold text-foreground flex items-center gap-2 m-0">
                      <SettingsIcon className="text-primary" size={20} />
                      <span>Event Setup Configuration</span>
                    </h4>
                    <Button variant="primary" size="sm" onClick={handleSaveEvent} loading={savingEvent} disabled={!selectedEvent}>
                      Save Changes
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

                  {events.length === 0 ? (
                    <div className="text-center py-6 bg-surface-container-low rounded-xl border border-outline-variant/30 text-xs italic text-on-surface-variant">
                      No created events found. Create an event from the sidebar first.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block font-bold text-on-surface-variant text-xs mb-1.5">Event Name</label>
                        <Input 
                          value={eventFormValues.title} 
                          onChange={(e) => setEventFormValues({ ...eventFormValues, title: e.target.value })} 
                          className="h-10 rounded-lg" 
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-on-surface-variant text-xs mb-1.5">Date</label>
                        <Input 
                          value={eventFormValues.date} 
                          onChange={(e) => setEventFormValues({ ...eventFormValues, date: e.target.value })} 
                          className="h-10 rounded-lg" 
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-on-surface-variant text-xs mb-1.5">Time / Timezone</label>
                        <Input 
                          value={eventFormValues.time} 
                          onChange={(e) => setEventFormValues({ ...eventFormValues, time: e.target.value })} 
                          className="h-10 rounded-lg" 
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-on-surface-variant text-xs mb-1.5">Contact Email</label>
                        <Input 
                          prefix={<Mail className="text-on-surface-variant" size={16} />} 
                          value={eventFormValues.contactEmail} 
                          onChange={(e) => setEventFormValues({ ...eventFormValues, contactEmail: e.target.value })} 
                          className="h-10 rounded-lg" 
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-on-surface-variant text-xs mb-1.5">Contact Phone</label>
                        <Input 
                          prefix={<Phone className="text-on-surface-variant" size={16} />} 
                          value={eventFormValues.contactPhone} 
                          onChange={(e) => setEventFormValues({ ...eventFormValues, contactPhone: e.target.value })} 
                          className="h-10 rounded-lg" 
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block font-bold text-on-surface-variant text-xs mb-1.5">Venue Location</label>
                        <Input 
                          prefix={<MapPin className="text-on-surface-variant" size={16} />} 
                          value={eventFormValues.location} 
                          onChange={(e) => setEventFormValues({ ...eventFormValues, location: e.target.value })} 
                          className="h-10 rounded-lg" 
                        />
                      </div>
                    </div>
                  )}
                </section>

                <section className="bento-card p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h4 className="font-heading text-base font-bold text-foreground flex items-center gap-2 m-0">
                        <Users className="text-primary" size={20} />
                        <span>Collaborative Team Management</span>
                      </h4>
                      <p className="text-xs text-on-surface-variant m-0 mt-1">Configure event manager scan permissions.</p>
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
                        No team members registered.
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
                                  <button 
                                    onClick={() => handleRemoveMember(member.username)}
                                    className="p-1 hover:bg-error-container/20 rounded transition-colors text-error border-none bg-transparent cursor-pointer"
                                    title="Remove member"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </section>
              </>
            )}

            {/* Basic Participant view placeholder if no other role blocks apply */}
            {!isOrganizer && !isPlatformAdmin && managedEvents.length === 0 && (
              <section className="bento-card p-6 text-center space-y-4">
                <Avatar size={64} className="bg-surface-container-high text-primary mx-auto">
                  <User size={32} />
                </Avatar>
                <div>
                  <h4 className="font-heading text-base font-bold text-foreground m-0">Participant Pass & Badges</h4>
                  <p className="text-xs text-on-surface-variant mt-1 max-w-sm mx-auto">
                    You have participant clearance. View, print, and scan event tickets directly from the dashboard workspace.
                  </p>
                </div>
                <Link href="/dashboard/tickets">
                  <Button variant="outline" size="sm">Go to My Tickets</Button>
                </Link>
              </section>
            )}

          </div>
        </div>
      )}

      {/* Security Settings Tab */}
      {activeTab === 'Security' && (
        <Card className="rounded-xl border border-outline-variant bg-white" styles={{ body: { padding: '24px' } }}>
          <h4 className="font-heading text-base font-bold text-foreground flex items-center gap-2 border-b border-outline-variant/30 pb-4 mb-6">
            <Lock className="text-primary" size={20} />
            <span>Security Configurations</span>
          </h4>

          <Form form={securityForm} layout="vertical" className="max-w-md space-y-4" requiredMark={false}>
            <Form.Item label={<span className="font-bold text-on-surface-variant text-xs">Current Password</span>} name="currentPassword">
              <Input.Password className="h-10 rounded-lg" />
            </Form.Item>
            <Form.Item label={<span className="font-bold text-on-surface-variant text-xs">New Password</span>} name="newPassword">
              <Input.Password className="h-10 rounded-lg" />
            </Form.Item>
            <Form.Item label={<span className="font-bold text-on-surface-variant text-xs">Confirm New Password</span>} name="confirmPassword">
              <Input.Password className="h-10 rounded-lg" />
            </Form.Item>
            <Button variant="primary" onClick={() => message.info('Password credentials updates are handled via verification emails.')}>
              Update Password Credentials
            </Button>
          </Form>
        </Card>
      )}

      {/* Preferences / Notifications Settings Tab */}
      {activeTab === 'Preferences' && (
        <Card className="rounded-xl border border-outline-variant bg-white" styles={{ body: { padding: '24px' } }}>
          <h4 className="font-heading text-base font-bold text-foreground flex items-center gap-2 border-b border-outline-variant/30 pb-4 mb-6">
            <Bell className="text-primary" size={20} />
            <span>Notification & Sync Preferences</span>
          </h4>

          <div className="space-y-6 max-w-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-foreground m-0">Transactional Check-in Sync Alerts</p>
                <p className="text-[11px] text-on-surface-variant m-0 mt-0.5">Receive immediate notification updates on gates activity scans.</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-foreground m-0">Event Updates & Schedule Modifications</p>
                <p className="text-[11px] text-on-surface-variant m-0 mt-0.5">Notify me regarding event sessions and schedule modifications.</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-foreground m-0">System Infrastructure Outages</p>
                <p className="text-[11px] text-on-surface-variant m-0 mt-0.5">Critical notifications on system upgrades or platform outages.</p>
              </div>
              <Switch />
            </div>
          </div>
        </Card>
      )}

      {/* Standard Sign Out card */}
      <Card className="rounded-xl border border-red-200 bg-red-50/10" styles={{ body: { padding: '24px' } }}>
        <h4 className="text-error font-bold text-sm m-0 mb-2">End Session Check</h4>
        <Paragraph className="text-on-surface-variant text-xs mb-4">Disconnect from security auth tokens and logout.</Paragraph>
        <Button variant="danger" onClick={async () => { await logout(); window.location.href = '/sign-in'; }}>
          Sign Out
        </Button>
      </Card>

      {/* Invite Member Modal */}
      <Modal
        title={<span className="font-heading font-extrabold text-lg">Invite Event Manager/Scanner</span>}
        open={isInviteModalOpen}
        onCancel={() => { setIsInviteModalOpen(false); setInviteUsername(''); setInviteRole('SCANNER'); }}
        footer={[
          <Button key="cancel" variant="outline" onClick={() => { setIsInviteModalOpen(false); setInviteUsername(''); setInviteRole('SCANNER'); }}>
            Cancel
          </Button>,
          <Button 
            key="submit" 
            variant="primary" 
            loading={inviting} 
            onClick={handleInvite}
            disabled={!inviteUsername.trim()}
          >
            Invite
          </Button>
        ]}
        centered
      >
        <div className="space-y-4 py-2">
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Invite an existing user on the platform to help manage registrations, scan tickets, or co-organize.
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
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1.5">Team Role</label>
            <Select
              value={inviteRole}
              onChange={(val) => setInviteRole(val)}
              className="w-full h-10 rounded-lg"
            >
              <Select.Option value="ORGANIZER">Co-Organizer (Host privilege)</Select.Option>
              <Select.Option value="SCANNER">Event Scanner (QR scan privilege)</Select.Option>
            </Select>
          </div>
        </div>
      </Modal>

      {/* Avatar Cropper Modal */}
      {cropperOpen && (
        <AvatarCropper 
          open={cropperOpen} 
          imageSrc={cropperImageSrc} 
          onClose={() => setCropperOpen(false)} 
          onSave={handleCropperSave} 
        />
      )}
    </div>
  );
}
