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
  ClipboardList,
  Camera
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchEventTeam, inviteTeamMember, removeTeamMember, TeamMember, fetchMyManagedEvents, applyAsOrganizer } from '@/lib/api';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import AvatarCropper from '@/components/ui/AvatarCropper';
import PageHeader from '@/components/ui/PageHeader';

const CLASS_LEVELS = ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10 / Dakhil", "Class 11 / Alim", "Class 12 / Alim", "University / Polytechnic / Fazil"];

const DISTRICTS_BY_DIVISION = {
  "Dhaka Division": ["Dhaka", "Faridpur", "Gazipur", "Gopalganj", "Kishoreganj", "Madaripur", "Manikganj", "Munshiganj", "Narayanganj", "Narsingdi", "Rajbari", "Shariatpur", "Tangail"],
  "Chattogram Division": ["Bandarban", "Brahmanbaria", "Chandpur", "Chattogram", "Comilla", "Cox's Bazar", "Feni", "Khagrachari", "Lakshmipur", "Noakhali", "Rangamati"],
  "Rajshahi Division": ["Bogura", "Chapainawabganj", "Joypurhat", "Naogaon", "Natore", "Pabna", "Rajshahi", "Sirajganj"],
  "Khulna Division": ["Bagerhat", "Chuadanga", "Jashore", "Jhenaidah", "Khulna", "Kushtia", "Magura", "Meherpur", "Narail", "Satkhira"],
  "Barishal Division": ["Barguna", "Barishal", "Bhola", "Jhalokati", "Patuakhali", "Pirojpur"],
  "Sylhet Division": ["Habiganj", "Moulvibazar", "Sunamganj", "Sylhet"],
  "Rangpur Division": ["Dinajpur", "Gaibandha", "Kurigram", "Lalmonirhat", "Nilphamari", "Panchagarh", "Rangpur", "Thakurgaon"],
  "Mymensingh Division": ["Jamalpur", "Mymensingh", "Netrokona", "Sherpur"]
};

const { Title, Paragraph } = Typography;

export default function ProfilePage() {
  const { message } = App.useApp();
  const { user, refetchUser, updateUserProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('Overview');

  // Profile Form States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [university, setUniversity] = useState("");
  const [classLevel, setClassLevel] = useState("");
  const [district, setDistrict] = useState("");
  const [occupationType, setOccupationType] = useState<'student' | 'job'>("student");
  const [institutionName, setInstitutionName] = useState("");
  const [position, setPosition] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperImageSrc, setCropperImageSrc] = useState('');
  const [applying, setApplying] = useState(false);

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
  const isProfileComplete = !!(
    user?.firstName &&
    (user?.mobile || user?.phoneNumber) &&
    user?.dateOfBirth &&
    user?.gender &&
    user?.district &&
    user?.occupationType &&
    user?.institutionName &&
    (user?.occupationType === 'student' ? user?.classLevel : user?.position)
  );

  // Load user profile details on mount
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName !== undefined ? (user.firstName || "") : (user.name?.split(' ')[0] || ""));
      setLastName(user.lastName !== undefined ? (user.lastName || "") : (user.name?.split(' ').slice(1).join(' ') || ""));
      setProfileEmail(user.email || "");
      setPhoneNumber(user.mobile || user.phoneNumber || "");
      setDateOfBirth(user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : "");
      setGender(user.gender || "");
      setUniversity(user.university || user.institutionName || "");
      setClassLevel(user.classLevel || "");
      setDistrict(user.district || "");
      setOccupationType((user.occupationType as 'student' | 'job') || "student");
      setInstitutionName(user.institutionName || user.university || "");
      setPosition(user.position || "");
    }
  }, [user]);

  // Load events and applications depending on roles
  useEffect(() => {
    async function loadOrganizerEvents() {
      try {
        const res = await fetch('/api/v1/events');
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : (data.data || []);
          const hostEvents = list.filter((e: any) => e.host_username === user?.username);
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
          const list = Array.isArray(data) ? data : (data.data || []);
          setPendingApplications(list);
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
            const list = Array.isArray(data) ? data : (data.data || []);
            setAuditLogs(list.slice(0, 5)); // show recent 5 logs
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

  const handleSaveProfile = async () => {
    if (dateOfBirth) {
      const dob = new Date(dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      const effectiveAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate()) ? age - 1 : age;
      if (effectiveAge < 8) {
        message.error("Date of birth must indicate an age of at least 8 years.");
        return;
      }
    }
    setUpdatingProfile(true);
    try {
      const payload = {
        firstName,
        lastName,
        email: profileEmail,
        mobile: phoneNumber,
        gender,
        dateOfBirth,
        district,
        occupationType,
        institutionName,
        university: occupationType === 'student' ? institutionName : '',
        classLevel: occupationType === 'student' ? classLevel : '',
        position: occupationType === 'job' ? position : ''
      };

      const success = await updateUserProfile(payload);

      if (success) {
        setIsEditingProfile(false);
      }
    } catch (err: any) {
      message.error(err.message || 'Failed to update profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleApproveApplication = async (username: string) => {
    try {
      const res = await fetch(`/api/v1/admin/organizers/${username}/approve`, { method: 'POST' });
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
      const res = await fetch(`/api/v1/admin/organizers/${username}/reject`, { method: 'POST' });
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

  const handleSuspendApplication = async (username: string) => {
    try {
      const res = await fetch(`/api/v1/admin/organizers/${username}/suspend`, { method: 'POST' });
      if (res.ok) {
        message.success(`Organizer application for "${username}" suspended.`);
        setPendingApplications(prev => prev.map(app => app.username === username ? { ...app, organizer_status: 'SUSPENDED' } : app));
      } else {
        const err = await res.json();
        message.error(err.error || 'Failed to suspend application.');
      }
    } catch {
      message.error('Action failed.');
    }
  };

  const handleApplyOrganizer = async () => {
    setApplying(true);
    try {
      const resData = await applyAsOrganizer();
      message.success(resData.message || 'Application submitted successfully!');
      await refetchUser();
    } catch (err: any) {
      message.error(err.message || 'Failed to submit application.');
    } finally {
      setApplying(false);
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
      <PageHeader
        title="My Profile"
        description="Manage your profile details."
      />
      {/* Main Stacked Options */}
      {activeTab === 'Overview' && (
        <div className="space-y-6 pb-12">
          {/* Top User Profile Header Card */}
          <div className="bento-card p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 bg-white dark:bg-dark-surface border border-outline-variant/30">
            <div className="relative group">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-primary shadow-sm relative">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-bold text-3xl">
                    {firstName ? firstName.charAt(0).toUpperCase() : user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  const el = document.getElementById('avatar-upload-input');
                  if (el) el.click();
                }}
                className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary/95 transition-colors shadow-sm cursor-pointer border-none"
              >
                <Camera size={14} />
              </button>
              <input
                id="avatar-upload-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>
            <div className="text-center md:text-left flex-1">
              <h2 className="text-xl md:text-2xl font-bold text-foreground m-0">
                {user?.name || `${firstName} ${lastName}`.trim()}
              </h2>
              {user?.username && (
                <p className="text-sm font-medium text-text-secondary mt-1 mb-0">
                  @{user.username} ({user.role?.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())})
                </p>
              )}
              <p className="text-sm font-medium text-text-muted mt-1 mb-0">
                {institutionName || user?.org || '-'}
              </p>
            </div>
          </div>

          {/* All Information Card */}
          <section className="bento-card p-6 md:p-8 flex flex-col gap-10 md:gap-12 bg-white dark:bg-dark-surface border border-outline-variant/30">
            {/* Personal Information */}
            <div>
              <div className="flex justify-between items-center mb-6 border-b border-outline-variant/30 pb-4">
                <h4 className="font-heading text-lg font-bold text-primary flex items-center gap-2 m-0">
                  <span>Personal Information</span>
                </h4>
                {!isEditingProfile ? (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="text-secondary font-bold text-sm bg-transparent border-none cursor-pointer flex items-center gap-2 hover:opacity-80 transition-opacity"
                  >
                    <Edit size={16} className="text-secondary" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setIsEditingProfile(false)}>Cancel</Button>
                    <Button variant="primary" size="sm" onClick={handleSaveProfile} loading={updatingProfile}>
                      Save All
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8">
                <div>
                  <label className="block text-xs font-bold text-text-muted mb-1">First Name</label>
                  {isEditingProfile ? (
                    <input value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors text-foreground" />
                  ) : (
                    <p className="text-sm font-semibold text-foreground m-0">{firstName || '-'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted mb-1">Last Name (Optional)</label>
                  {isEditingProfile ? (
                    <input value={lastName} onChange={e => setLastName(e.target.value)} className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors text-foreground" />
                  ) : (
                    <p className="text-sm font-semibold text-foreground m-0">{lastName || '-'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted mb-1">Date of Birth</label>
                  {isEditingProfile ? (
                    <input type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors text-foreground" />
                  ) : (
                    <p className="text-sm font-semibold text-foreground m-0">{dateOfBirth || '-'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted mb-1">Email Address</label>
                  {isEditingProfile ? (
                    <div className="relative">
                      <input type="email" value={profileEmail} disabled className="w-full bg-surface-container-low/50 border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-on-surface-variant cursor-not-allowed" title="Email cannot be changed" />
                    </div>
                  ) : (
                    <p className="text-sm font-semibold text-foreground m-0">{profileEmail}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted mb-1">Phone Number</label>
                  {isEditingProfile ? (
                    <input value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors text-foreground" />
                  ) : (
                    <p className="text-sm font-semibold text-foreground m-0">{phoneNumber || '-'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted mb-1">Gender</label>
                  {isEditingProfile ? (
                    <select value={gender} onChange={e => setGender(e.target.value)} className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors text-foreground">
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  ) : (
                    <p className="text-sm font-semibold text-foreground m-0">{gender || '-'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Org / Aca Information */}
            <div>
              <div className="mb-6 border-b border-outline-variant/30 pb-4">
                <h4 className="font-heading text-lg font-bold text-primary flex items-center gap-2 m-0">
                  <span>Academic Information</span>
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8">
                <div>
                  <label className="block text-xs font-bold text-text-muted mb-1">Occupation Type</label>
                  {isEditingProfile ? (
                    <select value={occupationType} onChange={e => setOccupationType(e.target.value as 'student' | 'job')} className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors text-foreground">
                      <option value="student">Student</option>
                      <option value="job">Job Holder</option>
                    </select>
                  ) : (
                    <p className="text-sm font-semibold text-foreground m-0 capitalize">{occupationType || '-'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted mb-1">
                    {occupationType === 'student' ? 'University / Institution' : 'Company Name'}
                  </label>
                  {isEditingProfile ? (
                    <input value={institutionName} onChange={e => setInstitutionName(e.target.value)} className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors text-foreground" />
                  ) : (
                    <p className="text-sm font-semibold text-foreground m-0">{institutionName || '-'}</p>
                  )}
                </div>
                {occupationType === 'student' ? (
                  <div>
                    <label className="block text-xs font-bold text-text-muted mb-1">Class / Level</label>
                    {isEditingProfile ? (
                      <select value={classLevel} onChange={e => setClassLevel(e.target.value)} className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors text-foreground">
                        <option value="">Select Class / Level</option>
                        {CLASS_LEVELS.map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-sm font-semibold text-foreground m-0">{classLevel || '-'}</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-text-muted mb-1">Position</label>
                    {isEditingProfile ? (
                      <input value={position} onChange={e => setPosition(e.target.value)} className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors text-foreground" />
                    ) : (
                      <p className="text-sm font-semibold text-foreground m-0">{position || '-'}</p>
                    )}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-text-muted mb-1">District</label>
                  {isEditingProfile ? (
                    <select value={district} onChange={e => setDistrict(e.target.value)} className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors text-foreground">
                      <option value="">Select District</option>
                      {Object.entries(DISTRICTS_BY_DIVISION).map(([division, districts]) => (
                        <optgroup key={division} label={division}>
                          {districts.map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  ) : (
                    <p className="text-sm font-semibold text-foreground m-0">{district || '-'}</p>
                  )}
                </div>
              </div>
            </div>
          </section>

              {/* Organizer Application Section in separate card */}
              {!isPlatformAdmin && !isOrganizer && isProfileComplete && (
                <section className="bento-card p-6 md:p-8 bg-white dark:bg-dark-surface border border-outline-variant/30">
                  <div className="mb-6 border-b border-outline-variant/30 pb-4">
                    <h4 className="font-heading text-lg font-bold text-primary flex items-center gap-2 m-0">
                      <span>Organizer Application</span>
                    </h4>
                  </div>
                  <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/30">
                    {user?.organizerStatus ? (
                      <div>
                        <p className="text-sm font-bold text-foreground mb-2">Application Status: <Tag color={
                          user.organizerStatus === 'APPROVED' ? 'green' :
                          user.organizerStatus === 'REJECTED' ? 'red' : 'blue'
                        }>{user.organizerStatus}</Tag></p>
                        {user.organizerStatus === 'PENDING' && <p className="text-xs text-on-surface-variant m-0">Your application is currently under review by our team.</p>}
                        {user.organizerStatus === 'REJECTED' && (
                          <div>
                            <p className="text-xs text-on-surface-variant m-0 mb-4">Your application was rejected. update your profile and try again.</p>
                            <Button variant="primary" onClick={handleApplyOrganizer} loading={applying}>Apply as Organizer</Button>
                          </div>
                        )}
                        {user.organizerStatus === 'SUSPENDED' && (
                          <p className="text-xs text-red-500 font-bold m-0 mt-4">you can not apply for organzier anymore</p>
                        )}
                        {user.organizerStatus === 'APPROVED' && (
                          <p className="text-xs text-green-600 m-0 mt-4">you became an organizer in the ayojok, please follow the  event rules when creat the event.</p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm text-on-surface-variant mb-4">You can apply to become an organizer to host events on Rong Plan.</p>
                        <Button variant="primary" onClick={handleApplyOrganizer} loading={applying}>Apply as Organizer</Button>
                      </div>
                    )}
                  </div>
                </section>
              )}

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
                    <Link href="/dashboard/organizer-applications">
                      <div className="p-4 rounded-xl border border-outline-variant/50 hover:bg-surface-container-low transition-colors cursor-pointer flex justify-between items-center">
                        <div>
                          <p className="text-xs font-bold text-foreground m-0">Organizer Applications</p>
                          <p className="text-[10px] text-on-surface-variant m-0 mt-0.5">Review and moderate applications.</p>
                        </div>
                        <ArrowRight size={16} className="text-primary" />
                      </div>
                    </Link>
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
