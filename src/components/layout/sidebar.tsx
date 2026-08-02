'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useUser } from '@/lib/hooks/use-user';
import { signOut } from '@/lib/actions/auth';
import { Avatar } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    label: 'Forms',
    href: '/forms',
    icon: <FileText className="h-4 w-4" />,
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: <Settings className="h-4 w-4" />,
  },
];

function FormFlowLogo({ collapsed }: { collapsed?: boolean }) {
  return (
    <Link href="/dashboard" className="flex items-center gap-2.5">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary">
        <svg
          className="h-4 w-4 text-primary-foreground"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"
          />
        </svg>
      </div>
      {!collapsed && (
        <span className="text-[15px] font-semibold tracking-[-0.01em] text-white">FormFlow</span>
      )}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = useCallback(async () => {
    await signOut();
  }, []);

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const userName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'User';

  const userEmail = user?.email || '';

  const sidebarContent = (
    <div className="flex h-full flex-col bg-[#0A0A0A] dark:bg-[#0A0A0A]">
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-white/10 px-4">
        <FormFlowLogo />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 px-2 py-3">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'nav-item group flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all',
                active
                  ? 'bg-white/10 text-white'
                  : 'text-white/60 hover:bg-white/5 hover:text-white/90'
              )}
            >
              <span className={cn('transition-colors', active ? 'text-primary' : 'text-white/50 group-hover:text-white/70')}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-white/10 p-2">
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              'flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left transition-colors',
              'hover:bg-white/5'
            )}
          >
            <Avatar
              name={userName}
              src={user?.user_metadata?.avatar_url}
              size="sm"
            />
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-white/90">{userName}</p>
              <p className="truncate text-[11px] text-white/50">{userEmail}</p>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-56">
            <DropdownMenuLabel>
              <span className="block truncate">{userEmail}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleSignOut} destructive>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-3.5 z-40 flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-[#0A0A0A] text-white/70 lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 border-r border-white/10 transition-transform duration-200 ease-in-out lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="absolute right-3 top-3.5 flex h-8 w-8 items-center justify-center rounded-md text-white/50 hover:text-white/80"
          aria-label="Close navigation"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-white/10 bg-[#0A0A0A] lg:block">
        {sidebarContent}
      </aside>
    </>
  );
}
