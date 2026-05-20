import { GATEWAY_SERIAL_REGEX, SENSOR_TYPE_REGEX, SERIAL_NUMBER_REGEX } from './constants';

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
