'use client';

import { useState, useCallback } from 'react';
import { Copy, Check, Link } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';

interface ShareLinkProps {
  slug: string;
}

export function ShareLink({ slug }: ShareLinkProps) {
  const [copied, setCopied] = useState(false);

  const baseUrl =
    typeof window !== 'undefined' ? window.location.origin : '';
  const formUrl = `${baseUrl}/f/${slug}`;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(formUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement('input');
      input.value = formUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [formUrl]);

  return (
    <div className="flex flex-col gap-6 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center gap-2">
        <Link className="h-5 w-5 text-indigo-500" />
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Share Link
        </h3>
      </div>

      {/* URL input + copy */}
      <div className="flex items-center gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
          <span className="flex-1 truncate text-sm text-gray-700 dark:text-gray-300">
            {formUrl}
          </span>
        </div>
        <Button
          variant={copied ? 'primary' : 'secondary'}
          size="md"
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy
            </>
          )}
        </Button>
      </div>

      {/* QR Code */}
      <div className="flex flex-col items-center gap-3">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Scan QR code to open form
        </p>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <QRCodeSVG
            value={formUrl}
            size={160}
            level="M"
            bgColor="#ffffff"
            fgColor="#1f2937"
          />
        </div>
      </div>
    </div>
  );
}
