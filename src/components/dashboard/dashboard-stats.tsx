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
    <div className="card flex items-center gap-4 px-5 py-4">
      <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', iconColor)}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium text-foreground-muted">{label}</p>
        <p className="text-2xl font-semibold tabular-nums tracking-[-0.02em] text-foreground">
          {value}
        </p>
      </div>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="card flex items-center gap-4 px-5 py-4">
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
        icon={<FileText className="h-5 w-5 text-primary" />}
        label="Total Forms"
        value={totalForms}
        iconColor="bg-accent"
      />
      <StatCard
        icon={<MessageSquare className="h-5 w-5 text-success" />}
        label="Total Responses"
        value={totalResponses}
        iconColor="bg-success/10"
      />
      <StatCard
        icon={<Radio className="h-5 w-5 text-warning" />}
        label="Active Forms"
        value={activeForms}
        iconColor="bg-warning/10"
      />
    </div>
  );
}
