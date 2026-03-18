'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import {
  Blocks,
  GitBranch,
  Palette,
  Eye,
  Share2,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useForm } from '@/lib/hooks/use-form';
import { BuilderProvider } from '@/lib/store/builder-context';

const TABS = [
  { label: 'Build', href: 'edit', icon: Blocks },
  { label: 'Logic', href: 'logic', icon: GitBranch },
  { label: 'Theme', href: 'theme', icon: Palette },
  { label: 'Preview', href: 'preview', icon: Eye },
  { label: 'Share', href: 'share', icon: Share2 },
  { label: 'Results', href: 'results', icon: BarChart3 },
] as const;

export default function FormLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const formId = params.formId as string;
  const { form, loading } = useForm(formId);

  const activeTab = useMemo(() => {
    const segments = pathname.split('/');
    return segments[segments.length - 1] || 'edit';
  }, [pathname]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-indigo-600" />
          <p className="text-sm text-gray-500">Loading form...</p>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Form not found
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            The form you are looking for does not exist or you do not have access
            to it.
          </p>
          <Link
            href="/dashboard"
            className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <BuilderProvider defaultSelectedId={form.questions?.[0]?.id || null}>
      <div className="flex h-screen flex-col overflow-hidden bg-white dark:bg-gray-950">
        {/* Tab navigation */}
        <div className="flex items-center border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-950">
          {/* Breadcrumb */}
          <div className="mr-6 flex items-center gap-2 py-3">
            <Link
              href="/dashboard"
              className="text-xs text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              Forms
            </Link>
            <span className="text-xs text-gray-300 dark:text-gray-600">
              /
            </span>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {form.title}
            </span>
          </div>

          {/* Tab links */}
          <nav className="flex items-center gap-1">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.href;
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.href}
                  href={`/forms/${formId}/${tab.href}`}
                  className={cn(
                    'relative flex items-center gap-1.5 px-3 py-3 text-sm font-medium transition-colors',
                    isActive
                      ? 'text-gray-900 dark:text-gray-100'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-hidden">{children}</div>
      </div>
    </BuilderProvider>
  );
}
