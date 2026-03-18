'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useForm } from '@/lib/hooks/use-form';
import { LogicEditor } from '@/components/builder/logic-editor';

export default function LogicPage() {
  const params = useParams();
  const formId = params.formId as string;
  const { form, loading, refresh } = useForm(formId);

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

  return <LogicEditor form={form} onRefresh={refresh} />;
}
