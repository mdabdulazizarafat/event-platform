'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Tag, Tabs, Select, Table, App, Modal, Pagination } from 'antd';
import {
  Users,
  DollarSign,
  CheckCircle,
  Activity,
  ArrowLeft,
  ShieldAlert,
  Calendar,
  MapPin,
  Scan,
  Edit3,
  Power,
  Play,
  Square,
  UserPlus,
  Plus,
  Trash2,
  Save,
  Search,
  ExternalLink,
  Shield,
  Ticket,
  Image as ImageIcon,
  QrCode,
  Clock,
  Mail,
  Phone
} from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import StatusChip from '@/components/ui/StatusChip';
import DataTable from '@/components/ui/DataTable';
import PageHeader from '@/components/ui/PageHeader';

import type { Event, TicketType, TeamMember, EventActivity } from '@/lib/api';
import {
  getEventBySlug,
  fetchTicketTypes,
  fetchScanStats,
  fetchScanLogs,
  fetchEventTeam,
  inviteTeamMember,
  removeTeamMember,
  fetchEventActivities,
  createEventActivity,
  updateEventActivity,
  deactivateEventActivity,
  fetchCertificateTemplate,
  upsertCertificateTemplate,
  fetchEventCertificates,
  issueCertificate,
  fetchMyRegistrations
} from '@/lib/api';

import { useAuth } from '@/context/AuthContext';

export default function EventControlCenterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const router = useRouter();
  const { message, modal } = App.useApp();
  const { user } = useAuth();

  // Root Data State
  const [event, setEvent] = useState<(Event & { id?: number; is_team_member?: boolean; is_registered?: boolean; is_host?: boolean; team_role?: string; }) | null>(null);
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [scanStats, setScanStats] = useState<any>(null);
  const [scanLogs, setScanLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanCurrentPage, setScanCurrentPage] = useState(1);
  const [scanPageSize, setScanPageSize] = useState(10);
  const [certCurrentPage, setCertCurrentPage] = useState(1);
  const [certPageSize, setCertPageSize] = useState(10);
  const [activeTab, setActiveTab] = useState('1');

  // Handle URL query parameter ?tab=X
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      if (tabParam) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    router.push(`?tab=${key}`, { scroll: false });
  };

  // ----------------------------------------------------
  // Tab 2: Participants / Registrations State
  // ----------------------------------------------------
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
  const [regCurrentPage, setRegCurrentPage] = useState(1);
  const [regPageSize, setRegPageSize] = useState(10);
  const [registrationSearchQuery, setRegistrationSearchQuery] = useState('');
  const [registrationStatusFilter, setRegistrationStatusFilter] = useState('All');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [submittingRegistration, setSubmittingRegistration] = useState(false);

  // Manual Register Form State
  const [regEmail, setRegEmail] = useState('');
  const [regUserId, setRegUserId] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regOrganization, setRegOrganization] = useState('');
  const [regJobTitle, setRegJobTitle] = useState('');
  const [regTshirtSize, setRegTshirtSize] = useState('M');
  const [regReference, setRegReference] = useState('');
  const [regTransactionId, setRegTransactionId] = useState('');
  const [regTicketTypeId, setRegTicketTypeId] = useState<string>('');

  // ----------------------------------------------------
  // Tab 8: My Ticket (Participant)
  // ----------------------------------------------------
  const [myTicket, setMyTicket] = useState<any | null>(null);

  // ----------------------------------------------------
  // Tab 3: Edit Form State
  // ----------------------------------------------------
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [registrationDeadlineDate, setRegistrationDeadlineDate] = useState('');
  const [registrationDeadlineTime, setRegistrationDeadlineTime] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState('500');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [status, setStatus] = useState('DRAFT');
  const [isUploading, setIsUploading] = useState(false);
  const [formTshirtSize, setFormTshirtSize] = useState(false);
  const [formReference, setFormReference] = useState(false);
  const [formTransactionId, setFormTransactionId] = useState(false);
  const [savingDetails, setSavingDetails] = useState(false);

  // ----------------------------------------------------
  // Tab 4: Tickets CRUD State
  // ----------------------------------------------------
  const [editableTickets, setEditableTickets] = useState<any[]>([]);

  // ----------------------------------------------------
  // Tab 5: Team Access State
  // ----------------------------------------------------
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [inviteUsername, setInviteUsername] = useState('');
  const [inviteRole, setInviteRole] = useState('SCANNER');
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [invitingTeam, setInvitingTeam] = useState(false);

  // ----------------------------------------------------
  // Tab 6: Activities & Scanning State
  // ----------------------------------------------------
  const [activities, setActivities] = useState<EventActivity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [activityName, setActivityName] = useState('');
  const [activityScanLimit, setActivityScanLimit] = useState('1');
  const [submittingActivity, setSubmittingActivity] = useState(false);

  // ----------------------------------------------------
  // Lifecycle & Initial Loading
  // ----------------------------------------------------
  useEffect(() => {
    loadAllEventData();
  }, [slug]);

  const loadAllEventData = async () => {
    try {
      setLoading(true);
      const eventData = await getEventBySlug(slug);
      if (eventData) {
        setEvent(eventData);
        setTitle(eventData.title || '');
        setDescription(eventData.description || '');
        setThumbnail(eventData.thumbnail || '');
        setLocation(eventData.location || '');
        setCapacity(eventData.capacity?.toString() || '500');
        setContactEmail(eventData.contactEmail || eventData.contactEmail || '');
        setContactPhone(eventData.contactPhone || eventData.contactPhone || '');
        setStatus(eventData.status || 'DRAFT');
        setFormTshirtSize(!!eventData.form_tshirt_size);
        setFormReference(!!eventData.form_reference);
        setFormTransactionId(!!eventData.form_transaction_id);

        // Date parse
        const rawDate = eventData.date || '';
        const parsedDate = new Date(rawDate);
        if (!isNaN(parsedDate.getTime())) {
          setDate(parsedDate.toISOString().split('T')[0]);
        } else {
          setDate(rawDate);
        }

        // Time parse
        const rawTime = eventData.time || '';
        const timeParts = rawTime.split(/\s*-\s*/);
        if (timeParts.length === 2) {
          setStartTime(parseTo24h(timeParts[0].trim()));
          setEndTime(parseTo24h(timeParts[1].trim()));
        } else if (timeParts.length === 1) {
          setStartTime(parseTo24h(timeParts[0].trim()));
        }

        // Registration deadline parse (from raw details if available)
        const rawDetailsRes = await fetch(`/api/v1/events/${slug}`);
        if (rawDetailsRes.ok) {
          const rawDetails = await rawDetailsRes.json();
          if (rawDetails.registration_deadline) {
            const rd = new Date(rawDetails.registration_deadline);
            if (!isNaN(rd.getTime())) {
              setRegistrationDeadlineDate(rd.toISOString().split('T')[0]);
              setRegistrationDeadlineTime(rd.toISOString().split('T')[1].substring(0, 5));
            }
          }
        }

        // Load Sub-Lists
        const tList = await fetchTicketTypes(slug);
        setTickets(tList);
        setEditableTickets(tList.map(t => ({ ...t, isNew: false })));

        if (tList.length > 0) {
          setRegTicketTypeId(tList[0].id.toString());
        }

        // Load Scan Stats
        try {
          const stats = await fetchScanStats(slug);
          setScanStats(stats);
          const logs = await fetchScanLogs(slug);
          setScanLogs(Array.isArray(logs) ? logs : (logs?.logs || logs?.data || []));
        } catch {
          setScanStats({ totalCheckedIn: 0, totalRegistered: 0, scanRate: 0 });
        }

        // Fetch Registrations
        loadRegistrations();

        // Fetch Team
        loadTeam();

        // Fetch Activities
        loadActivities();

        // Fetch Certificates
        loadCertificates();

        // If user is registered, fetch registration ticket details
        if (eventData.is_registered) {
          const myRegs = await fetchMyRegistrations();
          const thisEventReg = myRegs.find((r: any) => r.event_id === eventData.id || r.event_slug === slug);
          setMyTicket(thisEventReg || null);
        }
      }
    } catch (err) {
      console.error('Failed to load control center data:', err);
      message.error('Failed to load event data');
    } finally {
      setLoading(false);
    }
  };

  const parseTo24h = (t: string): string => {
    const match = t.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return t;
    let h = parseInt(match[1]);
    const m = match[2];
    const period = match[3].toUpperCase();
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return `${h.toString().padStart(2, '0')}:${m}`;
  };

  const formatTimeDisplay = (timeStr: string) => {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    if (parts.length < 2) return timeStr;
    const h = parseInt(parts[0]);
    const m = parseInt(parts[1]);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // ----------------------------------------------------
  // Actions
  // ----------------------------------------------------
  const updateStatus = async (newStatus: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/events/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setEvent(prev => prev ? { ...prev, status: newStatus } : null);
        setStatus(newStatus);
        message.success(`Event status is now ${newStatus}`);
      } else {
        const data = await res.json();
        message.error(data.error || 'Failed to update status');
      }
    } catch (err) {
      message.error('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // Tab 2: Registrations Methods
  // ----------------------------------------------------
  const loadRegistrations = async () => {
    setLoadingRegistrations(true);
    try {
      const res = await fetch(`/api/v1/events/${slug}/registrations`);
      if (res.ok) {
        const data = await res.json();
        setRegistrations(Array.isArray(data) ? data : (data.data || []));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRegistrations(false);
    }
  };

  const handleCancelRegistration = async (regId: number) => {
    modal.confirm({
      title: 'Cancel Registration?',
      content: 'Are you sure you want to cancel this participant\'s registration? A cancellation email will be enqueued.',
      okText: 'Yes, Cancel',
      okType: 'danger',
      onOk: async () => {
        try {
          const res = await fetch(`/api/v1/tickets/${regId}/cancel`, {
            method: 'POST'
          });
          if (res.ok) {
            message.success('Registration cancelled successfully');
            loadRegistrations();
            // Reload scan stats
            const stats = await fetchScanStats(slug).catch(() => null);
            if (stats) setScanStats(stats);
          } else {
            const err = await res.json();
            message.error(err.error || 'Failed to cancel registration');
          }
        } catch {
          message.error('An error occurred during cancellation');
        }
      }
    });
  };

  const handleManualRegister = async () => {
    if (!regEmail || !regUserId) {
      message.error('Email and Username are required');
      return;
    }
    setSubmittingRegistration(true);
    try {
      const res = await fetch(`/api/v1/events/${slug}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: regEmail,
          userId: regUserId,
          fullName: regFullName,
          phone: regPhone,
          organization: regOrganization,
          jobTitle: regJobTitle,
          tshirtSize: formTshirtSize ? regTshirtSize : undefined,
          reference: formReference ? regReference : undefined,
          transactionId: formTransactionId ? regTransactionId : undefined,
          ticketTypeId: regTicketTypeId ? parseInt(regTicketTypeId) : null
        })
      });
      if (res.ok) {
        message.success('Participant registered successfully');
        setIsRegisterModalOpen(false);
        // Reset form
        setRegEmail('');
        setRegUserId('');
        setRegFullName('');
        setRegPhone('');
        setRegOrganization('');
        setRegJobTitle('');
        setRegReference('');
        setRegTransactionId('');
        loadRegistrations();
        
        // Reload stats
        const stats = await fetchScanStats(slug).catch(() => null);
        if (stats) setScanStats(stats);
        const tList = await fetchTicketTypes(slug).catch(() => []);
        if (tList.length > 0) setTickets(tList);
      } else {
        const err = await res.json();
        message.error(err.error || 'Failed to register participant manually');
      }
    } catch {
      message.error('An error occurred during manual registration');
    } finally {
      setSubmittingRegistration(false);
    }
  };

  // ----------------------------------------------------
  // Tab 3: Edit Basic Info Methods
  // ----------------------------------------------------
  const handleSaveDetails = async () => {
    if (!title || !date || !startTime || !endTime || !location || !capacity) {
      message.error('Please fill in all required fields');
      return;
    }

    setSavingDetails(true);
    try {
      const timeDisplay = startTime && endTime
        ? `${formatTimeDisplay(startTime)} - ${formatTimeDisplay(endTime)}`
        : startTime
        ? formatTimeDisplay(startTime)
        : '';

      const payload: any = {
        title,
        description,
        thumbnail,
        date: formatDateDisplay(date),
        time: timeDisplay,
        startDate: new Date(`${date}T${startTime}:00`).toISOString(),
        endDate: new Date(`${date}T${endTime}:00`).toISOString(),
        location,
        capacity: parseInt(capacity),
        contactEmail,
        contactPhone,
        status,
        formPhone: true,
        formJobTitle: true,
        formOrganization: true,
        formTshirtSize,
        formReference,
        formTransactionId
      };

      if (registrationDeadlineDate && registrationDeadlineTime) {
        payload.registrationDeadline = new Date(`${registrationDeadlineDate}T${registrationDeadlineTime}:00`).toISOString();
      }

      const eventRes = await fetch(`/api/v1/events/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (eventRes.ok) {
        message.success('Event details saved successfully');
        loadAllEventData();
      } else {
        const err = await eventRes.json();
        throw new Error(err.error || 'Failed to update details');
      }
    } catch (err: any) {
      message.error(err.message || 'An error occurred while updating details');
    } finally {
      setSavingDetails(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const img = new Image();
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          const maxW = 800;
          const maxH = 450;
          let width = img.width;
          let height = img.height;

          if (width > maxW) {
            height = Math.round((height * maxW) / width);
            width = maxW;
          }
          if (height > maxH) {
            width = Math.round((width * maxH) / height);
            height = maxH;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
            
            try {
              const res = await fetch('/api/v1/events/upload-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageBase64: dataUrl, eventId: slug })
              });
              const data = await res.json();
              if (res.ok && data.url) {
                setThumbnail(data.url);
                message.success('Banner uploaded successfully!');
              } else {
                throw new Error(data.error || 'Upload failed');
              }
            } catch (err: any) {
              message.error(err.message || 'Image upload failed');
            }
          }
          setIsUploading(false);
        };
        img.src = event.target.result as string;
      } else {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // ----------------------------------------------------
  // Tab 4: Tickets CRUD Methods
  // ----------------------------------------------------
  const handleTicketChange = (index: number, field: string, value: any) => {
    const updated = [...editableTickets];
    updated[index] = { ...updated[index], [field]: value };
    setEditableTickets(updated);
  };

  const addTicketCategory = () => {
    setEditableTickets([...editableTickets, { name: '', description: '', price: '0', capacity: 100, isNew: true }]);
  };

  const removeTicketCategory = async (index: number) => {
    const ticket = editableTickets[index];
    if (ticket.id) {
      try {
        const res = await fetch(`/api/v1/events/${slug}/ticket-types/${ticket.id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete ticket');
        message.success('Ticket category removed');
      } catch (err: any) {
        message.error('Failed to remove ticket. It might be in use.');
        return;
      }
    }
    setEditableTickets(editableTickets.filter((_, i) => i !== index));
  };

  const handleSaveTickets = async () => {
    try {
      for (const ticket of editableTickets) {
        if (!ticket.name || ticket.price === undefined) {
          message.error('Ticket name and price are required');
          return;
        }
        if (ticket.isNew) {
          await fetch(`/api/v1/events/${slug}/ticket-types`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: ticket.name,
              description: ticket.description,
              price: parseFloat(ticket.price.toString()),
              capacity: parseInt(ticket.capacity.toString()),
              currency: 'BDT',
              isActive: true,
            })
          });
        } else if (ticket.id) {
          await fetch(`/api/v1/events/${slug}/ticket-types/${ticket.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: ticket.name,
              description: ticket.description,
              price: parseFloat(ticket.price.toString()),
              capacity: parseInt(ticket.capacity.toString()),
            })
          });
        }
      }
      message.success('Ticket tiers updated successfully!');
      const tList = await fetchTicketTypes(slug);
      setTickets(tList);
      setEditableTickets(tList.map(t => ({ ...t, isNew: false })));
    } catch {
      message.error('An error occurred while saving tickets');
    }
  };

  // ----------------------------------------------------
  // Tab 5: Team Access Methods
  // ----------------------------------------------------
  const loadTeam = async () => {
    setLoadingTeam(true);
    try {
      const res = await fetchEventTeam(slug);
      setTeam(res);
    } catch {
      console.warn('Failed to load team');
    } finally {
      setLoadingTeam(false);
    }
  };

  const handleInviteTeam = async () => {
    if (!inviteUsername) {
      message.error('Please enter a username');
      return;
    }
    setInvitingTeam(true);
    try {
      await inviteTeamMember(slug, inviteUsername, inviteRole);
      message.success('Team member invited successfully');
      setIsTeamModalOpen(false);
      setInviteUsername('');
      loadTeam();
    } catch (err: any) {
      message.error(err.message || 'Failed to invite team member');
    } finally {
      setInvitingTeam(false);
    }
  };

  const handleRemoveTeam = async (username: string) => {
    modal.confirm({
      title: 'Remove Team Member?',
      content: `Are you sure you want to remove ${username} from the event team?`,
      okText: 'Remove',
      okType: 'danger',
      onOk: async () => {
        try {
          await removeTeamMember(slug, username);
          message.success('Team member removed');
          loadTeam();
        } catch {
          message.error('Failed to remove team member');
        }
      }
    });
  };

  // ----------------------------------------------------
  // Tab 6: Activities & Scanning Methods
  // ----------------------------------------------------
  const loadActivities = async () => {
    setLoadingActivities(true);
    try {
      const res = await fetchEventActivities(slug);
      setActivities(res);
    } catch {
      console.warn('Failed to load activities');
    } finally {
      setLoadingActivities(false);
    }
  };

  const handleCreateActivity = async () => {
    if (!activityName) {
      message.error('Activity Name is required');
      return;
    }
    setSubmittingActivity(true);
    try {
      const scanLimitVal = activityScanLimit ? parseInt(activityScanLimit) : null;
      await createEventActivity(slug, activityName, scanLimitVal);
      message.success('Activity created successfully');
      setIsActivityModalOpen(false);
      setActivityName('');
      setActivityScanLimit('1');
      loadActivities();
    } catch (err: any) {
      message.error(err.message || 'Failed to create activity');
    } finally {
      setSubmittingActivity(false);
    }
  };

  const handleDeactivateActivity = async (actId: number) => {
    modal.confirm({
      title: 'Deactivate Activity?',
      content: 'Deactivating this activity prevents scanners from registering scans. This action cannot be undone.',
      okText: 'Deactivate',
      okType: 'danger',
      onOk: async () => {
        try {
          await deactivateEventActivity(slug, actId);
          message.success('Activity deactivated');
          loadActivities();
        } catch {
          message.error('Failed to deactivate activity');
        }
      }
    });
  };


  // ----------------------------------------------------
  // Tab 7: Certificates State
  // ----------------------------------------------------
  const [certTemplateUrl, setCertTemplateUrl] = useState('');
  const [certSendingTime, setCertSendingTime] = useState('');
  const [loadingCertTemplate, setLoadingCertTemplate] = useState(false);
  const [savingCertTemplate, setSavingCertTemplate] = useState(false);
  const [issuedCerts, setIssuedCerts] = useState<any[]>([]);
  const [loadingIssuedCerts, setLoadingIssuedCerts] = useState(false);

  const loadCertificates = async () => {
    setLoadingCertTemplate(true);
    setLoadingIssuedCerts(true);
    try {
      const template = await fetchCertificateTemplate(slug);
      if (template) {
        setCertTemplateUrl(template.template_url || '');
        if (template.sending_time) {
          const date = new Date(template.sending_time);
          setCertSendingTime(date.toISOString().slice(0, 16));
        }
      }
      const certs = await fetchEventCertificates(slug);
      setIssuedCerts(certs || []);
    } catch (err) {
      console.warn('Failed to load certificates');
    } finally {
      setLoadingCertTemplate(false);
      setLoadingIssuedCerts(false);
    }
  };

  const handleSaveCertTemplate = async () => {
    setSavingCertTemplate(true);
    try {
      const payload: any = { template_url: certTemplateUrl };
      if (certSendingTime) {
        payload.sending_time = new Date(certSendingTime).toISOString();
      }
      await upsertCertificateTemplate(slug, payload);
      message.success('Certificate template saved');
    } catch (err: any) {
      message.error(err.message || 'Failed to save certificate template');
    } finally {
      setSavingCertTemplate(false);
    }
  };

  // ----------------------------------------------------
  // Rendering Helpers
  // ----------------------------------------------------
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <span className="text-body-sm text-on-surface-variant">Loading Control Center...</span>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-20">
        <ShieldAlert className="w-12 h-12 text-error mx-auto mb-4" />
        <h3 className="text-headline-md font-bold text-foreground">Event Not Found</h3>
        <Button variant="outline" onClick={() => router.push('/dashboard/events')} className="mt-4">
          Back to Directory
        </Button>
      </div>
    );
  }

  const totalSold = tickets.reduce((acc, t) => acc + (t.sold_count || 0), 0);
  const totalRevenue = tickets.reduce((acc, t) => acc + ((t.sold_count || 0) * parseFloat(t.price)), 0);

  // Filtered registrations
  const filteredRegistrations = registrations.filter((reg) => {
    const query = registrationSearchQuery.toLowerCase();
    const matchesSearch = 
      reg.email.toLowerCase().includes(query) ||
      (reg.user_id && reg.user_id.toLowerCase().includes(query)) ||
      (reg.full_name && reg.full_name.toLowerCase().includes(query)) ||
      (reg.phone && reg.phone.toLowerCase().includes(query)) ||
      (reg.organization && reg.organization.toLowerCase().includes(query)) ||
      (reg.transaction_id && reg.transaction_id.toLowerCase().includes(query)) ||
      (reg.job_title && reg.job_title.toLowerCase().includes(query)) ||
      (reg.jobTitle && reg.jobTitle.toLowerCase().includes(query));
    
    const matchesStatus = registrationStatusFilter === 'All' || reg.status === registrationStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header section */}
      <PageHeader
        title={
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/dashboard/events')}
                icon={<ArrowLeft className="w-4 h-4" />}
                className="mr-2"
              >
                Back
              </Button>
              {event.title}
            </span>
            {event.status === 'DRAFT' && <Tag color="default">DRAFT</Tag>}
            {event.status === 'PUBLISHED' && <Tag color="blue">PUBLISHED (REGISTRATION OPEN)</Tag>}
            {event.status === 'REGISTRATION_CLOSED' && <Tag color="orange">REGISTRATION CLOSED</Tag>}
            {event.status === 'LIVE' && <Tag color="green" icon={<Activity size={12} className="mr-1 inline" />}>LIVE</Tag>}
            {event.status === 'ENDED' && <Tag color="purple">ENDED</Tag>}
            {event.status === 'ARCHIVED' && <Tag color="default">ARCHIVED</Tag>}
          </div>
        }
        description={
          <div className="flex flex-wrap items-center gap-4 text-xs text-on-surface-variant font-medium">
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{event.date}</span>
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{event.locationShort || event.location}</span>
          </div>
        }
        action={
          (user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' || event?.hostUsername === user?.username || event?.is_team_member) ? (
            <div className="flex items-center gap-2">
              {(!event.status || event.status === 'DRAFT') && (
                <Button variant="primary" size="sm" icon={<Power className="w-4 h-4" />} onClick={() => updateStatus('PUBLISHED')}>
                  Publish Event
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                icon={<Scan className="w-4 h-4" />}
                onClick={() => router.push(`/dashboard/events/${slug}/scanner`)}
                className="flex"
                disabled={event.status !== 'LIVE' && event.status !== 'PUBLISHED'}
              >
                Launch Scanner
              </Button>
            </div>
          ) : undefined
        }
      />

      {/* TABS LAYOUT */}
      <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-4 sm:p-6 shadow-xs w-full">
        <Tabs activeKey={activeTab} onChange={handleTabChange} items={[
          // ==========================================
          // Tab 1: Control Center / Stats
          // ==========================================
          {
            key: '1',
            label: 'Stats & Control',
            children: (
              <div className="space-y-6 pt-4">
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard
                    title="Total Registrations"
                    value={totalSold || '0'}
                    icon={<Users size={20} />}
                    color="var(--primary)"
                    bg="rgba(53, 37, 205, 0.05)"
                  />
                  <StatCard
                    title="Total Revenue"
                    value={`৳ ${totalRevenue}`}
                    icon={<DollarSign size={20} />}
                    color="var(--tertiary)"
                    bg="rgba(104, 64, 0, 0.05)"
                  />
                  <StatCard
                    title="Check-in Rate"
                    value={scanStats ? `${scanStats.scanRate || 0}%` : '0%'}
                    icon={<CheckCircle size={20} />}
                    progress={scanStats?.scanRate || 0}
                    color="var(--secondary)"
                    bg="rgba(0, 108, 73, 0.05)"
                  />
                  <StatCard
                    title="Active Check-ins"
                    value={scanStats ? scanStats.totalCheckedIn || 0 : 0}
                    icon={<Activity size={20} />}
                    color="var(--error)"
                    bg="rgba(186, 26, 26, 0.05)"
                  />
                </section>

                <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bento-card p-6 bg-surface-container-low/20 rounded-xl border border-outline-variant">
                    <h4 className="font-heading text-base font-bold text-foreground m-0 border-b border-outline-variant/60 pb-3">
                      Ticket Sales Breakdown
                    </h4>
                    <div className="mt-4 space-y-4">
                      {tickets.map((t) => {
                        const sold = t.sold_count || 0;
                        const capacityLimit = t.capacity || event.capacity || 100;
                        const percentage = Math.round((sold / capacityLimit) * 100);
                        
                        return (
                          <div key={t.id} className="space-y-1.5">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-extrabold text-foreground">{t.name}</span>
                              <span className="text-on-surface-variant font-bold">{sold} / {capacityLimit} sold ({percentage}%)</span>
                            </div>
                            <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                              <div className="bg-[#7b55fa] h-full transition-all duration-300" style={{ width: `${percentage}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bento-card p-6 bg-surface-container-low/20 rounded-xl border border-outline-variant">
                    <h4 className="font-heading text-base font-bold text-foreground m-0 border-b border-outline-variant/60 pb-3">
                      Recent Check-ins
                    </h4>
                    <div className="mt-4 space-y-3">
                      {scanLogs.length > 0 ? (
                        scanLogs.slice(0, 5).map((log, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/30">
                            <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-1.5 flex-shrink-0" />
                            <div className="flex-grow min-w-0">
                              <p className="text-xs font-bold text-foreground m-0 truncate">{log.email}</p>
                              <p className="text-[10px] text-on-surface-variant m-0 mt-0.5 uppercase tracking-wider font-bold">Activity: {log.activity_name || 'Main Event'}</p>
                            </div>
                            <span className="text-[9px] font-bold text-on-surface-variant/60 shrink-0">
                              {new Date(log.scanned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-10 text-body-sm text-on-surface-variant italic">
                          No check-ins recorded yet.
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              </div>
            )
          },
          // ==========================================
          // Tab 2: Participant List / Registry
          // ==========================================
          {
            key: '2',
            label: 'Participant List',
            children: (
              <div className="space-y-6 pt-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex flex-1 gap-3 max-w-xl">
                    <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant rounded-lg px-3 py-1.5 flex-1">
                      <Search className="w-4 h-4 text-on-surface-variant" />
                      <input
                        type="text"
                        placeholder="Search by email, name, organization, txid..."
                        value={registrationSearchQuery}
                        onChange={(e) => setRegistrationSearchQuery(e.target.value)}
                        className="bg-transparent border-none outline-none text-xs w-full placeholder:text-on-surface-variant"
                      />
                    </div>
                    <Select
                      value={registrationStatusFilter}
                      onChange={setRegistrationStatusFilter}
                      className="w-36"
                      size="large"
                      options={[
                        { value: 'All', label: 'All Statuses' },
                        { value: 'CONFIRMED', label: 'Confirmed' },
                        { value: 'CANCELLED', label: 'Cancelled' }
                      ]}
                    />
                  </div>

                  <Button variant="primary" icon={<UserPlus size={16} />} onClick={() => setIsRegisterModalOpen(true)}>
                    Register Participant
                  </Button>
                </div>

                {loadingRegistrations ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs text-on-surface-variant">Loading registrations...</span>
                  </div>
                ) : (
                  <>
                    <DataTable
                      columns={[
                        { key: 'full_name', title: 'Name', render: (row: any) => row.full_name || row.user_id },
                        { key: 'user_id', title: 'Username' },
                        { key: 'email', title: 'Email Address' },
                        { key: 'phone', title: 'Phone Number', render: (row: any) => row.phone || '-' },
                        { key: 'organization', title: 'Organization', render: (row: any) => row.organization || '-' },
                        { key: 'tshirt_size', title: 'T-Shirt', render: (row: any) => row.tshirt_size || '-' },
                        { key: 'transaction_id', title: 'TxID', render: (row: any) => row.transaction_id || '-' },
                        { key: 'ticket_name', title: 'Ticket Tier' },
                        {
                          key: 'status',
                          title: 'Status',
                          render: (row: any) => <StatusChip status={row.status} label={row.status} />
                        },
                        {
                          key: 'actions',
                          title: 'Action',
                          render: (row: any) => (
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-error border-error hover:bg-error/5"
                                onClick={() => handleCancelRegistration(row.id)}
                                disabled={row.status === 'CANCELLED'}
                                icon={<Trash2 size={13} />}
                              >
                                Cancel
                              </Button>
                            </div>
                          )
                        }
                      ]}
                      data={filteredRegistrations.slice((regCurrentPage - 1) * regPageSize, regCurrentPage * regPageSize)}
                      emptyText="No registrations found for this event."
                    />
                    {filteredRegistrations.length > 0 && (
                      <div className="flex justify-end pt-2">
                        <Pagination
                          current={regCurrentPage}
                          pageSize={regPageSize}
                          total={filteredRegistrations.length}
                          onChange={(page, size) => {
                            setRegCurrentPage(page);
                            setRegPageSize(size);
                          }}
                          showSizeChanger
                          showTotal={(total) => `Showing ${Math.min(total, (regCurrentPage - 1) * regPageSize + 1)}-${Math.min(total, regCurrentPage * regPageSize)} of ${total} entries`}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          },
          // ==========================================
          // Tab 3: Edit Event Details
          // ==========================================
          {
            key: '3',
            label: 'Edit Details',
            children: (
              <div className="space-y-6 pt-4 w-full">
                <div className="space-y-4">
                  <FormField label="Event Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField label="Event Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                    <FormField label="Start Time" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
                    <FormField label="End Time" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Registration Deadline Date" type="date" value={registrationDeadlineDate} onChange={(e) => setRegistrationDeadlineDate(e.target.value)} />
                    <FormField label="Registration Deadline Time" type="time" value={registrationDeadlineTime} onChange={(e) => setRegistrationDeadlineTime(e.target.value)} />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Venue / Location" value={location} onChange={(e) => setLocation(e.target.value)} required />
                    <FormField label="Global Capacity" type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} required />
                  </div>

                  <FormField label="Event Description" textarea value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>

                <div className="border-t border-outline-variant/60 pt-6 space-y-4">
                  <h4 className="font-bold text-sm text-foreground m-0 uppercase tracking-wider">Branding & Support</h4>
                  
                  <div className="space-y-2">
                    <label className="text-label-bold text-on-surface-variant font-bold uppercase tracking-wider block">
                      Event Banner Image
                    </label>
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border border-outline-variant border-dashed rounded-xl cursor-pointer bg-surface-container-low hover:bg-surface-container-high/60 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-4 pb-4">
                          <ImageIcon className="w-6 h-6 text-on-surface-variant/60 mb-2" />
                          <p className="text-xs text-foreground font-bold mb-1">
                            {isUploading ? 'Uploading...' : 'Click to upload banner to Cloudflare R2'}
                          </p>
                          <p className="text-[10px] text-on-surface-variant">
                            PNG, JPEG or WebP up to 5MB
                          </p>
                        </div>
                        <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                      </label>
                    </div>
                  </div>

                  <FormField label="Or paste Event Banner URL" value={thumbnail} onChange={(e) => setThumbnail(e.target.value)} />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Support Email" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
                    <FormField label="Support Phone" type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
                  </div>
                </div>

                <div className="border-t border-outline-variant/60 pt-6 space-y-4">
                  <h4 className="font-bold text-sm text-foreground m-0 uppercase tracking-wider">Registration Form Fields</h4>
                  <p className="text-xs text-on-surface-variant">Configure additional participant fields to collect in registration forms:</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-surface-container-low p-4 rounded-xl border border-outline-variant">
                    <div className="flex items-center justify-between p-2 hover:bg-surface-container-lowest/80 rounded-lg transition-colors">
                      <div>
                        <span className="text-xs font-bold text-foreground block">T-Shirt Size</span>
                        <span className="text-[10px] text-on-surface-variant">Collect sizes (XS to XXL)</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={formTshirtSize} 
                        onChange={(e) => setFormTshirtSize(e.target.checked)} 
                        className="w-4 h-4 text-primary rounded cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 hover:bg-surface-container-lowest/80 rounded-lg transition-colors">
                      <div>
                        <span className="text-xs font-bold text-foreground block">Reference</span>
                        <span className="text-[10px] text-on-surface-variant">"How did you hear?"</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={formReference} 
                        onChange={(e) => setFormReference(e.target.checked)} 
                        className="w-4 h-4 text-primary rounded cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 hover:bg-surface-container-lowest/80 rounded-lg transition-colors">
                      <div>
                        <span className="text-xs font-bold text-foreground block">Transaction ID</span>
                        <span className="text-[10px] text-on-surface-variant">For bank/bKash references</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={formTransactionId} 
                        onChange={(e) => setFormTransactionId(e.target.checked)} 
                        className="w-4 h-4 text-primary rounded cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-outline-variant/60 pt-6">
                  <Button variant="primary" loading={savingDetails} onClick={handleSaveDetails} icon={<Save className="w-4 h-4" />}>
                    Save Event Details
                  </Button>
                </div>
              </div>
            )
          },
          // ==========================================
          // Tab 4: Ticket Tiers
          // ==========================================
          {
            key: '4',
            label: 'Ticket Tiers',
            children: (
              <div className="space-y-6 pt-4 w-full">
                <div className="flex justify-between items-center border-b border-outline-variant/40 pb-3">
                  <div>
                    <h4 className="font-bold text-base text-foreground m-0">Configure Pricing & Capacity</h4>
                    <p className="text-xs text-on-surface-variant m-0 mt-0.5">Manage ticket tiers. Enter price 0 for free admission.</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={addTicketCategory} icon={<Plus size={16} />}>
                    Add Ticket Category
                  </Button>
                </div>

                <div className="space-y-4">
                  {editableTickets.map((ticket, index) => (
                    <div key={index} className="p-5 border border-outline-variant/60 rounded-xl bg-surface-container-low/30 relative">
                      <div className="absolute top-4 right-4 flex gap-2">
                        {ticket.isNew && <Tag color="blue">New Category</Tag>}
                        <button type="button" onClick={() => removeTicketCategory(index)} className="p-1 text-error hover:bg-error/10 rounded border-none bg-transparent cursor-pointer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 mt-2">
                        <FormField label="Ticket Category Name" value={ticket.name || ''} onChange={(e) => handleTicketChange(index, 'name', e.target.value)} required />
                        <FormField label="Price (BDT)" type="number" value={ticket.price === undefined ? '' : ticket.price} onChange={(e) => handleTicketChange(index, 'price', e.target.value)} required />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField label="Category Capacity" type="number" value={ticket.capacity === undefined ? '' : ticket.capacity} onChange={(e) => handleTicketChange(index, 'capacity', e.target.value)} required />
                        <FormField label="Description" value={ticket.description || ''} onChange={(e) => handleTicketChange(index, 'description', e.target.value)} />
                      </div>
                    </div>
                  ))}
                  {editableTickets.length === 0 && (
                    <div className="text-center py-10 text-on-surface-variant italic">No ticket categories added. Click Add Ticket Category to start.</div>
                  )}
                </div>

                {editableTickets.length > 0 && (
                  <div className="border-t border-outline-variant/60 pt-4">
                    <Button variant="primary" onClick={handleSaveTickets} icon={<Save className="w-4 h-4" />}>
                      Save Ticket Categories
                    </Button>
                  </div>
                )}
              </div>
            )
          },
          // ==========================================
          // Tab 5: Team Management
          // ==========================================
          {
            key: '5',
            label: 'Team Management',
            children: (
              <div className="space-y-6 pt-4 w-full">
                <div className="flex justify-between items-center border-b border-outline-variant/40 pb-3">
                  <div>
                    <h4 className="font-bold text-base text-foreground m-0">Event Team Access Control</h4>
                    <p className="text-xs text-on-surface-variant m-0 mt-0.5">Control which platform accounts can access scanner codes or edit details.</p>
                  </div>
                  <Button variant="primary" size="sm" onClick={() => setIsTeamModalOpen(true)} icon={<UserPlus size={16} />}>
                    Invite Member
                  </Button>
                </div>

                <div className="mb-4 flex items-start gap-3 p-4 bg-[#7b55fa]/5 rounded-xl border border-[#7b55fa]/10">
                  <Shield className="text-[#7b55fa] shrink-0 mt-0.5 w-5 h-5" />
                  <div>
                    <h4 className="font-bold text-xs text-foreground m-0">Access Levels Defined</h4>
                    <p className="text-[11px] text-on-surface-variant m-0 mt-1">
                      <strong>Organizer:</strong> Full access to update status, modify dates, adjust tickets, view registrations, and manage team list. <br/>
                      <strong>Scanner:</strong> Limited strictly to scan check-ins on mobile devices and view scan history.
                    </p>
                  </div>
                </div>

                {loadingTeam ? (
                  <div className="flex justify-center py-10">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <Table
                    dataSource={team}
                    columns={[
                      { title: 'Username', dataIndex: 'username', key: 'username', render: (text: string) => <span className="font-bold">{text}</span> },
                      { title: 'Full Name', dataIndex: 'name', key: 'name' },
                      { title: 'Email', dataIndex: 'email', key: 'email' },
                      { 
                        title: 'Role', 
                        dataIndex: 'role', 
                        key: 'role',
                        render: (role: string) => {
                          const color = role === 'ORGANIZER' ? 'blue' : 'cyan';
                          return <Tag color={color}>{role}</Tag>;
                        }
                      },
                      {
                        title: 'Action',
                        key: 'action',
                        render: (_: any, record: any) => (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-error border-error hover:bg-error/5"
                            onClick={() => handleRemoveTeam(record.username)}
                            icon={<Trash2 size={13} />}
                          >
                            Remove
                          </Button>
                        )
                      }
                    ]}
                    rowKey="username"
                    pagination={false}
                  />
                )}
              </div>
            )
          },
          // ==========================================
          // Tab 6: Activities & Scanning
          // ==========================================
          {
            key: '6',
            label: 'Activities & Scanning',
            children: (
              <div className="space-y-6 pt-4 w-full">
                <div className="flex justify-between items-center border-b border-outline-variant/40 pb-3">
                  <div>
                    <h4 className="font-bold text-base text-foreground m-0">Scanning Activities</h4>
                    <p className="text-xs text-on-surface-variant m-0 mt-0.5">Setup separate checkpoints (e.g. check-in, food, gift, certificate) and inspect stats.</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setIsActivityModalOpen(true)} icon={<Plus size={16} />}>
                    Create Custom Activity
                  </Button>
                </div>

                {loadingActivities ? (
                  <div className="flex justify-center py-10">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {activities.map((act) => (
                      <div key={act.id} className="p-4 border border-outline-variant rounded-xl bg-surface-container-low/20 flex justify-between items-center">
                        <div>
                          <h4 className="font-bold text-sm text-foreground m-0">{act.name}</h4>
                          <p className="text-[10px] text-on-surface-variant m-0 mt-0.5 font-bold uppercase tracking-wider">Scan Limit: {act.scan_limit || 'Unlimited'}</p>
                        </div>
                        <div className="flex gap-2">
                          {!act.is_active ? (
                            <Tag color="default">DEACTIVATED</Tag>
                          ) : (
                            <Button variant="outline" size="sm" className="text-error border-error hover:bg-error/5" onClick={() => handleDeactivateActivity(act.id)} icon={<Trash2 size={13} />}>
                              Deactivate
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t border-outline-variant/60 pt-6 space-y-4">
                  <h4 className="font-bold text-base text-foreground m-0">Comprehensive Scan History Logs</h4>
                  
                  <DataTable
                    columns={[
                      { key: 'email', title: 'Attendee Email' },
                      { key: 'activity_name', title: 'Checkpoint Activity', render: (row: any) => row.activity_name || 'Main Check-in' },
                      { key: 'scanned_by', title: 'Scanned By' },
                      {
                        key: 'scanned_at',
                        title: 'Scanned At',
                        render: (row: any) => new Date(row.scanned_at).toLocaleString()
                      }
                    ]}
                    data={scanLogs.slice((scanCurrentPage - 1) * scanPageSize, scanCurrentPage * scanPageSize)}
                    emptyText="No scans recorded yet."
                  />
                  {scanLogs.length > 0 && (
                    <div className="flex justify-end pt-2">
                      <Pagination
                        current={scanCurrentPage}
                        pageSize={scanPageSize}
                        total={scanLogs.length}
                        onChange={(page, size) => {
                          setScanCurrentPage(page);
                          setScanPageSize(size);
                        }}
                        showSizeChanger
                        showTotal={(total) => `Showing ${Math.min(total, (scanCurrentPage - 1) * scanPageSize + 1)}-${Math.min(total, scanCurrentPage * scanPageSize)} of ${total} entries`}
                      />
                    </div>
                  )}
                </div>
              </div>
            )
          },
          // ==========================================
          // Tab 7: Certificates
          // ==========================================
          {
            key: '7',
            label: 'Certificates',
            children: (
              <div className="space-y-6 pt-4 w-full">
                <div className="flex justify-between items-center border-b border-outline-variant/40 pb-3">
                  <div>
                    <h4 className="font-bold text-base text-foreground m-0">Event Certificates</h4>
                    <p className="text-xs text-on-surface-variant m-0 mt-0.5">Configure automated certificate issuing for participants.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4 p-5 border border-outline-variant/60 rounded-xl bg-surface-container-low/30">
                    <FormField label="Certificate Template URL" value={certTemplateUrl} onChange={(e) => setCertTemplateUrl(e.target.value)} placeholder="https://example.com/template.png" required />
                    <FormField label="Automated Issuing Time" type="datetime-local" value={certSendingTime} onChange={(e) => setCertSendingTime(e.target.value)} />
                    <Button variant="primary" loading={savingCertTemplate} onClick={handleSaveCertTemplate} icon={<Save className="w-4 h-4" />}>
                      Save Template Config
                    </Button>
                  </div>
                  <div className="border border-outline-variant/60 rounded-xl p-5">
                    <h4 className="font-bold text-sm text-foreground m-0 mb-3 border-b border-outline-variant/40 pb-2">Issued Certificates History</h4>
                    {loadingIssuedCerts ? (
                      <div className="text-center text-xs py-4">Loading...</div>
                    ) : (
                      <>
                        <DataTable
                          columns={[
                            { key: 'participant_name', title: 'Participant', render: (row: any) => row.participant_name || row.issued_to },
                            { key: 'certificate_type', title: 'Type' },
                            { key: 'issued_at', title: 'Issued On', render: (row: any) => new Date(row.issued_at).toLocaleDateString() },
                          ]}
                          data={issuedCerts.slice((certCurrentPage - 1) * certPageSize, certCurrentPage * certPageSize)}
                          emptyText="No certificates issued yet."
                        />
                        {issuedCerts.length > 0 && (
                          <div className="flex justify-end pt-2">
                            <Pagination
                              current={certCurrentPage}
                              pageSize={certPageSize}
                              total={issuedCerts.length}
                              onChange={(page, size) => {
                                setCertCurrentPage(page);
                                setCertPageSize(size);
                              }}
                              showSizeChanger
                              showTotal={(total) => `Showing ${Math.min(total, (certCurrentPage - 1) * certPageSize + 1)}-${Math.min(total, certCurrentPage * certPageSize)} of ${total} entries`}
                            />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          },
          // ==========================================
          // Tab 8: My Ticket (Participant)
          // ==========================================
          {
            key: '8',
            label: 'My Ticket',
            children: (
              <div className="pt-4 w-full">
                {myTicket ? (
                  <div className="bento-card p-6 flex flex-col items-center text-center space-y-4">
                    <h4 className="font-bold text-xl text-foreground m-0">{myTicket.ticket_name}</h4>
                    <Tag color={myTicket.status === 'CHECKED_IN' ? 'success' : 'blue'} className="font-bold uppercase mb-2">
                      {myTicket.status}
                    </Tag>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-outline-variant/40 inline-block">
                      {myTicket.qr_token ? (
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(myTicket.qr_token)}`} 
                          alt="Ticket QR Code" 
                          width={200} 
                          height={200} 
                        />
                      ) : (
                        <div className="w-[200px] h-[200px] flex items-center justify-center bg-surface-container-low text-on-surface-variant text-sm">
                          QR Not Available
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-on-surface-variant">Present this QR code at the event entrance for scanning.</p>
                  </div>
                ) : (
                  <div className="py-10 text-center">
                    <p className="text-on-surface-variant">No ticket found for this event.</p>
                  </div>
                )}
              </div>
            )
          },
          // ==========================================
          // Tab 9: Event Overview (Public Details)
          // ==========================================
          {
            key: '9',
            label: 'Overview',
            children: event ? (
              <div className="space-y-6 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left Description Column */}
                  <div className="md:col-span-2 space-y-4">
                    <h3 className="font-heading text-lg font-bold text-foreground m-0">About the Event</h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                      {event.description || 'No description provided for this event.'}
                    </p>
                  </div>

                  {/* Right Metadata Column */}
                  <div className="space-y-6 p-5 border border-outline-variant/60 rounded-xl bg-surface-container-low/30 h-fit">
                    <h4 className="font-bold text-sm text-foreground m-0 border-b border-outline-variant/40 pb-2">Event Details</h4>
                    
                    <div className="space-y-3 text-xs text-on-surface-variant font-medium">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <div>
                          <p className="font-bold text-foreground m-0">Date</p>
                          <p className="m-0 mt-0.5">{event.date}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <div>
                          <p className="font-bold text-foreground m-0">Time</p>
                          <p className="m-0 mt-0.5">{event.time}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        <div>
                          <p className="font-bold text-foreground m-0">Location</p>
                          <p className="m-0 mt-0.5">{event.location}</p>
                        </div>
                      </div>
                    </div>

                    {(event.contactEmail || event.contactPhone) && (
                      <div className="pt-4 border-t border-outline-variant/40 space-y-3">
                        <h4 className="font-bold text-xs text-foreground m-0">Contact Organizer</h4>
                        <div className="space-y-2 text-xs text-on-surface-variant">
                          {event.contactEmail && (
                            <p className="m-0 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{event.contactEmail}</p>
                          )}
                          {event.contactPhone && (
                            <p className="m-0 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{event.contactPhone}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null
          }
        ].filter(tab => {
          const isSuperAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';
          if (isSuperAdmin) return true;

          if (event?.hostUsername === user?.username) return true;

          if (event?.is_team_member) {
            if (event.team_role === 'ORGANIZER') return true;
            if (event.team_role === 'SCANNER' && (tab.key === '1' || tab.key === '6')) return true;
            if (event.team_role === 'MANAGER' && (tab.key !== '3' && tab.key !== '4' && tab.key !== '5' && tab.key !== '7')) return true;
            return false;
          }

          if (event?.is_registered) {
            if (tab.key === '8' || tab.key === '9') return true;
            return false;
          }

        }).map((tab, idx) => ({
          ...tab,
          key: (idx + 1).toString()
        }))} />
      </div>

      {/* MODALS */}
      {/* 1. Invite Team member Modal */}
      <Modal
        title={<span className="font-bold text-base">Invite Event Team Member</span>}
        open={isTeamModalOpen}
        onCancel={() => setIsTeamModalOpen(false)}
        footer={[
          <Button key="cancel" variant="outline" onClick={() => setIsTeamModalOpen(false)} className="mr-2">Cancel</Button>,
          <Button key="invite" variant="primary" loading={invitingTeam} onClick={handleInviteTeam}>Send Invite</Button>
        ]}
      >
        <div className="space-y-4 py-4">
          <FormField label="User Username" value={inviteUsername} onChange={(e) => setInviteUsername(e.target.value)} placeholder="e.g. zobaer123" required />
          <div className="flex flex-col gap-1.5">
            <label className="text-label-bold text-on-surface-variant font-bold uppercase tracking-wider block">Access Role</label>
            <Select
              value={inviteRole}
              onChange={setInviteRole}
              size="large"
              className="w-full"
              options={[
                { value: 'ORGANIZER', label: 'Organizer (Full Settings Workspace)' },
                { value: 'SCANNER', label: 'Scanner (Limited QR Code Scan Access)' }
              ]}
            />
          </div>
        </div>
      </Modal>

      {/* 2. Create Activity Modal */}
      <Modal
        title={<span className="font-bold text-base">Create Scan Activity Checkpoint</span>}
        open={isActivityModalOpen}
        onCancel={() => setIsActivityModalOpen(false)}
        footer={[
          <Button key="cancel" variant="outline" onClick={() => setIsActivityModalOpen(false)} className="mr-2">Cancel</Button>,
          <Button key="submit" variant="primary" loading={submittingActivity} onClick={handleCreateActivity}>Create Checkpoint</Button>
        ]}
      >
        <div className="space-y-4 py-4">
          <FormField label="Checkpoint/Activity Name" value={activityName} onChange={(e) => setActivityName(e.target.value)} placeholder="e.g. Dinner coupon scanning" required />
          <FormField label="Max scan allowed per ticket" type="number" value={activityScanLimit} onChange={(e) => setActivityScanLimit(e.target.value)} placeholder="e.g. 1" required />
        </div>
      </Modal>

      {/* 3. Manual Register Participant Modal */}
      <Modal
        title={<span className="font-bold text-base">Register Participant Manually</span>}
        open={isRegisterModalOpen}
        onCancel={() => setIsRegisterModalOpen(false)}
        width={650}
        footer={[
          <Button key="cancel" variant="outline" onClick={() => setIsRegisterModalOpen(false)} className="mr-2">Cancel</Button>,
          <Button key="register" variant="primary" loading={submittingRegistration} onClick={handleManualRegister}>Register Participant</Button>
        ]}
      >
        <div className="space-y-4 py-4 grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <div className="sm:col-span-2">
            <FormField label="Email Address" type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="e.g. participant@example.com" required />
          </div>
          <FormField label="Account Username" value={regUserId} onChange={(e) => setRegUserId(e.target.value)} placeholder="e.g. user123" required />
          <FormField label="Full Name" value={regFullName} onChange={(e) => setRegFullName(e.target.value)} placeholder="e.g. Zobaer Ahmed" />
          <FormField label="Mobile Number" type="tel" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} placeholder="e.g. +8801700000000" />
          <FormField label="Organization/Company" value={regOrganization} onChange={(e) => setRegOrganization(e.target.value)} placeholder="e.g. St. Gregory's College" />
          <FormField label="Job Title / Role" value={regJobTitle} onChange={(e) => setRegJobTitle(e.target.value)} placeholder="e.g. Student" />
          
          <div className="flex flex-col gap-1.5">
            <label className="text-label-bold text-on-surface-variant font-bold uppercase tracking-wider block">Ticket Category Tier</label>
            <Select
              value={regTicketTypeId}
              onChange={setRegTicketTypeId}
              size="large"
              className="w-full"
              options={tickets.map(t => ({ value: t.id.toString(), label: `${t.name} (৳ ${t.price})` }))}
            />
          </div>

          {formTshirtSize && (
            <div className="flex flex-col gap-1.5">
              <label className="text-label-bold text-on-surface-variant font-bold uppercase tracking-wider block">T-Shirt Size</label>
              <Select
                value={regTshirtSize}
                onChange={setRegTshirtSize}
                size="large"
                className="w-full"
                options={[
                  { value: 'S', label: 'S' },
                  { value: 'M', label: 'M' },
                  { value: 'L', label: 'L' },
                  { value: 'XL', label: 'XL' },
                  { value: 'XXL', label: 'XXL' }
                ]}
              />
            </div>
          )}

          {formReference && (
            <div className="sm:col-span-2">
              <FormField label="Reference (How did they hear?)" value={regReference} onChange={(e) => setRegReference(e.target.value)} placeholder="e.g. Facebook post" />
            </div>
          )}

          {formTransactionId && (
            <div className="sm:col-span-2">
              <FormField label="Manual Transaction ID" value={regTransactionId} onChange={(e) => setRegTransactionId(e.target.value)} placeholder="e.g. TXN1002345" />
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
