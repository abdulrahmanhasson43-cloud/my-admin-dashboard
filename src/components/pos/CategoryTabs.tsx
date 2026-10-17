interface CategoryTabsProps {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
}

/** The scrolling row of category chips above the product list. */
export default function CategoryTabs({ categories, selected, onSelect }: CategoryTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hidden">
      {categories.map(cat => {
        const isSelected = selected === cat;
        return (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className="px-4 h-9 sm:h-10 rounded-full text-[13px] sm:text-[14px] font-medium whitespace-nowrap transition-all bg-white flex-shrink-0"
            style={{
              border: isSelected ? '2px solid var(--vuno-primary-dark)' : '1px solid var(--vuno-border)',
              color: isSelected ? 'var(--vuno-primary)' : 'var(--vuno-text-secondary)',
            }}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
