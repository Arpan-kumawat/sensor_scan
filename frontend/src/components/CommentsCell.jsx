import { useEffect, useState } from 'react';

const MAX_COMMENTS_LENGTH = 500;

export const CommentsCell = ({ value, onSave, disabled }) => {
  const [draft, setDraft] = useState(value || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft(value || '');
  }, [value]);

  const handleBlur = async () => {
    const trimmed = draft.trim();
    const saved = (value || '').trim();
    if (trimmed === saved || saving || disabled) return;

    setSaving(true);
    try {
      await onSave(trimmed);
    } catch {
      setDraft(value || '');
    } finally {
      setSaving(false);
    }
  };

  return (
    <textarea
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={handleBlur}
      disabled={disabled || saving}
      maxLength={MAX_COMMENTS_LENGTH}
      rows={2}
      placeholder="Add a comment…"
      className="min-w-[140px] max-w-xs w-full resize-y rounded-lg border border-slate-200 bg-white/80 px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-sky-500/30 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800/80"
    />
  );
};
