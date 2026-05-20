import Tesseract from 'tesseract.js';
import { preprocessImageForOcr } from './imageProcessing';
import { extractGatewaySerialFromText, extractSensorData } from './validators';

export const runOcrOnCanvas = async (sourceCanvas, onProgress) => {
  const processed = preprocessImageForOcr(sourceCanvas);

  const { data } = await Tesseract.recognize(processed, 'eng', {
    logger: (m) => {
      if (m.status === 'recognizing text' && onProgress) {
        onProgress(Math.round((m.progress || 0) * 100));
      }
    },
  });

  const extracted = extractSensorData(data.text);
  return {
    rawText: data.text,
    ...extracted,
  };
};

/** OCR for printed gateway serial (text below barcode), e.g. GU300S-00104 */
export const runGatewayOcrOnCanvas = async (sourceCanvas, onProgress) => {
  const processed = preprocessImageForOcr(sourceCanvas);

  const { data } = await Tesseract.recognize(processed, 'eng', {
    logger: (m) => {
      if (m.status === 'recognizing text' && onProgress) {
        onProgress(Math.round((m.progress || 0) * 100));
      }
    },
  });

  const extracted = extractGatewaySerialFromText(data.text);
  return {
    rawText: data.text,
    serialNumber: extracted.serialNumber,
    isValid: extracted.isValid,
  };
};
