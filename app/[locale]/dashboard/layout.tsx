"use client";

import { useEffect, useState } from 'react';
import { useRouter, Link, usePathname } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { ThemeToggle } from '@/components/ThemeToggle';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { LogOut, User as UserIcon, Calendar, Users, Clock, ClipboardList } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const tDash = useTranslations('Dashboard');
  const tProfile = useTranslations('Profile');
  const router = useRouter();
  const pathname = usePathname();

  const [profile, setProfile] = useState<{ name: string; avatarUrl?: string | null } | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/admin/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile({ name: data.name, avatarUrl: data.avatarUrl });
      }
    } catch (err) {
      console.error('Failed to load profile in layout:', err);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const adminName = profile?.name || 'Admin';
  const initialLetter = adminName.charAt(0).toUpperCase();

  const navItems = [
    {
      href: '/dashboard',
      label: tDash('events') || 'Events',
      icon: Calendar,
      exact: true,
    },
    {
      href: '/dashboard/guests',
      label: tDash('manageGuestsNav') || 'Manage Guests',
      icon: Users,
      exact: false,
    },
    {
      href: '/dashboard/program',
      label: tDash('manageProgramNav') || 'Manage Program',
      icon: Clock,
      exact: false,
    },
    {
      href: '/dashboard/rsvps',
      label: tDash('rsvpListNav') || 'RSVPs',
      icon: ClipboardList,
      exact: false,
    },
    {
      href: '/dashboard/profile',
      label: tProfile('title') || 'Profile',
      icon: UserIcon,
      exact: false,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Top Header Navigation */}
      <header className="border-b bg-card text-card-foreground shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-xl font-bold font-serif text-primary flex items-center gap-2">
              <span>E-Invitation Admin</span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-sm font-medium transition-colors px-3 py-2 rounded-lg flex items-center gap-2 ${
                      isActive
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Admin Avatar & Profile Link */}
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-2.5 p-1 rounded-full hover:bg-muted/50 transition-colors group cursor-pointer"
              title={tProfile('title')}
            >
              <div className="w-9 h-9 rounded-full overflow-hidden bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0 shadow-sm group-hover:border-primary transition-colors">
                {profile?.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={adminName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-bold text-sm text-primary">{initialLetter}</span>
                )}
              </div>
              <span className="hidden sm:inline text-sm font-medium text-foreground group-hover:text-primary transition-colors max-w-[120px] truncate">
                {adminName}
              </span>
            </Link>

            <div className="h-4 w-px bg-border hidden sm:block" />

            <ThemeToggle />

            <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout" className="text-muted-foreground hover:text-destructive">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Links */}
        <div className="lg:hidden border-t bg-card/60 backdrop-blur-sm px-4 py-2 flex items-center gap-2 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-xs font-medium transition-colors px-3 py-1.5 rounded-lg flex items-center gap-1.5 shrink-0 ${
                  isActive
                    ? 'bg-primary/15 text-primary font-bold'
                    : 'text-muted-foreground hover:text-foreground bg-muted/30'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
