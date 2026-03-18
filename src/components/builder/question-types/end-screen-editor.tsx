'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import type { EndScreenProperties } from '@/lib/types/form';

interface EndScreenEditorProps {
  properties: EndScreenProperties;
  onChange: (properties: EndScreenProperties) => void;
}

export function EndScreenEditor({
  properties,
  onChange,
}: EndScreenEditorProps) {
  return (
    <div className="space-y-4">
      <Textarea
        label="Description"
        value={properties.description || ''}
        onChange={(e) =>
          onChange({ ...properties, description: e.target.value })
        }
        placeholder="Thank the respondent for completing the form..."
        autoResize
        rows={3}
      />

      <div className="border-t border-gray-200 pt-4 dark:border-gray-800">
        <Switch
          checked={properties.share_icons}
          onCheckedChange={(checked) =>
            onChange({ ...properties, share_icons: checked })
          }
          label="Show social share buttons"
        />
      </div>

      <div className="border-t border-gray-200 pt-4 dark:border-gray-800">
        <Switch
          checked={properties.show_button}
          onCheckedChange={(checked) =>
            onChange({ ...properties, show_button: checked })
          }
          label="Show action button"
        />
      </div>

      {properties.show_button && (
        <>
          <Input
            label="Button text"
            value={properties.button_text || ''}
            onChange={(e) =>
              onChange({ ...properties, button_text: e.target.value })
            }
            placeholder="Visit our website"
          />
          <Input
            label="Button URL"
            value={properties.button_url || ''}
            onChange={(e) =>
              onChange({ ...properties, button_url: e.target.value })
            }
            placeholder="https://example.com"
          />
        </>
      )}

      <div className="border-t border-gray-200 pt-4 dark:border-gray-800">
        <Input
          label="Redirect URL (optional)"
          value={properties.redirect_url || ''}
          onChange={(e) =>
            onChange({ ...properties, redirect_url: e.target.value })
          }
          placeholder="https://example.com/thank-you"
        />
        {properties.redirect_url && (
          <div className="mt-2">
            <Input
              label="Redirect delay (seconds)"
              type="number"
              value={String(properties.redirect_delay || 0)}
              onChange={(e) =>
                onChange({
                  ...properties,
                  redirect_delay: parseInt(e.target.value, 10) || 0,
                })
              }
              placeholder="3"
            />
          </div>
        )}
      </div>
    </div>
  );
}
