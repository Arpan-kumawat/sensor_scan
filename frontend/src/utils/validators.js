import { GATEWAY_SERIAL_REGEX, SENSOR_TYPE_REGEX, SERIAL_NUMBER_REGEX } from './constants';

/**
 * Finds a gateway serial printed on the label (e.g. GU300S-00104 below the barcode) in OCR text.
 * Normalizes spaced hyphens (e.g. "GU300S - 00104") then scans for hyphenated tokens.
 */
export const extractGatewaySerialFromText = (text) => {
  if (!text || typeof text !== 'string') {
    return { serialNumber: null, isValid: false };
  }

  const normalized = text
    .replace(/\r\n/g, '\n')
    .replace(/\s*-\s*/g, '-')
    .replace(/\s+/g, ' ')
    .trim();

  const tokenPattern = /[A-Z0-9]{3,}-[A-Z0-9]{3,}/gi;
  let match;
  let best = null;

  while ((match = tokenPattern.exec(normalized)) !== null) {
    const candidate = match[0].trim();
    if (GATEWAY_SERIAL_REGEX.test(candidate)) {
      best = candidate;
      break;
    }
  }

  return {
    serialNumber: best,
    isValid: Boolean(best),
  };
};

export const extractSensorData = (text) => {
  if (!text || typeof text !== 'string') {
    return { sensorType: null, serialNumber: null, isValid: false };
  }

  const normalized = text.replace(/\s+/g, ' ').trim();

  const typeMatch = normalized.match(SENSOR_TYPE_REGEX);
  const serialMatch = normalized.match(SERIAL_NUMBER_REGEX);

  const sensorType = typeMatch ? typeMatch[0] : null;
  const serialNumber = serialMatch ? serialMatch[1] : null;

  return {
    sensorType,
    serialNumber,
    isValid: Boolean(sensorType && serialNumber),
  };
};

export const validateSensorForm = ({ sensorType, serialNumber }) => {
  const errors = {};

  if (!sensorType?.trim()) {
    errors.sensorType = 'Sensor type is required';
  } else if (!SENSOR_TYPE_REGEX.test(sensorType.trim())) {
    errors.sensorType = 'Invalid format (e.g. SVT300-A)';
  }

  if (!serialNumber?.trim()) {
    errors.serialNumber = 'Serial number is required';
  } else if (!/^\d+$/.test(serialNumber.trim())) {
    errors.serialNumber = 'Serial must be numeric digits';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateGatewayForm = ({ serialNumber }) => {
  const errors = {};

  if (!serialNumber?.trim()) {
    errors.serialNumber = 'Gateway serial number is required';
  } else if (!GATEWAY_SERIAL_REGEX.test(serialNumber.trim())) {
    errors.serialNumber = 'Invalid format (e.g. GU300S-00104)';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/** Barcode may decode to the same string as the printed serial; OCR also validates this shape. */
export const isGatewaySerialFormat = (value) => {
  if (!value || typeof value !== 'string') return false;
  return GATEWAY_SERIAL_REGEX.test(value.trim());
};
