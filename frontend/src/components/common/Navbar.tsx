"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Events', href: '/events' },
  { label: 'Partners', href: '/partners' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, user, loading: isLoading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [currentHash, setCurrentHash] = useState('');

  const isDark = false;
  const settings = {
    platformName: "Somavesh",
    whiteLogoUrl: null,
    blackLogoUrl: null
  };

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });

    // Initial hash set
    if (typeof window !== 'undefined') {
      setCurrentHash(window.location.hash);
      const handleHashChange = () => {
        setCurrentHash(window.location.hash);
      };
      window.addEventListener('hashchange', handleHashChange);
      return () => {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('hashchange', handleHashChange);
      };
    }

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash) {
        setTimeout(() => {
          const el = document.querySelector(hash);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
      setCurrentHash(hash);
    }
  }, [pathname]);

  const handleNavClick = (href: string) => {
    setMenuOpen(false);

    if (href.startsWith('/#')) {
      if (pathname === '/') {
        const hash = href.replace('/', '');
        const el = document.querySelector(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', href);
        setCurrentHash(hash);
      } else {
        router.push(href);
      }
    } else {
      router.push(href);
    }
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/' && !currentHash;
    if (href.includes('#')) {
      const hash = href.split('#')[1];
      return pathname === '/' && currentHash === `#${hash}`;
    }
    return pathname?.startsWith(href);
  };

  const isDashboard = pathname?.startsWith('/dashboard');
  const isCompact = scrolled || isDashboard;

  return (
    <header
      id="navbar"
      className={`fixed top-0 left-0 right-0 z-[1000] transition-[padding,background-color,backdrop-filter] duration-300 ${isCompact ? 'navbar-glass py-3' : 'bg-transparent py-5'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between relative z-[101]">
        <Link
          href="/"
          className="flex items-center gap-2.5 group"
          aria-label={settings?.platformName || "Somavesh Home"}
        >
          {settings?.blackLogoUrl || settings?.whiteLogoUrl ? (
            isDark ? (
              <img src={settings.whiteLogoUrl || settings.blackLogoUrl || ""} alt={settings.platformName || "Somavesh"} className="h-9 w-auto object-contain" />
            ) : (
              <img src={settings.blackLogoUrl || settings.whiteLogoUrl || ""} alt={settings.platformName || "Somavesh"} className="h-9 w-auto object-contain" />
            )
          ) : (
            <div className="flex items-center gap-2">
              <img src="https://image.somavesh.com/SomaveshLogo.png" alt="Logo" className="h-8 w-auto" />
            </div>
          )}
        </Link>

        <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
          {navLinks.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={`relative px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 cursor-pointer ${isActive(href)
                ? '!text-black font-bold bg-transparent'
                : '!text-black/70 hover:!text-black hover:bg-black/5'
                }`}
            >
              {label}
              {isActive(href) && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-black" />
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {!isLoading && (
            isAuthenticated && user ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/dashboard" className="w-9 h-9 rounded-full bg-black/10 flex items-center justify-center text-black font-bold overflow-hidden border-2 border-transparent hover:border-black transition-colors">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name?.charAt(0) || 'U'
                  )}
                </Link>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Button variant="primary" size="sm" onClick={() => router.push('/sign-in')}>
                  Sign In
                </Button>
              </div>
            )
          )}

          <button
            onClick={() => setMenuOpen(prev => !prev)}
            aria-label="Toggle mobile menu"
            className="md:hidden w-9 h-9 rounded-md flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mounted && createPortal(
        <div className={`fixed inset-0 z-[1001] transition-opacity duration-300 ${menuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
          <div className={`absolute right-0 top-0 bottom-0 w-[280px] bg-[var(--bg-surface)] shadow-2xl transition-transform duration-300 transform ${menuOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
            <div className="p-5 flex items-center justify-between border-b border-[var(--neutral-border)]">
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5"
                aria-label={settings?.platformName || "Somavesh Home"}
              >
                {settings?.blackLogoUrl || settings?.whiteLogoUrl ? (
                  isDark ? (
                    <img src={settings.whiteLogoUrl || settings.blackLogoUrl || ""} alt={settings.platformName || "Somavesh"} className="h-8 w-auto object-contain" />
                  ) : (
                    <img src={settings.blackLogoUrl || settings.whiteLogoUrl || ""} alt={settings.platformName || "Somavesh"} className="h-8 w-auto object-contain" />
                  )
                ) : (
                  <div className="flex items-center gap-2">
                    <img src="https://image.somavesh.com/SomaveshLogo.png" alt="Logo" className="h-8 w-auto" />
                  </div>
                )}
              </Link>
              <button onClick={() => setMenuOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[var(--bg-elevated)] border border-[var(--neutral-border)] text-[var(--text-secondary)] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
              <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider px-3 mb-2 mt-2">Main Navigation</p>
              {navLinks.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={`w-full text-left px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150 cursor-pointer block ${isActive(href)
                    ? '!text-black font-bold bg-black/5'
                    : '!text-black/70 hover:!text-black hover:bg-black/5'
                    }`}
                >
                  {label}
                </Link>
              ))}

              {isAuthenticated && user && (
                <>
                  <div className="my-2 border-t border-[var(--neutral-border)]" />
                  <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider px-3 mb-2 mt-2">Dashboard</p>
                  {(user.role === 'SUPER_ADMIN' ? [
                    { href: "/dashboard", label: "Overview" },
                    { href: "/dashboard/users", label: "Users" },
                    { href: "/dashboard/organizer-applications", label: "Organizer Applications" },
                    { href: "/dashboard/events", label: "Events Directory" },
                    { href: "/dashboard/finance", label: "Finance Operations" },
                    { href: "/dashboard/infrastructure", label: "System Health" },
                    { href: "/dashboard/schedule", label: "My Schedule" },
                    { href: "/dashboard/certificates", label: "Certificates" },
                    { href: "/dashboard/profile", label: "Profile" },
                    { href: "/dashboard/partners-team", label: "Partners & Team" },
                    { href: "/dashboard/settings", label: "Platform Settings" },
                  ] : user.role === 'ADMIN' ? [
                    { href: "/dashboard", label: "Overview" },
                    { href: "/dashboard/users", label: "Users" },
                    { href: "/dashboard/organizer-applications", label: "Organizer Applications" },
                    { href: "/dashboard/events", label: "Events Directory" },
                    { href: "/dashboard/finance", label: "Finance Operations" },
                    { href: "/dashboard/schedule", label: "My Schedule" },
                    { href: "/dashboard/certificates", label: "Certificates" },
                    { href: "/dashboard/profile", label: "Profile" },
                  ] : user.role === 'USER' ? [
                    { href: "/dashboard", label: "Overview" },
                    { href: "/dashboard/events", label: "Events Directory" },
                    { href: "/dashboard/certificates", label: "Certificates" },
                    { href: "/dashboard/profile", label: "Profile" },
                  ] : [
                    { href: "/dashboard", label: "Overview" },
                    { href: "/dashboard/events", label: "Events Directory" },
                    { href: "/dashboard/schedule", label: "My Schedule" },
                    { href: "/dashboard/certificates", label: "Certificates" },
                    { href: "/dashboard/profile", label: "Profile" },
                  ]).map(({ label, href }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMenuOpen(false)}
                      className={`w-full text-left px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150 cursor-pointer block ${pathname === href
                        ? '!text-black font-bold bg-black/5'
                        : '!text-black/70 hover:!text-black hover:bg-black/5'
                        }`}
                    >
                      {label}
                    </Link>
                  ))}
                </>
              )}
            </div>

            <div className="p-4 border-t border-[var(--neutral-border)]">
              {!isLoading && isAuthenticated && user ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 mb-2 px-2">
                    <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center text-black font-bold overflow-hidden">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        user.name?.charAt(0) || 'U'
                      )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-bold text-[var(--text-primary)] truncate">{user.name}</p>
                      <p className="text-xs text-[var(--text-muted)] truncate">{user.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => { setMenuOpen(false); logout(); router.push('/sign-in'); }}
                    className="w-full"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    onClick={() => { setMenuOpen(false); router.push('/sign-in'); }}
                    className="w-full"
                  >
                    Log In
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => { setMenuOpen(false); router.push('/sign-up'); }}
                    className="w-full"
                  >
                    Register
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}
