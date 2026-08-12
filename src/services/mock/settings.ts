import type { StaffMember, PaymentMethodConfig } from '@/types';
import { defaultPermissions } from '@/types';

// TODO(phase-3): replace with real Firestore-backed staff/payment config.
// These are the SettingsPage staff members (subset view). Full staff data
// with permissions lives in ./staff.ts and is used by BranchesPage.
export const staffMembers: StaffMember[] = [
  { id: '1', name: 'أحمد محمد', phone: '01012345678', role: 'owner', branchId: '1', branchName: 'الفرع الرئيسي - القاهرة', status: 'active', lastActive: 'الآن', permissions: defaultPermissions.owner },
  { id: '2', name: 'محمود خالد', phone: '01098765432', role: 'manager', branchId: '1', branchName: 'الفرع الرئيسي - القاهرة', status: 'active', lastActive: 'قبل 5 دقائق', permissions: defaultPermissions.manager },
  { id: '3', name: 'فاطمة أحمد', phone: '01055667788', role: 'employee', branchId: '2', branchName: 'فرع الإسكندرية', status: 'active', lastActive: 'قبل 30 دقيقة', permissions: defaultPermissions.employee },
];

/* ── Payment methods ───────────────────────────────────────────────────
   Apple Pay replaces Bimoob (not every customer has Apple Pay, so it
   stays disabled by default — the merchant turns it on from Settings
   if it's relevant to their customers).
   No API keys or bank info are stored — these are just toggle flags. */
export const paymentMethodsList: PaymentMethodConfig[] = [
  { id: 'cash', name: 'كاش', enabled: true },
  { id: 'card', name: 'بطاقة ائتمان', enabled: true },
  { id: 'wallet', name: 'محفظة إلكترونية', enabled: true },
  { id: 'instapay', name: 'إنستاباي', enabled: true },
  { id: 'applepay', name: 'Apple Pay', enabled: false },
];
