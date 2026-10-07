// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import type { Product } from '@/types';
import { ALL_CATEGORIES, usePosCatalog } from './usePosCatalog';

const product = (id: string, name: string, category: string, barcode: string): Product =>
  ({ id, name, category, barcode, price: 1, stock: 1 } as unknown as Product);

const PRODUCTS = [
  product('1', 'سماعة بلوتوث', 'إلكترونيات', '1111'),
  product('2', 'ماوس لاسلكي', 'كمبيوتر', '2222'),
  product('3', 'شاحن سريع', 'إلكترونيات', '3333'),
];

describe('usePosCatalog', () => {
  it('starts with every product and the "all" chip first, categories de-duplicated', () => {
    const { result } = renderHook(() => usePosCatalog(PRODUCTS));
    expect(result.current.filteredProducts).toHaveLength(3);
    expect(result.current.categories).toEqual([ALL_CATEGORIES, 'إلكترونيات', 'كمبيوتر']);
  });

  it('search matches the name or the barcode', () => {
    const { result } = renderHook(() => usePosCatalog(PRODUCTS));
    act(() => result.current.setSearch('ماوس'));
    expect(result.current.filteredProducts.map(p => p.id)).toEqual(['2']);
    act(() => result.current.setSearch('3333'));
    expect(result.current.filteredProducts.map(p => p.id)).toEqual(['3']);
  });

  it('a category narrows the list, and combines with the search', () => {
    const { result } = renderHook(() => usePosCatalog(PRODUCTS));
    act(() => result.current.setSelectedCategory('إلكترونيات'));
    expect(result.current.filteredProducts.map(p => p.id)).toEqual(['1', '3']);
    act(() => result.current.setSearch('شاحن'));
    expect(result.current.filteredProducts.map(p => p.id)).toEqual(['3']);
  });

  it('going back to "all" clears the category filter', () => {
    const { result } = renderHook(() => usePosCatalog(PRODUCTS));
    act(() => result.current.setSelectedCategory('كمبيوتر'));
    act(() => result.current.setSelectedCategory(ALL_CATEGORIES));
    expect(result.current.filteredProducts).toHaveLength(3);
  });

  it('no match gives an empty list', () => {
    const { result } = renderHook(() => usePosCatalog(PRODUCTS));
    act(() => result.current.setSearch('zzz'));
    expect(result.current.filteredProducts).toEqual([]);
  });
});
