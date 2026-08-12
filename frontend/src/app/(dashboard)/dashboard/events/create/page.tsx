'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StepProgress from '@/components/ui/StepProgress';
import FormField from '@/components/ui/FormField';
import Button from '@/components/ui/Button';
import { 
  Plus, 
  Trash2, 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  Image as ImageIcon, 
  Calendar, 
  MapPin, 
  Users, 
  Mail, 
  Phone,
  CheckCircle,
  FileText,
  DollarSign
} from 'lucide-react';
import { message } from 'antd';
import { useAuth } from '@/context/AuthContext';

interface TicketTypeInput {
  name: string;
  description: string;
  price: string;
  capacity: string;
}

export default function CreateEventWizardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Step 1: Info State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [registrationDeadlineDate, setRegistrationDeadlineDate] = useState('');
  const [registrationDeadlineTime, setRegistrationDeadlineTime] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState('500');
  const [description, setDescription] = useState('');

  // Step 2: Branding State
  const [thumbnail, setThumbnail] = useState('https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&h=450&fit=crop');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  
  // Simulated R2 Upload State
  const [isUploading, setIsUploading] = useState(false);

  // Step 3: Ticket Types State
  const [tickets, setTickets] = useState<TicketTypeInput[]>([
    { name: 'Standard Pass', description: 'General Access to the event.', price: '0', capacity: '500' }
  ]);

  // Set default values from logged-in user profile
  useEffect(() => {
    if (user) {
      if (!contactEmail) setContactEmail(user.email || '');
      if (!contactPhone) setContactPhone(user.mobile || '');
    }
  }, [user]);

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setSlug(slugify(e.target.value));
  };

  const addTicket = () => {
    setTickets([...tickets, { name: '', description: '', price: '0', capacity: '100' }]);
  };

  const removeTicket = (index: number) => {
    if (tickets.length === 1) return;
    setTickets(tickets.filter((_, i) => i !== index));
  };

  const handleTicketChange = (index: number, field: keyof TicketTypeInput, value: string) => {
    const updated = [...tickets];
    updated[index][field] = value;
    setTickets(updated);
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
          // Draw to canvas to resize and compress the image
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
            // Export compressed JPEG
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

  // Helper to format date from yyyy-mm-dd to human-readable
  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Helper to format 24h time to 12h display
  const formatTimeDisplay = (timeStr: string) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  // Combined time range for API submission and preview
  const timeDisplay = startTime && endTime
    ? `${formatTimeDisplay(startTime)} - ${formatTimeDisplay(endTime)}`
    : startTime
    ? formatTimeDisplay(startTime)
    : '';

  const dateDisplay = formatDateDisplay(date);

  const handleNext = () => {
    if (currentStep === 0) {
      if (!title || !slug || !date || !startTime || !endTime || !registrationDeadlineDate || !registrationDeadlineTime || !location || !capacity) {
        message.error('Please fill in all required fields on Step 1');
        return;
      }
    }
    if (currentStep === 1) {
      if (!contactEmail) {
        message.error('Please specify a contact email on Step 2');
        return;
      }
    }
    if (currentStep === 2) {
      const invalidTicket = tickets.find(t => !t.name || parseFloat(t.price) < 0 || parseInt(t.capacity) <= 0);
      if (invalidTicket) {
        message.error('Please verify all ticket details are filled out correctly.');
        return;
      }
    }
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleStepNavigation = (stepIndex: number) => {
    // Perform light validation to make sure we don't skip unconfigured fields
    if (stepIndex > 0 && (!title || !slug || !date || !startTime || !endTime || !registrationDeadlineDate || !registrationDeadlineTime || !location)) {
      message.error('Please complete Step 1 details first');
      return;
    }
    if (stepIndex > 1 && !contactEmail) {
      message.error('Please complete Step 2 details first');
      return;
    }
    setCurrentStep(stepIndex);
  };

  const handleSubmit = async (publishImmediate: boolean) => {
    setLoading(true);
    try {
      // 1. Create Event
      const eventRes = await fetch('/api/v1/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          date: dateDisplay,
          time: timeDisplay,
          startDate: new Date(`${date}T${startTime}:00`).toISOString(),
          endDate: new Date(`${date}T${endTime}:00`).toISOString(),
          registrationDeadline: new Date(`${registrationDeadlineDate}T${registrationDeadlineTime}:00`).toISOString(),
          location,
          capacity: parseInt(capacity),
          contactEmail,
          contactPhone,
          thumbnail,
          description,
          status: publishImmediate ? 'PUBLISHED' : 'DRAFT'
        })
      });

      if (!eventRes.ok) {
        const err = await eventRes.json();
        throw new Error(err.error || 'Failed to create event base configuration.');
      }

      // 2. Create associated ticket types sequentially
      for (const ticket of tickets) {
        const ticketRes = await fetch(`/api/v1/events/${slug}/ticket-types`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: ticket.name,
            description: ticket.description,
            price: parseFloat(ticket.price),
            capacity: parseInt(ticket.capacity),
            currency: 'BDT',
            isActive: true,
          })
        });

        if (!ticketRes.ok) {
          console.warn(`Could not register ticket type: ${ticket.name}`);
        }
      }

      message.success(publishImmediate ? 'Event published successfully!' : 'Event created as draft!');
      router.push('/dashboard');
    } catch (err: any) {
      message.error(err.message || 'An error occurred while setting up the event.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { title: 'Event Details', description: 'Schedule & location' },
    { title: 'Branding', description: 'Banners & contact info' },
    { title: 'Tickets & Limits', description: 'Ticket types & pricing' },
    { title: 'Review & Publish', description: 'Final launch checks' }
  ];

  // Helper calculating registration capacity summary
  const totalTicketCapacity = tickets.reduce((acc, t) => acc + (parseInt(t.capacity) || 0), 0);
  const totalTicketPriceBDT = tickets.reduce((acc, t) => acc + (parseFloat(t.price) || 0), 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title block */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-heading text-3xl font-extrabold text-foreground leading-none">
            Create New Event
          </h2>
          <p className="text-on-surface-variant text-sm mt-1.5 mb-0">
            Configure schedule parameters, upload branding assets, and setup registration details.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.push('/dashboard')}>
          Back to Overview
        </Button>
      </div>

      <StepProgress steps={steps} currentStep={currentStep} onStepClick={handleStepNavigation} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side Form Panels */}
        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 shadow-xs">
          
          {/* Step 1: Info Details */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <h3 className="font-heading text-lg font-bold text-foreground m-0 border-b border-outline-variant/60 pb-3">
                Step 1: Basic Information
              </h3>
              
              <FormField
                label="Event Title"
                value={title}
                onChange={handleTitleChange}
                placeholder="e.g. Global Tech Summit 2026"
                required
              />

              <FormField
                label="URL Slug"
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                placeholder="e.g. global-tech-summit-2026"
                className="font-mono text-xs"
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  label="Event Date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
                <FormField
                  label="Start Time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
                <FormField
                  label="End Time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Registration Deadline Date"
                  type="date"
                  value={registrationDeadlineDate}
                  onChange={(e) => setRegistrationDeadlineDate(e.target.value)}
                  required
                />
                <FormField
                  label="Registration Deadline Time"
                  type="time"
                  value={registrationDeadlineTime}
                  onChange={(e) => setRegistrationDeadlineTime(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Venue / Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Convention Center, SF"
                  required
                />
                <FormField
                  label="Global Capacity Limit"
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  placeholder="500"
                  required
                />
              </div>

              <FormField
                label="Event Description"
                textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write a compelling description for your attendees..."
              />
            </div>
          )}

          {/* Step 2: Branding */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="font-heading text-lg font-bold text-foreground m-0 border-b border-outline-variant/60 pb-3">
                Step 2: Branding & Banner Configuration
              </h3>

              {/* R2 File Upload Container Mockup */}
              <div className="space-y-2">
                <label className="text-label-bold text-on-surface-variant font-bold uppercase tracking-wider block">
                  Event Banner Image
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-outline-variant border-dashed rounded-xl cursor-pointer bg-surface-container-low hover:bg-surface-container-high/60 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <ImageIcon className="w-8 h-8 text-on-surface-variant/60 mb-2" />
                      <p className="text-xs text-foreground font-bold mb-1">
                        Click to upload to Cloudflare R2
                      </p>
                      <p className="text-[10px] text-on-surface-variant">
                        WebP, JPEG, or PNG up to 5MB (optimized to 1200x630)
                      </p>
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleFileUpload} 
                    />
                  </label>
                </div>
              </div>

              <FormField
                label="Or paste Event Banner URL"
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
                placeholder="https://example.com/banner.jpg"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Support/Contact Email"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="info@events.com"
                  required
                />
                <FormField
                  label="Support/Contact Phone"
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+88017XXXXXXXX"
                />
              </div>
            </div>
          )}

          {/* Step 3: Registration Tickets */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-outline-variant/60 pb-3">
                <h3 className="font-heading text-lg font-bold text-foreground m-0">
                  Step 3: Registration & Tickets
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addTicket}
                  icon={<Plus className="w-4 h-4" />}
                >
                  Add Ticket Category
                </Button>
              </div>

              <div className="space-y-6">
                {tickets.map((ticket, index) => (
                  <div key={index} className="relative p-5 border border-outline-variant/60 rounded-xl bg-surface-container-low/40 flex flex-col gap-4">
                    <div className="absolute top-4 right-4 flex gap-2">
                      {tickets.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTicket(index)}
                          className="p-1.5 text-error hover:bg-error/10 rounded-lg cursor-pointer border-none bg-transparent"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        label="Ticket Category Name"
                        value={ticket.name}
                        onChange={(e) => handleTicketChange(index, 'name', e.target.value)}
                        placeholder="e.g. Early Bird, VIP Pass"
                        required
                      />
                      <FormField
                        label="Price (BDT)"
                        type="number"
                        value={ticket.price}
                        onChange={(e) => handleTicketChange(index, 'price', e.target.value)}
                        placeholder="0"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        label="Capacity Limit"
                        type="number"
                        value={ticket.capacity}
                        onChange={(e) => handleTicketChange(index, 'capacity', e.target.value)}
                        placeholder="100"
                        required
                      />
                      <FormField
                        label="Description"
                        value={ticket.description}
                        onChange={(e) => handleTicketChange(index, 'description', e.target.value)}
                        placeholder="Describe what's included in this category..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Final Review & Publish */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="font-heading text-lg font-bold text-foreground m-0 border-b border-outline-variant/60 pb-3">
                Step 4: Final Review & Publish
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-4 bg-secondary/5 rounded-xl border border-secondary/20 text-secondary">
                  <CheckCircle size={20} className="flex-shrink-0" />
                  <span className="text-xs font-bold">Your event configuration is complete. Review details on the right before publishing.</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/40">
                    <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block">Global Details</span>
                    <p className="text-sm font-bold text-foreground mt-2 mb-1">{title || 'No Title'}</p>
                    <p className="text-xs text-on-surface-variant font-medium">{dateDisplay || 'No Date'} • {timeDisplay || 'No Time'}</p>
                    <p className="text-xs text-on-surface-variant font-medium mt-1">{location || 'No Location'}</p>
                  </div>

                  <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/40">
                    <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block">Tickets Summary</span>
                    <p className="text-sm font-bold text-foreground mt-2 mb-1">
                      {tickets.length} Categories configured
                    </p>
                    <p className="text-xs text-on-surface-variant font-medium">
                      Total Capacity: {totalTicketCapacity} / {capacity} Global Limit
                    </p>
                    <p className="text-xs text-on-surface-variant font-medium mt-1">
                      Paid Passes Pricing: {totalTicketPriceBDT > 0 ? 'Yes' : 'All Free'}
                    </p>
                  </div>
                </div>

                <div className="bg-[#fffbeb] border border-[#fef3c7] rounded-xl p-4 text-[#d97706] flex gap-3">
                  <FileText className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold block mb-1">Unsaved Draft Option</span>
                    <span className="text-[11px] leading-relaxed">
                      You can save this event as a <strong>Draft</strong>. Draft events are not visible to participants on the public directories, allowing you to configure activities and team members before launching.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Wizard Controls Footer */}
          <div className="flex justify-between items-center pt-6 border-t border-outline-variant/60 mt-8">
            <Button
              type="button"
              variant="outline"
              disabled={currentStep === 0 || loading}
              onClick={handleBack}
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Back
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button
                type="button"
                variant="primary"
                onClick={handleNext}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Continue
              </Button>
            ) : (
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  loading={loading}
                  onClick={() => handleSubmit(false)}
                  icon={<Save className="w-4 h-4" />}
                >
                  Save as Draft
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  loading={loading}
                  onClick={() => handleSubmit(true)}
                  icon={<CheckCircle className="w-4 h-4" />}
                >
                  Publish & Go Live
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right Side Live Preview Panel */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-xs sticky top-24">
          <h4 className="font-heading text-sm font-bold text-foreground mt-0 mb-4 pb-2 border-b border-outline-variant/40">
            Real-time Card Preview
          </h4>

          {/* Event Card Mockup */}
          <div className="bento-card overflow-hidden bg-surface-container-low/40 flex flex-col">
            <div className="w-full aspect-[21/9] bg-surface-container-high relative overflow-hidden">
              {thumbnail ? (
                <img 
                  src={thumbnail} 
                  alt="Live Preview Banner" 
                  className="w-full h-full object-cover transition-all duration-300"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-on-surface-variant/40">
                  <ImageIcon size={28} />
                </div>
              )}
              <div className="absolute top-2 right-2 bg-primary/95 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Preview
              </div>
            </div>

            <div className="p-5 space-y-3 flex-grow">
              <h5 className="font-heading text-base font-extrabold text-foreground m-0 line-clamp-1">
                {title || 'Your Event Title Here'}
              </h5>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-on-surface-variant text-[11px] font-semibold">
                  <Calendar size={13} className="text-primary-container" />
                  <span>{dateDisplay || 'Date TBD'} • {timeDisplay || 'Time TBD'}</span>
                </div>

                <div className="flex items-center gap-2 text-on-surface-variant text-[11px] font-semibold">
                  <MapPin size={13} className="text-primary-container" />
                  <span className="truncate">{location || 'Location/Venue TBD'}</span>
                </div>

                <div className="flex items-center gap-2 text-on-surface-variant text-[11px] font-semibold">
                  <Users size={13} className="text-primary-container" />
                  <span>Global Capacity Limit: {capacity}</span>
                </div>
              </div>

              {description && (
                <p className="text-[11px] text-on-surface-variant/80 m-0 line-clamp-2 leading-relaxed italic border-t border-outline-variant/20 pt-2">
                  {description}
                </p>
              )}

              {/* Tickets Section inside preview */}
              <div className="border-t border-outline-variant/30 pt-3 mt-2">
                <span className="text-[9px] text-on-surface-variant font-bold uppercase tracking-wider block mb-1.5">Ticket Tiers</span>
                <div className="flex flex-wrap gap-1.5">
                  {tickets.map((t, idx) => (
                    <span key={idx} className="bg-surface-container border border-outline-variant/40 rounded-full px-2.5 py-0.5 text-[9px] font-bold text-foreground flex items-center gap-1">
                      {t.name || 'Pass'}
                      <strong className="text-primary text-[8px] font-extrabold">
                        {parseFloat(t.price) > 0 ? `৳${t.price}` : 'FREE'}
                      </strong>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-outline-variant/30 space-y-2.5">
            <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block">Configuration Checks</span>
            <div className="flex justify-between text-[11px] font-semibold">
              <span className="text-on-surface-variant">Global capacity limit:</span>
              <span className="text-foreground">{capacity} slots</span>
            </div>
            <div className="flex justify-between text-[11px] font-semibold">
              <span className="text-on-surface-variant">Ticket limits sum:</span>
              <span className={`font-bold ${totalTicketCapacity > parseInt(capacity) ? 'text-error' : 'text-secondary'}`}>
                {totalTicketCapacity} slots
              </span>
            </div>
            {totalTicketCapacity > parseInt(capacity) && (
              <span className="text-[9px] font-semibold text-error/90 leading-tight block mt-1">
                ⚠️ Warning: Ticket tier limits sum exceeds global capacity limit!
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
