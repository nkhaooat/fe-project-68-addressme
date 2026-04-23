'use client';

import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { merchantScanQR } from '@/libs/auth';

type ScanState = 'idle' | 'scanning' | 'success' | 'error' | 'denied' | 'insecure';

interface ScanResult {
  success: boolean;
  message: string;
  data?: {
    reservationId: string;
    status: string;
    user: { name: string; email: string; telephone: string };
    service: { name: string; duration: number; price: number };
    resvDate: string;
  };
}

export default function MerchantScanPage() {
  const { token, user } = useSelector((state: RootState) => state.auth);
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrRef = useRef<any>(null);
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [result, setResult] = useState<ScanResult | null>(null);
  const [verifying, setVerifying] = useState(false);

  // Check secure context
  const isSecure = typeof window !== 'undefined' && (window.isSecureContext || location.protocol === 'https:' || location.hostname === 'localhost');

  useEffect(() => {
    if (!isSecure) {
      setScanState('insecure');
      return;
    }
    return () => {
      stopScanner();
    };
  }, []);

  async function startScanner() {
    setScanState('scanning');
    setResult(null);

    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const scanner = new Html5Qrcode('qr-reader');
      html5QrRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText: string) => {
          // QR code may contain a URL like /qr/{token} — extract just the token
          let qrToken = decodedText;
          try {
            const url = new URL(decodedText);
            // Extract last path segment as token (e.g., /qr/abc123 → abc123)
            const segments = url.pathname.split('/').filter(Boolean);
            if (segments.length >= 2 && segments[segments.length - 2] === 'qr') {
              qrToken = segments[segments.length - 1];
            }
          } catch {
            // Not a URL — use as-is (raw token)
          }
          // Stop scanner and verify
          try {
            await scanner.stop();
          } catch {}
          html5QrRef.current = null;
          await verifyToken(qrToken);
        },
        () => {} // ignore scan failures
      );
    } catch (err: any) {
      if (err?.toString?.().includes('NotAllowedError') || err?.toString?.().includes('Permission')) {
        setScanState('denied');
      } else {
        setScanState('error');
        setResult({ success: false, message: `Camera error: ${err?.message || err}` });
      }
    }
  }

  async function stopScanner() {
    try {
      if (html5QrRef.current) {
        await html5QrRef.current.stop();
        html5QrRef.current = null;
      }
    } catch {}
  }

  async function verifyToken(qrToken: string) {
    setVerifying(true);
    try {
      const res = await merchantScanQR(token!, qrToken);
      setResult(res);
      setScanState(res.success ? 'success' : 'error');
    } catch {
      setResult({ success: false, message: 'Verification failed' });
      setScanState('error');
    }
    setVerifying(false);
  }

  function handleReset() {
    setResult(null);
    setScanState('idle');
  }

  if (user?.role !== 'merchant' || user?.merchantStatus !== 'approved') {
    return (
      <main className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <p className="text-red-400 text-xl">Merchant access required</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#1A1A1A] py-8">
      <div className="max-w-lg mx-auto px-4">
        <h1 className="text-3xl font-bold text-[#F0E5D8] mb-6 text-center">QR Scanner</h1>

        {/* Insecure context warning */}
        {scanState === 'insecure' && (
          <div className="bg-red-900/30 border border-red-600 rounded-lg p-6 text-center">
            <p className="text-red-400 text-lg font-bold mb-2">HTTPS Required</p>
            <p className="text-[#A88C6B] text-sm">
              QR scanning requires a secure connection (HTTPS). Please access this page via HTTPS.
            </p>
          </div>
        )}

        {/* Camera denied */}
        {scanState === 'denied' && (
          <div className="bg-red-900/30 border border-red-600 rounded-lg p-6 text-center">
            <p className="text-red-400 text-lg font-bold mb-2">Camera Access Denied</p>
            <p className="text-[#A88C6B] text-sm mb-4">
              Please allow camera access in your browser settings to scan QR codes.
            </p>
            <button onClick={startScanner}
              className="px-6 py-2 bg-[#E57A00] text-[#1A110A] font-bold rounded hover:bg-[#c46a00] transition-colors">
              Try Again
            </button>
          </div>
        )}

        {/* Idle — start button */}
        {scanState === 'idle' && (
          <div className="text-center">
            <div className="bg-[#2B2B2B] border border-[#403A36] rounded-xl p-8">
              <div className="text-6xl mb-6">📷</div>
              <p className="text-[#D4CFC6] mb-6">Point your camera at the customer&apos;s QR code to verify their booking</p>
              <button onClick={startScanner}
                className="px-8 py-4 bg-[#E57A00] text-[#1A110A] font-bold text-lg rounded-xl hover:bg-[#c46a00] transition-colors">
                Start Scanner
              </button>
            </div>
          </div>
        )}

        {/* Scanning */}
        {scanState === 'scanning' && (
          <div className="text-center">
            <div className="bg-[#2B2B2B] border border-[#403A36] rounded-xl overflow-hidden">
              <div id="qr-reader" ref={scannerRef} className="w-full" />
            </div>
            <p className="text-[#A88C6B] text-sm mt-4">Scanning... point at QR code</p>
            <button onClick={async () => { await stopScanner(); setScanState('idle'); }}
              className="mt-4 px-6 py-2 bg-[#2B2B2B] border border-[#403A36] text-[#D4CFC6] rounded hover:border-[#E57A00] transition-colors">
              Cancel
            </button>
          </div>
        )}

        {/* Verifying */}
        {verifying && (
          <div className="text-center py-16">
            <div className="text-4xl mb-4 animate-spin">⏳</div>
            <p className="text-[#E57A00] text-lg">Verifying QR code...</p>
          </div>
        )}

        {/* Success result */}
        {scanState === 'success' && result && !verifying && (
          <div className="bg-green-900/30 border border-green-600 rounded-xl p-6 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-green-400 mb-4">Session Confirmed</h2>
            {result.data && (
              <div className="bg-[#1A1A1A] rounded-lg p-4 text-left space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-[#8A8177]">Customer</span>
                  <span className="text-[#F0E5D8] font-semibold">{result.data.user.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8A8177]">Email</span>
                  <span className="text-[#D4CFC6]">{result.data.user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8A8177]">Service</span>
                  <span className="text-[#D4CFC6]">{result.data.service.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8A8177]">Duration</span>
                  <span className="text-[#D4CFC6]">{result.data.service.duration} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8A8177]">Date</span>
                  <span className="text-[#D4CFC6]">{new Date(result.data.resvDate).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8A8177]">Status</span>
                  <span className="text-green-400 font-bold">
                    {result.data.status.charAt(0).toUpperCase() + result.data.status.slice(1)}
                  </span>
                </div>
              </div>
            )}
            <button onClick={handleReset}
              className="px-6 py-2 bg-[#E57A00] text-[#1A110A] font-bold rounded hover:bg-[#c46a00] transition-colors">
              Scan Another
            </button>
          </div>
        )}

        {/* Error result */}
        {scanState === 'error' && result && !verifying && (
          <div className="bg-red-900/30 border border-red-600 rounded-xl p-6 text-center">
            <div className="text-5xl mb-4">❌</div>
            <h2 className="text-xl font-bold text-red-400 mb-2">Verification Failed</h2>
            <p className="text-[#A88C6B] mb-4">{result.message}</p>
            <button onClick={handleReset}
              className="px-6 py-2 bg-[#E57A00] text-[#1A110A] font-bold rounded hover:bg-[#c46a00] transition-colors">
              Scan Another
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
