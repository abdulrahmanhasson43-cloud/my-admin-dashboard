// @vitest-environment jsdom
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '@/App';
import { installDomStubs, signInForTests } from '@/test-utils/domStubs';

/** Branches + staff screen end to end, through the real providers and services. */

beforeAll(installDomStubs);
beforeEach(() => {
  window.localStorage.clear();
  window.localStorage.setItem('vuno_onboarding_done', 'true');
  signInForTests();
});
afterEach(() => cleanup());

async function openBranches() {
  const view = render(
    <MemoryRouter initialEntries={['/branches']}>
      <App />
    </MemoryRouter>,
  );
  await waitFor(() => expect(view.container.querySelector('.animate-spin')).toBeNull(), { timeout: 5000 });
  await screen.findByText('فرع الإسكندرية', {}, { timeout: 5000 });
  return view;
}

function showStaffTab() {
  fireEvent.click(screen.getByRole('button', { name: /الموظفين والصلاحيات/ }));
}

describe('Branches tab', () => {
  it('lists the branches and marks one as active', async () => {
    await openBranches();
    expect(screen.getByText('فرع الجيزة')).toBeTruthy();
    expect(screen.getByText('الفرع النشط حالياً')).toBeTruthy();
  });

  it('search narrows the branches', async () => {
    await openBranches();
    fireEvent.change(screen.getByPlaceholderText('ابحث باسم الفرع...'), { target: { value: 'الجيزة' } });
    await waitFor(() => expect(screen.queryByText('فرع الإسكندرية')).toBeNull());
    expect(screen.getByText('فرع الجيزة')).toBeTruthy();
  });

  it('adds a branch: the form opens, the branch appears, the form closes', async () => {
    await openBranches();
    fireEvent.click(screen.getByRole('button', { name: /فرع جديد/ }));
    fireEvent.change(await screen.findByPlaceholderText('اسم الفرع'), { target: { value: 'فرع أسوان' } });
    fireEvent.change(screen.getByPlaceholderText('العنوان'), { target: { value: 'شارع النيل' } });
    fireEvent.click(screen.getByRole('button', { name: 'حفظ' }));

    expect(await screen.findByText('فرع أسوان')).toBeTruthy();
    await waitFor(() => expect(screen.queryByPlaceholderText('اسم الفرع')).toBeNull());
  });

  it('a blank branch name is ignored and the form stays open', async () => {
    await openBranches();
    fireEvent.click(screen.getByRole('button', { name: /فرع جديد/ }));
    await screen.findByPlaceholderText('اسم الفرع');
    fireEvent.click(screen.getByRole('button', { name: 'حفظ' }));
    expect(screen.getByPlaceholderText('اسم الفرع')).toBeTruthy();
  });

  it('edits a branch name', async () => {
    await openBranches();
    fireEvent.click(screen.getByRole('button', { name: 'تعديل فرع الجيزة' }));
    const name = (await screen.findByPlaceholderText('اسم الفرع')) as HTMLInputElement;
    expect(name.value).toBe('فرع الجيزة');
    fireEvent.change(name, { target: { value: 'فرع الجيزة الجديد' } });
    fireEvent.click(screen.getByRole('button', { name: 'حفظ التعديلات' }));
    expect(await screen.findByText('فرع الجيزة الجديد')).toBeTruthy();
  });

  it('makes another branch the active one', async () => {
    await openBranches();
    const card = screen.getByText('فرع الإسكندرية').closest('.card-vuno') as HTMLElement;
    fireEvent.click(within(card).getByRole('button', { name: /تعيين كفرع نشط/ }));
    await waitFor(() => expect(within(card).getByText('الفرع النشط')).toBeTruthy());
  });

  it('deletes a branch', async () => {
    await openBranches();
    fireEvent.click(screen.getByRole('button', { name: 'حذف فرع الجيزة' }));
    await waitFor(() => expect(screen.queryByText('فرع الجيزة')).toBeNull());
  });
});

describe('Staff tab', () => {
  it('shows the roles legend and the staff list', async () => {
    await openBranches();
    showStaffTab();
    expect(await screen.findByText('الأدوار والصلاحيات')).toBeTruthy();
    expect(screen.getByText('محمود خالد')).toBeTruthy();
  });

  it('expands a member to show their permissions, then hides them', async () => {
    await openBranches();
    showStaffTab();
    const row = (await screen.findByText('محمود خالد')).closest('.card-vuno') as HTMLElement;
    fireEvent.click(within(row).getByRole('button', { name: 'الصلاحيات' }));
    expect(await within(row).findByText(/^صلاحيات محمود خالد/)).toBeTruthy();
    fireEvent.click(within(row).getByRole('button', { name: 'إخفاء' }));
    await waitFor(() => expect(within(row).queryByText(/^صلاحيات محمود خالد/)).toBeNull());
  });

  it('adds a staff member with the chosen role', async () => {
    await openBranches();
    showStaffTab();
    fireEvent.click(await screen.findByRole('button', { name: /موظف جديد/ }));
    fireEvent.change(await screen.findByPlaceholderText('اسم الموظف'), { target: { value: 'ليلى سمير' } });
    fireEvent.click(screen.getByRole('button', { name: 'إضافة الموظف' }));
    expect(await screen.findByText('ليلى سمير')).toBeTruthy();
    await waitFor(() => expect(screen.queryByPlaceholderText('اسم الموظف')).toBeNull());
  });

  it('a blank staff name is ignored and the dialog stays open', async () => {
    await openBranches();
    showStaffTab();
    fireEvent.click(await screen.findByRole('button', { name: /موظف جديد/ }));
    await screen.findByPlaceholderText('اسم الموظف');
    fireEvent.click(screen.getByRole('button', { name: 'إضافة الموظف' }));
    expect(screen.getByPlaceholderText('اسم الموظف')).toBeTruthy();
  });

  it('permission grid: a click toggles a cell, and changing the role resets the grid to that role', async () => {
    await openBranches();
    showStaffTab();
    fireEvent.click(await screen.findByRole('button', { name: /موظف جديد/ }));
    const dialog = (await screen.findByPlaceholderText('اسم الموظف')).closest('.max-h-\\[90vh\\]') as HTMLElement;

    // A ticked cell is the one with an inline background colour (the role colour).
    const ticked = () => Array.from(dialog.querySelectorAll('button.w-12')).filter(b => (b as HTMLElement).style.background).length;

    const employeeTicks = ticked();
    expect(employeeTicks).toBeGreaterThan(0);

    // Tick an extra cell (the first one that is off).
    const off = Array.from(dialog.querySelectorAll('button.w-12')).find(b => !(b as HTMLElement).style.background) as HTMLElement;
    fireEvent.click(off);
    expect(ticked()).toBe(employeeTicks + 1);

    // Switching to the owner role replaces the grid with the owner defaults.
    fireEvent.click(within(dialog).getByRole('button', { name: /المالك/ }));
    expect(ticked()).toBeGreaterThan(employeeTicks + 1);
  });

  it('deletes a staff member', async () => {
    await openBranches();
    showStaffTab();
    const row = (await screen.findByText('محمود خالد')).closest('.card-vuno') as HTMLElement;
    const buttons = within(row).getAllByRole('button');
    fireEvent.click(buttons[buttons.length - 1]); // the trash button is last
    await waitFor(() => expect(screen.queryByText('محمود خالد')).toBeNull());
  });
});
