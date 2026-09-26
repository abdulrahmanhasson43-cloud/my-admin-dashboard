import { useRef, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useProducts } from '@/context/products-context-value';
import { useAppSettings } from '@/context/app-settings-context-value';
import { useNotifications } from '@/context/notifications-context-value';
import { useActivityLog } from '@/context/activity-log-context-value';
import { useShift } from '@/context/shift-context-value';
import { DownloadIcon, UploadIcon, ShieldIcon, ClockIcon } from '@/components/icons';

interface BackupData {
  version: string;
  exportedAt: string;
  products: unknown[];
  settings: unknown;
  notifications: unknown[];
  activities: unknown[];
  shifts: unknown[];
}

/**
 * تصدير/استيراد البيانات — الفكرة الجديدة #13.
 * يصدّر كل بيانات النظام (منتجات، إعدادات، إشعارات، نشاطات، ورديات)
 * إلى ملف JSON يمكن استرجاعه لاحقًا.
 */
export default function DataBackupSection() {
  const { products } = useProducts();
  const settings = useAppSettings();
  const { notifications } = useNotifications();
  const { activities } = useActivityLog();
  const { shifts } = useShift();
  const { autoBackupEnabled, setAutoBackupEnabled, lastBackupAt, setLastBackupAt } = useAppSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Core export logic — shared by manual export and auto-backup
  const performBackup = useCallback(
    (silent = false) => {
      const data: BackupData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        products,
        settings,
        notifications,
        activities,
        shifts,
      };

      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vuno-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      const now = new Date().toISOString();
      setLastBackupAt(now);

      if (!silent) {
        toast.success('تم تصدير البيانات بنجاح');
      } else {
        toast.success('💾 تم النسخ الاحتياطي التلقائي', {
          description: 'تم حفظ نسخة من بياناتك',
          duration: 3000,
        });
      }
    },
    [products, settings, notifications, activities, shifts, setLastBackupAt],
  );

  const handleExport = () => performBackup(false);

  // Auto-backup effect — runs every 24 hours when enabled (Idea #26)
  // Checks lastBackupAt in localStorage; if > 24h ago or never, triggers backup.
  useEffect(() => {
    if (!autoBackupEnabled) return;

    const AUTO_BACKUP_KEY = 'vuno_last_auto_backup';
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

    const checkAndBackup = () => {
      const lastBackup = localStorage.getItem(AUTO_BACKUP_KEY);
      const now = Date.now();

      if (!lastBackup || now - parseInt(lastBackup, 10) > TWENTY_FOUR_HOURS) {
        performBackup(true);
        localStorage.setItem(AUTO_BACKUP_KEY, String(now));
      }
    };

    // Check on mount
    checkAndBackup();

    // Check every hour if 24h have passed
    const interval = setInterval(checkAndBackup, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [autoBackupEnabled, performBackup]);

  // Persist auto-backup toggle and lastBackupAt to localStorage
  useEffect(() => {
    if (lastBackupAt) {
      localStorage.setItem('vuno_last_backup_at', lastBackupAt);
    }
  }, [lastBackupAt]);

  const handleToggleAutoBackup = () => {
    const newValue = !autoBackupEnabled;
    setAutoBackupEnabled(newValue);
    if (newValue) {
      toast.success('✅ تم تفعيل النسخ الاحتياطي التلقائي', {
        description: 'سيتم حفظ نسخة كل 24 ساعة',
        duration: 3000,
      });
    } else {
      toast.info('تم إيقاف النسخ الاحتياطي التلقائي');
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string) as BackupData;
        if (!data.version || !data.exportedAt) {
          throw new Error('ملف غير صالح');
        }

        // Restore to localStorage so contexts pick it up on next load
        if (data.products) {
          localStorage.setItem('vuno_products', JSON.stringify(data.products));
        }
        if (data.notifications) {
          localStorage.setItem('vuno_notifications', JSON.stringify(data.notifications));
        }
        if (data.activities) {
          localStorage.setItem('vuno_activity_log', JSON.stringify(data.activities));
        }
        if (data.shifts) {
          localStorage.setItem('vuno_shifts', JSON.stringify(data.shifts));
        }

        toast.success('تم استيراد البيانات. أعد تحميل الصفحة لرؤية التغييرات.');
        setTimeout(() => window.location.reload(), 1500);
      } catch {
        toast.error('فشل استيراد الملف. تأكد أنه ملف نسخة احتياطية صالح من Vuno.');
      }
    };
    reader.readAsText(file);
    // Reset input so the same file can be imported again
    e.target.value = '';
  };

  return (
    <div className="card-vuno p-6">
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center"
          style={{ background: 'color-mix(in srgb, var(--vuno-primary) 8%, transparent)' }}
        >
          <ShieldIcon size={22} className="text-[var(--vuno-primary)]" />
        </div>
        <div>
          <h3 className="font-bold text-[16px] text-[var(--vuno-text)]">النسخ الاحتياطي والاستعادة</h3>
          <p className="text-[12px] text-[var(--vuno-text-muted)]">صدّر بياناتك أو استرجعها من ملف</p>
        </div>
      </div>

      <p className="text-[13px] text-[var(--vuno-text-secondary)] leading-relaxed mb-4">
        يمكنك تصدير كل بيانات النظام (المنتجات، الإعدادات، الإشعارات، النشاطات، الورديات) إلى ملف JSON
        محفوظ على جهازك، واسترجاعها في أي وقت. ننصح بأخذ نسخة احتياطية بانتظام.
      </p>

      {/* Auto-backup toggle (Idea #26) */}
      <div
        className="flex items-center gap-3 p-4 rounded-2xl border mb-4"
        style={{
          borderColor: autoBackupEnabled
            ? 'color-mix(in srgb, var(--vuno-success) 30%, transparent)'
            : 'var(--vuno-border)',
          background: autoBackupEnabled
            ? 'color-mix(in srgb, var(--vuno-success) 5%, transparent)'
            : 'transparent',
        }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{
            background: autoBackupEnabled
              ? 'color-mix(in srgb, var(--vuno-success) 15%, transparent)'
              : 'color-mix(in srgb, var(--vuno-primary) 8%, transparent)',
          }}
        >
          <ClockIcon
            size={18}
            className={autoBackupEnabled ? 'text-[var(--vuno-success)]' : 'text-[var(--vuno-primary)]'}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-[var(--vuno-text)]">النسخ الاحتياطي التلقائي</p>
          <p className="text-[11px] text-[var(--vuno-text-muted)] mt-0.5">
            {autoBackupEnabled
              ? lastBackupAt
                ? `آخر نسخة: ${new Date(lastBackupAt).toLocaleDateString('ar-EG')} — يتم كل 24 ساعة`
                : 'سيتم حفظ نسخة كل 24 ساعة تلقائيًا'
              : 'حفظ نسخة من بياناتك كل 24 ساعة تلقائيًا'}
          </p>
        </div>
        {/* Toggle switch */}
        <button
          onClick={handleToggleAutoBackup}
          className="relative w-12 h-7 rounded-full transition-colors shrink-0"
          style={{
            background: autoBackupEnabled ? 'var(--vuno-success)' : 'var(--vuno-border)',
          }}
          role="switch"
          aria-checked={autoBackupEnabled}
          aria-label="تفعيل النسخ الاحتياطي التلقائي"
        >
          <span
            className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform"
            style={{
              transform: autoBackupEnabled ? 'translateX(-22px)' : 'translateX(-2px)',
            }}
          />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleExport}
          className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-[var(--vuno-border)] hover:bg-[var(--vuno-bg)] transition-colors"
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: 'color-mix(in srgb, var(--vuno-success) 12%, transparent)' }}
          >
            <DownloadIcon size={18} className="text-[var(--vuno-success)]" />
          </div>
          <span className="text-[13px] font-semibold text-[var(--vuno-text)]">تصدير البيانات</span>
          <span className="text-[10px] text-[var(--vuno-text-muted)] text-center">حفظ نسخة على جهازك</span>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-[var(--vuno-border)] hover:bg-[var(--vuno-bg)] transition-colors"
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: 'color-mix(in srgb, var(--vuno-primary) 12%, transparent)' }}
          >
            <UploadIcon size={18} className="text-[var(--vuno-primary)]" />
          </div>
          <span className="text-[13px] font-semibold text-[var(--vuno-text)]">استيراد البيانات</span>
          <span className="text-[10px] text-[var(--vuno-text-muted)] text-center">استرجاع من ملف JSON</span>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        onChange={handleImport}
        className="hidden"
      />
    </div>
  );
}
