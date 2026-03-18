'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { createForm } from '@/lib/actions/forms';
import { useToast } from '@/components/ui/toast';

export default function NewFormPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const trimmedTitle = title.trim();
      if (!trimmedTitle) {
        setError('Please enter a form title.');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const result = await createForm(trimmedTitle);
        if (result?.error) {
          setError(result.error);
          addToast({
            type: 'error',
            title: 'Failed to create form',
            description: result.error,
          });
          setLoading(false);
        }
      } catch {
        // createForm calls redirect() on success, which throws
        setLoading(false);
      }
    },
    [title, addToast]
  );

  return (
    <div className="mx-auto max-w-lg">
      {/* Back link */}
      <button
        type="button"
        onClick={() => router.push('/dashboard')}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to dashboard
      </button>

      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Create a new form
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Give your form a name to get started. You can always change it later.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input
            label="Form title"
            placeholder="e.g. Customer Feedback Survey"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError('');
            }}
            error={error}
            autoFocus
            disabled={loading}
          />

          <Textarea
            label="Description (optional)"
            placeholder="Briefly describe the purpose of this form..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            disabled={loading}
          />

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={loading}>
              Create form
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
