import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon } from '@/components/icons';

/** The green "payment done" check that flashes over the screen after a sale. */
export default function SuccessOverlay({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-28 h-28 rounded-full flex items-center justify-center"
            style={{ background: 'var(--vuno-success)' }}
          >
            <CheckCircleIcon size={56} className="text-white" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
