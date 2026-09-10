'use client';

import React, { useState, useEffect } from 'react';
import { Typography, Card, Avatar, Input, Tag, Modal, Form, DatePicker, TimePicker, Select, message } from 'antd';
import dayjs from 'dayjs';
import { 
  Plus, 
  Search, 
  MapPin, 
  Calendar,
  Grid,
  PlusCircle,
  GripVertical,
  Tv,
  Users,
  Compass,
  UserPlus,
  CalendarDays,
  Clock,
  Inbox,
  Trash2
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { fetchMyManagedEvents, fetchSchedules, createSchedule, deleteSchedule, ScheduleItem } from '@/lib/api';

const { Title, Paragraph } = Typography;

export default function SchedulePage() {
  const { user } = useAuth();
  
  if (user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' || user?.role === 'ORGANIZER' || user?.role === 'EVENT_MANAGER') {
    return <OrganizerSchedule />;
  }
  
  return <MySchedule />;
}

function MySchedule() {
  const scheduleItems = [
    {
      id: 1,
      time: '09:00 AM - 10:30 AM',
      title: 'Opening Keynote: The Generative Era',
      room: 'Grand Hall',
      event: 'Global Tech Summit 2026',
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-3xl font-extrabold text-foreground leading-none">
          My Personal Schedule
        </h2>
        <p className="text-on-surface-variant text-sm mt-1.5 mb-0">
          Stay on top of keynotes, sessions, and workshop schedules you signed up for.
        </p>
      </div>

      {scheduleItems.length > 0 ? (
        <div className="space-y-4">
          {scheduleItems.map((item) => (
            <div key={item.id} className="bento-card p-6 bg-surface-container-lowest border border-outline-variant/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <span className="inline-block px-2.5 py-1 bg-primary-container/10 text-primary text-[10px] font-bold rounded-lg uppercase tracking-wide">
                  {item.event}
                </span>
                <h3 className="font-heading text-lg font-bold text-foreground m-0 mt-1">
                  {item.title}
                </h3>
                
                <div className="flex flex-wrap items-center gap-4 text-xs text-on-surface-variant font-medium">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{item.time}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{item.room}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-surface-container-low border border-outline-variant/60 rounded-2xl">
          <Inbox className="w-12 h-12 text-on-surface-variant/40 mx-auto mb-4" />
          <h3 className="text-headline-md font-bold text-foreground m-0">Schedule Empty</h3>
          <p className="text-body-sm text-on-surface-variant mt-2">
            You haven't added any session items to your personal itinerary.
          </p>
        </div>
      )}
    </div>
  );
}

function OrganizerSchedule() {
  const [activeDay, setActiveDay] = useState('Day 1');
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventSlug, setSelectedEventSlug] = useState<string>('');
  const [viewMode, setViewMode] = useState<'LIST' | 'BUILDER'>('LIST');
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      try {
        const res = await fetchMyManagedEvents();
        if (res && res.length > 0) {
          setEvents(res);
        }
      } catch (err) {
        console.error('Failed to load events:', err);
      } finally {
        setEventsLoading(false);
      }
    }
    loadEvents();
  }, []);

  useEffect(() => {
    async function loadSchedules() {
      if (selectedEventSlug) {
        try {
          const res = await fetchSchedules(selectedEventSlug);
          setSchedules(res);
        } catch (err) {
          console.error('Failed to load schedules:', err);
        }
      }
    }
    loadSchedules();
  }, [selectedEventSlug]);

  const handleAddSchedule = async (values: any) => {
    if (!selectedEventSlug) {
      message.error('No event selected.');
      return;
    }
    setLoading(true);
    try {
      const data = {
        title: values.title,
        date: values.date.format('YYYY-MM-DD'),
        start_time: values.timeRange[0].format('hh:mm A'),
        end_time: values.timeRange[1].format('hh:mm A'),
        room: values.room,
        speaker: values.speaker,
      };
      const newSchedule = await createSchedule(selectedEventSlug, data);
      setSchedules([...schedules, newSchedule]);
      message.success('Schedule added successfully');
      setIsModalOpen(false);
      form.resetFields();
    } catch (err: any) {
      message.error(err.message || 'Failed to add schedule');
    } finally {
      setLoading(false);
    }
  };

  const days = [
    { key: 'Day 1', label: 'Day 1' },
    { key: 'Day 2', label: 'Day 2' },
    { key: 'Day 3', label: 'Day 3' }
  ];

  if (viewMode === 'LIST') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-heading text-3xl font-extrabold text-foreground leading-none">
            Schedule Builder
          </h2>
          <p className="text-on-surface-variant text-sm mt-1.5 mb-0">
            Select an event to manage its schedule and sessions.
          </p>
        </div>

        {eventsLoading ? (
           <div className="flex justify-center p-10"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
              <div 
                key={event.slug} 
                onClick={() => {
                  setSelectedEventSlug(event.slug);
                  setViewMode('BUILDER');
                }}
                className="bento-card group cursor-pointer overflow-hidden flex flex-col h-full bg-white border border-outline-variant/60 hover:border-primary/50 hover:shadow-lg transition-all"
              >
                <div className="h-32 bg-slate-100 relative overflow-hidden">
                  {event.thumbnail ? (
                    <img src={event.thumbnail} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <CalendarDays className="w-10 h-10 text-primary/40" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-slate-700 shadow-sm border border-slate-200/50">
                    {event.date}
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-heading font-bold text-lg text-foreground line-clamp-1 m-0">{event.title}</h3>
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-on-surface-variant font-medium">
                    <MapPin size={14} className="text-primary/70 shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <div className="mt-auto pt-5">
                    <Button variant="outline" size="sm" className="w-full">
                      Manage Schedule
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-surface-container-low border border-outline-variant/60 rounded-2xl">
            <Inbox className="w-12 h-12 text-on-surface-variant/40 mx-auto mb-4" />
            <h3 className="text-headline-md font-bold text-foreground m-0">No Events Found</h3>
            <p className="text-body-sm text-on-surface-variant mt-2">
              You haven't created or been assigned to manage any events yet.
            </p>
          </div>
        )}
      </div>
    );
  }

  const handleDeleteSchedule = async (id: number) => {
    if (!selectedEventSlug) return;
    try {
      await deleteSchedule(selectedEventSlug, id);
      setSchedules(schedules.filter(s => s.id !== id));
      message.success('Session deleted successfully');
    } catch (err: any) {
      message.error(err.message || 'Failed to delete session');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-[calc(100vh-140px)] space-y-4">
      {/* Builder Header Options */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-container-lowest p-6 border border-outline-variant rounded-2xl shadow-xs">
        <div>
          <button 
            onClick={() => setViewMode('LIST')}
            className="flex items-center gap-1.5 text-xs font-bold text-primary mb-2 hover:underline cursor-pointer border-none bg-transparent p-0"
          >
            ← Back to Events List
          </button>
          <h2 className="font-heading text-2xl font-extrabold text-foreground leading-none mb-1">Schedule Builder</h2>
          <div className="mt-1">
             <span className="text-on-surface-variant font-medium text-xs">Event: </span>
             <span className="font-bold text-foreground text-xs">{events.find(e => e.slug === selectedEventSlug)?.title}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="primary"
            size="md"
            icon={<PlusCircle size={16} />}
            onClick={() => setIsModalOpen(true)}
          >
            Add Session Segment
          </Button>
        </div>
      </div>

      {/* Workspace Agenda List & Timetable */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-outline-variant/60 pb-3">
          <h3 className="font-heading text-base font-bold text-foreground m-0">Event Itinerary & Agenda</h3>
          <span className="text-xs font-bold text-on-surface-variant bg-surface-container-low px-3 py-1 rounded-full">
            {schedules.length} {schedules.length === 1 ? 'Session' : 'Sessions'} Programmed
          </span>
        </div>

        {schedules.length === 0 ? (
          <div className="text-center py-16 bg-surface-container-low/40 border border-dashed border-outline-variant rounded-xl">
            <CalendarDays className="w-10 h-10 text-on-surface-variant/40 mx-auto mb-3" />
            <h4 className="font-heading font-bold text-foreground m-0">No Sessions Scheduled</h4>
            <p className="text-xs text-on-surface-variant mt-1 mb-4">Add keynotes, workshops, breaks, or presentations to build your event agenda.</p>
            <Button variant="primary" size="sm" icon={<PlusCircle size={14} />} onClick={() => setIsModalOpen(true)}>
              Add First Session
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {schedules.map((item) => (
              <div 
                key={item.id} 
                className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white border border-outline-variant/60 hover:border-primary/40 rounded-xl transition-all shadow-2xs gap-4 group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-28 shrink-0 bg-primary/5 text-primary p-2.5 rounded-lg text-center border border-primary/10">
                    <span className="block font-bold text-xs">{item.start_time}</span>
                    <span className="block text-[10px] text-on-surface-variant font-medium mt-0.5">to {item.end_time}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-foreground m-0">{item.title}</h4>
                      {item.date && (
                        <span className="text-[10px] bg-surface-container-low text-on-surface-variant font-bold px-2 py-0.5 rounded">
                          {item.date}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 mt-1.5 text-xs text-on-surface-variant font-medium">
                      {item.room && (
                        <span className="flex items-center gap-1 text-primary">
                          <MapPin size={12} /> {item.room}
                        </span>
                      )}
                      {item.speaker && (
                        <span className="flex items-center gap-1">
                          <Users size={12} /> Speaker: <strong className="text-foreground">{item.speaker}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="!text-destructive !border-destructive/30 hover:!bg-destructive/10" 
                    icon={<Trash2 size={14} />}
                    onClick={() => handleDeleteSchedule(item.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Add Session Modal */}
      <Modal
        title={<span className="font-heading font-bold text-lg">Add New Session Segment</span>}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <Form layout="vertical" form={form} onFinish={handleAddSchedule} className="mt-4 space-y-1">
          <Form.Item name="title" label="Session / Topic Title" rules={[{ required: true, message: 'Please enter a session title' }]}>
            <Input placeholder="e.g. Opening Keynote: Artificial Intelligence in 2026" className="rounded-xl h-11" />
          </Form.Item>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item name="date" label="Date" rules={[{ required: true, message: 'Please select date' }]}>
              <DatePicker className="w-full rounded-xl h-11" />
            </Form.Item>
            <Form.Item name="timeRange" label="Start & End Time" rules={[{ required: true, message: 'Please select time range' }]}>
              <TimePicker.RangePicker format="hh:mm A" use12Hours className="w-full rounded-xl h-11" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item name="room" label="Room / Stage Name" rules={[{ required: true, message: 'Please enter room name' }]}>
              <Input placeholder="e.g. Main Auditorium Stage" className="rounded-xl h-11" />
            </Form.Item>
            <Form.Item name="speaker" label="Speaker Name" rules={[{ required: true, message: 'Please enter speaker name' }]}>
              <Input placeholder="e.g. Dr. Arfat Rahman" className="rounded-xl h-11" />
            </Form.Item>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/40 mt-6">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" loading={loading}>Save Session</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
