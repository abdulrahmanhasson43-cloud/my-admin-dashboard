import type { Category } from '@/types';

// TODO(phase-3): replace with a real Firestore-backed categories service.
export const sampleCategories: Category[] = [
  { id: '1', name: 'إلكترونيات', productCount: 45, color: '#e05e38' },
  { id: '2', name: 'إكسسوارات', productCount: 78, color: '#3B82F6' },
  { id: '3', name: 'كمبيوتر', productCount: 32, color: '#10B981' },
  { id: '4', name: 'شاشات', productCount: 15, color: '#8B5CF6' },
  { id: '5', name: 'شبكات', productCount: 23, color: '#F59E0B' },
  { id: '6', name: 'مستلزمات مكتبية', productCount: 56, color: '#EC4899' },
];

// Palette used when a user creates a new category in the UI.
export const categoryColorPalette = ['#e05e38', '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4'];
