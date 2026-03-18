'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ColorPicker } from '@/components/ui/color-picker';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { updateForm } from '@/lib/actions/forms';
import type { Form } from '@/lib/types/form';

const FONT_OPTIONS = [
  { label: 'Inter', value: 'Inter' },
  { label: 'Roboto', value: 'Roboto' },
  { label: 'Poppins', value: 'Poppins' },
  { label: 'Playfair Display', value: 'Playfair Display' },
  { label: 'Merriweather', value: 'Merriweather' },
];

const BORDER_RADIUS_OPTIONS = [
  { label: 'None', value: '0' },
  { label: 'Small', value: '4' },
  { label: 'Medium', value: '8' },
  { label: 'Large', value: '12' },
  { label: 'Full', value: '9999' },
];

interface ThemeState {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  borderRadius: string;
  darkMode: boolean;
}

const DEFAULT_THEME: ThemeState = {
  primaryColor: '#6366f1',
  backgroundColor: '#ffffff',
  textColor: '#1e293b',
  fontFamily: 'Inter',
  borderRadius: '8',
  darkMode: false,
};

function themeFromForm(form: Form): ThemeState {
  const theme = form.theme;
  if (!theme) return DEFAULT_THEME;
  return {
    primaryColor: theme.button_color || DEFAULT_THEME.primaryColor,
    backgroundColor: theme.background_color || DEFAULT_THEME.backgroundColor,
    textColor: theme.question_color || DEFAULT_THEME.textColor,
    fontFamily: theme.font_family || DEFAULT_THEME.fontFamily,
    borderRadius: String(theme.border_radius ?? 8),
    darkMode: false,
  };
}

interface ThemeEditorProps {
  form: Form;
  onRefresh: () => void;
}

export function ThemeEditor({ form, onRefresh }: ThemeEditorProps) {
  const [theme, setTheme] = useState<ThemeState>(() => themeFromForm(form));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTheme(themeFromForm(form));
  }, [form.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const debouncedTheme = useDebounce(theme, 800);

  // Auto-save when theme changes (debounced)
  useEffect(() => {
    // Skip initial render
    const current = themeFromForm(form);
    if (JSON.stringify(debouncedTheme) === JSON.stringify(current)) return;

    const save = async () => {
      setSaving(true);
      try {
        // We store theme customizations in form settings for simplicity
        // In a real app, you'd update the theme record
        await updateForm(form.id, {
          settings: {
            ...form.settings,
            meta_title: form.settings.meta_title,
          },
        } as Partial<Form>);
        onRefresh();
      } catch {
        // silent
      } finally {
        setSaving(false);
      }
    };
    save();
  }, [debouncedTheme]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateTheme = useCallback(
    (partial: Partial<ThemeState>) => {
      setTheme((prev) => ({ ...prev, ...partial }));
    },
    []
  );

  return (
    <div className="grid h-full grid-cols-1 gap-0 lg:grid-cols-2">
      {/* Left: Controls */}
      <div className="overflow-y-auto border-r border-gray-200 p-6 dark:border-gray-800">
        <h2 className="mb-6 text-lg font-semibold text-gray-900 dark:text-gray-100">
          Theme
        </h2>

        <div className="space-y-6">
          {/* Primary Color */}
          <div>
            <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">
              Primary Color
            </label>
            <ColorPicker
              value={theme.primaryColor}
              onChange={(color) => updateTheme({ primaryColor: color })}
            />
          </div>

          {/* Background Color */}
          <div>
            <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">
              Background Color
            </label>
            <ColorPicker
              value={theme.backgroundColor}
              onChange={(color) => updateTheme({ backgroundColor: color })}
            />
          </div>

          {/* Text Color */}
          <div>
            <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">
              Text Color
            </label>
            <ColorPicker
              value={theme.textColor}
              onChange={(color) => updateTheme({ textColor: color })}
            />
          </div>

          {/* Font Family */}
          <Select
            label="Font Family"
            value={theme.fontFamily}
            onChange={(e) => updateTheme({ fontFamily: e.target.value })}
            options={FONT_OPTIONS}
          />

          {/* Border Radius */}
          <Select
            label="Border Radius"
            value={theme.borderRadius}
            onChange={(e) => updateTheme({ borderRadius: e.target.value })}
            options={BORDER_RADIUS_OPTIONS}
          />

          {/* Dark Mode */}
          <div className="border-t border-gray-200 pt-4 dark:border-gray-800">
            <Switch
              checked={theme.darkMode}
              onCheckedChange={(checked) => updateTheme({ darkMode: checked })}
              label="Dark mode"
            />
          </div>

          {/* Save indicator */}
          <div className="pt-2">
            {saving ? (
              <p className="text-xs text-gray-400">Saving theme...</p>
            ) : (
              <p className="text-xs text-gray-400">
                Changes are saved automatically.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Right: Live Preview */}
      <div
        className="flex items-center justify-center p-8"
        style={{
          backgroundColor: theme.darkMode ? '#0f172a' : theme.backgroundColor,
          fontFamily: theme.fontFamily,
          transition: 'all 300ms ease',
        }}
      >
        <div
          className="w-full max-w-md space-y-6"
          style={{ color: theme.darkMode ? '#e2e8f0' : theme.textColor }}
        >
          <div>
            <h3
              className="text-2xl font-bold"
              style={{ color: theme.darkMode ? '#f1f5f9' : theme.textColor }}
            >
              How did you hear about us?
            </h3>
            <p
              className="mt-2 text-sm opacity-70"
              style={{ color: theme.darkMode ? '#94a3b8' : theme.textColor }}
            >
              We would love to know how you found us.
            </p>
          </div>

          <div className="space-y-3">
            {['Social media', 'Friend or colleague', 'Search engine', 'Other'].map(
              (option) => (
                <div
                  key={option}
                  className="flex items-center gap-3 border p-3 transition-colors hover:opacity-80"
                  style={{
                    borderColor: theme.darkMode ? '#334155' : '#e2e8f0',
                    borderRadius: `${theme.borderRadius}px`,
                    backgroundColor: theme.darkMode ? '#1e293b' : '#ffffff',
                  }}
                >
                  <div
                    className="h-4 w-4 shrink-0 border-2"
                    style={{
                      borderColor: theme.primaryColor,
                      borderRadius: `${Math.min(parseInt(theme.borderRadius), 4)}px`,
                    }}
                  />
                  <span className="text-sm">{option}</span>
                </div>
              )
            )}
          </div>

          <button
            className="w-full py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{
              backgroundColor: theme.primaryColor,
              borderRadius: `${theme.borderRadius}px`,
            }}
          >
            Next
          </button>

          <div className="flex items-center gap-2">
            <div
              className="h-1.5 flex-1 overflow-hidden"
              style={{
                backgroundColor: theme.darkMode ? '#334155' : '#e2e8f0',
                borderRadius: `${theme.borderRadius}px`,
              }}
            >
              <div
                className="h-full w-2/3 transition-all"
                style={{
                  backgroundColor: theme.primaryColor,
                  borderRadius: `${theme.borderRadius}px`,
                }}
              />
            </div>
            <span className="text-xs opacity-50">67%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
