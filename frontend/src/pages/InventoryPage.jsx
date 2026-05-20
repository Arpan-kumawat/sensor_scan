import { useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { TableSkeleton } from '../components/Skeleton';
import { useGateways } from '../hooks/useGateways';
import { useToast } from '../hooks/useToast';
import { useSensors } from '../hooks/useSensors';
import { formatDateTime } from '../utils/formatDate';

const PAGE_SIZE = 10;

export const InventoryPage = () => {
  const { showToast } = useToast();
  const [inventoryTab, setInventoryTab] = useState('sensors');

  const sensorsHook = useSensors(1, PAGE_SIZE);
  const gatewaysHook = useGateways(1, PAGE_SIZE);

  const {
    sensors,
    loading: sensorsLoading,
    error: sensorsError,
    page: sensorPage,
    setPage: setSensorPage,
    search: sensorSearch,
    setSearch: setSensorSearch,
    pagination: sensorPagination,
    totalCount: sensorTotalCount,
    removeSensor,
    exportExcel: exportSensorsExcel,
  } = sensorsHook;

  const {
    gateways,
    loading: gatewaysLoading,
    error: gatewaysError,
    page: gatewayPage,
    setPage: setGatewayPage,
    search: gatewaySearch,
    setSearch: setGatewaySearch,
    pagination: gatewayPagination,
    totalCount: gatewayTotalCount,
    removeGateway,
    exportExcel: exportGatewaysExcel,
  } = gatewaysHook;

  const [sensorSearchInput, setSensorSearchInput] = useState('');
  const [gatewaySearchInput, setGatewaySearchInput] = useState('');
  const [deletingSensorId, setDeletingSensorId] = useState(null);
  const [deletingGatewayId, setDeletingGatewayId] = useState(null);
  const [exportingSensors, setExportingSensors] = useState(false);
  const [exportingGateways, setExportingGateways] = useState(false);

  const handleSensorSearch = (e) => {
    e.preventDefault();
    setSensorSearch(sensorSearchInput);
    setSensorPage(1);
  };

  const handleGatewaySearch = (e) => {
    e.preventDefault();
    setGatewaySearch(gatewaySearchInput);
    setGatewayPage(1);
  };

  const handleDeleteSensor = async (id) => {
    if (!window.confirm('Delete this sensor from inventory?')) return;
    setDeletingSensorId(id);
    try {
      await removeSensor(id);
      showToast('Sensor deleted', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete failed', 'error');
    } finally {
      setDeletingSensorId(null);
    }
  };

  const handleDeleteGateway = async (id) => {
    if (!window.confirm('Delete this gateway from inventory?')) return;
    setDeletingGatewayId(id);
    try {
      await removeGateway(id);
      showToast('Gateway deleted', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete failed', 'error');
    } finally {
      setDeletingGatewayId(null);
    }
  };

  const handleExportSensors = async () => {
    setExportingSensors(true);
    try {
      await exportSensorsExcel();
      showToast('Sensor Excel downloaded', 'success');
    } catch {
      showToast('Export failed', 'error');
    } finally {
      setExportingSensors(false);
    }
  };

  const handleExportGateways = async () => {
    setExportingGateways(true);
    try {
      await exportGatewaysExcel();
      showToast('Gateway Excel downloaded', 'success');
    } catch {
      showToast('Export failed', 'error');
    } finally {
      setExportingGateways(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Inventory</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Sensors and gateways in separate lists
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <GlassCard className="!p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Sensors</p>
            <p className="text-3xl font-bold text-sky-500">{sensorTotalCount}</p>
          </GlassCard>
          <GlassCard className="!p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Gateways</p>
            <p className="text-3xl font-bold text-violet-500">{gatewayTotalCount}</p>
          </GlassCard>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200/80 bg-white/50 p-1 dark:border-slate-700/80 dark:bg-slate-900/40">
        <button
          type="button"
          onClick={() => setInventoryTab('sensors')}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
            inventoryTab === 'sensors'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
        >
          Sensors
        </button>
        <button
          type="button"
          onClick={() => setInventoryTab('gateways')}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
            inventoryTab === 'gateways'
              ? 'bg-violet-500 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
        >
          Gateways
        </button>
      </div>

      {inventoryTab === 'sensors' && (
        <GlassCard>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <form onSubmit={handleSensorSearch} className="flex flex-1 gap-2">
              <input
                type="search"
                value={sensorSearchInput}
                onChange={(e) => setSensorSearchInput(e.target.value)}
                placeholder="Search by type or serial..."
                className="flex-1 rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-500/30 dark:border-slate-600 dark:bg-slate-800/80"
              />
              <button
                type="submit"
                className="rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-600"
              >
                Search
              </button>
              {sensorSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setSensorSearchInput('');
                    setSensorSearch('');
                    setSensorPage(1);
                  }}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm dark:border-slate-600"
                >
                  Clear
                </button>
              )}
            </form>
            <button
              type="button"
              onClick={handleExportSensors}
              disabled={exportingSensors || sensorTotalCount === 0}
              className="rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
            >
              {exportingSensors ? 'Exporting...' : 'Export Excel'}
            </button>
          </div>

          {sensorsError && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-300">
              {sensorsError}
            </div>
          )}

          {sensorsLoading ? (
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
                {sensorSearch
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
                            onClick={() => handleDeleteSensor(sensor._id)}
                            disabled={deletingSensorId === sensor._id}
                            className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-500/10 disabled:opacity-50"
                          >
                            {deletingSensorId === sensor._id ? 'Deleting...' : 'Delete'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {sensorPagination.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-slate-500">
                    Page {sensorPagination.page} of {sensorPagination.totalPages} (
                    {sensorPagination.total} results)
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={sensorPage <= 1}
                      onClick={() => setSensorPage((p) => p - 1)}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-40 dark:border-slate-600"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={sensorPage >= sensorPagination.totalPages}
                      onClick={() => setSensorPage((p) => p + 1)}
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
      )}

      {inventoryTab === 'gateways' && (
        <GlassCard>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <form onSubmit={handleGatewaySearch} className="flex flex-1 gap-2">
              <input
                type="search"
                value={gatewaySearchInput}
                onChange={(e) => setGatewaySearchInput(e.target.value)}
                placeholder="Search gateway serial..."
                className="flex-1 rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500/30 dark:border-slate-600 dark:bg-slate-800/80"
              />
              <button
                type="submit"
                className="rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-600"
              >
                Search
              </button>
              {gatewaySearch && (
                <button
                  type="button"
                  onClick={() => {
                    setGatewaySearchInput('');
                    setGatewaySearch('');
                    setGatewayPage(1);
                  }}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm dark:border-slate-600"
                >
                  Clear
                </button>
              )}
            </form>
            <button
              type="button"
              onClick={handleExportGateways}
              disabled={exportingGateways || gatewayTotalCount === 0}
              className="rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
            >
              {exportingGateways ? 'Exporting...' : 'Export Excel'}
            </button>
          </div>

          {gatewaysError && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-300">
              {gatewaysError}
            </div>
          )}

          {gatewaysLoading ? (
            <TableSkeleton rows={6} />
          ) : gateways.length === 0 ? (
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
                  d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <h3 className="text-lg font-semibold">No gateways found</h3>
              <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                {gatewaySearch
                  ? 'Try a different search term.'
                  : 'Scan or enter a gateway serial on the Scan page.'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200/60 bg-slate-50/80 dark:border-slate-700/60 dark:bg-slate-800/50">
                      <th className="px-4 py-3 font-semibold">Gateway serial</th>
                      <th className="px-4 py-3 font-semibold">Manufacturer</th>
                      <th className="px-4 py-3 font-semibold">Scanned At</th>
                      <th className="px-4 py-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gateways.map((gateway) => (
                      <tr
                        key={gateway._id}
                        className="border-b border-slate-100 transition hover:bg-slate-50/50 dark:border-slate-800 dark:hover:bg-slate-800/30"
                      >
                        <td className="px-4 py-3 font-mono font-medium text-violet-600 dark:text-violet-400">
                          {gateway.serialNumber}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                          {gateway.manufacturer || '—'}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                          {formatDateTime(gateway.scannedAt)}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => handleDeleteGateway(gateway._id)}
                            disabled={deletingGatewayId === gateway._id}
                            className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-500/10 disabled:opacity-50"
                          >
                            {deletingGatewayId === gateway._id ? 'Deleting...' : 'Delete'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {gatewayPagination.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-slate-500">
                    Page {gatewayPagination.page} of {gatewayPagination.totalPages} (
                    {gatewayPagination.total} results)
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={gatewayPage <= 1}
                      onClick={() => setGatewayPage((p) => p - 1)}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-40 dark:border-slate-600"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={gatewayPage >= gatewayPagination.totalPages}
                      onClick={() => setGatewayPage((p) => p + 1)}
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
      )}
    </div>
  );
};
