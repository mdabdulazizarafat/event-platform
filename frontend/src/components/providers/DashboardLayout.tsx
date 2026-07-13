'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Typography, Avatar, Dropdown, Button, Modal, Form, Input, InputNumber, message } from 'antd';
import type { MenuProps } from 'antd';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Settings,
  HelpCircle,
  LogOut,
  ChevronDown,
  Armchair,
  Search,
  Bell,
  Plus,
  Tv,
  UserPlus,
  Scan
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const { Text } = Typography;

interface NavItem {
  key: string;
  label: string;
  icon: React.ElementType;
  href: string;
}

const navItems: NavItem[] = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard, href: '/dashboard' },
  { key: 'my-tickets', label: 'My Tickets', icon: CalendarDays, href: '/dashboard/tickets' },
  { key: 'attendees', label: 'Attendees', icon: Users, href: '/dashboard/attendees' },
  { key: 'scanner', label: 'QR Scanner', icon: Scan, href: '/dashboard/scanner' },
  { key: 'schedule', label: 'Schedule', icon: CalendarDays, href: '/dashboard/schedule' },
  { key: 'settings', label: 'Settings', icon: Settings, href: '/dashboard/settings' },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  // Create Event Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form] = Form.useForm();

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    form.setFieldsValue({ slug: slugify(title) });
  };

  const handleCreateEvent = async (values: any) => {
    setCreating(true);
    try {
      const res = await fetch('/api/v1/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        message.success('Event created successfully!');
        setIsCreateModalOpen(false);
        form.resetFields();
        window.location.reload();
      } else {
        const data = await res.json();
        message.error(data.error || 'Failed to create event.');
      }
    } catch (err) {
      message.error('Network error. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const profileMenuItems: MenuProps['items'] = [
    { key: 'settings', label: 'Settings', onClick: () => router.push('/dashboard/settings') },
    { type: 'divider' },
    { key: 'logout', label: 'Sign Out', danger: true, onClick: async () => { await logout(); router.push('/login'); } },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar - 280px fixed width */}
      <aside className="w-[280px] bg-surface-container-lowest border-r border-outline-variant flex flex-col fixed inset-y-0 left-0 z-30 p-4">
        {/* Brand */}
        <div className="mb-8 px-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#4f46e5] flex items-center justify-center text-white">
            <Armchair size={20} />
          </div>
          <div>
            <h1 className="font-heading text-lg font-bold text-primary leading-tight">Rong Plan</h1>
            <p className="font-sans text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Event Portal</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {navItems
            .filter((item) => {
              if (user?.role === 'PARTICIPANT') {
                return ['my-tickets', 'settings'].includes(item.key);
              }
              return ['overview', 'attendees', 'scanner', 'schedule', 'settings'].includes(item.key);
            })
            .map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-primary-container text-white'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-foreground'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
        </nav>

        {/* Sidebar Footer */}
        <div className="mt-auto space-y-1 pt-4 border-t border-outline-variant">
          {user?.role !== 'PARTICIPANT' && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full bg-primary text-white font-bold py-3 rounded-lg mb-4 hover:opacity-90 transition-opacity flex items-center justify-center gap-2 active:scale-95 duration-100"
            >
              <Plus size={18} />
              <span>Create New Event</span>
            </button>
          )}
          
          <Link href="#" className="flex items-center gap-3 text-on-surface-variant hover:bg-surface-container-high hover:text-foreground rounded-lg px-4 py-2 text-sm font-bold transition-colors">
            <HelpCircle size={18} />
            <span>Support</span>
          </Link>

          <button 
            onClick={async () => { await logout(); router.push('/login'); }}
            className="w-full flex items-center gap-3 text-on-surface-variant hover:bg-surface-container-high hover:text-error rounded-lg px-4 py-2 text-sm font-bold transition-colors border-0 bg-transparent text-left cursor-pointer"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 ml-[280px] flex flex-col">
        {/* TopNavBar */}
        <header className="sticky top-0 right-0 h-16 bg-surface border-b border-outline-variant flex justify-between items-center px-8 z-40">
          <div className="flex items-center gap-4 bg-surface-container-low px-4 py-2 rounded-full w-96 border border-outline-variant">
            <Search size={16} className="text-on-surface-variant" />
            <input 
              type="text" 
              placeholder="Search events, participants..." 
              className="bg-transparent border-none outline-none focus:ring-0 text-xs w-full placeholder:text-on-surface-variant"
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <button className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:bg-surface-container rounded-full transition-colors relative">
                <Bell size={18} />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-error rounded-full"></span>
              </button>
              <button className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:bg-surface-container rounded-full transition-colors">
                <HelpCircle size={18} />
              </button>
            </div>

            <div className="h-8 w-px bg-outline-variant"></div>

            <div className="flex items-center gap-3">
              <button className="text-primary font-bold text-sm hover:underline border-none bg-transparent cursor-pointer">Go Live</button>
              <button className="bg-primary-container text-white px-4 py-2 rounded-lg font-bold text-xs hover:opacity-90 active:scale-95 transition-all">Invite Team</button>
            </div>

            <div className="flex items-center gap-3 pl-4 border-l border-outline-variant">
              <div className="text-right hidden xl:block">
                <p className="font-bold text-xs text-foreground leading-none">{user?.name || 'Sarah Jenkins'}</p>
                <p className="text-[10px] text-on-surface-variant">Senior Organizer</p>
              </div>
              <Avatar size={40} src={user?.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAlMARQHkkZDSofG5XDsxX4aoSLB9g672BvKKBaOdTA174cYGxaQuohJdP6O-srf5yH90ezmTxXpDo8pLs86dLw8HO2fSZEL_xzjCwtTtuNolAxpvERhqCd4FBKPnLI2BU44lXcyU6TvdWbXuPoTr_293IRYAJUsHeLkERJUbYzQQ3OvFuVQ23cq5ljivpz4UiOrF7bwHx_GvjgxMiE9gVYksCV9Arlu-wlbCDn-1PMcF3-w_nrjNCuu8ng1yHBieQ7ukqalKN3Kg'} className="border-2 border-primary-container object-cover" />
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>

      {/* Create Event Modal */}
      <Modal
        title={<span className="font-heading font-extrabold text-lg text-foreground">Create New Event</span>}
        open={isCreateModalOpen}
        onCancel={() => { setIsCreateModalOpen(false); form.resetFields(); }}
        footer={null}
        destroyOnClose
        width={520}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateEvent}
          className="pt-4"
          requiredMark={false}
        >
          <Form.Item
            label={<span className="font-bold text-on-surface-variant text-xs">Event Title</span>}
            name="title"
            rules={[{ required: true, message: 'Please enter an event title' }]}
          >
            <Input placeholder="e.g. Global Tech Summit 2026" className="h-10 rounded-lg" onChange={handleTitleChange} />
          </Form.Item>

          <Form.Item
            label={<span className="font-bold text-on-surface-variant text-xs">URL Slug</span>}
            name="slug"
            rules={[{ required: true, message: 'Please enter a URL slug' }]}
          >
            <Input placeholder="e.g. global-tech-summit-2026" className="h-10 rounded-lg font-mono text-xs" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label={<span className="font-bold text-on-surface-variant text-xs">Date</span>}
              name="date"
              rules={[{ required: true, message: 'Required' }]}
            >
              <Input type="date" className="h-10 rounded-lg" />
            </Form.Item>

            <Form.Item
              label={<span className="font-bold text-on-surface-variant text-xs">Time</span>}
              name="time"
              rules={[{ required: true, message: 'Required' }]}
            >
              <Input type="time" className="h-10 rounded-lg" />
            </Form.Item>
          </div>

          <Form.Item
            label={<span className="font-bold text-on-surface-variant text-xs">Location / Venue</span>}
            name="location"
            rules={[{ required: true, message: 'Please enter a location' }]}
          >
            <Input placeholder="e.g. Convention Center North, SF" className="h-10 rounded-lg" />
          </Form.Item>

          <Form.Item
            label={<span className="font-bold text-on-surface-variant text-xs">Capacity</span>}
            name="capacity"
            rules={[{ required: true, message: 'Please set a capacity' }]}
          >
            <InputNumber min={1} max={100000} placeholder="500" className="w-full h-10 rounded-lg" />
          </Form.Item>

          <div className="flex justify-end gap-3 pt-2 border-t border-outline-variant/30">
            <Button onClick={() => { setIsCreateModalOpen(false); form.resetFields(); }} className="font-bold">
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={creating} className="bg-[#3525cd] font-bold">
              Create Event
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
