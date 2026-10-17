// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import type { Product } from '@/types';
import { usePosCart } from './usePosCart';

const product = (id: string, price = 10): Product => ({ id, name: `p-${id}`, price } as unknown as Product);

describe('usePosCart', () => {
  it('starts empty', () => {
    const { result } = renderHook(() => usePosCart());
    expect(result.current.cart).toEqual([]);
    expect(result.current.itemCount).toBe(0);
  });

  it('adding the same product twice makes one line of 2, and counts the units', () => {
    const { result } = renderHook(() => usePosCart());
    act(() => result.current.add(product('a')));
    act(() => result.current.add(product('a')));
    expect(result.current.cart).toHaveLength(1);
    expect(result.current.itemCount).toBe(2);
    expect(result.current.quantityFor('a')).toBe(2);
    expect(result.current.quantityFor('missing')).toBe(0);
  });

  it('a variant combination is its own line', () => {
    const { result } = renderHook(() => usePosCart());
    act(() => result.current.addVariant(product('a'), { color: 'red' }, 2));
    expect(result.current.cart[0].id).toBe('a-red');
    expect(result.current.cart[0].quantity).toBe(2);
  });

  it('changes, sets and removes a line', () => {
    const { result } = renderHook(() => usePosCart());
    act(() => result.current.add(product('a')));
    act(() => result.current.changeQty('a', 2));
    expect(result.current.quantityFor('a')).toBe(3);
    act(() => result.current.setQty('a', 7));
    expect(result.current.quantityFor('a')).toBe(7);
    act(() => result.current.remove('a'));
    expect(result.current.cart).toEqual([]);
  });

  it('replace swaps the whole cart and clear empties it', () => {
    const { result } = renderHook(() => usePosCart());
    act(() => result.current.add(product('a')));
    act(() => result.current.replace([{ ...product('b'), quantity: 4 }]));
    expect(result.current.cart.map(l => l.id)).toEqual(['b']);
    expect(result.current.itemCount).toBe(4);
    act(() => result.current.clear());
    expect(result.current.cart).toEqual([]);
  });
});
