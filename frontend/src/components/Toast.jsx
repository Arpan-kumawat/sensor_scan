import { useToast } from '../hooks/useToast';

const typeStyles = {
  success: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  error: 'border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-300',
  warning: 'border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  info: 'border-sky-500/50 bg-sky-500/10 text-sky-700 dark:text-sky-300',
};

export const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex max-w-sm flex-col gap-2 p-4 sm:bottom-6 sm:right-6">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto animate-slide-up rounded-xl border px-4 py-3 text-sm font-medium shadow-lg backdrop-blur-md ${typeStyles[toast.type] || typeStyles.info}`}
        >
          <div className="flex items-start justify-between gap-3">
            <span>{toast.message}</span>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="shrink-0 opacity-60 hover:opacity-100"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
