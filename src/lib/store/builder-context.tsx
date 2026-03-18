'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';

type PreviewMode = 'builder' | 'preview';

interface BuilderContextValue {
  selectedQuestionId: string | null;
  unsavedChanges: boolean;
  previewMode: PreviewMode;
  setSelectedQuestion: (id: string | null) => void;
  setUnsavedChanges: (value: boolean) => void;
  setPreviewMode: (mode: PreviewMode) => void;
}

const BuilderContext = createContext<BuilderContextValue | null>(null);

export function useBuilderContext() {
  const ctx = useContext(BuilderContext);
  if (!ctx) {
    throw new Error('useBuilderContext must be used within a BuilderProvider');
  }
  return ctx;
}

interface BuilderProviderProps {
  children: React.ReactNode;
  defaultSelectedId?: string | null;
}

export function BuilderProvider({
  children,
  defaultSelectedId = null,
}: BuilderProviderProps) {
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    defaultSelectedId
  );
  const [unsavedChanges, setUnsavedChangesState] = useState(false);
  const [previewMode, setPreviewModeState] = useState<PreviewMode>('builder');

  const setSelectedQuestion = useCallback((id: string | null) => {
    setSelectedQuestionId(id);
  }, []);

  const setUnsavedChanges = useCallback((value: boolean) => {
    setUnsavedChangesState(value);
  }, []);

  const setPreviewMode = useCallback((mode: PreviewMode) => {
    setPreviewModeState(mode);
  }, []);

  return (
    <BuilderContext.Provider
      value={{
        selectedQuestionId,
        unsavedChanges,
        previewMode,
        setSelectedQuestion,
        setUnsavedChanges,
        setPreviewMode,
      }}
    >
      {children}
    </BuilderContext.Provider>
  );
}
