import type { ComponentType } from 'react';

export interface SettingsSection {
  id: string;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string; size?: number }>;
}

export interface PaymentMethodConfig {
  id: string;
  name: string;
  enabled: boolean;
}
