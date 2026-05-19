import Tesseract from 'tesseract.js';
import { preprocessImageForOcr } from './imageProcessing';
import { extractSensorData } from './validators';

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
