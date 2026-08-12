import { useState, useRef, useEffect, type FC } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChatbotIcon, CloseIcon, SendIcon } from '@/components/icons';

/**
 * مساعد فونو الذكي — شات بوت عائم في الزاوية السفلى اليمنى.
 * الواجهة فقط في هذه المرحلة، سيتم ربط API لاحقًا من لوحة Super Admin.
 * يهدف إلى مساعدة المستخدمين في كل ما يخص المنصة.
 */

interface ChatMessage {
  id: string;
  role: 'bot' | 'user';
  text: string;
  time: string;
}

interface SuggestedQuestion {
  label: string;
  query: string;
}

const suggestedQuestions: SuggestedQuestion[] = [
  { label: 'كيف أضيف منتجًا جديدًا؟', query: 'كيف أضيف منتجًا جديدًا؟' },
  { label: 'كيف أصنع فاتورة؟', query: 'كيف أصنع فاتورة؟' },
  { label: 'كيف أعمل نسخة احتياطية؟', query: 'كيف أعمل نسخة احتياطية للبيانات؟' },
  { label: 'كيف أستخدم اختصارات لوحة المفاتيح؟', query: 'ما هي اختصارات لوحة المفاتيح؟' },
  { label: 'كيف أشارك فاتورة عبر واتساب؟', query: 'كيف أشارك فاتورة عبر واتساب؟' },
  { label: 'كيف أقفل يومية المبيعات؟', query: 'كيف أقفل يومية المبيعات؟' },
];

const welcomeMessage: ChatMessage = {
  id: 'welcome',
  role: 'bot',
  text: 'مرحبًا بك في مساعد فونو الذكي! 👋\nأنا هنا لمساعدتك في كل ما يخص المنصة. كيف يمكنني مساعدتك اليوم؟',
  time: '',
};

function formatTime(): string {
  const now = new Date();
  return now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
}

/** رد مؤقت وهمي — سيتم استبداله بـ API لاحقًا */
function generateMockReply(userText: string): string {
  const lower = userText.toLowerCase();
  if (lower.includes('منتج') && lower.includes('جديد')) {
    return 'لإضافة منتج جديد:\n1. اذهب إلى صفحة المنتجات\n2. اضغط زر "إضافة منتج"\n3. أدخل الاسم والسعر والفئة والمخزون\n4. يمكنك أيضًا إضافة ألوان ومقاسات كخيارات للمنتج\n5. اضغط حفظ';
  }
  if (lower.includes('فاتورة')) {
    return 'لإنشاء فاتورة:\n1. افتح صفحة نقطة البيع (POS)\n2. اختر المنتجات وأضفها للسلة\n3. اختر العميل (مسجل أو مؤقت)\n4. اختر طريقة الدفع وادخل المبلغ\n5. اضغط تأكيد الدفع — وستُنشأ الفاتورة';
  }
  if (lower.includes('نسخة احتياطية') || lower.includes('backup')) {
    return 'للنسخ الاحتياطي:\n• يمكنك تصدير بياناتك من الإعدادات ← النسخ الاحتياطي والتصدير\n• يمكن تفعيل النسخ التلقائي كل 24 ساعة\n• سيتم تنزيل ملف JSON يحتوي على جميع منتجاتك وإعداداتك';
  }
  if (lower.includes('اختصار') || lower.includes('keyboard')) {
    return 'اختصارات لوحة المفاتيح:\n• Ctrl+F — بحث في نقطة البيع\n• Ctrl+Enter — دفع سريع\n• Ctrl+K — لوحة الأوامر\n• Ctrl+N — فاتورة جديدة\n• Ctrl+P — طباعة\n• Ctrl+1/2/3 — تنقل سريع';
  }
  if (lower.includes('واتساب') || lower.includes('whatsapp')) {
    return 'لمشاركة فاتورة عبر واتساب:\n1. افتح الفاتورة من صفحة الفواتير\n2. اضغط زر "مشاركة واتساب"\n3. اختر نوع الرسالة (فاتورة، تذكير دفع، عرض خاص...)\n4. اكتب رقم العميل\n5. راجع الرسالة ثم اضغط إرسال';
  }
  if (lower.includes('قفل') || lower.includes('يومية') || lower.includes('تقرير')) {
    return 'لإغلاق يومية المبيعات:\n1. افتح تقرير الإغلاق اليومي من القائمة\n2. راجع إحصائيات المبيعات والفواتير\n3. تحقق من طرق الدفع والمصروفات\n4. أدخل المبلغ المعدود للجرد\n5. اطبع أو صدّر التقرير';
  }
  return 'شكرًا لسؤالك! هذه ميزة تجريبية وسيتم ربط الردود الذكية قريبًا. يمكنك التواصل مع الدعم الفني في الوقت الحالي. 🙏';
}

const Chatbot: FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open, messages, isTyping]);

  const handleSend = (text?: string) => {
    const content = (text ?? input).trim();
    if (!content) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: content,
      time: formatTime(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate bot reply — will be replaced with API call later
    setTimeout(() => {
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'bot',
        text: generateMockReply(content),
        time: formatTime(),
      };
      setIsTyping(false);
      setMessages((prev) => [...prev, botMsg]);
    }, 1200);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleOpen = () => {
    setOpen((prev) => !prev);
  };

  return createPortal(
    <>
      {/* Floating button */}
      <button
        onClick={toggleOpen}
        className="fixed bottom-24 right-4 z-[55] w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 active:scale-90 hover:scale-105 select-none"
        style={{
          background: 'var(--vuno-primary, #1D1D1F)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        }}
        aria-label="مساعد فونو الذكي"
        aria-expanded={open}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CloseIcon size={20} className="text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChatbotIcon size={22} className="text-white" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notification pulse dot */}
        {!open && (
          <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-[#25D366] border-2 border-white animate-pulse" />
        )}
      </button>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat-window"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed bottom-40 right-4 z-[55] w-[calc(100vw-2rem)] max-w-[380px] flex flex-col rounded-3xl overflow-hidden border bg-white shadow-2xl"
            style={{
              height: 'min(560px, calc(100vh - 8rem))',
              borderColor: 'var(--vuno-border, #E5E1D8)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center gap-3 px-4 py-3.5 text-white shrink-0"
              style={{ background: 'var(--vuno-primary, #1D1D1F)' }}
            >
              <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                <ChatbotIcon size={22} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-bold leading-tight">مساعد فونو الذكي</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-[#25D366]" />
                  <p className="text-[11px] text-white/70">متصل الآن</p>
                </div>
              </div>
              <button
                onClick={toggleOpen}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors shrink-0"
                aria-label="إغلاق"
              >
                <CloseIcon size={18} className="text-white" />
              </button>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[var(--vuno-bg, #F7F3EC)]">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className="max-w-[85%] px-3.5 py-2.5 rounded-2xl text-[13.5px] leading-relaxed whitespace-pre-line"
                    style={{
                      background: msg.role === 'user' ? '#25D366' : 'white',
                      color: msg.role === 'user' ? 'white' : 'var(--vuno-ink, #1D1D1F)',
                      borderBottomRightRadius: msg.role === 'user' ? '6px' : '16px',
                      borderBottomLeftRadius: msg.role === 'bot' ? '6px' : '16px',
                      border: msg.role === 'bot' ? '1px solid var(--vuno-border, #E5E1D8)' : 'none',
                    }}
                  >
                    {msg.text}
                  </div>
                  {msg.time && (
                    <span className="text-[10px] text-[var(--vuno-muted, #8A8A8E)] px-1">{msg.time}</span>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-end">
                  <div
                    className="px-4 py-3 rounded-2xl rounded-bl-[6px] border bg-white"
                    style={{ borderColor: 'var(--vuno-border, #E5E1D8)' }}
                  >
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[var(--vuno-muted)] animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-[var(--vuno-muted)] animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-[var(--vuno-muted)] animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested questions — show only when few messages */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2 shrink-0 bg-[var(--vuno-bg, #F7F3EC)]">
                <p className="text-[11px] font-semibold text-[var(--vuno-muted, #8A8A8E)] mb-2">أسئلة شائعة:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.map((q) => (
                    <button
                      key={q.label}
                      onClick={() => handleSend(q.query)}
                      className="px-3 py-1.5 rounded-full text-[12px] font-medium border border-[var(--vuno-border, #E5E1D8)] bg-white text-[var(--vuno-ink, #1D1D1F)] hover:border-[var(--vuno-primary, #1D1D1F)] transition-colors active:scale-95"
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input area */}
            <div className="px-3 py-3 shrink-0 bg-white border-t" style={{ borderColor: 'var(--vuno-border, #E5E1D8)' }}>
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="اكتب رسالتك..."
                  className="flex-1 h-11 px-4 rounded-full text-[14px] bg-[var(--vuno-bg, #F7F3EC)] border border-[var(--vuno-border, #E5E1D8)] outline-none focus:border-[var(--vuno-primary, #1D1D1F)] transition-colors"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim()}
                  className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90 disabled:opacity-40"
                  style={{ background: 'var(--vuno-primary, #1D1D1F)' }}
                  aria-label="إرسال"
                >
                  <SendIcon size={18} className="text-white" style={{ transform: 'scaleX(-1)' }} />
                </button>
              </div>
              <p className="text-center text-[10px] text-[var(--vuno-muted, #8A8A8E)] mt-2">
                مساعد ذكي تجريبي — سيتم ربط الردود الذكية قريبًا
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>,
    document.body,
  );
};

export default Chatbot;
