import { describe, expect, it } from 'vitest';
import type { CartItem, Product } from '@/types';
import {
  addProduct, addProductVariant, changeQuantity, countUnits, quantityOf, removeItem, setQuantity, variantLineId,
} from './cart';

const product = (id: string, price = 10): Product => ({ id, name: `p-${id}`, price } as unknown as Product);
const line = (id: string, quantity: number, price = 10): CartItem => ({ ...product(id, price), quantity } as CartItem);

describe('cart rules', () => {
  it('adds a new product as a line of 1', () => {
    const cart = addProduct([], product('a'));
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(1);
  });

  it('merges the same product into one line instead of duplicating', () => {
    const cart = addProduct(addProduct([], product('a')), product('a'));
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(2);
  });

  it('never mutates the cart it was given', () => {
    const before = [line('a', 1)];
    const snapshot = JSON.stringify(before);
    addProduct(before, product('a'));
    changeQuantity(before, 'a', 5);
    setQuantity(before, 'a', 9);
    removeItem(before, 'a');
    expect(JSON.stringify(before)).toBe(snapshot);
  });

  it('keeps each variant combination on its own line', () => {
    const p = product('shirt');
    const red = addProductVariant([], p, { color: 'red', size: 'M' }, 2);
    const both = addProductVariant(red, p, { color: 'blue', size: 'M' }, 1);
    expect(both.map(i => i.id)).toEqual(['shirt-red-M', 'shirt-blue-M']);
    expect(variantLineId('shirt', { color: 'red', size: 'M' })).toBe('shirt-red-M');
  });

  it('adds quantity to an existing variant line', () => {
    const p = product('shirt');
    const cart = addProductVariant(addProductVariant([], p, { size: 'L' }, 1), p, { size: 'L' }, 3);
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(4);
  });

  it('changeQuantity moves up and down but never below 1', () => {
    const up = changeQuantity([line('a', 1)], 'a', 2);
    expect(up[0].quantity).toBe(3);
    const stays = changeQuantity([line('a', 1)], 'a', -1);
    expect(stays[0].quantity).toBe(1);
  });

  it('setQuantity floors decimals and rejects NaN / below 1', () => {
    const cart = [line('a', 2)];
    expect(setQuantity(cart, 'a', 4.9)[0].quantity).toBe(4);
    expect(setQuantity(cart, 'a', 0)).toBe(cart);
    expect(setQuantity(cart, 'a', Number.NaN)).toBe(cart);
  });

  it('removeItem drops only the requested line', () => {
    expect(removeItem([line('a', 1), line('b', 1)], 'a').map(i => i.id)).toEqual(['b']);
  });

  it('counts units and looks up a line quantity', () => {
    const cart = [line('a', 2), line('b', 3)];
    expect(countUnits(cart)).toBe(5);
    expect(quantityOf(cart, 'b')).toBe(3);
    expect(quantityOf(cart, 'missing')).toBe(0);
  });
});
