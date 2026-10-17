import { motion } from 'framer-motion';
import { CheckCircleIcon } from '@/components/icons';

/** The "تم الحفظ بنجاح" bubble at the bottom of the screen. */
export default function SavedNotice() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-full text-white text-[14px] font-medium flex items-center gap-2"
      style={{ background: 'var(--vuno-success)', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
    >
      <CheckCircleIcon size={16} className="text-white" />
      تم الحفظ بنجاح
    </motion.div>
  );
}
