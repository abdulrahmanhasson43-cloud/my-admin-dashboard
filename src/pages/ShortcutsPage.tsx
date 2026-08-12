import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  POSIcon, ProductsIcon, InventoryIcon, InvoiceIcon,
  TrendingUpIcon, ReceiptIcon, SearchIcon,
  CheckCircleIcon,
} from '@/components/icons';
import { desktopShortcuts, type ShortcutDef } from '@/hooks/useKeyboardShortcuts';
import { useDeviceType } from '@/hooks/useDeviceType';

/* =========================================================================
   Platform feature cards — what the platform offers (shown to everyone)
   ========================================================================= */
const platformFeatures = [
  {
    icon: POSIcon,
    title: 'نقطة بيع سريعة',
    desc: 'امسح الباركود أو اختر المنتج، أكمل البيع في ثوانٍ، واطبع إيصالًا حراريًا أو شاركه عبر واتساب كصورة.',
    path: '/pos',
    linkLabel: 'افتح نقطة البيع',
  },
  {
    icon: ProductsIcon,
    title: 'إدارة المنتجات',
    desc: 'أضف منتجاتك بكل تفاصيلها، نظّمها في فئات، وتابع الأسعار والتكلفة وحالة النشاط لكل صنف.',
    path: '/products',
    linkLabel: 'إدارة المنتجات',
  },
  {
    icon: InventoryIcon,
    title: 'مخزون ذكي',
    desc: 'راقب مخزون المتجر والمستودع على حدة، اطلب تحويلات بينهما، وتنبه تلقائيًا عند انخفاض الكميات.',
    path: '/inventory',
    linkLabel: 'عرض المخزون',
  },
  {
    icon: InvoiceIcon,
    title: 'فواتير منظمة',
    desc: 'كل عملية بيع تتحول إلى فاتورة مرقّمة تلقائيًا. ابحث، عاين، وصدّر سجل الفواتير بالكامل بضغطة.',
    path: '/invoices',
    linkLabel: 'تصفّح الفواتير',
  },
  {
    icon: TrendingUpIcon,
    title: 'تقارير لحظية',
    desc: 'رسوم بيانية احترافية للمبيعات والإيرادات وطرق الدفع وأداء الفئات، مع مقارنة الأرباح عبر الوقت.',
    path: '/reports',
    linkLabel: 'اطّلع على التقارير',
  },
  {
    icon: ReceiptIcon,
    title: 'إيصال حراري قابل للتخصيص',
    desc: 'تحكّم فيما يظهر على الإيصال: اسم المتجر، الشعار، أرقام التواصل، الباركود، والتذييل. شاركه كصورة فورًا.',
    path: '/settings',
    linkLabel: 'تخصيص الإيصال',
  },
];

/* =========================================================================

/* =========================================================================
   Key cap — styled to look like a physical key
   ========================================================================= */
function KeyCap({ label }: { label: string }) {
  const isLong = label.length > 1;
  return (
    <span
      className={`inline-flex items-center justify-center h-8 ${
        isLong ? 'px-3' : 'w-8'
      } rounded-lg bg-white border border-[var(--vuno-border)] text-[13px] font-semibold text-[var(--vuno-ink)]`}
      style={{ boxShadow: '0 1px 0 var(--vuno-border), 0 2px 4px rgba(0,0,0,0.04)' }}
    >
      {label}
    </span>
  );
}

function ShortcutRow({ shortcut, index }: { shortcut: ShortcutDef; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="flex items-center justify-between gap-4 px-4 py-3.5 border-b border-[var(--vuno-border-light)] last:border-0"
    >
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-semibold text-[var(--vuno-ink)] truncate">{shortcut.label}</p>
        <p className="text-[13px] text-[var(--vuno-text-secondary)] mt-0.5">{shortcut.description}</p>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {shortcut.keys.map((key, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-[var(--vuno-text-muted)] text-xs">+</span>}
            <KeyCap label={key} />
          </span>
        ))}
      </div>
    </motion.div>
  );
}

/* =========================================================================
   Feature card
   ========================================================================= */
function FeatureCard({ feature, index }: { feature: typeof platformFeatures[0]; index: number }) {
  const Icon = feature.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      className="bg-white rounded-[18px] border border-[var(--vuno-border)] p-5 flex flex-col gap-3 hover:border-[var(--vuno-primary)]/30 transition-colors"
    >
      <div className="w-11 h-11 rounded-xl bg-[var(--vuno-surface-pearl)] flex items-center justify-center text-[var(--vuno-primary)]">
        <Icon size={24} />
      </div>
      <div className="flex-1">
        <h3 className="text-[16px] font-bold text-[var(--vuno-ink)]">{feature.title}</h3>
        <p className="text-[13.5px] leading-relaxed text-[var(--vuno-text-secondary)] mt-1.5">
          {feature.desc}
        </p>
      </div>
      <Link
        to={feature.path}
        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--vuno-primary)] hover:gap-2.5 transition-all mt-1"
      >
        {feature.linkLabel}
        <span aria-hidden>←</span>
      </Link>
    </motion.div>
  );
}

/* =========================================================================
   Main page
   ========================================================================= */
export default function ShortcutsPage() {
  const deviceType = useDeviceType();
  const isMobile = deviceType === 'mobile';

  const navShortcuts = desktopShortcuts.filter(s => s.group === 'navigation');
  const actionShortcuts = desktopShortcuts.filter(s => s.group === 'actions');

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-[20px] border border-[var(--vuno-border)] p-6 md:p-8"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[var(--vuno-primary)]/8 flex items-center justify-center text-[var(--vuno-primary)] flex-shrink-0">
            <CheckCircleIcon size={28} />
          </div>
          <div>
            <h1 className="text-[22px] md:text-[26px] font-bold text-[var(--vuno-ink)] leading-tight">
              كل ما تقدّمه المنصّة
            </h1>
            <p className="text-[14px] md:text-[15px] text-[var(--vuno-text-secondary)] mt-2 leading-relaxed max-w-2xl">
              دليلك السريع إلى مزايا المنصّة وطرق التنقل. مصمّمة لتكون بديهية على اللمس والكيبورد معًا —
              اختَر ما يناسب جهازك واستعِدّ العمل بكفاءة أعلى.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Platform features */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-[18px] font-bold text-[var(--vuno-ink)]">المزايا الأساسية</h2>
          <span className="text-[13px] text-[var(--vuno-text-muted)]">{platformFeatures.length} مزايا</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {platformFeatures.map((f, i) => (
            <FeatureCard key={f.title} feature={f} index={i} />
          ))}
        </div>
      </section>

      {/* Desktop keyboard shortcuts — shown on desktop, hidden on mobile */}
      {!isMobile && (
        <section>
          <div className="flex items-baseline justify-between mb-1">
            <h2 className="text-[18px] font-bold text-[var(--vuno-ink)]">اختصارات لوحة المفاتيح</h2>
          </div>
          <p className="text-[13px] text-[var(--vuno-text-muted)] mb-4">
            اختصارات مخفية لمستخدمي الكمبيوتر — بأسلوبنا الخاص، تكتشفها هنا فقط.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Navigation shortcuts */}
            <div>
              <h3 className="text-[14px] font-semibold text-[var(--vuno-text-secondary)] mb-2 px-1">
                التنقل السريع
              </h3>
              <div className="bg-white rounded-[18px] border border-[var(--vuno-border)] overflow-hidden">
                {navShortcuts.map((s, i) => (
                  <ShortcutRow key={s.label} shortcut={s} index={i} />
                ))}
              </div>
            </div>

            {/* Action shortcuts */}
            <div>
              <h3 className="text-[14px] font-semibold text-[var(--vuno-text-secondary)] mb-2 px-1">
                إجراءات سريعة
              </h3>
              <div className="bg-white rounded-[18px] border border-[var(--vuno-border)] overflow-hidden">
                {actionShortcuts.map((s, i) => (
                  <ShortcutRow key={s.label} shortcut={s} index={i} />
                ))}
              </div>

              {/* Tip card */}
              <div className="mt-4 bg-[var(--vuno-surface-pearl)] rounded-[14px] border border-[var(--vuno-border-light)] p-4 flex items-start gap-3">
                <SearchIcon size={20} className="text-[var(--vuno-primary)] flex-shrink-0 mt-0.5" />
                <p className="text-[13px] leading-relaxed text-[var(--vuno-text-secondary)]">
                  <span className="font-semibold text-[var(--vuno-ink)]">نصيحة:</span> اضغط{' '}
                  <KeyCap label="/" /> في أي صفحة للتركيز فورًا على حقل البحث، أو اضغط{' '}
                  <KeyCap label="g" /> ثم حرفًا للقفز السريع بين الأقسام.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
