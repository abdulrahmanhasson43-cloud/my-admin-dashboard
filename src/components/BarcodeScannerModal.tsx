import { useEffect, useRef, useState } from 'react';
import { XIcon } from '@/components/icons';

interface BarcodeScannerModalProps {
  onDetected: (code: string) => void;
  onClose: () => void;
}

export default function BarcodeScannerModal({ onDetected, onClose }: BarcodeScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const supported = typeof window !== 'undefined' && 'BarcodeDetector' in window;

  useEffect(() => {
    let cancelled = false;
    let rafId: number;

    async function start() {
      try {
        // facingMode: 'environment' forces the back camera directly —
        // no "front or back?" prompt to the user.
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
        });
        if (cancelled) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        if (supported) {
          const detector = new BarcodeDetector({
            formats: ['qr_code', 'ean_13', 'ean_8', 'code_128', 'code_39', 'upc_a', 'upc_e'],
          });
          const scanLoop = async () => {
            if (cancelled || !videoRef.current) return;
            try {
              const codes = await detector.detect(videoRef.current);
              if (codes.length > 0) {
                onDetected(codes[0].rawValue);
                return;
              }
            } catch {
              // keep scanning even if a single frame fails to decode
            }
            rafId = requestAnimationFrame(scanLoop);
          };
          rafId = requestAnimationFrame(scanLoop);
        }
      } catch {
        if (!cancelled) setError('مش قادرين نفتح الكاميرا. تأكد إنك سمحت للموقع بالوصول للكاميرا.');
      }
    }

    start();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [onDetected, supported]);

  return (
    <div className="fixed inset-0 z-[80] bg-black flex flex-col">
      <div className="flex items-center justify-between p-4">
        <span className="text-white text-[15px] font-semibold">امسح الباركود</span>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center transition-transform active:scale-90"
        >
          <XIcon size={18} className="text-white" />
        </button>
      </div>

      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {error ? (
          <div className="text-center px-8">
            <p className="text-white text-[14px] mb-4">{error}</p>
          </div>
        ) : (
          <>
            <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
            <div className="absolute w-64 h-64 border-2 border-white/70 rounded-2xl" />
            {!supported && (
              <div className="absolute bottom-24 inset-x-6 bg-black/60 rounded-xl p-3 text-center">
                <p className="text-white text-[12px]">
                  المتصفح ده مش بيدعم القراءة التلقائية — اكتب الباركود يدويًا تحت
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {!supported && !error && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (manualCode.trim()) onDetected(manualCode.trim());
          }}
          className="p-4 flex gap-2"
        >
          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="اكتب رقم الباركود..."
            className="flex-1 h-11 px-4 rounded-full bg-white/10 text-white placeholder:text-white/50 text-[14px] focus:outline-none"
          />
          <button
            type="submit"
            className="h-11 px-5 rounded-full text-white font-semibold text-[14px]"
            style={{ background: 'var(--vuno-primary)' }}
          >
            بحث
          </button>
        </form>
      )}
    </div>
  );
}
