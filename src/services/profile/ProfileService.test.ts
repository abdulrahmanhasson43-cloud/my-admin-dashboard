import { describe, expect, it } from 'vitest';
import type { StoreBranding, SubscriptionInfo, UserProfile } from '@/types';
import { ProfileService } from './ProfileService';
import { MockProfileRepository } from './MockProfileRepository';

const profile = { name: 'M', email: 'm@x.com' } as unknown as UserProfile;
const branding = { storeName: 'فونو', primaryColor: '#000' } as unknown as StoreBranding;
const subscription = { plan: 'pro', usage: [{ label: 'x', used: 1, limit: 10 }] } as unknown as SubscriptionInfo;

const service = () => new ProfileService(new MockProfileRepository(profile, branding, subscription));

describe('ProfileService', () => {
  it('updateProfile merges the changes and keeps the other fields', async () => {
    const svc = service();
    const updated = await svc.updateProfile({ name: 'محمد' } as Partial<UserProfile>);
    expect(updated).toMatchObject({ name: 'محمد', email: 'm@x.com' });
    expect(await svc.getProfile()).toMatchObject({ name: 'محمد', email: 'm@x.com' });
  });

  it('updateBranding merges the changes and keeps the other fields', async () => {
    const svc = service();
    await svc.updateBranding({ primaryColor: '#fff' } as Partial<StoreBranding>);
    expect(await svc.getBranding()).toMatchObject({ storeName: 'فونو', primaryColor: '#fff' });
  });

  it('returns the subscription', async () => {
    expect(await service().getSubscription()).toMatchObject({ plan: 'pro' });
  });

  it('updates never reach back into the seed objects', async () => {
    const svc = service();
    await svc.updateProfile({ name: 'تغيّر' } as Partial<UserProfile>);
    expect(profile.name).toBe('M');
  });
});
