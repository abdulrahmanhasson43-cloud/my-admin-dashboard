import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { XIcon, ScanLineIcon, PlusIcon } from '@/components/icons';

interface BarcodeScannerModalProps {
  /** يُستدعى عند العثور على منتج مطابق للباركود */
  onDetected: (code: string) => void;
  /** يُستدعى عند عدم العثور على منتج — الفكرة #11 */
  onNotFound?: (code: string) => void;
  onClose: () => void;
}

/* ─────────────────────────────────────────────────────────────
   مساعدات صوت واهتزاز — الفكرة #11
   ───────────────────────────────────────────────────────────── */

/** صوت "بيب" قصير يُولَّد برمجيًا (Web Audio API) — لا حاجة لملف mp3 */
function playBeep() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.frequency.value = 880; // نغمة عالية واضحة
    oscillator.type = 'sine';
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.15);
    oscillator.onended = () => ctx.close();
  } catch {
    // تجاهل أخطاء الصوت (متصفح قد يحظر التشغيل التلقائي)
  }
}

/** اهتزاز الجهاز (للموبايل فقط) — الفكرة #11 */
function vibrate(pattern: number | number[] = 200) {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {
    // تجاهل
  }
}

export default function BarcodeScannerModal({ onDetected, onNotFound, onClose }: BarcodeScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectedRef = useRef(false); // منع الكشف المكرر في نفس الإطار
  const [error, setError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [lastCode, setLastCode] = useState<string | null>(null);
  const supported = typeof window !== 'undefined' && 'BarcodeDetector' in window;

  useEffect(() => {
    let cancelled = false;
    let rafId: number;

    async function start() {
      try {
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
            if (cancelled || !videoRef.current || detectedRef.current) return;
            try {
              const codes = await detector.detect(videoRef.current);
              if (codes.length > 0 && !detectedRef.current) {
                detectedRef.current = true;
                const code = codes[0].rawValue;
                // رد فعل ناجح: صوت + اهتزاز
                playBeep();
                vibrate(200);
                setLastCode(code);
                onDetected(code);
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

  /** معالجة إدخال باركود يدوي — نفس رد الفعل (صوت + اهتزاز) */
  const handleManualSubmit = (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) return;
    playBeep();
    vibrate(150);
    setLastCode(trimmed);
    onDetected(trimmed);
  };

  /** زر "إضافة منتج جديد" عند عدم العثور على المنتج — الفكرة #11 */
  const handleAddNew = () => {
    if (onNotFound && lastCode) {
      onNotFound(lastCode);
    } else if (lastCode) {
      toast.error('المنتج غير موجود', { description: `باركود: ${lastCode}` });
    }
  };

  return (
    <div className="fixed inset-0 z-[80] bg-black flex flex-col">
      <div className="flex items-center justify-between p-4">
        <span className="text-white text-[15px] font-semibold flex items-center gap-2">
          <ScanLineIcon size={18} className="text-white" />
          امسح الباركود
        </span>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center transition-transform active:scale-90"
          aria-label="إغلاق"
        >
          <XIcon size={18} className="text-white" />
        </button>
      </div>

      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {error ? (
          <div className="text-center px-8">
            <p className="text-white text-[14px] mb-4">{error}</p>
            {/* حتى لو الكاميرا فشلت، يمكن إدخال الباركود يدويًا */}
            <ManualEntry
              value={manualCode}
              onChange={setManualCode}
              onSubmit={() => handleManualSubmit(manualCode)}
            />
          </div>
        ) : (
          <>
            <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />

            {/* مربع التحديد + خط مسح متحرك — الفكرة #11 */}
            <div className="absolute w-64 h-64 pointer-events-none">
              {/* زوايا مربع التحديد */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-xl" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-xl" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-xl" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-xl" />
              {/* خط المسح المتحرك */}
              <motion.div
                className="absolute left-2 right-2 h-0.5"
                style={{ background: 'linear-gradient(90deg, transparent, var(--vuno-primary), transparent)', boxShadow: '0 0 12px var(--vuno-primary)' }}
                animate={{ top: ['8px', '240px', '8px'] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>

            {!supported && (
              <div className="absolute bottom-24 inset-x-6 bg-black/60 rounded-xl p-3 text-center">
                <p className="text-white text-[12px]">
                  المتصفح ده مش بيدعم القراءة التلقائية — اكتب الباركود يدويًا تحت
                </p>
              </div>
            )}

            {/* عرض آخر باركود ممسوح */}
            {lastCode && (
              <div className="absolute bottom-24 inset-x-6 bg-white/95 rounded-xl p-3 flex items-center justify-between gap-2">
                <span className="text-[13px] font-semibold text-[var(--vuno-text)] truncate" dir="ltr">{lastCode}</span>
                <button
                  onClick={handleAddNew}
                  className="flex items-center gap-1 px-3 h-8 rounded-full text-white text-[12px] font-medium flex-shrink-0"
                  style={{ background: 'var(--vuno-primary)' }}
                >
                  <PlusIcon size={13} className="text-white" />
                  إضافة منتج جديد
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {!supported && !error && (
        <ManualEntry
          value={manualCode}
          onChange={setManualCode}
          onSubmit={() => handleManualSubmit(manualCode)}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   حقل إدخال يدوي — يُعاد استخدامه في حالة عدم دعم الكاميرا
   ───────────────────────────────────────────────────────────── */
function ManualEntry({
  value,
  onChange,
  onSubmit,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
}) {
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
      className="p-4 flex gap-2 w-full max-w-md mx-auto"
    >
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="اكتب رقم الباركود..."
        dir="ltr"
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
  );
}
