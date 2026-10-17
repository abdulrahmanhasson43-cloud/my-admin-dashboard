import { DownloadIcon } from '@/components/icons';
import SearchBar from '@/components/SearchBar';

interface InventoryToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  /** What the QR button next to the search box encodes. */
  qrValue: string;
  onExport: () => void;
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

/** Search box (with QR and export buttons) and the scrollable category chips. */
export default function InventoryToolbar({
  search, onSearchChange, qrValue, onExport, categories, selectedCategory, onSelectCategory,
}: InventoryToolbarProps) {
  return (
    <div className="space-y-3">
      <SearchBar
        value={search}
        onChange={onSearchChange}
        placeholder="ابحث عن منتج..."
        qrValue={qrValue}
        qrLabel="QR Code — المخزون"
        actions={
          <button
            onClick={onExport}
            className="px-4 py-2.5 rounded-full border border-black/10 bg-white text-[var(--vuno-ink)] font-medium flex items-center gap-2 hover:bg-[var(--vuno-parchment)] transition-colors whitespace-nowrap active:scale-95 flex-shrink-0"
          >
            <DownloadIcon size={16} />
            تصدير
          </button>
        }
      />
      {/* فلتر الفئات أفقي قابل للتمرير */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
              selectedCategory === cat
                ? 'text-white'
                : 'bg-white border border-[var(--vuno-border)] text-[var(--vuno-text-secondary)] hover:bg-[var(--vuno-bg)]'
            }`}
            style={selectedCategory === cat ? { background: 'var(--vuno-primary)' } : undefined}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
