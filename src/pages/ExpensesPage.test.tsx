// @vitest-environment jsdom
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '@/App';
import { installDomStubs, signInForTests } from '@/test-utils/domStubs';

/** The expenses screen end to end, through the real providers and services. */

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

async function openExpenses() {
  const view = render(
    <MemoryRouter initialEntries={['/expenses']}>
      <App />
    </MemoryRouter>,
  );
  await waitFor(() => expect(view.container.querySelector('.animate-spin')).toBeNull(), { timeout: 5000 });
  return view;
}

const DESCRIPTION = 'placeholder-free: فاتورة اختبار';

function openForm() {
  fireEvent.click(screen.getByRole('button', { name: /مصروف جديد/ }));
}

function fillForm(description: string, amount: string) {
  fireEvent.change(screen.getByPlaceholderText('مثال: فاتورة الكهرباء'), { target: { value: description } });
  fireEvent.change(screen.getByPlaceholderText('0'), { target: { value: amount } });
}

function showList() {
  fireEvent.click(screen.getByRole('button', { name: 'القائمة' }));
}

describe('Expenses screen', () => {
  it('opens on the calendar view and can switch to the list', async () => {
    await openExpenses();
    expect(screen.getByRole('button', { name: 'الشهر السابق' })).toBeTruthy();
    showList();
    expect(screen.queryByRole('button', { name: 'الشهر السابق' })).toBeNull();
  });

  it('saves a valid expense: the form closes and it appears in the list under "اليوم"', async () => {
    await openExpenses();
    openForm();
    fillForm(DESCRIPTION, '275');
    fireEvent.click(screen.getByRole('button', { name: 'حفظ المصروف' }));

    await waitFor(() => expect(screen.queryByPlaceholderText('مثال: فاتورة الكهرباء')).toBeNull());
    showList();
    expect(await screen.findByText(DESCRIPTION)).toBeTruthy();
    expect(screen.getByText('اليوم')).toBeTruthy();
  });

  it('a zero or negative amount is explained with a message and the form stays open', async () => {
    await openExpenses();
    openForm();
    fillForm(DESCRIPTION, '-5');
    fireEvent.click(screen.getByRole('button', { name: 'حفظ المصروف' }));

    // Before the fix the form closed silently and nothing was saved.
    expect(await screen.findByText('المبلغ لازم يكون رقم أكبر من صفر')).toBeTruthy();
    expect(screen.getByPlaceholderText('مثال: فاتورة الكهرباء')).toBeTruthy();
    showList();
    expect(screen.queryByText(DESCRIPTION)).toBeNull();
  });

  it('a blank form is ignored quietly (no message, form stays)', async () => {
    await openExpenses();
    openForm();
    fireEvent.click(screen.getByRole('button', { name: 'حفظ المصروف' }));
    expect(screen.getByPlaceholderText('مثال: فاتورة الكهرباء')).toBeTruthy();
    expect(screen.queryByText('المبلغ لازم يكون رقم أكبر من صفر')).toBeNull();
  });

  it('deleting asks first, and removes the expense only when confirmed', async () => {
    await openExpenses();
    openForm();
    fillForm(DESCRIPTION, '100');
    fireEvent.click(screen.getByRole('button', { name: 'حفظ المصروف' }));
    showList();
    await screen.findByText(DESCRIPTION);

    const row = screen.getByText(DESCRIPTION).closest('.card-vuno') as HTMLElement;
    const deleteButton = row.querySelector('button[aria-label="حذف"]') as HTMLElement;

    vi.spyOn(window, 'confirm').mockReturnValue(false);
    fireEvent.click(deleteButton);
    expect(screen.getByText(DESCRIPTION)).toBeTruthy();

    vi.spyOn(window, 'confirm').mockReturnValue(true);
    fireEvent.click(deleteButton);
    await waitFor(() => expect(screen.queryByText(DESCRIPTION)).toBeNull());
  });

  it('searching narrows the list', async () => {
    await openExpenses();
    openForm();
    fillForm(DESCRIPTION, '100');
    fireEvent.click(screen.getByRole('button', { name: 'حفظ المصروف' }));
    showList();
    await screen.findByText(DESCRIPTION);

    fireEvent.change(screen.getByPlaceholderText('ابحث في المصروفات...'), { target: { value: 'مفيش حاجة بالاسم ده' } });
    expect(await screen.findByText('لا توجد مصروفات مطابقة')).toBeTruthy();
  });
});
