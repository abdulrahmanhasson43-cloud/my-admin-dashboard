/**
 * STORAGE_KEYS — the single source of truth for every browser-storage key.
 *
 * Why this file exists: before it, each context/repository declared its own
 * `STORAGE_KEY` string, and the backup/restore code re-typed those strings by
 * hand. The two drifted apart (`vuno-notifications` vs `vuno_notifications`),
 * so restoring a backup silently wrote to a key nobody reads.
 *
 * The VALUES below are unchanged from what the app already used, so existing
 * users keep their saved data.
 */
export const STORAGE_KEYS = {
  notifications: 'vuno-notifications',
  activeBranch: 'vuno-active-branch-id',
  activityLog: 'vuno_activity_log',
  heldOrders: 'vuno_held_orders',
  salesGoal: 'vuno_sales_goal',
  theme: 'vuno_theme',
  shifts: 'vuno_shifts',
  onboardingDone: 'vuno_onboarding_done',
  lastAutoBackup: 'vuno_last_auto_backup',
  lastBackupAt: 'vuno_last_backup_at',
  /** The sign-in session. Written by AuthService only; deliberately NOT part of backup/restore. */
  authSession: 'vuno_auth_session',
  /** Written by backup-restore only; products are not persisted yet (see CONTEXT notes). */
  products: 'vuno_products',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
