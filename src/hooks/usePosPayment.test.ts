// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { usePosPayment } from './usePosPayment';

const ALL = [{ id: 'cash' }, { id: 'card' }, { id: 'wallet' }];

describe('usePosPayment', () => {
  it('defaults to cash with nothing paid and no change', () => {
    const { result } = renderHook(() => usePosPayment(ALL, 114));
    expect(result.current.effectivePayment).toBe('cash');
    expect(result.current.paidNumber).toBe(0);
    expect(result.current.change).toBe(0);
  });

  it('uses the method the cashier picks', () => {
    const { result } = renderHook(() => usePosPayment(ALL, 114));
    act(() => result.current.setSelectedPayment('card'));
    expect(result.current.effectivePayment).toBe('card');
  });

  it('falls back to the first enabled method when the chosen one is switched off', () => {
    const { result, rerender } = renderHook(({ methods }) => usePosPayment(methods, 114), { initialProps: { methods: ALL } });
    act(() => result.current.setSelectedPayment('card'));
    rerender({ methods: [{ id: 'wallet' }, { id: 'cash' }] });
    expect(result.current.effectivePayment).toBe('wallet');
    // …and the original pick is remembered, so turning it back on restores it.
    rerender({ methods: ALL });
    expect(result.current.effectivePayment).toBe('card');
  });

  it('keeps the selection when no method list is available at all', () => {
    const { result } = renderHook(() => usePosPayment([], 114));
    expect(result.current.effectivePayment).toBe('cash');
  });

  it('parses the amount handed over and works out the change', () => {
    const { result } = renderHook(() => usePosPayment(ALL, 114));
    act(() => result.current.setAmountPaid('200'));
    expect(result.current.paidNumber).toBe(200);
    expect(result.current.change).toBe(86);
  });

  it('short payment gives negative change; junk text counts as nothing paid', () => {
    const { result } = renderHook(() => usePosPayment(ALL, 114));
    act(() => result.current.setAmountPaid('100'));
    expect(result.current.change).toBe(-14);
    act(() => result.current.setAmountPaid('abc'));
    expect(result.current.paidNumber).toBe(0);
    expect(result.current.change).toBe(0);
  });
});
