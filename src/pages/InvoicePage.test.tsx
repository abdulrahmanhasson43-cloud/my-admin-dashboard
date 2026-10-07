// @vitest-environment jsdom
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '@/App';
import { installDomStubs, signInForTests } from '@/test-utils/domStubs';

/** The invoices screen end to end: list, details, and the "new invoice" builder. */

beforeAll(installDomStubs);
beforeEach(() => {
  window.localStorage.clear();
  window.localStorage.setItem('vuno_onboarding_done', 'true');
  signInForTests();
});
afterEach(() => cleanup());

async function openInvoices() {
  const view = render(
    <MemoryRouter initialEntries={['/invoices']}>
      <App />
    </MemoryRouter>,
  );
  await waitFor(() => expect(view.container.querySelector('.animate-spin')).toBeNull(), { timeout: 5000 });
  // The mock invoices load asynchronously.
  await waitFor(() => expect(screen.getAllByText('INV-2025-001').length).toBeGreaterThan(0), { timeout: 5000 });
  return view;
}

const PRODUCT = 'سماعة بلوتوث لاسلكية'; // 250 EGP in the mock data
const PRODUCT_PRICE = 250;

function openBuilder() {
  fireEvent.click(screen.getByRole('button', { name: /فاتورة جديدة/ }));
}

function pickCustomer(name: string) {
  const select = screen.getByRole('combobox') as HTMLSelectElement;
  const option = Array.from(select.options).find(o => o.text.startsWith(name));
  fireEvent.change(select, { target: { value: option?.value } });
}

function addProduct() {
  fireEvent.click(screen.getByRole('button', { name: new RegExp(PRODUCT) }));
}

describe('Invoices screen', () => {
  it('lists the invoices and narrows them by search', async () => {
    await openInvoices();
    expect(screen.getAllByText('INV-2025-002').length).toBeGreaterThan(0);
    fireEvent.change(screen.getByPlaceholderText('ابحث برقم الفاتورة أو العميل...'), { target: { value: 'INV-2025-003' } });
    await waitFor(() => expect(screen.queryAllByText('INV-2025-002')).toHaveLength(0));
    expect(screen.getAllByText('INV-2025-003').length).toBeGreaterThan(0);
  });

  it('filters by status', async () => {
    await openInvoices();
    fireEvent.click(screen.getByRole('button', { name: 'معلقة' }));
    // Only INV-2025-003 is pending in the mock data.
    await waitFor(() => expect(screen.queryAllByText('INV-2025-001')).toHaveLength(0));
    expect(screen.getAllByText('INV-2025-003').length).toBeGreaterThan(0);
  });

  it('opens an invoice, shows its amounts, and closes it', async () => {
    await openInvoices();
    fireEvent.click(screen.getAllByText('INV-2025-001')[0]);
    expect(await screen.findByText('طباعة الفاتورة')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'إغلاق' }));
    await waitFor(() => expect(screen.queryByText('طباعة الفاتورة')).toBeNull());
  });

  it('builder: saving without a customer is refused with a message', async () => {
    await openInvoices();
    openBuilder();
    fireEvent.click(await screen.findByRole('button', { name: /حفظ الفاتورة/ }));
    expect(await screen.findByText('يرجى اختيار العميل')).toBeTruthy();
  });

  it('builder: saving with a customer but no products is refused with a message', async () => {
    await openInvoices();
    openBuilder();
    pickCustomer('أحمد محمد');
    fireEvent.click(await screen.findByRole('button', { name: /حفظ الفاتورة/ }));
    expect(await screen.findByText('يرجى إضافة منتج واحد على الأقل')).toBeTruthy();
  });

  it('builder: customer + product + save creates the invoice with VAT and closes the panel', async () => {
    await openInvoices();
    openBuilder();
    pickCustomer('خالد محمود');
    addProduct();
    fireEvent.click(screen.getByRole('button', { name: /حفظ الفاتورة/ }));

    const total = (PRODUCT_PRICE * 1.14).toLocaleString();
    expect(await screen.findByText(/تم إنشاء الفاتورة INV-\d+ بنجاح/)).toBeTruthy();
    expect(screen.getByText(new RegExp(`الإجمالي: ${total} EGP`))).toBeTruthy();
    await waitFor(() => expect(screen.queryByRole('button', { name: /حفظ الفاتورة/ })).toBeNull());
  });

  it('builder: adding the same product twice shows "في السلة" and keeps one line', async () => {
    await openInvoices();
    openBuilder();
    addProduct();
    expect(await screen.findByText('في السلة')).toBeTruthy();
    addProduct();
    expect(screen.getByText(/عناصر الفاتورة \(1\)/)).toBeTruthy();
  });
});
