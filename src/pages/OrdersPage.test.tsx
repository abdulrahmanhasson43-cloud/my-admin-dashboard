// @vitest-environment jsdom
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '@/App';
import { installDomStubs, signInForTests } from '@/test-utils/domStubs';

/** The orders screen end to end, through the real providers and services. */

beforeAll(installDomStubs);
beforeEach(() => {
  window.localStorage.clear();
  window.localStorage.setItem('vuno_onboarding_done', 'true');
  signInForTests();
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

async function openOrders() {
  const view = render(
    <MemoryRouter initialEntries={['/orders']}>
      <App />
    </MemoryRouter>,
  );
  await waitFor(() => expect(view.container.querySelector('.animate-spin')).toBeNull(), { timeout: 5000 });
  await waitFor(() => expect(screen.queryByText('جارٍ التحميل…')).toBeNull(), { timeout: 5000 });
  return view;
}

const NAME_PLACEHOLDER = 'مثال: أحمد محمد';

function openModal() {
  // The exact name skips the "إضافة طلب جديد" button on the first Kanban column.
  fireEvent.click(screen.getByRole('button', { name: 'طلب جديد' }));
}

function addLine(name: string, price: string, quantity: string) {
  fireEvent.change(screen.getByPlaceholderText('اسم المنتج'), { target: { value: name } });
  fireEvent.change(screen.getByPlaceholderText('السعر'), { target: { value: price } });
  fireEvent.change(screen.getByPlaceholderText('الكمية'), { target: { value: quantity } });
  fireEvent.click(screen.getByRole('button', { name: 'إضافة المنتج' }));
}

describe('Orders screen', () => {
  it('shows the headline numbers and the time filters', async () => {
    await openOrders();
    expect(screen.getByText('إجمالي الطلبات')).toBeTruthy();
    expect(screen.getByText('إجمالي القيمة')).toBeTruthy();
    for (const label of ['اليوم', 'الأسبوع', 'الشهر']) {
      expect(screen.getByText(label)).toBeTruthy();
    }
    // "الكل" is both a time filter and the first mobile status chip.
    expect(screen.getAllByText('الكل').length).toBeGreaterThanOrEqual(2);
  });

  it('opens the new-order form and closes it again with cancel', async () => {
    await openOrders();
    openModal();
    expect(screen.getByPlaceholderText(NAME_PLACEHOLDER)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'إلغاء' }));
    expect(screen.queryByPlaceholderText(NAME_PLACEHOLDER)).toBeNull();
  });

  it('an order with no customer name and no lines is not created: the form stays open', async () => {
    await openOrders();
    openModal();
    fireEvent.click(screen.getByRole('button', { name: 'إنشاء الطلب' }));
    expect(screen.getByPlaceholderText(NAME_PLACEHOLDER)).toBeTruthy();
  });

  it('a line with a zero price is ignored, a valid one is added with its total', async () => {
    await openOrders();
    openModal();
    addLine('قلم', '0', '1');
    expect(screen.queryByText('قلم × 1')).toBeNull();

    addLine('قلم', '12', '2');
    expect(screen.getByText('قلم × 2')).toBeTruthy();
    // The line total and the grand total are the same number here.
    expect(screen.getAllByText('24 ج.م').length).toBe(2);
  });

  it('creates an order: the form closes and the customer shows up on the board', async () => {
    await openOrders();
    openModal();
    fireEvent.change(screen.getByPlaceholderText(NAME_PLACEHOLDER), { target: { value: 'عميل اختبار الطلبات' } });
    addLine('قلم', '12', '2');
    fireEvent.click(screen.getByRole('button', { name: 'إنشاء الطلب' }));

    await waitFor(() => expect(screen.queryByPlaceholderText(NAME_PLACEHOLDER)).toBeNull());
    expect((await screen.findAllByText('عميل اختبار الطلبات')).length).toBeGreaterThan(0);
  });
});
