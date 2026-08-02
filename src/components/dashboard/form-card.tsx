'use client';

import React, { useCallback, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MoreVertical,
  Pencil,
  Copy,
  Trash2,
  BarChart3,
  MessageSquare,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { deleteForm, duplicateForm } from '@/lib/actions/forms';
import { useToast } from '@/components/ui/toast';
import type { Form, FormStatus } from '@/lib/types/form';

const STATUS_MAP: Record<
  FormStatus,
  { label: string; variant: 'default' | 'success' | 'danger' | 'warning' | 'info' }
> = {
  draft: { label: 'Draft', variant: 'default' },
  published: { label: 'Published', variant: 'success' },
  closed: { label: 'Closed', variant: 'danger' },
  archived: { label: 'Archived', variant: 'warning' },
};

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSeconds < 60) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 5) return `${diffWeeks}w ago`;
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export interface FormCardProps {
  form: Form;
  onRefresh: () => void;
}

export function FormCard({ form, onRefresh }: FormCardProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const statusConfig = STATUS_MAP[form.status] || STATUS_MAP.draft;

  const handleEdit = useCallback(() => {
    router.push(`/forms/${form.id}/edit`);
  }, [router, form.id]);

  const handleDuplicate = useCallback(async () => {
    const result = await duplicateForm(form.id);
    if (result.error) {
      addToast({ type: 'error', title: 'Failed to duplicate form', description: result.error });
    } else {
      addToast({ type: 'success', title: 'Form duplicated' });
      onRefresh();
    }
  }, [form.id, addToast, onRefresh]);

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    const result = await deleteForm(form.id);
    if (result.error) {
      addToast({ type: 'error', title: 'Failed to delete form', description: result.error });
      setIsDeleting(false);
    } else {
      addToast({ type: 'success', title: 'Form deleted' });
      onRefresh();
    }
  }, [form.id, addToast, onRefresh]);

  const handleViewResults = useCallback(() => {
    router.push(`/forms/${form.id}/results`);
  }, [router, form.id]);

  return (
    <div
      className={cn(
        'group relative rounded-lg border border-border bg-card transition-all duration-150',
        'hover:border-border-hover hover:shadow-md',
        isDeleting && 'pointer-events-none opacity-50'
      )}
    >
      <Link href={`/forms/${form.id}/edit`} className="block px-5 pb-4 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-[15px] font-semibold tracking-[-0.01em] text-foreground">
              {form.title}
            </h3>
            {form.description && (
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-foreground-muted">
                {form.description}
              </p>
            )}
          </div>
          <Badge variant={statusConfig.variant} className="shrink-0">
            {statusConfig.label}
          </Badge>
        </div>

        <div className="mt-4 flex items-center gap-4 text-xs text-foreground-subtle">
          <span className="inline-flex items-center gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" />
            {form.response_count} {form.response_count === 1 ? 'response' : 'responses'}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {formatRelativeDate(form.created_at)}
          </span>
        </div>
      </Link>

      <div className="absolute right-3 top-3.5">
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-md text-foreground-subtle opacity-0 transition-all',
              'group-hover:opacity-100 hover:bg-surface-2 hover:text-foreground',
              'focus-visible:opacity-100 focus-visible:outline-none'
            )}
          >
            <MoreVertical className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={handleEdit}>
              <Pencil className="mr-2 h-3.5 w-3.5" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={handleDuplicate}>
              <Copy className="mr-2 h-3.5 w-3.5" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={handleViewResults}>
              <BarChart3 className="mr-2 h-3.5 w-3.5" />
              View Results
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleDelete} destructive>
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
