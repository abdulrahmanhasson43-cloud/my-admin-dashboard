import { describe, expect, it } from 'vitest';
import type { PaymentMethodConfig, StaffMember } from '@/types';
import { SettingsService } from './SettingsService';
import { MockSettingsRepository } from './MockSettingsRepository';

const methods: PaymentMethodConfig[] = [
  { id: 'cash', name: 'كاش', enabled: true },
  { id: 'card', name: 'بطاقة', enabled: true },
];

const service = () => new SettingsService(new MockSettingsRepository(methods, [{ id: 's1' } as StaffMember]));

describe('SettingsService', () => {
  it('turns one payment method off and leaves the others alone', async () => {
    const svc = service();
    expect((await svc.setPaymentMethodEnabled('card', false)).enabled).toBe(false);
    const all = await svc.getPaymentMethods();
    expect(all.find(m => m.id === 'card')?.enabled).toBe(false);
    expect(all.find(m => m.id === 'cash')?.enabled).toBe(true);
  });

  it('turning it back on works', async () => {
    const svc = service();
    await svc.setPaymentMethodEnabled('card', false);
    expect((await svc.setPaymentMethodEnabled('card', true)).enabled).toBe(true);
  });

  it('rejects an unknown payment method', async () => {
    await expect(service().setPaymentMethodEnabled('nope', true)).rejects.toThrow(/unknown payment method/);
  });

  it('lists the staff members', async () => {
    expect(await service().getStaffMembers()).toHaveLength(1);
  });
});
