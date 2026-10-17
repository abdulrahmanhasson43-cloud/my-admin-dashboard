import { motion } from 'framer-motion';
import { BranchesIcon } from '@/components/icons';
import type { Branch } from '@/types';

/** Highlighted strip showing which branch is currently active. */
export default function ActiveBranchBanner({ branch }: { branch: Branch }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-vuno p-4 flex items-center gap-4"
      style={{ background: 'color-mix(in srgb, var(--vuno-primary) 6%, var(--vuno-surface))' }}
    >
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white flex-shrink-0" style={{ background: 'var(--vuno-primary)' }}>
        <BranchesIcon size={22} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-[var(--vuno-text-muted)] font-medium">الفرع النشط حالياً</p>
        <h3 className="font-bold text-[var(--vuno-text)] truncate">{branch.name}</h3>
        <p className="text-xs text-[var(--vuno-text-secondary)] truncate">{branch.address}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="px-3 py-1.5 rounded-full text-xs font-bold text-white" style={{ background: 'var(--vuno-success)' }}>
          نشط
        </span>
      </div>
    </motion.div>
  );
}
