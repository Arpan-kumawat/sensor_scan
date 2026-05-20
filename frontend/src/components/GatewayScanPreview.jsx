import { validateGatewayForm } from '../utils/validators';

export const GatewayScanPreview = ({
  form,
  errors,
  onChange,
  onSave,
  onRescan,
  saving,
}) => {
  const { isValid } = validateGatewayForm(form);

  return (
    <div className="animate-slide-up space-y-4">
      <h3 className="text-lg font-semibold">Gateway serial</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        From barcode (e.g. GU300S-00104). Edit if needed, then save.
      </p>

      <div className="space-y-3">
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Gateway serial number
          </span>
          <input
            type="text"
            value={form.serialNumber}
            onChange={(e) => onChange('serialNumber', e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 font-mono text-sm outline-none ring-sky-500/30 focus:ring-2 dark:border-slate-600 dark:bg-slate-800/80"
            placeholder="e.g. GU300S-00104"
            autoComplete="off"
          />
          {errors.serialNumber && (
            <p className="mt-1 text-xs text-red-500">{errors.serialNumber}</p>
          )}
        </label>

        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Manufacturer (optional)
          </span>
          <input
            type="text"
            value={form.manufacturer}
            onChange={(e) => onChange('manufacturer', e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm outline-none ring-sky-500/30 focus:ring-2 dark:border-slate-600 dark:bg-slate-800/80"
            placeholder="Manufacturer name"
          />
        </label>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={onSave}
          disabled={!isValid || saving}
          className="flex-1 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save gateway'}
        </button>
        <button
          type="button"
          onClick={onRescan}
          disabled={saving}
          className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold transition hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800"
        >
          Scan again
        </button>
      </div>
    </div>
  );
};
