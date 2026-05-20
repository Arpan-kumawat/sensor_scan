import { formatDateTime, formatRelative } from '../utils/formatDate';

export const ScanHistory = ({ history, onClear }) => {
  if (!history.length) {
    return (
      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        No recent scans yet
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Recent Scans</h3>
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-slate-500 hover:text-red-500"
        >
          Clear
        </button>
      </div>
      <ul className="max-h-48 space-y-2 overflow-y-auto">
        {history.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between rounded-xl bg-slate-100/80 px-3 py-2 text-sm dark:bg-slate-800/60"
          >
            <div>
              {item.mode === 'gateway' ? (
                <>
                  <span className="font-medium text-violet-600 dark:text-violet-400">Gateway</span>
                  <span className="mx-2 text-slate-400">·</span>
                  <span className="font-mono text-slate-600 dark:text-slate-300">
                    {item.serialNumber}
                  </span>
                </>
              ) : (
                <>
                  <span className="font-medium">{item.sensorType}</span>
                  <span className="mx-2 text-slate-400">·</span>
                  <span className="text-slate-600 dark:text-slate-300">S/N {item.serialNumber}</span>
                </>
              )}
            </div>
            <div className="text-right text-xs text-slate-500">
              <div>{formatRelative(item.timestamp)}</div>
              <div className="hidden sm:block">{formatDateTime(item.timestamp)}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
