import { useMemo, useState } from 'react';
import type { Product } from '@/types';
import { ALL_CATEGORIES, filterProducts, listCategories } from '@/lib/inventory';

/**
 * useInventoryFilters — the search text, the chosen category chip, the chips
 * themselves, and the products that match both. The matching rules live in
 * lib/inventory.ts.
 */
export function useInventoryFilters(products: Product[]) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORIES);

  const categories = useMemo(() => listCategories(products), [products]);
  const filtered = useMemo(
    () => filterProducts(products, search, selectedCategory),
    [products, search, selectedCategory],
  );

  return { search, setSearch, selectedCategory, setSelectedCategory, categories, filtered };
}
