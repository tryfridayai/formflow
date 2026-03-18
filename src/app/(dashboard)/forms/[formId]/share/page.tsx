'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Globe, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { ShareLink } from '@/components/share/share-link';
import { EmbedCode } from '@/components/share/embed-code';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getForm, publishForm, closeForm } from '@/lib/actions/forms';
import type { FormStatus } from '@/lib/types/form';

export default function SharePage() {
  const params = useParams<{ formId: string }>();
  const formId = params.formId;

  const [slug, setSlug] = useState<string>('');
  const [status, setStatus] = useState<FormStatus>('draft');
  const [formTitle, setFormTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  const fetchForm = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getForm(formId);
      if (result.data) {
        setSlug(result.data.slug);
        setStatus(result.data.status as FormStatus);
        setFormTitle(result.data.title);
      }
    } finally {
      setLoading(false);
    }
  }, [formId]);

  useEffect(() => {
    fetchForm();
  }, [fetchForm]);

  const handleTogglePublish = useCallback(async () => {
    setToggling(true);
    try {
      if (status === 'published') {
        const result = await closeForm(formId);
        if (result.success) setStatus('closed');
      } else {
        const result = await publishForm(formId);
        if (result.success) setStatus('published');
      }
    } finally {
      setToggling(false);
    }
  }, [formId, status]);

  const isPublished = status === 'published';

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
        <div className="h-64 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Share
        </h1>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
          Share &ldquo;{formTitle}&rdquo; with anyone
        </p>
      </div>

      {/* Publish toggle */}
      <motion.div
        className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              isPublished ? 'bg-emerald-50 dark:bg-emerald-950' : 'bg-gray-100 dark:bg-gray-800'
            }`}
          >
            {isPublished ? (
              <Globe className="h-5 w-5 text-emerald-500" />
            ) : (
              <Lock className="h-5 w-5 text-gray-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Form Status
              </h3>
              <Badge variant={isPublished ? 'success' : 'default'}>
                {status === 'published'
                  ? 'Published'
                  : status === 'closed'
                  ? 'Closed'
                  : 'Draft'}
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              {isPublished
                ? 'Your form is live and accepting responses.'
                : 'Publish your form to start collecting responses.'}
            </p>
          </div>
        </div>

        <Button
          variant={isPublished ? 'ghost' : 'primary'}
          size="md"
          onClick={handleTogglePublish}
          loading={toggling}
        >
          {isPublished ? (
            <>
              <Lock className="h-4 w-4" />
              Unpublish
            </>
          ) : (
            <>
              <Globe className="h-4 w-4" />
              Publish
            </>
          )}
        </Button>
      </motion.div>

      {/* Share link and embed (only show when published or has a slug) */}
      {slug && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ShareLink slug={slug} />
          <EmbedCode slug={slug} />
        </div>
      )}

      {!isPublished && slug && (
        <p className="text-center text-xs text-gray-400">
          The form link will only work while the form is published.
        </p>
      )}
    </div>
  );
}
