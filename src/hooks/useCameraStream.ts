'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface CameraDevice {
  deviceId: string;
  label: string;
  facingMode?: string;
}

interface UseCameraStreamReturn {
  stream: MediaStream | null;
  devices: CameraDevice[];
  currentDeviceId: string | null;
  error: string | null;
  isMobile: boolean;
  isLoading: boolean;
  requestCamera: () => Promise<void>;
  switchCamera: (deviceId: string) => Promise<void>;
  stopCamera: () => void;
}

export function useCameraStream(): UseCameraStreamReturn {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [devices, setDevices] = useState<CameraDevice[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Detect mobile - use multiple indicators
  const isMobile = useRef<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const ua = navigator.userAgent;
    const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const isSmallScreen = window.innerWidth <= 768;
    return hasTouchScreen && (isMobileUA || isSmallScreen);
  });

  // Get stored camera preference
  const getStoredCamera = useCallback(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('canisense_camera_device');
  }, []);

  // Store camera preference
  const storeCamera = useCallback((deviceId: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('canisense_camera_device', deviceId);
  }, []);

  // Enumerate devices
  const enumerateDevices = useCallback(async () => {
    try {
      const deviceList = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = deviceList
        .filter(device => device.kind === 'videoinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Caméra ${device.deviceId.slice(0, 8)}`,
          facingMode: getFacingModeFromLabel(device.label)
        }));
      setDevices(videoDevices);
      return videoDevices;
    } catch (err) {
      console.error('Error enumerating devices:', err);
      return [];
    }
  }, []);

  // Get facing mode from device label (heuristic)
  const getFacingModeFromLabel = (label: string): string | undefined => {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes('back') || lowerLabel.includes('rear') || lowerLabel.includes('environment')) {
      return 'environment';
    }
    if (lowerLabel.includes('front') || lowerLabel.includes('user')) {
      return 'user';
    }
    return undefined;
  };

  // Get constraints for camera request
  const getConstraints = useCallback((deviceId?: string): MediaStreamConstraints => {
    const baseConstraints: MediaStreamConstraints = {
      video: {},
      audio: true
    };

    if (deviceId) {
      // Specific device requested
      (baseConstraints.video as any).deviceId = { exact: deviceId };
    } else if (isMobile.current) {
      // Mobile: prefer rear camera
      (baseConstraints.video as any).facingMode = { ideal: 'environment' };
    } else {
      // Desktop: use default
      (baseConstraints.video as any).facingMode = { ideal: 'user' };
    }

    return baseConstraints;
  }, []);

  // Try to get stream with specific constraints
  const tryGetUserMedia = async (constraints: MediaStreamConstraints): Promise<MediaStream> => {
    try {
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      return newStream;
    } catch (err) {
      throw err;
    }
  };

  // Request camera access
  const requestCamera = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Stop existing stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      let newStream: MediaStream;
      let selectedDeviceId: string | null = null;

      // Check if user has stored preference
      const storedDevice = getStoredCamera();
      if (storedDevice && devices.find(d => d.deviceId === storedDevice)) {
        // Try stored device first
        try {
          const constraints = getConstraints(storedDevice);
          newStream = await tryGetUserMedia(constraints);
          selectedDeviceId = storedDevice;
        } catch (err) {
          // Stored device failed, continue to auto-selection
          console.warn('Stored camera failed, trying auto-selection');
        }
      }

      if (!newStream) {
        // Auto-selection based on device type
        if (isMobile.current) {
          // Mobile: try environment first, then enumerate
          try {
            const constraints: MediaStreamConstraints = {
              video: { facingMode: { exact: 'environment' } },
              audio: true
            };
            newStream = await tryGetUserMedia(constraints);
          } catch (envErr) {
            console.warn('Environment camera failed, trying facingMode ideal');
            try {
              const constraints: MediaStreamConstraints = {
                video: { facingMode: { ideal: 'environment' } },
                audio: true
              };
              newStream = await tryGetUserMedia(constraints);
            } catch (idealErr) {
              console.warn('Environment ideal failed, enumerating devices');
              // Enumerate and find rear camera
              const videoDevices = await enumerateDevices();
              const rearDevice = videoDevices.find(d => d.facingMode === 'environment') ||
                               videoDevices.find(d => !d.facingMode || d.facingMode !== 'user');
              if (rearDevice) {
                const constraints = getConstraints(rearDevice.deviceId);
                newStream = await tryGetUserMedia(constraints);
                selectedDeviceId = rearDevice.deviceId;
              } else {
                throw new Error('Aucune caméra arrière disponible sur cet appareil.');
              }
            }
          }
        } else {
          // Desktop: use default
          const constraints = getConstraints();
          newStream = await tryGetUserMedia(constraints);
        }
      }

      setStream(newStream);
      setCurrentDeviceId(selectedDeviceId);

      // Store preference if we have a device ID
      if (selectedDeviceId) {
        storeCamera(selectedDeviceId);
      }

    } catch (err: any) {
      console.error('Error requesting camera:', err);
      let errorMessage = 'Erreur d\'accès à la caméra.';

      if (err.name === 'NotAllowedError') {
        errorMessage = 'Permission caméra refusée. Autorisez l\'accès pour continuer.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'Aucune caméra détectée sur cet appareil.';
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'La caméra est utilisée par une autre application.';
      } else if (err.message.includes('arrière')) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [stream, devices, getStoredCamera, getConstraints, enumerateDevices, storeCamera]);

  // Switch to different camera
  const switchCamera = useCallback(async (deviceId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Stop existing stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const constraints = getConstraints(deviceId);
      const newStream = await tryGetUserMedia(constraints);

      setStream(newStream);
      setCurrentDeviceId(deviceId);
      storeCamera(deviceId);

    } catch (err: any) {
      console.error('Error switching camera:', err);
      setError('Erreur lors du changement de caméra.');
    } finally {
      setIsLoading(false);
    }
  }, [stream, getConstraints, storeCamera]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setCurrentDeviceId(null);
    }
  }, [stream]);

  // Initialize devices on mount
  useEffect(() => {
    enumerateDevices();
  }, [enumerateDevices]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return {
    stream,
    devices,
    currentDeviceId,
    error,
    isMobile: isMobile.current,
    isLoading,
    requestCamera,
    switchCamera,
    stopCamera
  };
}
