import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getCameraErrorMessage,
  getVideoConstraints,
  hasCameraApi,
  isSecureContext,
} from '../utils/cameraSupport';

const attachStream = async (videoRef, stream) => {
  if (!videoRef.current) return;
  videoRef.current.srcObject = stream;
  videoRef.current.setAttribute('playsinline', 'true');
  videoRef.current.setAttribute('webkit-playsinline', 'true');
  await videoRef.current.play();
};

const requestStream = async (facingMode) => {
  const attempts = [
    getVideoConstraints(facingMode, 'high'),
    getVideoConstraints(facingMode, 'basic'),
    getVideoConstraints(facingMode, 'minimal'),
    true,
  ];

  let lastError;
  for (const constraints of attempts) {
    try {
      return await navigator.mediaDevices.getUserMedia({
        video: constraints,
        audio: false,
      });
    } catch (err) {
      lastError = err;
      if (err.name === 'NotAllowedError' || err.name === 'NotFoundError') {
        throw err;
      }
    }
  }
  throw lastError;
};

export const useCamera = () => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');
  const [needsHttps, setNeedsHttps] = useState(false);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    setError(null);
    setNeedsHttps(!isSecureContext());

    if (!isSecureContext()) {
      setError(getCameraErrorMessage({ name: 'SecurityError' }));
      setIsActive(false);
      return;
    }

    if (!hasCameraApi()) {
      setError(getCameraErrorMessage(null));
      setIsActive(false);
      return;
    }

    stopCamera();

    try {
      const stream = await requestStream(facingMode);
      streamRef.current = stream;
      await attachStream(videoRef, stream);
      setIsActive(true);
      setNeedsHttps(false);
    } catch (err) {
      setError(getCameraErrorMessage(err));
      setIsActive(false);
    }
  }, [facingMode, stopCamera]);

  const switchCamera = useCallback(() => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  }, []);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  useEffect(() => {
    if (isActive) {
      startCamera();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  return {
    videoRef,
    isActive,
    error,
    needsHttps,
    facingMode,
    startCamera,
    stopCamera,
    switchCamera,
  };
};
