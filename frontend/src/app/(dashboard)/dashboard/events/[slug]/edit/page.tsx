'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, message, Tabs, Tag } from 'antd';
import { ArrowLeft, Save, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import type { Event, TicketType } from '@/lib/api';
import { fetchTicketTypes } from '@/lib/api';

interface EditableTicketType extends Partial<TicketType> {
  isNew?: boolean;
}

export default function EditEventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('1');
  
  // Form State
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
  
  // Ticket State
  const [tickets, setTickets] = useState<EditableTicketType[]>([]);

  // Helper to parse 12h time string to 24h format for the picker
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

  useEffect(() => {
    async function loadData() {
      try {
        const [eventRes, ticketsData] = await Promise.all([
          fetch(`/api/v1/events/${slug}`),
          fetchTicketTypes(slug).catch(() => [])
        ]);

        if (eventRes.ok) {
          const data = await eventRes.json();
          setTitle(data.title || '');
          setDescription(data.description || '');
          setThumbnail(data.thumbnail || '');
          // Parse date: try to convert human-readable date back to yyyy-mm-dd for the picker
          const rawDate = data.date || '';
          const parsedDate = new Date(rawDate);
          if (!isNaN(parsedDate.getTime())) {
            setDate(parsedDate.toISOString().split('T')[0]);
          } else {
            setDate(rawDate);
          }
          // Parse time: try to split 'HH:MM AM - HH:MM PM' into start/end 24h
          const rawTime = data.time || '';
          const timeParts = rawTime.split(/\s*-\s*/);
          if (timeParts.length === 2) {
            setStartTime(parseTo24h(timeParts[0].trim()));
            setEndTime(parseTo24h(timeParts[1].trim()));
          } else if (timeParts.length === 1) {
            setStartTime(parseTo24h(timeParts[0].trim()));
          }

          if (data.registration_deadline) {
            const rd = new Date(data.registration_deadline);
            if (!isNaN(rd.getTime())) {
              setRegistrationDeadlineDate(rd.toISOString().split('T')[0]);
              setRegistrationDeadlineTime(rd.toISOString().split('T')[1].substring(0, 5));
            }
          }
          
          setLocation(data.location || '');
          setCapacity(data.capacity?.toString() || '500');
          setContactEmail(data.contact_email || data.contactEmail || '');
          setContactPhone(data.contact_phone || data.contactPhone || '');
          setStatus(data.status || 'DRAFT');
        } else {
          message.error('Failed to load event details');
          router.push(`/dashboard/events/${slug}`);
        }
        
        setTickets(ticketsData);
      } catch (err) {
        message.error('Failed to load event details');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [slug, router]);



  // Helper to format 24h time to 12h display for API
  const formatTimeDisplay = (timeStr: string) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  // Helper to format date from yyyy-mm-dd to human-readable
  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const timeDisplay = startTime && endTime
    ? `${formatTimeDisplay(startTime)} - ${formatTimeDisplay(endTime)}`
    : startTime
    ? formatTimeDisplay(startTime)
    : '';

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
                body: JSON.stringify({ imageBase64: dataUrl })
              });
              const data = await res.json();
              if (res.ok && data.url) {
                setThumbnail(data.url);
                message.success('Upload to Cloudflare R2 bucket successful!');
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

  const handleSave = async () => {
    if (!title || !date || !startTime || !endTime || !location || !capacity) {
      message.error('Please fill in all required fields in Basic Info');
      return;
    }

    setSaving(true);
    try {
      // 1. Update basic event details
      const eventRes = await fetch(`/api/v1/events/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, description, thumbnail, date: formatDateDisplay(date), time: timeDisplay, 
          startDate: new Date(`${date}T${startTime}:00`).toISOString(),
          endDate: new Date(`${date}T${endTime}:00`).toISOString(),
          registrationDeadline: new Date(`${registrationDeadlineDate}T${registrationDeadlineTime}:00`).toISOString(),
          location,
          capacity: parseInt(capacity), contactEmail, contactPhone, status
        })
      });

      if (!eventRes.ok) {
        const err = await eventRes.json();
        throw new Error(err.error || 'Failed to update event details');
      }

      // 2. Update Tickets
      for (const ticket of tickets) {
        if (ticket.isNew) {
          await fetch(`/api/v1/events/${slug}/ticket-types`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: ticket.name,
              description: ticket.description,
              price: parseFloat(ticket.price?.toString() || '0'),
              capacity: parseInt(ticket.capacity?.toString() || '0'),
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
              price: parseFloat(ticket.price?.toString() || '0'),
              capacity: parseInt(ticket.capacity?.toString() || '0'),
            })
          });
        }
      }

      message.success('Event updated successfully!');
      router.push(`/dashboard/events/${slug}`);
    } catch (err: any) {
      message.error(err.message || 'An error occurred while updating the event');
    } finally {
      setSaving(false);
    }
  };

  const handleTicketChange = (index: number, field: keyof EditableTicketType, value: any) => {
    const updated = [...tickets];
    updated[index] = { ...updated[index], [field]: value };
    setTickets(updated);
  };

  const removeTicket = async (index: number) => {
    const ticket = tickets[index];
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
    setTickets(tickets.filter((_, i) => i !== index));
  };

  const addTicket = () => {
    setTickets([...tickets, { name: '', description: '', price: '0', capacity: 100, isNew: true }]);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const tabItems = [
    {
      key: '1',
      label: 'Basic Info',
      children: (
        <div className="space-y-4 pt-2">
          <FormField label="Event Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Event Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            <FormField label="Start Time" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
            <FormField label="End Time" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Registration Deadline Date" type="date" value={registrationDeadlineDate} onChange={(e) => setRegistrationDeadlineDate(e.target.value)} required />
            <FormField label="Registration Deadline Time" type="time" value={registrationDeadlineTime} onChange={(e) => setRegistrationDeadlineTime(e.target.value)} required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Venue / Location" value={location} onChange={(e) => setLocation(e.target.value)} required />
            <FormField label="Global Capacity" type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} required />
          </div>
          <FormField label="Event Description" textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
      )
    },
    {
      key: '2',
      label: 'Branding & Contact',
      children: (
        <div className="space-y-4 pt-2">
          <div className="space-y-2 mb-4">
            <label className="text-label-bold text-on-surface-variant font-bold uppercase tracking-wider block">
              Event Banner Image
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-outline-variant border-dashed rounded-xl cursor-pointer bg-surface-container-low hover:bg-surface-container-high/60 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <ImageIcon className="w-8 h-8 text-on-surface-variant/60 mb-2" />
                  <p className="text-xs text-foreground font-bold mb-1">
                    {isUploading ? 'Uploading...' : 'Click to upload to Cloudflare R2'}
                  </p>
                  <p className="text-[10px] text-on-surface-variant">
                    WebP, JPEG, or PNG up to 5MB (optimized to 1200x630)
                  </p>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
              </label>
            </div>
          </div>
          <FormField label="Or paste Event Banner URL" value={thumbnail} onChange={(e) => setThumbnail(e.target.value)} />
          <div className="w-full aspect-[21/9] rounded-xl overflow-hidden bg-surface-container-low border border-outline-variant/60 relative flex items-center justify-center mb-6">
            {thumbnail ? (
              <img src={thumbnail} alt="Banner Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-on-surface-variant/40">
                <ImageIcon className="w-10 h-10" />
                <span className="text-xs font-bold uppercase tracking-wider">No image specified</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Support Email" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
            <FormField label="Support Phone" type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
          </div>
        </div>
      )
    },
    {
      key: '3',
      label: 'Tickets',
      children: (
        <div className="space-y-6 pt-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-on-surface-variant">Configure available ticket tiers for this event.</span>
            <Button variant="outline" size="sm" onClick={addTicket} icon={<Plus className="w-4 h-4" />}>
              Add Ticket Category
            </Button>
          </div>
          
          <div className="space-y-4">
            {tickets.map((ticket, index) => (
              <div key={index} className="p-5 border border-outline-variant/60 rounded-xl bg-surface-container-low/40 relative">
                <div className="absolute top-4 right-4 flex gap-2">
                  {ticket.isNew && <Tag color="blue">New</Tag>}
                  <button type="button" onClick={() => removeTicket(index)} className="p-1.5 text-error hover:bg-error/10 rounded-lg cursor-pointer border-none bg-transparent">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 mt-2">
                  <FormField label="Ticket Name" value={ticket.name || ''} onChange={(e) => handleTicketChange(index, 'name', e.target.value)} required />
                  <FormField label="Price (BDT)" type="number" value={ticket.price?.toString() || ''} onChange={(e) => handleTicketChange(index, 'price', e.target.value)} required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Capacity" type="number" value={ticket.capacity?.toString() || ''} onChange={(e) => handleTicketChange(index, 'capacity', e.target.value)} required />
                  <FormField label="Description" value={ticket.description || ''} onChange={(e) => handleTicketChange(index, 'description', e.target.value)} />
                </div>
              </div>
            ))}
            {tickets.length === 0 && (
              <div className="text-center p-8 text-on-surface-variant italic">No tickets configured yet.</div>
            )}
          </div>
        </div>
      )
    },
    {
      key: '4',
      label: 'Status & Settings',
      children: (
        <div className="space-y-6 pt-2">
          <div>
            <h4 className="text-sm font-bold text-foreground mb-3">Event Status</h4>
            <div className="flex flex-wrap gap-3">
              {['DRAFT', 'PUBLISHED', 'LIVE', 'ENDED', 'ARCHIVED'].map(s => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold border cursor-pointer transition-colors ${status === s ? 'bg-primary text-white border-primary' : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant hover:border-primary'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          
          <div className="border-t border-outline-variant/60 pt-6 mt-6">
            <h4 className="text-sm font-bold text-error mb-2">Danger Zone</h4>
            <p className="text-xs text-on-surface-variant mb-4">Deleting this event is permanent and cannot be undone.</p>
            <Button variant="outline" className="text-error border-error hover:bg-error/10">Delete Event</Button>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between border-b border-outline-variant/60 pb-5">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/events/${slug}`)} icon={<ArrowLeft className="w-4 h-4" />}>
            Back
          </Button>
          <h2 className="font-heading text-2xl font-extrabold text-foreground leading-tight m-0">
            Edit Event Details
          </h2>
        </div>
        <Button variant="primary" loading={saving} onClick={handleSave} icon={<Save className="w-4 h-4" />}>
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 sm:p-8 shadow-xs">
          <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
        </div>
        
        {/* Right Side Live Preview Panel */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-xs sticky top-24 hidden lg:block">
          <h4 className="font-heading text-sm font-bold text-foreground mt-0 mb-4 pb-2 border-b border-outline-variant/40">
            Real-time Card Preview
          </h4>

          {/* Event Card Mockup */}
          <div className="bento-card overflow-hidden bg-surface-container-low/40 flex flex-col">
            <div className="w-full aspect-[21/9] bg-surface-container-high relative overflow-hidden">
              {thumbnail ? (
                <img src={thumbnail} alt="Live Preview Banner" className="w-full h-full object-cover transition-all duration-300" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-on-surface-variant/40">
                  <ImageIcon size={28} />
                </div>
              )}
              <div className="absolute top-2 right-2 bg-primary/95 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                {status}
              </div>
            </div>

            <div className="p-5 space-y-3 flex-grow">
              <h5 className="font-heading text-base font-extrabold text-foreground m-0 line-clamp-1">
                {title || 'Your Event Title Here'}
              </h5>

              <div className="space-y-1.5">
                <div className="text-on-surface-variant text-[11px] font-semibold">
                  <span>{formatDateDisplay(date) || 'Date TBD'} • {timeDisplay || 'Time TBD'}</span>
                </div>
                <div className="text-on-surface-variant text-[11px] font-semibold">
                  <span className="truncate">{location || 'Location/Venue TBD'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
