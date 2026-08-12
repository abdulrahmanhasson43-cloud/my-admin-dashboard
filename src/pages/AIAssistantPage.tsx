import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AIAssistantIcon, SendIcon, TrendingUpIcon, PackageIcon, ReceiptIcon, ExpenseIcon } from '@/components/icons';
import { generateId } from '@/lib/utils';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface SuggestionPrompt {
  icon: React.ComponentType<{ className?: string; size?: number }>;
  label: string;
  prompt: string;
}

const suggestions: SuggestionPrompt[] = [
  { icon: TrendingUpIcon, label: 'أعلى المنتجات مبيعاً', prompt: 'إيه أعلى 5 منتجات مبيعاً هذا الأسبوع؟' },
  { icon: ReceiptIcon, label: 'ملخص مبيعات اليوم', prompt: 'اديني ملخص مبيعات اليوم' },
  { icon: PackageIcon, label: 'المنتجات الناقصة', prompt: 'إيه المنتجات اللي مخزونها منخفض ومحتاج إعادة طلب؟' },
  { icon: ExpenseIcon, label: 'تحليل المصروفات', prompt: 'حلل مصروفاتي الأخيرة وقولي أنا مصروف فين أكتر' },
];

// Pre-canned responses for demo (API integration point marked)
const demoResponses: Record<string, string> = {
  'default': 'أنا المساعد الذكي بتاع Vuno. مقدر أساعدك في تحليل المبيعات، إدارة المخزون، تتبع المصروفات، وتقارير الأداء. إيه اللي تحب تعرفه؟',
};

function generateResponse(prompt: string): string {
  // API INTEGRATION POINT: Replace this with actual API call
  // e.g., POST to your AI backend with the conversation context
  const lower = prompt.toLowerCase();

  if (lower.includes('مبيع') || lower.includes('بيع')) {
    return 'بناءً على بياناتك، مبيعات اليوم وصلت 3,450 EGP من 12 فاتورة. أعلى منتج مبيعاً هو "سماعة بلوتوث" بـ 250 EGP. المبيعات زادت 18.4% عن الشهر اللي فات. تحب أشوفلك تفاصيل أكتر؟';
  }
  if (lower.includes('مخزون') || lower.includes('ناقص') || lower.includes('منخفض')) {
    return 'عندك 4 منتجات مخزونها منخفض في المتجر: "شاحن سريع 65W" (8 قطع)، "كابل USB-C" (5 قطع). بتقترح تعمل أمر شراء جديد للموردين. تحب أجهزلك أمر شراء؟';
  }
  if (lower.includes('مصروف') || lower.includes('مصاريف')) {
    return 'مصروفاتك اليوم وصلت 12,750 EGP. أكتر فئة مصروفات هي "الإيجار" (8,000 EGP) بعدها "المرتبات" (3,500 EGP). متوسط مصروفاتك اليومي 3,185 EGP. تحب أشوفلك رسم بياني؟';
  }
  if (lower.includes('ربح') || lower.includes('أرباح')) {
    return 'صافي ربحك هذا الشهر 72,450 - 45,200 (مشتريات) - 12,750 (مصروفات) = 14,500 EGP. هامش الربح 20%. تحب أقارنه بالشهر اللي فات؟';
  }

  return demoResponses['default'];
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'أهلاً! أنا المساعد الذكي بتاع Vuno. مقدر أساعدك في تحليل مبيعاتك، إدارة مخزونك، تتبع مصروفاتك، وتقارير أداء متجرك. إيه اللي تحب نساعدك فيه النهارده؟',
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (text?: string) => {
    const message = (text ?? input).trim();
    if (!message) return;

    const userMsg: ChatMessage = {
      id: generateId('user'),
      role: 'user',
      content: message,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate API response delay
    // API INTEGRATION POINT: Replace setTimeout with actual fetch call
    setTimeout(() => {
      const response = generateResponse(message);
      const assistantMsg: ChatMessage = {
        id: generateId('assistant'),
        role: 'assistant',
        content: response,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto animate-fade-in" style={{ minHeight: 'calc(100vh - 140px)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[var(--vuno-border-light)]">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'color-mix(in srgb, var(--vuno-primary) 12%, transparent)' }}
        >
          <AIAssistantIcon size={22} className="text-[var(--vuno-primary)]" />
        </div>
        <div>
          <h1 className="text-[18px] font-semibold text-[var(--vuno-text)]">المساعد الذكي</h1>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <p className="text-[12px] text-[var(--vuno-text-muted)]">متصل · جاهز للأسئلة</p>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
          >
            <div className={`flex items-start gap-2.5 max-w-[85%] ${msg.role === 'user' ? 'flex-row' : 'flex-row-reverse'}`}>
              {msg.role === 'assistant' && (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                  style={{ background: 'color-mix(in srgb, var(--vuno-primary) 12%, transparent)' }}
                >
                  <AIAssistantIcon size={16} className="text-[var(--vuno-primary)]" />
                </div>
              )}
              <div>
                <div
                  className={`px-4 py-3 rounded-[18px] text-[14px] leading-relaxed ${
                    msg.role === 'user'
                      ? 'text-white rounded-tr-md'
                      : 'text-[var(--vuno-text)] rounded-tl-md'
                  }`}
                  style={{
                    background: msg.role === 'user' ? 'var(--vuno-primary)' : 'var(--vuno-surface-pearl)',
                  }}
                >
                  {msg.content}
                </div>
                <p className={`text-[10px] text-[var(--vuno-text-muted)] mt-1 ${msg.role === 'user' ? 'text-left' : 'text-right'}`}>
                  {msg.timestamp}
                </p>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Typing indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex justify-end"
            >
              <div className="flex items-center gap-2.5">
                <div className="px-4 py-3 rounded-[18px] rounded-tl-md" style={{ background: 'var(--vuno-surface-pearl)' }}>
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <motion.span
                        key={i}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                        className="w-2 h-2 rounded-full bg-[var(--vuno-text-muted)]"
                      />
                    ))}
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'color-mix(in srgb, var(--vuno-primary) 12%, transparent)' }}>
                  <AIAssistantIcon size={16} className="text-[var(--vuno-primary)]" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion prompts — show when only welcome message */}
      {messages.length === 1 && (
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          {suggestions.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.button
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => handleSend(s.prompt)}
                className="card-vuno p-3.5 text-right hover:border-[var(--vuno-primary)] transition-all active:scale-95 flex items-center gap-2.5"
              >
                <div className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ background: 'color-mix(in srgb, var(--vuno-primary) 8%, transparent)' }}>
                  <Icon size={16} className="text-[var(--vuno-primary)]" />
                </div>
                <span className="text-[13px] font-medium text-[var(--vuno-text)] leading-tight">{s.label}</span>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Input bar */}
      <div className="sticky bottom-0 bg-[var(--vuno-bg)] pt-3 pb-1">
        <div className="flex items-center gap-2 bg-white rounded-full p-1.5" style={{ border: '1px solid var(--vuno-border)' }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="اكتب سؤالك..."
            className="flex-1 h-10 px-4 bg-transparent text-[15px] text-[var(--vuno-text)] focus:outline-none"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-transform active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
            style={{ background: 'var(--vuno-primary)' }}
            aria-label="إرسال"
          >
            <SendIcon size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
