import type { ComponentType } from 'react';

/** The ten sections of the settings screen. */
export type SettingsSectionId =
  | 'store'
  | 'invoice'
  | 'receipt'
  | 'staff'
  | 'payments'
  | 'branches-inventory'
  | 'shifts'
  | 'daily-summary'
  | 'appearance'
  | 'data-backup';

export interface SettingsSection {
  id: SettingsSectionId;
  /** The short name on the settings menu. */
  title: string;
  /** The heading shown once the section is open (it can be longer than the menu name). */
  heading: string;
  description: string;
  icon: ComponentType<{ className?: string; size?: number }>;
}

export interface PaymentMethodConfig {
  id: string;
  name: string;
  enabled: boolean;
}
