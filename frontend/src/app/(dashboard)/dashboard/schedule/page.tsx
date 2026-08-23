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
  Inbox
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { fetchMyManagedEvents, fetchSchedules, createSchedule, ScheduleItem } from '@/lib/api';

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

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-140px)] overflow-hidden">
      {/* Builder Header Options */}
      <div className="pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <button 
            onClick={() => setViewMode('LIST')}
            className="flex items-center gap-1.5 text-xs font-bold text-primary mb-2 hover:underline cursor-pointer border-none bg-transparent p-0"
          >
            ← Back to Events
          </button>
          <h2 className="font-heading text-3xl font-extrabold text-foreground leading-none mb-1">Schedule Builder</h2>
          <div className="mt-1">
             <span className="text-on-surface-variant font-medium text-sm">Managing: </span>
             <span className="font-bold text-foreground text-sm">{events.find(e => e.slug === selectedEventSlug)?.title}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-surface-container-low p-1 rounded-lg border border-outline-variant/30">
          {days.map((day) => (
            <button
              key={day.key}
              onClick={() => setActiveDay(day.key)}
              className={`px-4 py-2 text-xs font-bold rounded-md transition-all cursor-pointer border-none bg-transparent ${
                activeDay === day.key
                  ? 'bg-white text-primary border border-outline-variant/30 shadow-sm font-extrabold'
                  : 'text-on-surface-variant hover:text-foreground'
              }`}
            >
              {day.label}
            </button>
          ))}
        </div>

        <Button 
          variant="primary"
          size="md"
          icon={<PlusCircle size={16} />}
          onClick={() => setIsModalOpen(true)}
        >
          Add Session
        </Button>
      </div>

      {/* Workspace Grid Area */}
      <div className="flex-grow flex overflow-hidden border border-outline-variant rounded-xl bg-surface-container-lowest shadow-sm">
        {/* Timeline main viewport */}
        <div className="flex-1 overflow-auto p-4 custom-scrollbar">
          <div className="min-w-[700px] border border-outline-variant/50 rounded-xl overflow-hidden bg-white">
            {/* Tracks Header */}
            <div className="grid grid-cols-4 bg-surface-container-low border-b border-outline-variant/80">
              <div className="h-12 flex items-center justify-center border-r border-outline-variant/50">
                <span className="font-bold text-[11px] uppercase tracking-wider text-on-surface-variant/80">Time</span>
              </div>
              <div className="h-12 flex items-center px-4 border-r border-outline-variant/50">
                <span className="font-bold text-xs text-primary flex items-center gap-2">
                  <Tv size={14} />
                  <span>Main Stage</span>
                </span>
              </div>
              <div className="h-12 flex items-center px-4 border-r border-outline-variant/50">
                <span className="font-bold text-xs text-primary flex items-center gap-2">
                  <Compass size={14} />
                  <span>Workshop Room A</span>
                </span>
              </div>
              <div className="h-12 flex items-center px-4">
                <span className="font-bold text-xs text-primary flex items-center gap-2">
                  <Users size={14} />
                  <span>Networking Hub</span>
                </span>
              </div>
            </div>

            {/* Time Slot Rows */}
            {/* Real DB Schedule Items */}
            {schedules.length === 0 && (
              <div className="p-8 text-center text-on-surface-variant font-medium">
                No schedules found. Click "Add Session" or the Plus icon to add one.
              </div>
            )}
            {schedules.map((item, idx) => (
              <div key={idx} className="grid grid-cols-4 border-b border-outline-variant/40">
                <div className="h-32 bg-surface-container-lowest/30 flex items-start justify-center pt-4 border-r border-outline-variant/50 font-bold text-xs text-on-surface-variant/70">
                  {item.start_time}
                </div>
                <div className="h-32 border-r border-outline-variant/50 p-2 relative bg-surface-container-lowest/10">
                  <div className="absolute inset-2 bg-primary-container/5 border-l-4 border-primary rounded-lg p-3 flex flex-col justify-between hover:shadow-md transition-shadow group cursor-pointer">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-xs text-foreground leading-tight m-0">{item.title}</h4>
                      <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase">{item.status}</span>
                    </div>
                    <p className="text-[10px] text-on-surface-variant/80 m-0">{item.speaker} • {item.start_time} - {item.end_time}</p>
                    <p className="text-[10px] font-bold text-primary m-0 mt-1">{item.room}</p>
                  </div>
                </div>
                <div 
                  className="h-32 border-r border-outline-variant/50 p-2 flex items-center justify-center bg-surface-container-low/20 hover:bg-primary-container/5 cursor-pointer transition-colors group"
                  onClick={() => setIsModalOpen(true)}
                >
                  <Plus size={16} className="text-on-surface-variant/40 group-hover:text-primary transition-colors" />
                </div>
                <div 
                  className="h-32 p-2 flex items-center justify-center bg-surface-container-low/20 hover:bg-primary-container/5 cursor-pointer transition-colors group"
                  onClick={() => setIsModalOpen(true)}
                >
                  <Plus size={16} className="text-on-surface-variant/40 group-hover:text-primary transition-colors" />
                </div>
              </div>
            ))}



          </div>
        </div>
      </div>
      
      {/* Add Session Modal */}
      <Modal
        title={<span className="font-heading font-bold text-lg">Add New Session</span>}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <Form layout="vertical" form={form} onFinish={handleAddSchedule} className="mt-4">
          <Form.Item name="title" label="Session/Segment Name" rules={[{ required: true, message: 'Please enter a title' }]}>
            <Input placeholder="e.g. Opening Keynote" />
          </Form.Item>
          
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="date" label="Date" rules={[{ required: true, message: 'Please select date' }]}>
              <DatePicker className="w-full" />
            </Form.Item>
            <Form.Item name="timeRange" label="Start & End Time" rules={[{ required: true, message: 'Please select time range' }]}>
              <TimePicker.RangePicker format="hh:mm A" use12Hours className="w-full" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="room" label="Room Number/Name" rules={[{ required: true, message: 'Please enter room' }]}>
              <Input placeholder="e.g. Main Stage" />
            </Form.Item>
            <Form.Item name="speaker" label="Speaker Name" rules={[{ required: true, message: 'Please enter speaker' }]}>
              <Input placeholder="e.g. Sarah Jenkins" />
            </Form.Item>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" loading={loading}>Save Session</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

