'use client';

import React, { useState, useMemo } from 'react';
import { Plus, FileText } from 'lucide-react';
import { useForms } from '@/lib/hooks/use-forms';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { DashboardStats } from '@/components/dashboard/dashboard-stats';
import { FormCard } from '@/components/dashboard/form-card';
import { CreateFormDialog } from '@/components/dashboard/create-form-dialog';

export default function DashboardPage() {
  const { forms, loading, refresh } = useForms();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const stats = useMemo(() => {
    const totalForms = forms.length;
    const totalResponses = forms.reduce((sum, f) => sum + (f.response_count || 0), 0);
    const activeForms = forms.filter((f) => f.status === 'published').length;
    return { totalForms, totalResponses, activeForms };
  }, [forms]);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your forms and track responses.
          </p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          size="sm"
        >
          <Plus className="h-4 w-4" />
          New form
        </Button>
      </div>

      {/* Stats */}
      <DashboardStats
        totalForms={stats.totalForms}
        totalResponses={stats.totalResponses}
        activeForms={stats.activeForms}
        loading={loading}
      />

      {/* Forms grid */}
      <section>
        <h2 className="mb-4 text-sm font-medium text-gray-900 dark:text-gray-100">
          Your forms
        </h2>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-5 w-16 rounded-md" />
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : forms.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-6 w-6" />}
            title="No forms yet"
            description="Create your first form to start collecting responses."
            action={
              <Button
                onClick={() => setCreateDialogOpen(true)}
                size="sm"
              >
                <Plus className="h-4 w-4" />
                Create your first form
              </Button>
            }
            className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {forms.map((form) => (
              <FormCard key={form.id} form={form} onRefresh={refresh} />
            ))}
          </div>
        )}
      </section>

      {/* Create form dialog */}
      <CreateFormDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      />
    </div>
  );
}
