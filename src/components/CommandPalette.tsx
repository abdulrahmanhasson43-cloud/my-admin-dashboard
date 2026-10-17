import { useEffect, useMemo, useState, type ComponentType } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
import {
  POSIcon, SearchIcon, CommandIcon, RocketIcon,
  ArchiveIcon, ActivityIcon,
} from '@/components/icons';
import { mainNavItems, moreSections, pageTitles } from '@/constants/navigation';
import { useTheme } from '@/context/theme-context-value';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CommandItem {
  id: string;
  label: string;
  group: string;
  icon: ComponentType<{ className?: string; size?: number }>;
  action: () => void;
  keywords?: string[];
}

export default function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { toggleTheme } = useTheme();
  const [search, setSearch] = useState('');

  // Reset search when palette closes
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => setSearch(''), 200);
      return () => clearTimeout(t);
    }
  }, [open]);

  const items = useMemo<CommandItem[]>(() => {
    const navItems: CommandItem[] = [
      ...mainNavItems,
      ...moreSections,
    ].map(item => ({
      id: item.path,
      label: item.label,
      group: 'التنقل',
      icon: item.icon,
      action: () => {
        navigate(item.path);
        onOpenChange(false);
      },
      keywords: pageTitles[item.path] ? [pageTitles[item.path]] : [],
    }));

    const actionItems: CommandItem[] = [
      {
        id: 'theme-toggle',
        label: 'تبديل الوضع الليلي / النهاري',
        group: 'إجراءات',
        icon: RocketIcon,
        action: () => {
          toggleTheme();
          onOpenChange(false);
        },
        keywords: ['dark', 'light', 'mode', 'theme', 'وضع', 'ليلي'],
      },
      {
        id: 'new-sale',
        label: 'بدء بيع جديد',
        group: 'إجراءات',
        icon: POSIcon,
        action: () => {
          navigate('/pos');
          onOpenChange(false);
        },
        keywords: ['pos', 'sell', 'checkout', 'بيع', 'نقطة'],
      },
      {
        id: 'shifts',
        label: 'فتح إدارة الورديات',
        group: 'إجراءات',
        icon: ArchiveIcon,
        action: () => {
          navigate('/shifts');
          onOpenChange(false);
        },
        keywords: ['shift', 'ورديات', 'كاشير'],
      },
      {
        id: 'activity',
        label: 'عرض سجل النشاطات',
        group: 'إجراءات',
        icon: ActivityIcon,
        action: () => {
          navigate('/activity');
          onOpenChange(false);
        },
        keywords: ['activity', 'log', 'سجل', 'نشاطات'],
      },
    ];

    return [...navItems, ...actionItems];
  }, [navigate, onOpenChange, toggleTheme]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => onOpenChange(false)}
        className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm animate-in fade-in duration-150"
      />

      {/* Command palette — centered, Apple-style */}
      <div className="fixed top-[15%] left-1/2 -translate-x-1/2 z-[101] w-[92%] max-w-lg">
        <div
          className="bg-[var(--vuno-surface)] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] border border-[var(--vuno-border)] overflow-hidden"
          dir="rtl"
        >
          <Command
            className="outline-none"
            shouldFilter={true}
            loop
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 border-b border-[var(--vuno-border)]">
              <SearchIcon size={18} className="text-[var(--vuno-text-muted)] flex-shrink-0" />
              <Command.Input
                value={search}
                onValueChange={setSearch}
                placeholder="ابحث عن صفحة أو إجراء..."
                className="flex-1 bg-transparent border-none outline-none py-4 text-[15px] text-[var(--vuno-text)] placeholder:text-[var(--vuno-text-muted)]"
                autoFocus
              />
              <kbd className="flex items-center gap-0.5 px-2 py-1 rounded-md bg-[var(--vuno-border-light)] text-[10px] font-semibold text-[var(--vuno-text-muted)] flex-shrink-0">
                <CommandIcon size={10} />
                K
              </kbd>
            </div>

            {/* Results */}
            <Command.List className="max-h-[320px] overflow-y-auto p-2">
              <Command.Empty className="py-8 text-center text-[13px] text-[var(--vuno-text-muted)]">
                لا توجد نتائج
              </Command.Empty>

              {/* Group: Navigation */}
              <Command.Group
                heading="التنقل"
                className="text-[11px] font-semibold text-[var(--vuno-text-muted)] px-2 pt-2 pb-1"
              >
                {items
                  .filter(i => i.group === 'التنقل')
                  .map(item => (
                    <CommandItemRow key={item.id} item={item} />
                  ))}
              </Command.Group>

              {/* Group: Actions */}
              <Command.Group
                heading="إجراءات سريعة"
                className="text-[11px] font-semibold text-[var(--vuno-text-muted)] px-2 pt-3 pb-1"
              >
                {items
                  .filter(i => i.group === 'إجراءات')
                  .map(item => (
                    <CommandItemRow key={item.id} item={item} />
                  ))}
              </Command.Group>
            </Command.List>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-[var(--vuno-border)] bg-[var(--vuno-surface-pearl)]">
              <div className="flex items-center gap-3 text-[10px] text-[var(--vuno-text-muted)]">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-[var(--vuno-border-light)] font-semibold">↑↓</kbd>
                  تنقل
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-[var(--vuno-border-light)] font-semibold">↵</kbd>
                  اختيار
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-[var(--vuno-border-light)] font-semibold">Esc</kbd>
                  إغلاق
                </span>
              </div>
              <span className="text-[10px] font-medium text-[var(--vuno-text-muted)]">Vuno</span>
            </div>
          </Command>
        </div>
      </div>
    </>
  );
}

function CommandItemRow({ item }: { item: CommandItem }) {
  const Icon = item.icon;
  return (
    <Command.Item
      onSelect={item.action}
      keywords={item.keywords}
      value={`${item.label} ${(item.keywords ?? []).join(' ')}`}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-[14px] text-[var(--vuno-text)] transition-colors data-[selected=true]:bg-[var(--vuno-bg)] data-[selected=true]:font-medium outline-none"
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: 'color-mix(in srgb, var(--vuno-primary) 8%, transparent)' }}
      >
        <Icon size={16} className="text-[var(--vuno-primary)]" />
      </div>
      <span className="flex-1">{item.label}</span>
      <span className="text-[10px] text-[var(--vuno-text-muted)]">{item.group}</span>
    </Command.Item>
  );
}
