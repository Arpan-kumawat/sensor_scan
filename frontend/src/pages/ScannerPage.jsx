import { useCallback, useEffect, useRef, useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { OcrLoader } from '../components/OcrLoader';
import { ScanHistory } from '../components/ScanHistory';
import { ScanPreview } from '../components/ScanPreview';
import { useCamera } from '../hooks/useCamera';
import { useToast } from '../hooks/useToast';
import { createSensor } from '../services/api';
import { DUPLICATE_MESSAGE } from '../utils/constants';
import { captureFrameFromVideo } from '../utils/imageProcessing';
import { runOcrOnCanvas } from '../utils/ocr';
import { addToScanHistory, clearScanHistory, getScanHistory } from '../utils/scanHistory';
import { isSecureContext } from '../utils/cameraSupport';
import { validateSensorForm } from '../utils/validators';

const AUTO_SCAN_INTERVAL_MS = 3500;

export const ScannerPage = () => {
  const { showToast } = useToast();
  const {
    videoRef,
    isActive,
    error: cameraError,
    startCamera,
    stopCamera,
    switchCamera,
  } = useCamera();

  const [ocrRunning, setOcrRunning] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [preview, setPreview] = useState(null);
  const [form, setForm] = useState({ sensorType: '', serialNumber: '', manufacturer: '' });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [autoScan, setAutoScan] = useState(false);
  const [history, setHistory] = useState(getScanHistory);
  const scanLockRef = useRef(false);
  const autoTimerRef = useRef(null);

  const resetPreview = useCallback(() => {
    setPreview(null);
    setForm({ sensorType: '', serialNumber: '', manufacturer: '' });
    setFormErrors({});
    scanLockRef.current = false;
  }, []);

  const performScan = useCallback(async () => {
    if (!videoRef.current || scanLockRef.current || ocrRunning || preview) return;
    if (videoRef.current.videoWidth === 0) return;

    scanLockRef.current = true;
    setOcrRunning(true);
    setOcrProgress(0);

    try {
      const canvas = captureFrameFromVideo(videoRef.current);
      const result = await runOcrOnCanvas(canvas, setOcrProgress);

      if (!result.isValid) {
        showToast('Could not read label. Adjust angle and lighting, then try again.', 'warning');
        scanLockRef.current = false;
        return;
      }

      setPreview(canvas.toDataURL('image/jpeg', 0.85));
      setForm({
        sensorType: result.sensorType || '',
        serialNumber: result.serialNumber || '',
        manufacturer: '',
      });
      setFormErrors({});
      stopCamera();
      showToast('Label detected successfully', 'success');
    } catch {
      showToast('OCR failed. Please try again.', 'error');
      scanLockRef.current = false;
    } finally {
      setOcrRunning(false);
    }
  }, [ocrRunning, preview, showToast, stopCamera, videoRef]);

  useEffect(() => {
    if (!autoScan || !isActive || preview || ocrRunning) {
      if (autoTimerRef.current) {
        clearInterval(autoTimerRef.current);
        autoTimerRef.current = null;
      }
      return;
    }

    autoTimerRef.current = setInterval(performScan, AUTO_SCAN_INTERVAL_MS);
    return () => {
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
    };
  }, [autoScan, isActive, preview, ocrRunning, performScan]);

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSave = async () => {
    const validation = validateSensorForm(form);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    setSaving(true);
    try {
      await createSensor({
        sensorType: form.sensorType.trim(),
        serialNumber: form.serialNumber.trim(),
        manufacturer: form.manufacturer.trim(),
      });

      const updated = addToScanHistory({
        sensorType: form.sensorType.trim(),
        serialNumber: form.serialNumber.trim(),
        status: 'saved',
      });
      setHistory(updated);
      showToast('Sensor saved to inventory', 'success');
      resetPreview();
    } catch (err) {
      const message = err.response?.data?.message;
      if (err.response?.status === 409 || message === DUPLICATE_MESSAGE) {
        showToast(DUPLICATE_MESSAGE, 'warning');
        addToScanHistory({
          sensorType: form.sensorType.trim(),
          serialNumber: form.serialNumber.trim(),
          status: 'duplicate',
        });
        setHistory(getScanHistory());
      } else {
        showToast(message || 'Failed to save sensor', 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleRescan = () => {
    resetPreview();
    startCamera();
  };

  return (
    <div className="space-y-6">
      <div className="animate-slide-up">
        <h2 className="text-2xl font-bold">Scan Sensor Label</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Point the camera at the label. OCR extracts sensor type (e.g. SVT300-A) and serial (S/N:
          00871).
        </p>
      </div>

      {!isSecureContext() && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
          <strong>Mobile camera tip:</strong> Use the <strong>https://</strong> URL from your
          terminal (not http://). Accept the security warning on first visit, then tap{' '}
          <strong>Start Camera</strong> and allow permission.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          {!preview ? (
            <div className="space-y-4">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-900">
                {!isActive && !cameraError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-400">
                    <svg className="h-16 w-16 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <p className="text-sm">Camera not started</p>
                  </div>
                )}

                {cameraError && (
                  <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-red-400">
                    {cameraError}
                  </div>
                )}

                <video
                  ref={videoRef}
                  playsInline
                  muted
                  autoPlay
                  className={`h-full w-full object-cover ${isActive ? 'block' : 'hidden'}`}
                />

                {isActive && !ocrRunning && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="focus-ring-animate h-[55%] w-[75%] rounded-2xl border-2 border-dashed border-sky-400/80 shadow-[0_0_30px_rgba(14,165,233,0.25)]" />
                  </div>
                )}

                {ocrRunning && <OcrLoader progress={ocrProgress} />}
              </div>

              <div className="flex flex-wrap gap-2">
                {!isActive ? (
                  <button
                    type="button"
                    onClick={startCamera}
                    className="rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-600"
                  >
                    Start Camera
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={performScan}
                      disabled={ocrRunning}
                      className="rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-50"
                    >
                      Capture & Scan
                    </button>
                    <button
                      type="button"
                      onClick={switchCamera}
                      className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium dark:border-slate-600"
                    >
                      Flip Camera
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium dark:border-slate-600"
                    >
                      Stop
                    </button>
                    <label className="ml-auto flex cursor-pointer items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={autoScan}
                        onChange={(e) => setAutoScan(e.target.checked)}
                        className="rounded border-slate-300"
                      />
                      Auto-scan
                    </label>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <img
                src={preview}
                alt="Captured label"
                className="aspect-[4/3] w-full rounded-2xl object-cover"
              />
              <ScanPreview
                form={form}
                errors={formErrors}
                onChange={handleFormChange}
                onSave={handleSave}
                onRescan={handleRescan}
                saving={saving}
              />
            </div>
          )}
        </GlassCard>

        <GlassCard>
          <ScanHistory
            history={history}
            onClear={() => {
              clearScanHistory();
              setHistory([]);
            }}
          />
        </GlassCard>
      </div>
    </div>
  );
};
