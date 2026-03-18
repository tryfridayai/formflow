'use client';

import React from 'react';
import { FileText, MessageSquare, Radio } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Skeleton } from '@/components/ui/skeleton';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  iconColor: string;
}

function StatCard({ icon, label, value, iconColor }: StatCardProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-lg border border-gray-200 bg-white px-5 py-4',
        'dark:border-gray-800 dark:bg-gray-950'
      )}
    >
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
          iconColor
        )}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
          {label}
        </p>
        <p className="text-2xl font-semibold tabular-nums text-gray-900 dark:text-gray-100">
          {value}
        </p>
      </div>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-lg border border-gray-200 bg-white px-5 py-4',
        'dark:border-gray-800 dark:bg-gray-950'
      )}
    >
      <Skeleton className="h-10 w-10 rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-7 w-12" />
      </div>
    </div>
  );
}

export interface DashboardStatsProps {
  totalForms: number;
  totalResponses: number;
  activeForms: number;
  loading?: boolean;
}

export function DashboardStats({
  totalForms,
  totalResponses,
  activeForms,
  loading = false,
}: DashboardStatsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <StatCard
        icon={<FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />}
        label="Total Forms"
        value={totalForms}
        iconColor="bg-indigo-50 dark:bg-indigo-950"
      />
      <StatCard
        icon={
          <MessageSquare className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        }
        label="Total Responses"
        value={totalResponses}
        iconColor="bg-emerald-50 dark:bg-emerald-950"
      />
      <StatCard
        icon={<Radio className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
        label="Active Forms"
        value={activeForms}
        iconColor="bg-amber-50 dark:bg-amber-950"
      />
    </div>
  );
}
