'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Moon, Sun, LogOut } from 'lucide-react';
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

interface Breadcrumb {
  label: string;
  href?: string;
}

function getBreadcrumbs(pathname: string): Breadcrumb[] {
  const segments = pathname.split('/').filter(Boolean);
  const crumbs: Breadcrumb[] = [];

  const labelMap: Record<string, string> = {
    dashboard: 'Dashboard',
    forms: 'Forms',
    settings: 'Settings',
    new: 'New Form',
    edit: 'Edit',
    results: 'Results',
    share: 'Share',
    theme: 'Theme',
    logic: 'Logic',
    preview: 'Preview',
  };

  let path = '';
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    path += `/${segment}`;

    // Skip UUID-like segments in breadcrumb display but include in path
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        segment
      );

    if (isUuid) {
      crumbs.push({ label: 'Form', href: path });
    } else {
      const label = labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      const isLast = i === segments.length - 1;
      crumbs.push({
        label,
        href: isLast ? undefined : path,
      });
    }
  }

  return crumbs;
}

export function Topbar() {
  const pathname = usePathname();
  const { user } = useUser();
  const breadcrumbs = getBreadcrumbs(pathname);

  const userName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'User';

  const userEmail = user?.email || '';

  const handleSignOut = async () => {
    await signOut();
  };

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header
      className={cn(
        'flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6',
        'dark:border-gray-800 dark:bg-gray-950'
      )}
    >
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5">
        {/* Spacer for mobile hamburger */}
        <div className="w-10 lg:hidden" />
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gray-400 dark:text-gray-500" />
            )}
            {crumb.href ? (
              <Link
                href={crumb.href}
                className="text-sm text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {crumb.label}
              </span>
            )}
          </React.Fragment>
        ))}
      </nav>

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        {/* Dark mode toggle */}
        <button
          type="button"
          onClick={toggleDarkMode}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors duration-150',
            'hover:bg-gray-100 hover:text-gray-700',
            'dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
          )}
          aria-label="Toggle dark mode"
        >
          <Sun className="h-4 w-4 dark:hidden" />
          <Moon className="hidden h-4 w-4 dark:block" />
        </button>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              'flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors duration-150',
              'hover:bg-gray-100 dark:hover:bg-gray-800'
            )}
          >
            <Avatar
              name={userName}
              src={user?.user_metadata?.avatar_url}
              size="sm"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {userName}
              </p>
              <p className="mt-0.5 font-normal text-gray-500 dark:text-gray-400">
                {userEmail}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => {
                window.location.href = '/settings';
              }}
            >
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleSignOut} destructive>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
