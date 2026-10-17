import { motion } from 'framer-motion';
import { ChevronDownIcon } from '@/components/icons';
import type { SettingsSection, SettingsSectionId } from '@/types';

function SettingsMenuItem({ section, index, onOpen }: {
  section: SettingsSection;
  index: number;
  onOpen: (id: SettingsSectionId) => void;
}) {
  const Icon = section.icon;
  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.06, 0.3), ease: [0.16, 1, 0.3, 1] }}
      onClick={() => onOpen(section.id)}
      className="w-full bg-white rounded-[18px] p-4 sm:p-5 text-right transition-transform active:scale-[0.98] flex items-center gap-4"
      style={{ border: '1px solid var(--vuno-border)' }}
    >
      <div className="w-11 h-11 rounded-[12px] flex items-center justify-center flex-shrink-0" style={{ background: 'var(--vuno-surface-pearl)' }}>
        <Icon size={20} className="text-[var(--vuno-primary)]" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-[16px] font-semibold text-[var(--vuno-text)] leading-snug">{section.title}</h3>
        <p className="text-[13px] text-[var(--vuno-text-muted)] mt-0.5 leading-snug truncate">{section.description}</p>
      </div>
      <ChevronDownIcon size={18} className="text-[var(--vuno-text-muted)] -rotate-90 flex-shrink-0" />
    </motion.button>
  );
}

/** The screen's front page: a title and one button per section. */
export default function SettingsMenu({ sections, onOpen }: {
  sections: ReadonlyArray<SettingsSection>;
  onOpen: (id: SettingsSectionId) => void;
}) {
  return (
    <>
      <div className="mb-2">
        <h1 className="text-[28px] font-semibold text-[var(--vuno-text)] tracking-tight">الإعدادات</h1>
        <p className="text-[15px] text-[var(--vuno-text-muted)] mt-0.5">خصّص متجرك وفواتيرك وطرق دفعك</p>
      </div>

      <div className="space-y-2.5">
        {sections.map((section, i) => (
          <SettingsMenuItem key={section.id} section={section} index={i} onOpen={onOpen} />
        ))}
      </div>
    </>
  );
}
