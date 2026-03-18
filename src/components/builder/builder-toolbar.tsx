'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, Cloud, Eye, Globe, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBuilderContext } from '@/lib/store/builder-context';
import { updateForm, publishForm, closeForm } from '@/lib/actions/forms';
import type { Form } from '@/lib/types/form';

interface BuilderToolbarProps {
  form: Form;
  onRefresh: () => void;
}

export function BuilderToolbar({ form, onRefresh }: BuilderToolbarProps) {
  const { unsavedChanges, setUnsavedChanges, previewMode, setPreviewMode } =
    useBuilderContext();

  const [title, setTitle] = useState(form.title);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Sync title when form changes
  useEffect(() => {
    setTitle(form.title);
  }, [form.title]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  const handleTitleSave = useCallback(async () => {
    setIsEditingTitle(false);
    if (title.trim() === '' || title === form.title) {
      setTitle(form.title);
      return;
    }
    setIsSaving(true);
    try {
      await updateForm(form.id, { title: title.trim() });
      setUnsavedChanges(false);
      onRefresh();
    } catch {
      setTitle(form.title);
    } finally {
      setIsSaving(false);
    }
  }, [title, form.id, form.title, setUnsavedChanges, onRefresh]);

  const handleTitleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleTitleSave();
      } else if (e.key === 'Escape') {
        setTitle(form.title);
        setIsEditingTitle(false);
      }
    },
    [handleTitleSave, form.title]
  );

  const handlePublish = useCallback(async () => {
    setIsPublishing(true);
    try {
      if (form.status === 'published') {
        await closeForm(form.id);
      } else {
        await publishForm(form.id);
      }
      onRefresh();
    } catch {
      // Error handling is done by the server action
    } finally {
      setIsPublishing(false);
    }
  }, [form.id, form.status, onRefresh]);

  const statusBadge = (() => {
    switch (form.status) {
      case 'published':
        return <Badge variant="success">Published</Badge>;
      case 'closed':
        return <Badge variant="warning">Closed</Badge>;
      case 'archived':
        return <Badge variant="default">Archived</Badge>;
      default:
        return <Badge variant="default">Draft</Badge>;
    }
  })();

  const saveStatus = (() => {
    if (isSaving) {
      return (
        <span className="flex items-center gap-1.5 text-xs text-gray-400">
          <Loader2 className="h-3 w-3 animate-spin" />
          Saving...
        </span>
      );
    }
    if (unsavedChanges) {
      return (
        <span className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
          <Cloud className="h-3 w-3" />
          Unsaved changes
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 text-xs text-gray-400">
        <Check className="h-3 w-3" />
        Saved
      </span>
    );
  })();

  return (
    <div className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-950">
      {/* Left section: back + title */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-colors',
            'hover:bg-gray-100 hover:text-gray-700',
            'dark:hover:bg-gray-800 dark:hover:text-gray-300'
          )}
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <div className="h-4 w-px bg-gray-200 dark:bg-gray-800" />

        {isEditingTitle ? (
          <input
            ref={titleInputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={handleTitleKeyDown}
            className={cn(
              'h-8 rounded-md border border-gray-300 bg-white px-2 text-sm font-medium text-gray-900',
              'focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20',
              'dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100'
            )}
            maxLength={255}
          />
        ) : (
          <button
            onClick={() => setIsEditingTitle(true)}
            className={cn(
              'rounded-md px-2 py-1 text-sm font-medium text-gray-900 transition-colors',
              'hover:bg-gray-100',
              'dark:text-gray-100 dark:hover:bg-gray-800'
            )}
          >
            {title}
          </button>
        )}

        {statusBadge}
        {saveStatus}
      </div>

      {/* Right section: actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            setPreviewMode(previewMode === 'builder' ? 'preview' : 'builder')
          }
        >
          {previewMode === 'preview' ? (
            <>
              <X className="h-4 w-4" />
              Exit Preview
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" />
              Preview
            </>
          )}
        </Button>

        <Button
          variant={form.status === 'published' ? 'secondary' : 'primary'}
          size="sm"
          onClick={handlePublish}
          loading={isPublishing}
        >
          <Globe className="h-4 w-4" />
          {form.status === 'published' ? 'Unpublish' : 'Publish'}
        </Button>
      </div>
    </div>
  );
}
