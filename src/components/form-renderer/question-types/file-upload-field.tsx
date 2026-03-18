'use client';

import { useState, useRef, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Upload, File, X } from 'lucide-react';
import type { Question, FileUploadProperties } from '@/lib/types/form';

interface FileUploadFieldProps {
  question: Question;
  value: string;
  onChange: (value: string) => void;
  answerColor: string;
  questionColor: string;
}

export function FileUploadField({
  question,
  value,
  onChange,
  answerColor,
  questionColor,
}: FileUploadFieldProps) {
  const config = question.properties.config as FileUploadProperties;
  const maxSizeMb = config?.max_size_mb ?? 10;
  const allowedTypes = useMemo(() => config?.allowed_types ?? [], [config?.allowed_types]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);

      // Validate size
      if (file.size > maxSizeMb * 1024 * 1024) {
        setError(`File is too large. Maximum size is ${maxSizeMb}MB.`);
        return;
      }

      // Validate type
      if (allowedTypes.length > 0) {
        const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
        const mimeMatch = allowedTypes.some(
          (t) =>
            file.type.includes(t) || ext === t.replace('.', '').toLowerCase()
        );
        if (!mimeMatch) {
          setError(`File type not allowed. Accepted: ${allowedTypes.join(', ')}`);
          return;
        }
      }

      // Store file name as the value (actual upload would happen on submit)
      onChange(file.name);
    },
    [maxSizeMb, allowedTypes, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleRemove = () => {
    onChange('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="w-full max-w-md">
      {!value ? (
        <motion.div
          className="flex cursor-pointer flex-col items-center gap-4 rounded-xl border-2 border-dashed px-8 py-12 text-center transition-colors"
          style={{
            borderColor: isDragging ? answerColor : `${questionColor}30`,
            backgroundColor: isDragging ? `${answerColor}10` : 'transparent',
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <Upload
            className="h-10 w-10 opacity-40"
            style={{ color: questionColor }}
          />
          <div>
            <p className="text-base font-medium" style={{ color: questionColor }}>
              {isDragging ? 'Drop your file here' : 'Click or drag file to upload'}
            </p>
            <p
              className="mt-1 text-xs opacity-40"
              style={{ color: questionColor }}
            >
              Max {maxSizeMb}MB
              {allowedTypes.length > 0 && ` - ${allowedTypes.join(', ')}`}
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            onChange={handleInputChange}
            accept={
              allowedTypes.length > 0 ? allowedTypes.join(',') : undefined
            }
            className="hidden"
          />
        </motion.div>
      ) : (
        <motion.div
          className="flex items-center gap-3 rounded-xl border-2 px-4 py-3"
          style={{ borderColor: `${answerColor}40` }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <File className="h-6 w-6 shrink-0" style={{ color: answerColor }} />
          <span
            className="flex-1 truncate text-base font-medium"
            style={{ color: answerColor }}
          >
            {value}
          </span>
          <button
            type="button"
            onClick={handleRemove}
            className="rounded-md p-1 transition-colors hover:bg-white/10"
          >
            <X
              className="h-5 w-5 opacity-60"
              style={{ color: questionColor }}
            />
          </button>
        </motion.div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}
