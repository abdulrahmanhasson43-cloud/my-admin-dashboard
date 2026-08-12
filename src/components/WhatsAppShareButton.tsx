import { useState } from 'react';
import { WhatsAppIcon } from '@/components/icons';
import WhatsAppShareModal, { type WhatsAppMessageType } from './WhatsAppShareModal';
import type { Invoice, CompletedSale } from '@/types';

interface WhatsAppShareButtonProps {
  /** Either a mock Invoice (invoices page) or a CompletedSale (POS) */
  invoice?: Invoice;
  sale?: CompletedSale;
  /** Visual variant — "pill" for full buttons, "icon" for compact icon-only */
  variant?: 'pill' | 'icon';
  label?: string;
  className?: string;
  size?: 'sm' | 'md';
}

/**
 * الفكرة #21 — زر مشاركة عبر واتساب.
 * يفتح نافذة WhatsAppShareModal لاختيار نوع الرسالة ومعاينتها قبل الإرسال.
 */
export default function WhatsAppShareButton({
  invoice,
  sale,
  variant = 'pill',
  label = 'مشاركة واتساب',
  className = '',
  size = 'md',
}: WhatsAppShareButtonProps) {
  const [open, setOpen] = useState(false);

  const heightClass = size === 'sm' ? 'h-9' : 'h-11';
  const textSize = size === 'sm' ? 'text-[13px]' : 'text-[14px]';
  const iconSize = size === 'sm' ? 15 : 17;

  if (variant === 'icon') {
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform active:scale-90 ${className}`}
          style={{ background: '#25D366' }}
          aria-label="مشاركة عبر واتساب"
          title="مشاركة عبر واتساب"
        >
          <WhatsAppIcon size={18} className="text-white" />
        </button>
        <WhatsAppShareModal
          open={open}
          onClose={() => setOpen(false)}
          invoice={invoice}
          sale={sale}
        />
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`flex items-center justify-center gap-2 ${heightClass} px-5 rounded-full text-white font-semibold ${textSize} transition-transform active:scale-95 ${className}`}
        style={{ background: '#25D366' }}
      >
        <WhatsAppIcon size={iconSize} className="text-white" />
        {label}
      </button>
      <WhatsAppShareModal
        open={open}
        onClose={() => setOpen(false)}
        invoice={invoice}
        sale={sale}
      />
    </>
  );
}

export type { WhatsAppMessageType };
