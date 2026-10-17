// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '@/App';
import { installDomStubs } from '@/test-utils/domStubs';

/** Both login layouts now share one form; these tests pin its behaviour. */

beforeAll(installDomStubs);
afterEach(() => {
  cleanup();
  setViewportWidth(1024);
});

/** jsdom's default window is 1024px wide (desktop); the mobile layout needs < 768px. */
function setViewportWidth(width: number) {
  Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: width });
}

async function openLogin() {
  const view = render(
    <MemoryRouter initialEntries={['/login']}>
      <App />
    </MemoryRouter>,
  );
  await screen.findByText('البريد الإلكتروني', {}, { timeout: 5000 });
  return view;
}

describe('LoginPage', () => {
  it('owner mode: shows email + password, forgot-password and the sign-up toggle', async () => {
    await openLogin();
    expect(screen.getByPlaceholderText('example@email.com')).toBeTruthy();
    expect(screen.getByText('نسيت كلمة المرور؟')).toBeTruthy();
    expect(screen.getByText('ليس لديك حساب؟')).toBeTruthy();
  });

  it('switching to sign-up adds the confirm-password field and hides forgot-password', async () => {
    await openLogin();
    fireEvent.click(screen.getByRole('button', { name: 'إنشاء حساب' }));
    expect(await screen.findByText('تأكيد كلمة المرور')).toBeTruthy();
    expect(screen.queryByText('نسيت كلمة المرور؟')).toBeNull();
    expect(screen.getByText('ابدأ رحلتك مع فونو')).toBeTruthy();
  });

  it('employee mode: branch, employee code and a 4-digit PIN, no sign-up toggle', async () => {
    await openLogin();
    fireEvent.click(screen.getByRole('button', { name: /موظف/ }));
    expect(await screen.findByText('كود الموظف')).toBeTruthy();
    expect(screen.getByPlaceholderText('أدخل كود الموظف')).toBeTruthy();
    expect((screen.getByPlaceholderText('••••') as HTMLInputElement).maxLength).toBe(4);
    expect(screen.queryByText('ليس لديك حساب؟')).toBeNull();
  });

  it('submitting goes to the dashboard after the simulated sign-in', async () => {
    await openLogin();
    fireEvent.change(screen.getByPlaceholderText('example@email.com'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'secret123' } });
    fireEvent.click(screen.getByRole('button', { name: /^تسجيل الدخول$/ }));
    expect(await screen.findByText('جاري الدخول...')).toBeTruthy();
    await waitFor(() => expect(screen.queryByText('جاري الدخول...')).toBeNull(), { timeout: 3000 });
    // The dashboard is on screen now (its page content replaced the form).
    await waitFor(() => expect(screen.queryByPlaceholderText('example@email.com')).toBeNull(), { timeout: 3000 });
  });

  describe('mobile layout (same form, its own details)', () => {
    it('shows the lone forgot-password link — no "remember me" checkbox', async () => {
      setViewportWidth(375);
      await openLogin();
      expect(screen.getByText('نسيت كلمة المرور؟')).toBeTruthy();
      expect(screen.queryByText('تذكرني')).toBeNull();
    });

    it('desktop layout adds "remember me" next to forgot-password', async () => {
      setViewportWidth(1280);
      await openLogin();
      expect(screen.getByText('تذكرني')).toBeTruthy();
      expect(screen.getByText('نسيت كلمة المرور؟')).toBeTruthy();
    });

    it('employee PIN label: plain on mobile, "(4 أرقام)" on desktop', async () => {
      setViewportWidth(375);
      await openLogin();
      fireEvent.click(screen.getByRole('button', { name: /موظف/ }));
      expect(await screen.findByText('الرقم السري')).toBeTruthy();
      cleanup();

      setViewportWidth(1280);
      await openLogin();
      fireEvent.click(screen.getByRole('button', { name: /موظف/ }));
      expect(await screen.findByText('الرقم السري (4 أرقام)')).toBeTruthy();
    });
  });
});
