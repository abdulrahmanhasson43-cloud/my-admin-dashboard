import { motion } from 'framer-motion';
import { BranchesIcon, EditIcon, TrashIcon, MapPinIcon, CheckIcon } from '@/components/icons';
import QRCodeButton from '@/components/QRCodeButton';
import type { Branch } from '@/types';

interface BranchCardProps {
  branch: Branch;
  index: number;
  isActive: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onActivate: () => void;
}

/** One branch: name, address, status, numbers, QR code, and edit / delete / make-active actions. */
export default function BranchCard({ branch, index: i, isActive, onEdit, onDelete, onActivate }: BranchCardProps) {
  return (
    <motion.div key={branch.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.1, 0.3) }} className={`card-vuno p-6 hover:shadow-md transition-all ${isActive ? 'ring-2 ring-[var(--vuno-primary)] border-[var(--vuno-primary)]' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white" style={{ background: 'var(--vuno-primary)' }}>
            <BranchesIcon size={22} />
          </div>
          <div>
            <h3 className="font-bold text-[var(--vuno-text)]">{branch.name}</h3>
            <div className="flex items-center gap-1 text-xs text-[var(--vuno-text-muted)] mt-1">
              <MapPinIcon size={12} />
              {branch.address}
            </div>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${branch.status === 'active' ? 'bg-[var(--vuno-surface-pearl)] text-[var(--vuno-success)]' : 'bg-[var(--vuno-surface-pearl)] text-[var(--vuno-text-muted)]'}`}>
          {branch.status === 'active' ? 'نشط' : 'غير نشط'}
        </span>
      </div>
      {isActive && (
        <div className="mb-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold text-white" style={{ background: 'var(--vuno-success)' }}>
          <CheckIcon size={12} />
          الفرع النشط
        </div>
      )}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[var(--vuno-border-light)]">
        <div className="text-center">
          <p className="text-lg font-bold text-[var(--vuno-text)]">{branch.employees}</p>
          <p className="text-xs text-[var(--vuno-text-muted)]">موظف</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-[var(--vuno-primary)]">{(branch.sales / 1000).toFixed(0)}K</p>
          <p className="text-xs text-[var(--vuno-text-muted)]">مبيعات</p>
        </div>
        <div className="flex items-center justify-center gap-1.5">
          <QRCodeButton value={`vuno:branch:${branch.id}`} label={`رمز QR للفرع ${branch.name}`} iconSize={15} />
          <button onClick={() => onEdit()} aria-label={`تعديل ${branch.name}`} className="p-2 rounded-lg hover:bg-[var(--vuno-bg)] text-[var(--vuno-primary)] transition-colors"><EditIcon size={16} /></button>
          <button onClick={() => onDelete()} aria-label={`حذف ${branch.name}`} className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"><TrashIcon size={16} /></button>
        </div>
      </div>
      {!isActive && (
        <button
          onClick={onActivate}
          className="w-full mt-4 py-2.5 rounded-xl text-sm font-medium border border-[var(--vuno-primary)] text-[var(--vuno-primary)] hover:bg-[var(--vuno-surface-pearl)] transition-colors flex items-center justify-center gap-2"
        >
          <BranchesIcon size={14} />
          تعيين كفرع نشط
        </button>
      )}
    </motion.div>
  );
}
