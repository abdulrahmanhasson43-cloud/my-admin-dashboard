import { useMemo, useState } from 'react';
import type { Product } from '@/types';

/** The "all categories" chip on the POS. */
export const ALL_CATEGORIES = 'الكل';

/**
 * usePosCatalog — what the cashier is looking at: the search text, the chosen
 * category chip, and the products that match both. Search matches the name or
 * the barcode.
 */
export function usePosCatalog(products: Product[]) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORIES);

  const categories = useMemo(
    () => [ALL_CATEGORIES, ...Array.from(new Set(products.map(p => p.category)))],
    [products],
  );

  const filteredProducts = useMemo(
    () =>
      products.filter(p => {
        const matchSearch = p.name.includes(search) || p.barcode.includes(search);
        const matchCategory = selectedCategory === ALL_CATEGORIES || p.category === selectedCategory;
        return matchSearch && matchCategory;
      }),
    [products, search, selectedCategory],
  );

  return { search, setSearch, selectedCategory, setSelectedCategory, categories, filteredProducts };
}
