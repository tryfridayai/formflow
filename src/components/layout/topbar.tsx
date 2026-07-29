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
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-6">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
        <div className="w-10 lg:hidden" />
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <ChevronRight className="h-3.5 w-3.5 text-foreground-subtle" />
            )}
            {crumb.href ? (
              <Link
                href={crumb.href}
                className="text-foreground-muted transition-colors hover:text-foreground"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="font-medium text-foreground">{crumb.label}</span>
            )}
          </React.Fragment>
        ))}
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleDarkMode}
          className="flex h-8 w-8 items-center justify-center rounded-md text-foreground-muted transition-colors hover:bg-surface-2 hover:text-foreground"
          aria-label="Toggle theme"
        >
          <Sun className="h-4 w-4 dark:hidden" />
          <Moon className="hidden h-4 w-4 dark:block" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-surface-2"
          >
            <Avatar
              name={userName}
              src={user?.user_metadata?.avatar_url}
              size="sm"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <p className="font-medium text-foreground">{userName}</p>
              <p className="mt-0.5 text-xs text-foreground-muted">{userEmail}</p>
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
