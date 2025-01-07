'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { useRouter } from 'next/navigation';

export default function CapturePage() {
  const webcamRef = useRef<Webcam>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasFlash, setHasFlash] = useState(false);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if flash is available
    if ('ImageCapture' in window) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          const track = stream.getVideoTracks()[0];
          const imageCapture = new (window as any).ImageCapture(track);
          imageCapture.getPhotoCapabilities()
            .then((capabilities: any) => {
              setHasFlash(!!capabilities.fillLightMode?.includes('flash'));
            })
            .catch(console.error);
        })
        .catch(console.error);
    }
  }, []);

  const captureReceipt = useCallback(async () => {
    if (!webcamRef.current) return;
    
    try {
      setIsProcessing(true);

      // Capture image
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) return;

      // Convert base64 to blob
      const response = await fetch(imageSrc);
      const blob = await response.blob();
      const file = new File([blob], `receipt-${Date.now()}.jpg`, { type: 'image/jpeg' });

      // Get location if available
      let location = null;
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
      } catch (error) {
        console.warn('Location not available:', error);
      }

      // Get calendar events if available
      let calendarEvent = null;
      if ('calendar' in navigator) {
        try {
          // This is a hypothetical API - actual implementation would depend on the platform
          const events = await (navigator as any).calendar.getEvents({
            startTime: new Date(Date.now() - 30 * 60 * 1000), // Last 30 minutes
            endTime: new Date(),
          });
          if (events?.length > 0) {
            calendarEvent = events[0];
          }
        } catch (error) {
          console.warn('Calendar not available:', error);
        }
      }

      // Create form data
      const formData = new FormData();
      formData.append('receipt', file);
      formData.append('metadata', JSON.stringify({
        timestamp: new Date().toISOString(),
        location,
        calendarEvent,
      }));

      // Upload to API
      const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_MAIN_APP_URL}/api/receipts/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload receipt');
      }

      // Navigate to receipt view
      const { receipt } = await uploadResponse.json();
      router.push(`/receipts/${receipt.id}`);
    } catch (error) {
      console.error('Failed to capture receipt:', error);
      // TODO: Show error toast
    } finally {
      setIsProcessing(false);
    }
  }, [router]);

  const toggleFlash = useCallback(() => {
    if (!webcamRef.current || !hasFlash) return;

    const track = webcamRef.current.video?.srcObject
      ? (webcamRef.current.video.srcObject as MediaStream).getVideoTracks()[0]
      : null;

    if (track) {
      const capabilities = track.getCapabilities();
      const settings = track.getSettings();

      if (capabilities.torch) {
        track.applyConstraints({
          advanced: [{ torch: !settings.torch }],
        }).then(() => {
          setIsFlashOn(!settings.torch);
        });
      }
    }
  }, [hasFlash]);

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Camera View */}
      <div className="flex-1 relative">
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={{
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          }}
          onUserMedia={() => setIsCameraReady(true)}
          className="w-full h-full object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="h-full flex flex-col">
            {/* Receipt guide overlay */}
            <div className="flex-1 border-2 border-white/50 m-4 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-black p-4 flex justify-between items-center">
        {/* Gallery Button */}
        <button
          onClick={() => router.push('/receipts')}
          className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="white"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
            />
          </svg>
        </button>

        {/* Capture Button */}
        <button
          onClick={captureReceipt}
          disabled={!isCameraReady || isProcessing}
          className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center disabled:opacity-50"
        >
          <div className="w-16 h-16 rounded-full bg-white" />
        </button>

        {/* Flash Button */}
        {hasFlash && (
          <button
            onClick={toggleFlash}
            className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="white"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
} 