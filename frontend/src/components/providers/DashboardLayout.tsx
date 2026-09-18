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
  Globe,
  FileText
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const { Text } = Typography;

interface NavItem {
  key: string;
  label: string;
  icon: React.ElementType;
  href: string;
}

// Organizer Navigation
const organizerNavItems: NavItem[] = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard, href: '/dashboard' },
  { key: 'events', label: 'Events Directory', icon: Globe, href: '/dashboard/events' },
  { key: 'schedule', label: 'My Schedule', icon: CalendarDays, href: '/dashboard/schedule' },
  { key: 'certificates', label: 'Certificates', icon: Award, href: '/dashboard/certificates' },
  { key: 'profile', label: 'Profile', icon: Users, href: '/dashboard/profile' },
];

// User Navigation
const userNavItems: NavItem[] = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard, href: '/dashboard' },
  { key: 'events', label: 'Events Directory', icon: Globe, href: '/dashboard/events' },
  { key: 'certificates', label: 'Certificates', icon: Award, href: '/dashboard/certificates' },
  { key: 'profile', label: 'Profile', icon: Users, href: '/dashboard/profile' },
];

// Super Admin Navigation
const superAdminNavItems: NavItem[] = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard, href: '/dashboard' },
  { key: 'accounts', label: 'Users', icon: Users, href: '/dashboard/users' },
  { key: 'organizer-applications', label: 'Organizer Applications', icon: FileText, href: '/dashboard/organizer-applications' },
  { key: 'events', label: 'Events Directory', icon: Globe, href: '/dashboard/events' },
  { key: 'finance', label: 'Finance Operations', icon: DollarSign, href: '/dashboard/finance' },
  { key: 'infrastructure', label: 'System Health', icon: Activity, href: '/dashboard/infrastructure' },
  { key: 'schedule', label: 'My Schedule', icon: CalendarDays, href: '/dashboard/schedule' },
  { key: 'certificates', label: 'Certificates', icon: Award, href: '/dashboard/certificates' },
  { key: 'profile', label: 'Profile', icon: Users, href: '/dashboard/profile' },
  { key: 'partners-team', label: 'Partners & Team', icon: Users, href: '/dashboard/partners-team' },
  { key: 'settings', label: 'Platform Settings', icon: Settings, href: '/dashboard/settings' },
];

// Admin Navigation
const adminNavItems: NavItem[] = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard, href: '/dashboard' },
  { key: 'accounts', label: 'Users', icon: Users, href: '/dashboard/users' },
  { key: 'organizer-applications', label: 'Organizer Applications', icon: FileText, href: '/dashboard/organizer-applications' },
  { key: 'events', label: 'Events Directory', icon: Globe, href: '/dashboard/events' },
  { key: 'finance', label: 'Finance Operations', icon: DollarSign, href: '/dashboard/finance' },
  { key: 'schedule', label: 'My Schedule', icon: CalendarDays, href: '/dashboard/schedule' },
  { key: 'certificates', label: 'Certificates', icon: Award, href: '/dashboard/certificates' },
  { key: 'profile', label: 'Profile', icon: Users, href: '/dashboard/profile' },
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
  const { user, loading, logout } = useAuth();

  const profileMenuItems: MenuProps['items'] = [
    { key: 'profile', label: 'Profile', onClick: () => router.push('/dashboard/profile') },
    { type: 'divider' },
    { key: 'logout', label: 'Sign Out', danger: true, onClick: async () => { await logout(); router.push('/sign-in'); } },
  ];

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hasScannerAccess, setHasScannerAccess] = useState(false);

  useEffect(() => {
    async function checkScannerAccess() {
      if (!user) return;
      try {
        const res = await fetch('/api/v1/events');
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : (data.data || []);
          const isScanner = list.some((e: any) => e.is_team_member);
          setHasScannerAccess(isScanner);
        }
      } catch (err) {
        console.error('Error checking scanner access', err);
      }
    }
    checkScannerAccess();
  }, [user]);

  // Client-side role-based routing guard
  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push('/sign-in');
      return;
    }

    // Redirect legacy overview subroutes to unified dashboard
    if (pathname === '/dashboard/admin' || pathname === '/dashboard/user') {
      router.push('/dashboard');
      return;
    }

    const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'ADMIN';
    const isUser = user.role === 'USER';
    const isOrganizer = user.role === 'ORGANIZER';

    // Guard organizer routes
    if (
      (pathname.startsWith('/dashboard/events/create') ||
        pathname.startsWith('/dashboard/attendees')) &&
      !isOrganizer && !isAdmin
    ) {
      router.push('/dashboard');
    }

    // Guard admin routes
    const adminRoutes = ['/dashboard/users', '/dashboard/finance', '/dashboard/infrastructure', '/dashboard/settings', '/dashboard/organizer-applications', '/dashboard/partners-team'];
    if (adminRoutes.some(route => pathname.startsWith(route)) && !isAdmin) {
      router.push('/dashboard');
      return;
    }

    // Guard super admin routes
    const superAdminRoutes = ['/dashboard/settings', '/dashboard/partners-team'];
    if (superAdminRoutes.some(route => pathname.startsWith(route)) && user.role !== 'SUPER_ADMIN') {
      router.push('/dashboard');
      return;
    }
  }, [user, loading, pathname, router]);



  // Pick Nav Items based on user role
  const getNavItems = () => {
    if (user?.role === 'SUPER_ADMIN') return superAdminNavItems;
    if (user?.role === 'ADMIN') return adminNavItems;
    if (user?.role === 'USER') {
      return userNavItems;
    }
    return organizerNavItems; // Default to organizer (ORGANIZER)
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
  if (loading || !user) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const canCreateEvent = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' || user?.role === 'ORGANIZER';

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-background text-foreground relative">

      {/* Mobile Sidebar Overlay */}
      <div
        className={`lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar - 280px fixed width */}
      <aside className={`w-[280px] glass-panel border-r border-outline-variant flex flex-col fixed top-[72px] bottom-0 left-0 z-50 transition-transform duration-300 transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} bg-background`}>
        {/* Brand Area (Logo Removed) */}

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-4 custom-scrollbar">
          {currentNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all duration-200 active:scale-95 ${isActive
                  ? 'bg-gradient-to-r from-primary/10 to-transparent text-[#2BA361] border-l-2 border-primary shadow-[inset_2px_0_10px_rgba(43,163,97,0.05)]'
                  : 'text-[#1d1d1f] hover:bg-surface-container-high hover:text-black'
                  }`}
              >
                <Icon size={18} className={isActive ? 'text-[#2BA361]' : 'text-[#1d1d1f]'} />
                <span className={isActive ? 'text-[#2BA361]' : 'text-[#1d1d1f]'}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="mt-auto space-y-1 p-4 border-t border-outline-variant">
          {canCreateEvent && (
            <button
              onClick={() => { setSidebarOpen(false); router.push('/dashboard/events/create'); }}
              className="w-full bg-primary text-white font-bold py-3 rounded-lg mb-4 hover:opacity-90 transition-opacity flex items-center justify-center gap-2 active:scale-95 duration-100 border-none cursor-pointer"
            >
              <Plus size={18} />
              <span>Create New Event</span>
            </button>
          )}

          {/* <Link href="/dashboard/support" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 text-on-surface-variant hover:bg-surface-container-high hover:text-foreground rounded-lg px-4 py-2 text-sm font-bold transition-colors">
            <HelpCircle size={18} />
            <span>Support</span>
          </Link> */}

          <button
            onClick={async () => { setSidebarOpen(false); await logout(); router.push('/sign-in'); }}
            className="w-full flex items-center gap-3 text-on-surface-variant hover:bg-surface-container-high hover:text-error rounded-lg px-4 py-2 text-sm font-bold transition-colors border-0 bg-transparent text-left cursor-pointer"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>

          {/* User Profile */}
          {/* <div className="mt-4 pt-4 border-t border-outline-variant flex items-center gap-3 px-2">
            <Avatar size={40} className="bg-primary flex-shrink-0 flex items-center justify-center font-bold text-white">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <Text className="font-bold text-sm text-foreground m-0 truncate leading-tight">
                {user?.name || 'User'}
              </Text>
              <Text className="text-xs text-on-surface-variant m-0 truncate">
                {getRoleLabel()}
              </Text>
            </div>
          </div> */}
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 lg:ml-[280px] flex flex-col w-full pt-[72px]">
        {/* Main Content Area */}
        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
