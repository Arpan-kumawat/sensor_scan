import { useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { TableSkeleton } from '../components/Skeleton';
import { useToast } from '../hooks/useToast';
import { useSensors } from '../hooks/useSensors';
import { formatDateTime } from '../utils/formatDate';

const PAGE_SIZE = 10;

export const InventoryPage = () => {
  const { showToast } = useToast();
  const {
    sensors,
    loading,
    error,
    page,
    setPage,
    search,
    setSearch,
    pagination,
    totalCount,
    removeSensor,
    exportExcel,
  } = useSensors(1, PAGE_SIZE);

  const [searchInput, setSearchInput] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [exporting, setExporting] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this sensor from inventory?')) return;
    setDeletingId(id);
    try {
      await removeSensor(id);
      showToast('Sensor deleted', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete failed', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportExcel();
      showToast('Excel file downloaded', 'success');
    } catch {
      showToast('Export failed', 'error');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Inventory</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Manage scanned sensor boxes
          </p>
        </div>
        <GlassCard className="!p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Total Sensors</p>
          <p className="text-3xl font-bold text-sky-500">{totalCount}</p>
        </GlassCard>
      </div>

      <GlassCard>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <form onSubmit={handleSearch} className="flex flex-1 gap-2">
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by type or serial..."
              className="flex-1 rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-500/30 dark:border-slate-600 dark:bg-slate-800/80"
            />
            <button
              type="submit"
              className="rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-600"
            >
              Search
            </button>
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  setSearch('');
                  setPage(1);
                }}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm dark:border-slate-600"
              >
                Clear
              </button>
            )}
          </form>
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting || totalCount === 0}
            className="rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
          >
            {exporting ? 'Exporting...' : 'Export Excel'}
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <TableSkeleton rows={6} />
        ) : sensors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <svg
              className="mb-4 h-16 w-16 text-slate-300 dark:text-slate-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            <h3 className="text-lg font-semibold">No sensors found</h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
              {search
                ? 'Try a different search term.'
                : 'Scan your first sensor label to populate the inventory.'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border border-slate-200/60 dark:border-slate-700/60">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200/60 bg-slate-50/80 dark:border-slate-700/60 dark:bg-slate-800/50">
                    <th className="px-4 py-3 font-semibold">Sensor Type</th>
                    <th className="px-4 py-3 font-semibold">Serial Number</th>
                    <th className="px-4 py-3 font-semibold">Manufacturer</th>
                    <th className="px-4 py-3 font-semibold">Scanned At</th>
                    <th className="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sensors.map((sensor) => (
                    <tr
                      key={sensor._id}
                      className="border-b border-slate-100 transition hover:bg-slate-50/50 dark:border-slate-800 dark:hover:bg-slate-800/30"
                    >
                      <td className="px-4 py-3 font-medium">{sensor.sensorType}</td>
                      <td className="px-4 py-3 font-mono text-sky-600 dark:text-sky-400">
                        {sensor.serialNumber}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                        {sensor.manufacturer || '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                        {formatDateTime(sensor.scannedAt)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => handleDelete(sensor._id)}
                          disabled={deletingId === sensor._id}
                          className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-500/10 disabled:opacity-50"
                        >
                          {deletingId === sensor._id ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination.totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Page {pagination.page} of {pagination.totalPages} ({pagination.total} results)
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-40 dark:border-slate-600"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-40 dark:border-slate-600"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </GlassCard>
    </div>
  );
};
