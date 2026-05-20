import { useCallback, useEffect, useRef, useState } from 'react';
import { GatewayScanPreview } from '../components/GatewayScanPreview';
import { GlassCard } from '../components/GlassCard';
import { OcrLoader } from '../components/OcrLoader';
import { ScanHistory } from '../components/ScanHistory';
import { ScanPreview } from '../components/ScanPreview';
import { useCamera } from '../hooks/useCamera';
import { useToast } from '../hooks/useToast';
import { createGateway, createSensor } from '../services/api';
import {
  createGatewayBarcodeDetector,
  detectBarcodeFromVideo,
} from '../utils/barcodeScan';
import { DUPLICATE_GATEWAY_MESSAGE, DUPLICATE_MESSAGE } from '../utils/constants';
import { captureFrameFromVideo } from '../utils/imageProcessing';
import { runOcrOnCanvas } from '../utils/ocr';
import { addToScanHistory, clearScanHistory, getScanHistory } from '../utils/scanHistory';
import { isSecureContext } from '../utils/cameraSupport';
import { validateGatewayForm, validateSensorForm } from '../utils/validators';

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

  const [scanTab, setScanTab] = useState('sensor');
  const [reviewKind, setReviewKind] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const [ocrRunning, setOcrRunning] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [form, setForm] = useState({ sensorType: '', serialNumber: '', manufacturer: '' });
  const [formErrors, setFormErrors] = useState({});

  const [gatewayForm, setGatewayForm] = useState({ serialNumber: '', manufacturer: '' });
  const [gatewayFormErrors, setGatewayFormErrors] = useState({});
  const [gatewayScanning, setGatewayScanning] = useState(false);

  const [saving, setSaving] = useState(false);
  const [autoScan, setAutoScan] = useState(false);
  const [history, setHistory] = useState(getScanHistory);
  const scanLockRef = useRef(false);
  const autoTimerRef = useRef(null);
  const barcodeDetectorRef = useRef(null);

  const resetReview = useCallback(() => {
    setPreviewImage(null);
    setReviewKind(null);
    setForm({ sensorType: '', serialNumber: '', manufacturer: '' });
    setFormErrors({});
    setGatewayForm({ serialNumber: '', manufacturer: '' });
    setGatewayFormErrors({});
    scanLockRef.current = false;
  }, []);

  const changeScanTab = (tab) => {
    if (tab === scanTab) return;
    if (reviewKind) resetReview();
    setScanTab(tab);
  };

  const performOcrScan = useCallback(async () => {
    if (!videoRef.current || scanLockRef.current || ocrRunning || reviewKind) return;
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

      setPreviewImage(canvas.toDataURL('image/jpeg', 0.85));
      setForm({
        sensorType: result.sensorType || '',
        serialNumber: result.serialNumber || '',
        manufacturer: '',
      });
      setFormErrors({});
      setReviewKind('sensor');
      stopCamera();
      showToast('Label detected successfully', 'success');
    } catch {
      showToast('OCR failed. Please try again.', 'error');
      scanLockRef.current = false;
    } finally {
      setOcrRunning(false);
    }
  }, [ocrRunning, reviewKind, showToast, stopCamera, videoRef]);

  const performGatewayBarcodeScan = useCallback(async () => {
    if (!videoRef.current || scanLockRef.current || gatewayScanning || reviewKind) return;
    if (videoRef.current.videoWidth === 0) return;

    scanLockRef.current = true;
    setGatewayScanning(true);

    try {
      if (!barcodeDetectorRef.current) {
        barcodeDetectorRef.current = await createGatewayBarcodeDetector();
      }
      const detector = barcodeDetectorRef.current;
      if (!detector) {
        showToast(
          'Barcode scanning needs a supported browser (Chrome or Edge). Use Enter manually.',
          'warning'
        );
        scanLockRef.current = false;
        return;
      }

      const raw = await detectBarcodeFromVideo(videoRef.current, detector);
      if (!raw) {
        showToast('No barcode detected. Adjust distance or lighting, then try again.', 'warning');
        scanLockRef.current = false;
        return;
      }

      const canvas = captureFrameFromVideo(videoRef.current);
      setPreviewImage(canvas.toDataURL('image/jpeg', 0.85));
      setGatewayForm({ serialNumber: raw, manufacturer: '' });
      setGatewayFormErrors({});
      setReviewKind('gateway');
      stopCamera();
      showToast('Barcode read', 'success');
    } catch {
      showToast('Barcode scan failed. Try again or enter manually.', 'error');
    } finally {
      setGatewayScanning(false);
      scanLockRef.current = false;
    }
  }, [gatewayScanning, reviewKind, showToast, stopCamera, videoRef]);

  useEffect(() => {
    if (
      scanTab !== 'sensor' ||
      !autoScan ||
      !isActive ||
      reviewKind ||
      ocrRunning
    ) {
      if (autoTimerRef.current) {
        clearInterval(autoTimerRef.current);
        autoTimerRef.current = null;
      }
      return;
    }

    autoTimerRef.current = setInterval(performOcrScan, AUTO_SCAN_INTERVAL_MS);
    return () => {
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
    };
  }, [autoScan, isActive, ocrRunning, performOcrScan, reviewKind, scanTab]);

  const handleSensorFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleGatewayFormChange = (field, value) => {
    setGatewayForm((prev) => ({ ...prev, [field]: value }));
    setGatewayFormErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSaveSensor = async () => {
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
        mode: 'sensor',
        sensorType: form.sensorType.trim(),
        serialNumber: form.serialNumber.trim(),
        status: 'saved',
      });
      setHistory(updated);
      showToast('Sensor saved to inventory', 'success');
      resetReview();
    } catch (err) {
      const message = err.response?.data?.message;
      if (err.response?.status === 409 || message === DUPLICATE_MESSAGE) {
        showToast(DUPLICATE_MESSAGE, 'warning');
        addToScanHistory({
          mode: 'sensor',
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

  const handleSaveGateway = async () => {
    const validation = validateGatewayForm(gatewayForm);
    if (!validation.isValid) {
      setGatewayFormErrors(validation.errors);
      return;
    }

    setSaving(true);
    try {
      await createGateway({
        serialNumber: gatewayForm.serialNumber.trim(),
        manufacturer: gatewayForm.manufacturer.trim(),
      });

      const updated = addToScanHistory({
        mode: 'gateway',
        serialNumber: gatewayForm.serialNumber.trim(),
        status: 'saved',
      });
      setHistory(updated);
      showToast('Gateway saved to inventory', 'success');
      resetReview();
    } catch (err) {
      const message = err.response?.data?.message;
      if (err.response?.status === 409 || message === DUPLICATE_GATEWAY_MESSAGE) {
        showToast(DUPLICATE_GATEWAY_MESSAGE, 'warning');
        addToScanHistory({
          mode: 'gateway',
          serialNumber: gatewayForm.serialNumber.trim(),
          status: 'duplicate',
        });
        setHistory(getScanHistory());
      } else {
        showToast(message || 'Failed to save gateway', 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleRescan = () => {
    resetReview();
    startCamera();
  };

  const openGatewayManualEntry = () => {
    stopCamera();
    setPreviewImage(null);
    setGatewayForm({ serialNumber: '', manufacturer: '' });
    setGatewayFormErrors({});
    setReviewKind('gateway');
  };

  const showCamera = !reviewKind;
  const busyOverlay = scanTab === 'sensor' ? ocrRunning : gatewayScanning;

  return (
    <div className="space-y-6">
      <div className="animate-slide-up">
        <h2 className="text-2xl font-bold">Scan inventory</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          <strong>Sensor:</strong> OCR reads the label (type + S/N).{' '}
          <strong>Gateway:</strong> scan a barcode with serial like GU300S-00104, or enter it
          manually.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200/80 bg-white/50 p-1 dark:border-slate-700/80 dark:bg-slate-900/40">
        <button
          type="button"
          onClick={() => changeScanTab('sensor')}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
            scanTab === 'sensor'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
        >
          Sensor label (OCR)
        </button>
        <button
          type="button"
          onClick={() => changeScanTab('gateway')}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
            scanTab === 'gateway'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
        >
          Gateway barcode
        </button>
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
          {showCamera ? (
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

                {isActive && !busyOverlay && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="focus-ring-animate h-[55%] w-[75%] rounded-2xl border-2 border-dashed border-sky-400/80 shadow-[0_0_30px_rgba(14,165,233,0.25)]" />
                  </div>
                )}

                {scanTab === 'sensor' && ocrRunning && <OcrLoader progress={ocrProgress} />}
                {scanTab === 'gateway' && gatewayScanning && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/70 text-sm text-slate-200">
                    <p className="font-medium">Reading barcode…</p>
                  </div>
                )}
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
                    {scanTab === 'sensor' ? (
                      <button
                        type="button"
                        onClick={performOcrScan}
                        disabled={ocrRunning}
                        className="rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-50"
                      >
                        Capture & Scan
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={performGatewayBarcodeScan}
                          disabled={gatewayScanning}
                          className="rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-50"
                        >
                          Scan barcode
                        </button>
                        <button
                          type="button"
                          onClick={openGatewayManualEntry}
                          disabled={gatewayScanning}
                          className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium dark:border-slate-600"
                        >
                          Enter manually
                        </button>
                      </>
                    )}
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
                    {scanTab === 'sensor' && (
                      <label className="ml-auto flex cursor-pointer items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={autoScan}
                          onChange={(e) => setAutoScan(e.target.checked)}
                          className="rounded border-slate-300"
                        />
                        Auto-scan
                      </label>
                    )}
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt={reviewKind === 'sensor' ? 'Captured label' : 'Captured frame'}
                  className="aspect-[4/3] w-full rounded-2xl object-cover"
                />
              ) : (
                <div className="flex aspect-[4/3] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 text-center text-sm text-slate-500 dark:border-slate-600 dark:bg-slate-800/40 dark:text-slate-400">
                  <p className="font-medium text-slate-600 dark:text-slate-300">Manual entry</p>
                  <p className="mt-1 max-w-xs px-4">Type the gateway serial from the label or a USB scanner.</p>
                </div>
              )}
              {reviewKind === 'sensor' && (
                <ScanPreview
                  form={form}
                  errors={formErrors}
                  onChange={handleSensorFormChange}
                  onSave={handleSaveSensor}
                  onRescan={handleRescan}
                  saving={saving}
                />
              )}
              {reviewKind === 'gateway' && (
                <GatewayScanPreview
                  form={gatewayForm}
                  errors={gatewayFormErrors}
                  onChange={handleGatewayFormChange}
                  onSave={handleSaveGateway}
                  onRescan={handleRescan}
                  saving={saving}
                />
              )}
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
