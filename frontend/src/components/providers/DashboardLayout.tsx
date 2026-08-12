'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Typography, Avatar, Dropdown, Button, message } from 'antd';
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
  Scan,
  Award,
  Activity,
  DollarSign,
  Globe
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const { Text } = Typography;

interface NavItem {
  key: string;
  label: string;
  icon: React.ElementType;
  href: string;
}

// Host Navigation
const hostNavItems: NavItem[] = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard, href: '/dashboard' },
  { key: 'attendees', label: 'Attendees', icon: Users, href: '/dashboard/attendees' },
  { key: 'scanner', label: 'QR Scanner', icon: Scan, href: '/dashboard/scanner' },
  // { key: 'schedule', label: 'Schedule', icon: CalendarDays, href: '/dashboard/schedule' },
  { key: 'account', label: 'My Account', icon: Users, href: '/dashboard/account' },
  // { key: 'settings', label: 'Event Settings', icon: Settings, href: '/dashboard/settings' },
];

// User Navigation
const userNavItems: NavItem[] = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard, href: '/dashboard/user' },
  { key: 'schedule', label: 'My Schedule', icon: CalendarDays, href: '/dashboard/user/schedule' },
  { key: 'my-tickets', label: 'My Tickets', icon: CalendarDays, href: '/dashboard/tickets' },
  { key: 'certificates', label: 'Certificates', icon: Award, href: '/dashboard/user/certificates' },
  { key: 'account', label: 'My Account', icon: Users, href: '/dashboard/account' },
];

// Super Admin Navigation
const superAdminNavItems: NavItem[] = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard, href: '/dashboard/admin' },
  { key: 'accounts', label: 'Accounts', icon: Users, href: '/dashboard/admin/accounts' },
  { key: 'events', label: 'Events Directory', icon: Globe, href: '/dashboard/admin/events' },
  { key: 'finance', label: 'Finance Operations', icon: DollarSign, href: '/dashboard/admin/finance' },
  { key: 'infrastructure', label: 'System Health', icon: Activity, href: '/dashboard/admin/infrastructure' },
  { key: 'account', label: 'My Account', icon: Users, href: '/dashboard/account' },
  { key: 'settings', label: 'Platform Settings', icon: Settings, href: '/dashboard/admin/settings' },
];

// Admin Navigation
const adminNavItems: NavItem[] = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard, href: '/dashboard/admin' },
  { key: 'accounts', label: 'Accounts', icon: Users, href: '/dashboard/admin/accounts' },
  { key: 'events', label: 'Events Directory', icon: Globe, href: '/dashboard/admin/events' },
  { key: 'finance', label: 'Finance Operations', icon: DollarSign, href: '/dashboard/admin/finance' },
  { key: 'account', label: 'My Account', icon: Users, href: '/dashboard/account' },
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

  const profileMenuItems: MenuProps['items'] = [
    { key: 'account', label: 'My Account', onClick: () => router.push('/dashboard/account') },
    { type: 'divider' },
    { key: 'logout', label: 'Sign Out', danger: true, onClick: async () => { await logout(); router.push('/sign-in'); } },
  ];

  const [hasScannerAccess, setHasScannerAccess] = useState(false);

  useEffect(() => {
    async function checkScannerAccess() {
      if (!user) return;
      try {
        const res = await fetch('/api/v1/events');
        if (res.ok) {
          const data = await res.json();
          const isScanner = data.some((e: any) => e.is_team_member);
          setHasScannerAccess(isScanner);
        }
      } catch (err) {
        console.error('Error checking scanner access', err);
      }
    }
    checkScannerAccess();
  }, [user]);

  // Pick Nav Items based on user role
  const getNavItems = () => {
    if (user?.role === 'SUPER_ADMIN') return superAdminNavItems;
    if (user?.role === 'ADMIN') return adminNavItems;
    if (user?.role === 'USER') {
      const items = [...userNavItems];
      if (hasScannerAccess && !items.some(item => item.key === 'scanner')) {
        items.splice(1, 0, { key: 'scanner', label: 'QR Scanner', icon: Scan, href: '/dashboard/scanner' });
      }
      return items;
    }
    return hostNavItems; // Default to host (ORGANIZER)
  };

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'SUPER_ADMIN':
        return 'Super Admin';
      case 'ADMIN':
        return 'Admin';
      case 'USER':
        return 'User';
      case 'ORGANIZER':
        return 'Event Organizer';
      default:
        return 'Guest';
    }
  };

  const currentNavItems = getNavItems();
  const canCreateEvent = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' || user?.role === 'ORGANIZER';

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
            <p className="font-sans text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
              {user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN'
                ? 'Admin Portal'
                : user?.role === 'USER'
                ? 'User Portal'
                : 'Organizer Portal'}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {currentNavItems.map((item) => {
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
          {canCreateEvent && (
            <button
              onClick={() => router.push('/dashboard/events/create')}
              className="w-full bg-primary text-white font-bold py-3 rounded-lg mb-4 hover:opacity-90 transition-opacity flex items-center justify-center gap-2 active:scale-95 duration-100 border-none cursor-pointer"
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
            onClick={async () => { await logout(); router.push('/sign-in'); }}
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
              {/* Contextual actions can be injected here by specific pages in the future */}
            </div>

            <div className="flex items-center gap-3 pl-4 border-l border-outline-variant">
              <div className="text-right hidden xl:block">
                <p className="font-bold text-xs text-foreground leading-none">{user?.name || 'Sarah Jenkins'}</p>
                <p className="text-[10px] text-on-surface-variant">{getRoleLabel()}</p>
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
    </div>
  );
}
