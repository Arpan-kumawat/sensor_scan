export const isSecureContext = () =>
  typeof window !== 'undefined' && window.isSecureContext;

export const hasCameraApi = () =>
  typeof navigator !== 'undefined' &&
  Boolean(navigator.mediaDevices?.getUserMedia);

export const getCameraErrorMessage = (err) => {
  if (!hasCameraApi()) {
    if (!isSecureContext()) {
      return 'Camera requires HTTPS on mobile. Open the https:// URL from the terminal (not http://).';
    }
    return 'Camera API is not supported in this browser.';
  }

  switch (err?.name) {
    case 'NotAllowedError':
    case 'PermissionDeniedError':
      return 'Camera permission denied. Allow camera in browser/site settings, then tap Start Camera again.';
    case 'NotFoundError':
    case 'DevicesNotFoundError':
      return 'No camera found on this device.';
    case 'NotReadableError':
    case 'TrackStartError':
      return 'Camera is in use by another app. Close it and try again.';
    case 'OverconstrainedError':
    case 'ConstraintNotSatisfiedError':
      return 'Could not start camera with the requested settings.';
    case 'SecurityError':
      return 'Camera blocked for security. Use HTTPS (https://your-ip:5173), not HTTP.';
    case 'AbortError':
      return 'Camera request was cancelled. Tap Start Camera to try again.';
    default:
      if (!isSecureContext()) {
        return 'Camera requires HTTPS on mobile. Use the https:// network URL from npm run dev.';
      }
      return `Unable to access camera (${err?.message || err?.name || 'unknown error'}).`;
  }
};

export const getVideoConstraints = (facingMode, level = 'high') => {
  if (level === 'basic') {
    return { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } };
  }
  if (level === 'minimal') {
    return { facingMode };
  }
  return {
    facingMode: { ideal: facingMode },
    width: { ideal: 1280, max: 1920 },
    height: { ideal: 720, max: 1080 },
  };
};
