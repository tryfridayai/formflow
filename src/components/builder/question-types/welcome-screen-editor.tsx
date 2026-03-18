'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import type { WelcomeScreenProperties } from '@/lib/types/form';

interface WelcomeScreenEditorProps {
  properties: WelcomeScreenProperties;
  onChange: (properties: WelcomeScreenProperties) => void;
}

export function WelcomeScreenEditor({
  properties,
  onChange,
}: WelcomeScreenEditorProps) {
  return (
    <div className="space-y-4">
      <Textarea
        label="Description"
        value={properties.description || ''}
        onChange={(e) =>
          onChange({ ...properties, description: e.target.value })
        }
        placeholder="Introduce your form to respondents..."
        autoResize
        rows={3}
      />

      <div className="border-t border-gray-200 pt-4 dark:border-gray-800">
        <Switch
          checked={properties.show_button}
          onCheckedChange={(checked) =>
            onChange({ ...properties, show_button: checked })
          }
          label="Show start button"
        />
      </div>

      {properties.show_button && (
        <Input
          label="Button text"
          value={properties.button_text}
          onChange={(e) =>
            onChange({ ...properties, button_text: e.target.value })
          }
          placeholder="Start"
        />
      )}

      <Input
        label="Background image URL (optional)"
        value={properties.image_url || ''}
        onChange={(e) =>
          onChange({ ...properties, image_url: e.target.value })
        }
        placeholder="https://example.com/image.jpg"
      />
    </div>
  );
}
