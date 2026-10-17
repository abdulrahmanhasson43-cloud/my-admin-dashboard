import { useNavigate } from 'react-router-dom';
import { ClockIcon } from '@/components/icons';
import SectionCard from '@/components/SectionCard';
import type { SettingsSection } from '@/types';
import SectionHeader from './SectionHeader';
import SectionPanel from './SectionPanel';

/** إدارة الورديات — رابط لصفحة الورديات. */
export default function ShiftsSettingsSection({ section, onBack }: { section: SettingsSection; onBack: () => void }) {
  const navigate = useNavigate();

  return (
    <SectionPanel variant="rise" className="space-y-4">
      <SectionHeader section={section} onBack={onBack} />
      <SectionCard>
        <div className="text-center py-8">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'color-mix(in srgb, var(--vuno-primary) 8%, transparent)' }}>
            <ClockIcon size={26} className="text-[var(--vuno-primary)]" />
          </div>
          <p className="text-[15px] font-semibold text-[var(--vuno-text)] mb-1">إدارة الورديات</p>
          <p className="text-[13px] text-[var(--vuno-text-muted)] mb-4">تحكم في ورديات الكاشير، بدء وإنهاء الوردية، وتسجيل المبيعات</p>
          <button
            onClick={() => navigate('/shifts')}
            className="px-6 h-11 rounded-full text-white font-semibold text-[15px] transition-transform active:scale-95"
            style={{ background: 'var(--vuno-primary)' }}
          >
            الذهاب لصفحة الورديات
          </button>
        </div>
      </SectionCard>
    </SectionPanel>
  );
}
