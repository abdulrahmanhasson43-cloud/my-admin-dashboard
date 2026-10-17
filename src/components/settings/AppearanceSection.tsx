import { MoonIcon, SunIcon } from '@/components/icons';
import SectionCard from '@/components/SectionCard';
import { useTheme } from '@/context/theme-context-value';
import type { SettingsSection } from '@/types';
import SectionHeader from './SectionHeader';
import SectionPanel from './SectionPanel';

/** المظهر — الوضع الليلي/النهاري (الفكرة #31). The choice is kept by the theme provider. */
export default function AppearanceSection({ section, onBack }: { section: SettingsSection; onBack: () => void }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <SectionPanel variant="rise" className="space-y-4">
      <SectionHeader section={section} onBack={onBack} />
      <SectionCard>
        <div className="flex items-center justify-between gap-4 py-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'color-mix(in srgb, var(--vuno-primary) 8%, transparent)' }}>
              {isDark ? <MoonIcon size={18} className="text-[var(--vuno-primary)]" /> : <SunIcon size={18} className="text-[var(--vuno-primary)]" />}
            </div>
            <div className="min-w-0">
              <p className="text-[15px] font-medium text-[var(--vuno-text)] leading-snug">الوضع الليلي</p>
              <p className="text-[12px] text-[var(--vuno-text-muted)] mt-0.5 leading-snug">تبديل بين الوضع النهاري والليلي لراحة العين</p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="flex-shrink-0 relative w-[52px] h-[30px] rounded-full transition-colors duration-200"
            style={{ background: isDark ? 'var(--vuno-primary)' : '#D2D2D7' }}
          >
            <span
              className="absolute top-[3px] w-[24px] h-[24px] rounded-full bg-white transition-all duration-200 flex items-center justify-center"
              style={{
                left: isDark ? '3px' : '25px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
              }}
            >
              {isDark ? <MoonIcon size={12} className="text-[var(--vuno-primary)]" /> : <SunIcon size={12} className="text-[var(--vuno-text-muted)]" />}
            </span>
          </button>
        </div>
      </SectionCard>
      <SectionCard>
        <p className="text-[13px] text-[var(--vuno-text-muted)] leading-relaxed">الوضع الليلي يقلل إجهاد العين في الأماكن المظلمة، ويتم حفظ تفضيلك تلقائيًا على جهازك.</p>
      </SectionCard>
    </SectionPanel>
  );
}
