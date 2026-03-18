'use client';

import { useState, useCallback, useMemo } from 'react';
import { Copy, Check, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmbedCodeProps {
  slug: string;
}

export function EmbedCode({ slug }: EmbedCodeProps) {
  const [width, setWidth] = useState('100%');
  const [height, setHeight] = useState('600');
  const [copied, setCopied] = useState(false);

  const baseUrl =
    typeof window !== 'undefined' ? window.location.origin : '';
  const formUrl = `${baseUrl}/f/${slug}`;

  const embedCode = useMemo(() => {
    const h = height.includes('%') ? height : `${height}px`;
    return `<iframe\n  src="${formUrl}"\n  width="${width}"\n  height="${h}"\n  frameborder="0"\n  allow="camera; microphone"\n  style="border: none; border-radius: 8px;"\n  title="FormFlow Form"\n></iframe>`;
  }, [formUrl, width, height]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = embedCode;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [embedCode]);

  return (
    <div className="flex flex-col gap-6 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center gap-2">
        <Code className="h-5 w-5 text-indigo-500" />
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Embed Code
        </h3>
      </div>

      {/* Customization */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Width
          </label>
          <input
            type="text"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
            className="h-8 w-28 rounded-md border border-gray-200 bg-transparent px-2 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 dark:border-gray-700 dark:text-gray-300"
            placeholder="100% or 800px"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Height
          </label>
          <input
            type="text"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="h-8 w-28 rounded-md border border-gray-200 bg-transparent px-2 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 dark:border-gray-700 dark:text-gray-300"
            placeholder="600"
          />
        </div>
      </div>

      {/* Code block */}
      <div className="relative">
        <pre className="overflow-x-auto rounded-lg bg-gray-950 p-4 text-xs leading-relaxed text-gray-300">
          <code>{embedCode}</code>
        </pre>
        <div className="absolute right-2 top-2">
          <Button
            variant={copied ? 'primary' : 'ghost'}
            size="sm"
            onClick={handleCopy}
            className="bg-gray-800 text-gray-300 hover:bg-gray-700"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                Copy
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Preview hint */}
      <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Paste this code in your website&apos;s HTML to embed the form. The
          form will adapt to the container width.
        </p>
      </div>
    </div>
  );
}
