'use client';

import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { createForm } from '@/lib/actions/forms';
import { useToast } from '@/components/ui/toast';

export interface CreateFormDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateFormDialog({ open, onClose }: CreateFormDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { addToast } = useToast();

  const handleClose = useCallback(() => {
    if (!loading) {
      setTitle('');
      setDescription('');
      setError('');
      onClose();
    }
  }, [loading, onClose]);

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
        // createForm redirects on success, so we won't reach the lines after
        // unless there's an error
        const result = await createForm(trimmedTitle);
        if (result?.error) {
          setError(result.error);
          addToast({ type: 'error', title: 'Failed to create form', description: result.error });
          setLoading(false);
        }
      } catch {
        // createForm calls redirect() which throws a NEXT_REDIRECT error
        // This is expected behavior - the redirect is happening
        // If we get here and it's not a redirect, it's an actual error
        setLoading(false);
      }
    },
    [title, addToast]
  );

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create a new form</DialogTitle>
          <DialogDescription>
            Give your form a name to get started. You can change this later.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-2 space-y-4">
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
            placeholder="What is this form about?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            disabled={loading}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={loading}>
              Create form
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
