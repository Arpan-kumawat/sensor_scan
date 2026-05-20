export const SENSOR_TYPE_REGEX = /[A-Z]{3}\d{3}-[A-Z]/;
export const SERIAL_NUMBER_REGEX = /S\/N:\s*(\d+)/i;

/** Gateway barcode / label serial (e.g. GU300S-00104) */
export const GATEWAY_SERIAL_REGEX = /^[A-Z0-9]{3,}-[A-Z0-9]{3,}$/i;

export const SCAN_HISTORY_KEY = 'sensor-scan-history';
export const THEME_KEY = 'sensor-inventory-theme';
export const MAX_HISTORY = 20;

export const DUPLICATE_MESSAGE = 'Sensor already scanned';
export const DUPLICATE_GATEWAY_MESSAGE = 'Gateway already scanned';
