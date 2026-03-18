'use client';

import React, { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Eye, Monitor, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useForm } from '@/lib/hooks/use-form';

export default function PreviewPage() {
  const params = useParams();
  const formId = params.formId as string;
  const { form, loading } = useForm(formId);
  const [device, setDevice] = React.useState<'desktop' | 'mobile'>('desktop');

  const previewUrl = useMemo(() => {
    if (!form) return '';
    return `/f/${form.slug}`;
  }, [form]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-indigo-600" />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-gray-500">Form not found.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Preview toolbar */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Preview
          </span>
        </div>

        <div className="flex items-center gap-1 rounded-lg bg-gray-200 p-0.5 dark:bg-gray-800">
          <button
            onClick={() => setDevice('desktop')}
            className={cn(
              'rounded-md p-1.5 transition-colors',
              device === 'desktop'
                ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            )}
            aria-label="Desktop preview"
          >
            <Monitor className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDevice('mobile')}
            className={cn(
              'rounded-md p-1.5 transition-colors',
              device === 'mobile'
                ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            )}
            aria-label="Mobile preview"
          >
            <Smartphone className="h-4 w-4" />
          </button>
        </div>

        <a
          href={previewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
        >
          Open in new tab
        </a>
      </div>

      {/* Preview iframe */}
      <div className="flex flex-1 items-center justify-center bg-gray-100 p-6 dark:bg-gray-900">
        <div
          className={cn(
            'overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg transition-all duration-300 dark:border-gray-800',
            device === 'desktop' ? 'h-full w-full max-w-5xl' : 'h-[667px] w-[375px]'
          )}
        >
          <iframe
            src={previewUrl}
            className="h-full w-full border-none"
            title="Form preview"
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        </div>
      </div>
    </div>
  );
}
