'use client';

import React, { useState, useEffect } from 'react';
import DataTable from '@/components/ui/DataTable';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import StatusChip from '@/components/ui/StatusChip';
import { Trash2, ArrowLeft, Plus, Edit, UserPlus } from 'lucide-react';
import { message, Drawer, Tabs, Select, Table, Tag, Pagination } from 'antd';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AdminEventsDirectoryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Management Drawer State
  const [manageVisible, setManageVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [savingEvent, setSavingEvent] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [hostUsername, setHostUsername] = useState('');
  const [status, setStatus] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState('0');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [description, setDescription] = useState('');

  // Team State
  const [team, setTeam] = useState<any[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [inviteUsername, setInviteUsername] = useState('');
  const [inviteRole, setInviteRole] = useState('MANAGER');

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      const res = await fetch('/api/v1/admin/events');
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      } else {
        setEvents([]);
      }
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteEvent = async (id: number) => {
    if (user?.role !== 'SUPER_ADMIN') {
      message.error('Only Super Admins can purge events.');
      return;
    }
    const confirmText = window.prompt('Type "delete the event" to confirm purging this event:');
    if (confirmText !== 'delete the event') {
      message.error('Confirmation text did not match. Purge cancelled.');
      return;
    }
    try {
      const res = await fetch(`/api/v1/admin/events/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        message.success('Event purged successfully.');
        setEvents(events.filter(e => e.id !== id));
      } else {
        const err = await res.json();
        message.error(err.error || 'Purge request failed.');
      }
    } catch (err: any) {
      console.error(err);
      message.error('Purge action failed.');
    }
  };

  const handleManageClick = (event: any) => {
    setSelectedEvent(event);
    setTitle(event.title || '');
    setSlug(event.slug || '');
    setHostUsername(event.host_username || '');
    setStatus(event.status || 'DRAFT');
    
    // Process date
    let parsedDate = event.date || '';
    const d = new Date(parsedDate);
    if (!isNaN(d.getTime())) {
      parsedDate = d.toISOString().split('T')[0];
    }
    setDate(parsedDate);
    
    setTime(event.time || '');
    setLocation(event.location || '');
    setCapacity(event.capacity?.toString() || '0');
    setContactEmail(event.contact_email || '');
    setContactPhone(event.contact_phone || '');
    setDescription(event.description || '');

    setManageVisible(true);
    fetchTeam(event.id);
  };

  const handleCreateClick = () => {
    setSelectedEvent(null);
    setTitle('');
    setSlug('');
    setHostUsername('');
    setStatus('DRAFT');
    setDate('');
    setTime('');
    setLocation('');
    setCapacity('100');
    setContactEmail('');
    setContactPhone('');
    setDescription('');
    setManageVisible(true);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!selectedEvent) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    }
  };

  const fetchTeam = async (eventId: number) => {
    setLoadingTeam(true);
    try {
      const res = await fetch(`/api/v1/admin/events/${eventId}/team`);
      if (res.ok) {
        setTeam(await res.json());
      }
    } catch (err) {
      message.error('Failed to load event team.');
    } finally {
      setLoadingTeam(false);
    }
  };

  const handleSaveEvent = async () => {
    setSavingEvent(true);
    try {
      const payload = {
        slug,
        title,
        hostUsername,
        status,
        date,
        time,
        location,
        capacity: parseInt(capacity, 10),
        contactEmail: contactEmail || null,
        contactPhone: contactPhone || null,
        description
      };

      const url = selectedEvent 
        ? `/api/v1/admin/events/${selectedEvent.id}`
        : '/api/v1/admin/events';
        
      const method = selectedEvent ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        message.success(selectedEvent ? 'Event updated successfully.' : 'Event created successfully.');
        setManageVisible(false);
        loadEvents();
      } else {
        const err = await res.json();
        message.error(err.error || 'Failed to save event.');
      }
    } catch (err) {
      message.error('Error saving event.');
    } finally {
      setSavingEvent(false);
    }
  };

  const handleInviteTeam = async () => {
    if (!inviteUsername) {
      message.error('Username is required');
      return;
    }
    try {
      const res = await fetch(`/api/v1/admin/events/${selectedEvent.id}/team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: inviteUsername, role: inviteRole })
      });
      if (res.ok) {
        message.success('Team member added successfully.');
        setInviteUsername('');
        fetchTeam(selectedEvent.id);
      } else {
        const text = await res.text();
        try {
          const err = JSON.parse(text);
          message.error(err.error || 'Failed to add team member.');
        } catch (e) {
          message.error(`Unknown error (${res.status}): ${text.substring(0, 50)}`);
        }
      }
    } catch (err: any) {
      console.error(err);
      message.error(err.message || 'Error adding team member.');
    }
  };

  const handleRemoveTeam = async (username: string) => {
    if (!confirm(`Remove ${username} from the event team?`)) return;
    try {
      const res = await fetch(`/api/v1/admin/events/${selectedEvent.id}/team/${username}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        message.success('Team member removed.');
        fetchTeam(selectedEvent.id);
      } else {
        message.error('Failed to remove team member.');
      }
    } catch (err) {
      message.error('Error removing team member.');
    }
  };

  const columns = [
    { key: 'title', title: 'Event Title' },
    { key: 'host_username', title: 'Organizer' },
    { key: 'date', title: 'Date' },
    {
      key: 'status',
      title: 'Status',
      render: (row: any) => <StatusChip status={row.status} label={row.status} />
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (row: any) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleManageClick(row)}
            icon={<Edit className="w-3.5 h-3.5" />}
          >
            Manage
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDeleteEvent(row.id)}
            icon={<Trash2 className="w-3.5 h-3.5" />}
            disabled={user?.role !== 'SUPER_ADMIN'}
          >
            Purge
          </Button>
        </div>
      )
    }
  ];

  const teamColumns = [
    { title: 'Username', dataIndex: 'username', key: 'username', render: (text: string) => <span className="font-bold">{text}</span> },
    { title: 'Role', dataIndex: 'role', key: 'role', render: (r: string) => <Tag color={r === 'ORGANIZER' ? 'blue' : 'cyan'}>{r}</Tag> },
    { title: 'Action', key: 'action', render: (_: any, record: any) => (
      <Button variant="outline" size="sm" className="text-error border-error" onClick={() => handleRemoveTeam(record.username)} icon={<Trash2 className="w-4 h-4"/>}>Remove</Button>
    )}
  ];

  const renderBasicInfoForm = () => (
    <div className="space-y-4 pt-2">
      <FormField label="Event Title" value={title} onChange={(e) => handleTitleChange(e.target.value)} />
      <FormField label="Event Slug" value={slug} onChange={(e) => setSlug(e.target.value)} disabled={!!selectedEvent} placeholder="e.g. tech-meetup-2026" />
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Organizer Username" value={hostUsername} onChange={(e) => setHostUsername(e.target.value)} placeholder="e.g. john_doe" />
        <div className="flex flex-col gap-1.5">
          <label className="text-label-bold text-on-surface-variant font-bold uppercase tracking-wider block">Status</label>
          <Select value={status} onChange={setStatus} size="large" className="w-full" options={[
            { value: 'DRAFT', label: 'DRAFT' },
            { value: 'LIVE', label: 'LIVE' },
            { value: 'POSTPONED', label: 'POSTPONED' },
            { value: 'CANCELLED', label: 'CANCELLED' }
          ]} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <FormField label="Time (Raw)" value={time} onChange={(e) => setTime(e.target.value)} placeholder="e.g. 18:00 - 21:00" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
        <FormField label="Capacity" type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Contact Email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
        <FormField label="Contact Phone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
      </div>
      <FormField label="Description" textarea value={description} onChange={(e) => setDescription(e.target.value)} />
      
      <div className="flex justify-end pt-4">
        <Button variant="primary" onClick={handleSaveEvent} loading={savingEvent}>
          {selectedEvent ? 'Save Event Details' : 'Create Event'}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <section className="flex items-center justify-between border-b border-outline-variant/60 pb-5">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/admin')} icon={<ArrowLeft className="w-4 h-4" />}>
            Back
          </Button>
          <div>
            <h2 className="font-heading text-2xl font-extrabold text-foreground leading-tight m-0">
              Global Events Directory
            </h2>
            <p className="text-on-surface-variant text-sm mt-1.5 mb-0">
              Moderate events, update statuses, change organizers, and manage team access.
            </p>
          </div>
        </div>

        <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={handleCreateClick}>
          Create New Event
        </Button>
      </section>

      <section className="space-y-4">
        <DataTable columns={columns} data={events.slice((currentPage - 1) * pageSize, currentPage * pageSize)} emptyText="No events directory records." />
        <div className="flex justify-end pt-2">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={events.length}
            onChange={(page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            }}
            showSizeChanger
            showTotal={(total) => `Showing ${Math.min(total, (currentPage - 1) * pageSize + 1)}-${Math.min(total, currentPage * pageSize)} of ${total} entries`}
          />
        </div>
      </section>

      <Drawer
        title={<span className="font-bold text-lg">{selectedEvent ? `Manage Event: ${selectedEvent?.title}` : 'Create New Event'}</span>}
        width={700}
        onClose={() => setManageVisible(false)}
        open={manageVisible}
        destroyOnClose
      >
        {selectedEvent ? (
          <Tabs defaultActiveKey="1" items={[
            {
              key: '1',
              label: 'Basic Info & Status',
              children: renderBasicInfoForm()
            },
            {
              key: '2',
              label: 'Event Team & Access',
              children: (
                <div className="space-y-6 pt-2">
                  <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant space-y-4">
                    <h4 className="font-bold text-sm m-0">Give Access / Add Team Member</h4>
                    <div className="flex items-end gap-3">
                      <div className="flex-1">
                        <FormField label="Username" value={inviteUsername} onChange={(e) => setInviteUsername(e.target.value)} placeholder="e.g. sarah123" />
                      </div>
                      <div className="flex-1">
                        <label className="text-label-bold text-on-surface-variant font-bold uppercase tracking-wider block mb-1.5">Role</label>
                        <Select value={inviteRole} onChange={setInviteRole} size="large" className="w-full" options={[
                          { value: 'ORGANIZER', label: 'ORGANIZER' },
                          { value: 'MANAGER', label: 'MANAGER' },
                          { value: 'SCANNER', label: 'SCANNER' }
                        ]} />
                      </div>
                      <Button variant="primary" onClick={handleInviteTeam} icon={<UserPlus className="w-4 h-4" />}>
                        Add
                      </Button>
                    </div>
                  </div>

                  <div className="bg-surface-container-lowest p-1 rounded-xl border border-outline-variant">
                    <Table 
                      dataSource={team} 
                      columns={teamColumns} 
                      rowKey="username" 
                      loading={loadingTeam}
                      pagination={false}
                      size="small"
                    />
                  </div>
                </div>
              )
            }
          ]} />
        ) : (
          renderBasicInfoForm()
        )}
      </Drawer>
    </div>
  );
}
