import { SCAN_HISTORY_KEY, MAX_HISTORY } from './constants';

export const getScanHistory = () => {
  try {
    const raw = localStorage.getItem(SCAN_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const addToScanHistory = (entry) => {
  const history = getScanHistory();
  const updated = [
    {
      id: crypto.randomUUID(),
      ...entry,
      timestamp: new Date().toISOString(),
    },
    ...history,
  ].slice(0, MAX_HISTORY);

  localStorage.setItem(SCAN_HISTORY_KEY, JSON.stringify(updated));
  return updated;
};

export const clearScanHistory = () => {
  localStorage.removeItem(SCAN_HISTORY_KEY);
};
