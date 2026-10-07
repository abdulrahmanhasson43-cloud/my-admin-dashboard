// @vitest-environment jsdom
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '@/App';
import { installDomStubs, signInForTests } from '@/test-utils/domStubs';

/**
 * End-to-end through the real providers (no mocks of our own code): the
 * cashier flow on /pos — add a product, open the cart, pay — and what that
 * sale must leave behind (receipt, goal progress, activity log).
 */

beforeAll(installDomStubs);
beforeEach(() => {
  window.localStorage.clear();
  window.localStorage.setItem('vuno_onboarding_done', 'true');
  signInForTests();
});
afterEach(() => cleanup());

async function openPos() {
  const view = render(
    <MemoryRouter initialEntries={['/pos']}>
      <App />
    </MemoryRouter>,
  );
  await waitFor(() => expect(view.container.querySelector('.animate-spin')).toBeNull(), { timeout: 5000 });
  return view;
}

const PRODUCT = 'سماعة بلوتوث لاسلكية'; // 250 EGP in the mock data
const PRODUCT_PRICE = 250;

function addProductToCart() {
  fireEvent.click(screen.getByRole('button', { name: new RegExp(PRODUCT) }));
}

function openCart() {
  fireEvent.click(screen.getByLabelText('سلة المشتريات'));
}

describe('POS cashier flow', () => {
  it('adds a product, pays, and shows the receipt', async () => {
    await openPos();
    addProductToCart();
    openCart();

    const total = PRODUCT_PRICE * 1.14;
    fireEvent.click(await screen.findByRole('button', { name: new RegExp(`^دفع ${total.toLocaleString()} EGP`) }));

    // The receipt screen appears after the 1.2s success animation.
    expect(await screen.findByText('تم الدفع بنجاح', {}, { timeout: 4000 })).toBeTruthy();
    expect(screen.getByText(/فاتورة رقم INV-\d{6}/)).toBeTruthy();
  });

  it('a completed sale moves the sales goal and writes the activity log', async () => {
    await openPos();
    addProductToCart();
    openCart();
    fireEvent.click(await screen.findByRole('button', { name: /^دفع .* EGP/ }));
    await screen.findByText('تم الدفع بنجاح', {}, { timeout: 4000 });

    const goal = JSON.parse(window.localStorage.getItem('vuno_sales_goal') ?? 'null');
    expect(goal.achieved).toBeCloseTo(PRODUCT_PRICE * 1.14);

    const log = JSON.parse(window.localStorage.getItem('vuno_activity_log') ?? '[]');
    expect(log[0].type).toBe('sale');
    expect(log[0].description).toMatch(/تم إتمام بيع بقيمة .* · INV-\d{6}/);
  });

  it('an empty cart shows the empty state and no pay button', async () => {
    await openPos();
    openCart();
    expect(await screen.findByText('السلة فارغة')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /^دفع / })).toBeNull();
  });

  it('the + button and the typed quantity both change the total on the pay button', async () => {
    await openPos();
    addProductToCart();
    openCart();

    // The cart line's quantity box is the number input with min=1 (the other one is "amount paid").
    await screen.findAllByRole('spinbutton');
    const quantity = screen.getAllByRole('spinbutton').find(el => (el as HTMLInputElement).min === '1') as HTMLInputElement;
    // In the cart line the + button sits right after the quantity box.
    fireEvent.click(quantity.nextElementSibling as HTMLElement);
    const doubled = PRODUCT_PRICE * 2 * 1.14;
    expect(await screen.findByRole('button', { name: new RegExp(`^دفع ${doubled.toLocaleString()} EGP`) })).toBeTruthy();

    fireEvent.change(quantity, { target: { value: '3' } });
    const tripled = PRODUCT_PRICE * 3 * 1.14;
    expect(await screen.findByRole('button', { name: new RegExp(`^دفع ${tripled.toLocaleString()} EGP`) })).toBeTruthy();
  });

  it('parks the cart as a held order and resumes it with the same items', async () => {
    await openPos();
    addProductToCart();
    openCart();

    // Hold: the cart's "تعليق" button opens the popup; confirm inside the popup.
    fireEvent.click(await screen.findByRole('button', { name: 'تعليق' }));
    const nameInput = await screen.findByPlaceholderText('مثال: أحمد — طاولة 3');
    fireEvent.change(nameInput, { target: { value: 'أحمد' } });
    const popup = nameInput.closest('.fixed') as HTMLElement;
    fireEvent.click(within(popup).getByRole('button', { name: 'تعليق' }));

    // Parked: cart emptied, order saved through HeldOrderService.
    await waitFor(() => {
      const saved = JSON.parse(window.localStorage.getItem('vuno_held_orders') ?? '[]');
      expect(saved).toHaveLength(1);
      expect(saved[0].label).toBe('أحمد');
      expect(saved[0].items[0].name).toBe(PRODUCT);
    });

    // Resume: open the held-orders panel and take the order back.
    fireEvent.click(screen.getByLabelText('الطلبات المعلقة'));
    fireEvent.click(await screen.findByRole('button', { name: 'استرداد' }));

    // The cart is back with the product, and the held list is empty again.
    expect(await screen.findByRole('button', { name: /^دفع .* EGP/ })).toBeTruthy();
    await waitFor(() => expect(JSON.parse(window.localStorage.getItem('vuno_held_orders') ?? '[]')).toHaveLength(0));
  });

  it('quick pay always pays in cash — even when another method was selected first', async () => {
    await openPos();
    addProductToCart();
    openCart();

    // Pick "card", then tap the 500 quick-pay button (which switches the method to cash).
    fireEvent.click((await screen.findByText('بطاقة ائتمان')).closest('button') as HTMLElement);
    fireEvent.click(screen.getByRole('button', { name: '500' }));

    await screen.findByText('تم الدفع بنجاح', {}, { timeout: 4000 });
    // The receipt must say cash, not card.
    expect(screen.getByText('كاش')).toBeTruthy();
    expect(screen.queryByText('بطاقة')).toBeNull();
  });
});
