import { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XIcon, SearchIcon, UserIcon, PhoneIcon, CheckIcon,
  UsersIcon, UserPlusIcon,
} from '@/components/icons';
import { sampleClients } from '@/services/mock';
import type { Client } from '@/types';

/** The customer attached to a POS checkout. Either a registered
    client (looked up from the DB by phone) or a temporary walk-in. */
export interface SelectedCustomer {
  type: 'registered' | 'temporary';
  /** For registered customers — the client record from the DB */
  client?: Client;
  /** For temporary customers — just a name (and optional phone) */
  tempName?: string;
  tempPhone?: string;
}

interface CustomerSelectionProps {
  open: boolean;
  onClose: () => void;
  onSelect: (customer: SelectedCustomer | null) => void;
  current?: SelectedCustomer | null;
}

/**
 * طلب المستخدم C — نظام اختيار العميل عند الدفع في POS.
 * يوفر خيارين:
 * 1. عميل مسجّل — البحث برقم الهاتف من قاعدة البيانات
 * 2. عميل مؤقت — زيارة واحدة (إدخال اسم ورقم اختياري)
 */
export default function CustomerSelection({
  open,
  onClose,
  onSelect,
  current,
}: CustomerSelectionProps) {
  const [mode, setMode] = useState<'registered' | 'temporary'>(
    current?.type || 'registered',
  );
  const [search, setSearch] = useState('');
  const [tempName, setTempName] = useState(current?.tempName || '');
  const [tempPhone, setTempPhone] = useState(current?.tempPhone || '');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Reset when opening
  useEffect(() => {
    if (open) {
      setMode(current?.type || 'registered');
      setSearch('');
      setTempName(current?.tempName || '');
      setTempPhone(current?.tempPhone || '');
    }
  }, [open, current]);

  // Focus search input when in registered mode
  useEffect(() => {
    if (open && mode === 'registered') {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [open, mode]);

  const filteredClients = useMemo(() => {
    if (!search.trim()) return sampleClients;
    return sampleClients.filter(
      c => c.phone.includes(search) || c.name.includes(search),
    );
  }, [search]);

  const handleSelectRegistered = (client: Client) => {
    onSelect({ type: 'registered', client });
    onClose();
  };

  const handleConfirmTemporary = () => {
    if (!tempName.trim()) return;
    onSelect({ type: 'temporary', tempName: tempName.trim(), tempPhone: tempPhone.trim() || undefined });
    onClose();
  };

  const handleSkip = () => {
    onSelect(null);
    onClose();
  };

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50"
          dir="rtl"
        >
          <motion.div
            initial={{ y: 40, scale: 0.97 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 40, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white px-5 pt-4 pb-3 border-b border-[var(--vuno-border)] rounded-t-3xl">
              <div className="w-10 h-1 rounded-full bg-[var(--vuno-border)] mx-auto mb-3 sm:hidden" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: 'color-mix(in srgb, var(--vuno-primary) 8%, transparent)' }}
                  >
                    <UserIcon size={18} className="text-[var(--vuno-primary)]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[15px] text-[var(--vuno-text)]">اختيار العميل</h3>
                    <p className="text-[11px] text-[var(--vuno-text-muted)]">عميل مسجّل أو مؤقت</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--vuno-bg)]"
                >
                  <XIcon size={16} className="text-[var(--vuno-text-secondary)]" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Mode toggle */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setMode('registered')}
                  className="flex items-center justify-center gap-2 h-11 rounded-xl text-[13px] font-semibold transition-all active:scale-95"
                  style={{
                    background: mode === 'registered' ? 'var(--vuno-primary)' : 'var(--vuno-surface)',
                    border: mode === 'registered' ? '1px solid var(--vuno-primary)' : '1px solid var(--vuno-border)',
                    color: mode === 'registered' ? '#fff' : 'var(--vuno-text-secondary)',
                  }}
                >
                  <UsersIcon size={16} />
                  عميل مسجّل
                </button>
                <button
                  onClick={() => setMode('temporary')}
                  className="flex items-center justify-center gap-2 h-11 rounded-xl text-[13px] font-semibold transition-all active:scale-95"
                  style={{
                    background: mode === 'temporary' ? 'var(--vuno-primary)' : 'var(--vuno-surface)',
                    border: mode === 'temporary' ? '1px solid var(--vuno-primary)' : '1px solid var(--vuno-border)',
                    color: mode === 'temporary' ? '#fff' : 'var(--vuno-text-secondary)',
                  }}
                >
                  <UserPlusIcon size={16} />
                  عميل مؤقت
                </button>
              </div>

              {mode === 'registered' ? (
                <>
                  {/* Search by phone or name */}
                  <div className="relative">
                    <SearchIcon size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--vuno-text-muted)]" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="ابحث برقم الهاتف أو الاسم..."
                      className="w-full h-11 rounded-xl pr-10 pl-4 text-[13px]"
                      style={{
                        background: 'var(--vuno-surface-pearl)',
                        border: '1px solid var(--vuno-border)',
                        color: 'var(--vuno-text)',
                      }}
                    />
                  </div>

                  {/* Client results */}
                  <div className="max-h-[280px] overflow-y-auto space-y-1.5">
                    {filteredClients.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 rounded-full bg-[var(--vuno-bg)] flex items-center justify-center mx-auto mb-2">
                          <SearchIcon size={20} className="text-[var(--vuno-text-muted)]" />
                        </div>
                        <p className="text-[13px] text-[var(--vuno-text-muted)]">لا توجد نتائج</p>
                      </div>
                    ) : (
                      filteredClients.map(client => (
                        <button
                          key={client.id}
                          onClick={() => handleSelectRegistered(client)}
                          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--vuno-bg)] transition-colors text-right"
                          style={{
                            background: current?.client?.id === client.id
                              ? 'color-mix(in srgb, var(--vuno-primary) 6%, transparent)'
                              : 'var(--vuno-surface-pearl)',
                            border: current?.client?.id === client.id
                              ? '1px solid var(--vuno-primary)'
                              : '1px solid var(--vuno-border-light)',
                          }}
                        >
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: 'color-mix(in srgb, var(--vuno-primary) 10%, transparent)' }}
                          >
                            <UserIcon size={18} className="text-[var(--vuno-primary)]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-[var(--vuno-text)] truncate">{client.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <PhoneIcon size={11} className="text-[var(--vuno-text-muted)]" />
                              <span className="text-[11px] text-[var(--vuno-text-muted)]" dir="ltr">{client.phone}</span>
                            </div>
                          </div>
                          {current?.client?.id === client.id && (
                            <CheckIcon size={16} className="text-[var(--vuno-primary)] flex-shrink-0" />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Temporary customer form */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-[12px] font-semibold text-[var(--vuno-text-secondary)] mb-1.5 block">
                        اسم العميل
                      </label>
                      <input
                        type="text"
                        value={tempName}
                        onChange={e => setTempName(e.target.value)}
                        placeholder="اكتب اسم العميل..."
                        className="w-full h-11 rounded-xl px-4 text-[14px]"
                        style={{
                          background: 'var(--vuno-surface-pearl)',
                          border: '1px solid var(--vuno-border)',
                          color: 'var(--vuno-text)',
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-[12px] font-semibold text-[var(--vuno-text-secondary)] mb-1.5 block">
                        رقم الهاتف (اختياري)
                      </label>
                      <div className="relative">
                        <PhoneIcon size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--vuno-text-muted)]" />
                        <input
                          type="tel"
                          dir="ltr"
                          inputMode="tel"
                          value={tempPhone}
                          onChange={e => setTempPhone(e.target.value)}
                          placeholder="01XXXXXXXXX"
                          className="w-full h-11 rounded-xl pr-10 pl-4 text-[14px] text-left"
                          style={{
                            background: 'var(--vuno-surface-pearl)',
                            border: '1px solid var(--vuno-border)',
                            color: 'var(--vuno-text)',
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleConfirmTemporary}
                    disabled={!tempName.trim()}
                    className="w-full h-12 rounded-full text-white font-semibold text-[15px] transition-transform active:scale-95 disabled:opacity-40"
                    style={{ background: 'var(--vuno-primary)' }}
                  >
                    تأكيد العميل المؤقت
                  </button>
                </>
              )}

              {/* Skip — no customer */}
              <button
                onClick={handleSkip}
                className="w-full h-10 rounded-full text-[13px] font-medium text-[var(--vuno-text-muted)] hover:bg-[var(--vuno-bg)] transition-colors"
              >
                متابعة بدون عميل
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
