'use client';

import { useState } from 'react';
import { X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ResultsFiltersProps {
  onApplyFilters: (filters: {
    startDate?: string;
    endDate?: string;
    status?: 'all' | 'complete' | 'partial';
  }) => void;
  onClearFilters: () => void;
}

export function ResultsFilters({
  onApplyFilters,
  onClearFilters,
}: ResultsFiltersProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<'all' | 'complete' | 'partial'>('all');

  const hasFilters = startDate || endDate || status !== 'all';

  const handleApply = () => {
    onApplyFilters({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      status,
    });
  };

  const handleClear = () => {
    setStartDate('');
    setEndDate('');
    setStatus('all');
    onClearFilters();
  };

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <Filter className="h-4 w-4 text-gray-400" />

      {/* Date range */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-500 dark:text-gray-400">From</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="h-8 rounded-md border border-gray-200 bg-transparent px-2 text-xs text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 dark:border-gray-700 dark:text-gray-300"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-500 dark:text-gray-400">To</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="h-8 rounded-md border border-gray-200 bg-transparent px-2 text-xs text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 dark:border-gray-700 dark:text-gray-300"
        />
      </div>

      {/* Status filter */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-500 dark:text-gray-400">
          Status
        </label>
        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value as 'all' | 'complete' | 'partial')
          }
          className="h-8 rounded-md border border-gray-200 bg-transparent px-2 text-xs text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 dark:border-gray-700 dark:text-gray-300"
        >
          <option value="all">All</option>
          <option value="complete">Complete</option>
          <option value="partial">Partial</option>
        </select>
      </div>

      {/* Actions */}
      <div className="ml-auto flex items-center gap-2">
        <Button variant="primary" size="sm" onClick={handleApply}>
          Apply
        </Button>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={handleClear}>
            <X className="mr-1 h-3 w-3" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
