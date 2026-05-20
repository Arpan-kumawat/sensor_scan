const DEFAULT_FORMATS = [
  'code_128',
  'code_39',
  'itf',
  'qr_code',
  'ean_13',
  'ean_8',
  'upc_a',
  'upc_e',
  'datamatrix',
  'pdf417',
];

export const isBarcodeDetectorSupported = () =>
  typeof window !== 'undefined' && 'BarcodeDetector' in window;

/**
 * @returns {Promise<BarcodeDetector | null>}
 */
export const createGatewayBarcodeDetector = async () => {
  if (!isBarcodeDetectorSupported()) return null;
  try {
    const supported = await window.BarcodeDetector.getSupportedFormats();
    const formats = DEFAULT_FORMATS.filter((f) => supported.includes(f));
    return new window.BarcodeDetector({
      formats: formats.length ? formats : supported,
    });
  } catch {
    return null;
  }
};

/**
 * @param {HTMLVideoElement} video
 * @param {BarcodeDetector} detector
 * @returns {Promise<string | null>} raw barcode value
 */
export const detectBarcodeFromVideo = async (video, detector) => {
  if (!video || !detector || video.readyState < 2) return null;
  if (video.videoWidth === 0) return null;
  try {
    const barcodes = await detector.detect(video);
    if (!barcodes?.length) return null;
    const raw = barcodes[0]?.rawValue;
    return typeof raw === 'string' ? raw.trim() : null;
  } catch {
    return null;
  }
};

/**
 * Same as live video, but uses a single captured frame (barcode + printed text align on one snapshot).
 * @param {HTMLCanvasElement} canvas
 * @param {BarcodeDetector} detector
 * @returns {Promise<string | null>} raw barcode value
 */
export const detectBarcodeFromCanvas = async (canvas, detector) => {
  if (!canvas || !detector) return null;
  try {
    const barcodes = await detector.detect(canvas);
    if (!barcodes?.length) return null;
    const raw = barcodes[0]?.rawValue;
    return typeof raw === 'string' ? raw.trim() : null;
  } catch {
    return null;
  }
};
