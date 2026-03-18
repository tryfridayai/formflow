'use client';

import { useState, useCallback } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { exportCSV } from '@/lib/actions/responses';

interface ExportButtonProps {
  formId: string;
}

export function ExportButton({ formId }: ExportButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = useCallback(async () => {
    setLoading(true);
    try {
      const result = await exportCSV(formId);

      if (result.error) {
        console.error('Export failed:', result.error);
        return;
      }

      if (result.data && result.filename) {
        // Create a blob and trigger download
        const blob = new Blob([result.data], {
          type: 'text/csv;charset=utf-8;',
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = result.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setLoading(false);
    }
  }, [formId]);

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleExport}
      loading={loading}
    >
      <Download className="h-4 w-4" />
      Export CSV
    </Button>
  );
}
