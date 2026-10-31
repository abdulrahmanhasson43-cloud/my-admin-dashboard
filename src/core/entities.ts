/** كيانات النطاق (Domain) — أنواع خالصة بلا أي اعتماد على React أو على مصدر البيانات. */

export type CategoryKey =
  | 'languages'
  | 'programming'
  | 'design'
  | 'business'
  | 'science'
  | 'math'
  | 'skills';

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  free?: boolean;
  completed?: boolean;
}

export interface Module {
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  tagline: string;
  description: string;
  category: CategoryKey;
  level: 'مبتدئ' | 'متوسط' | 'متقدم';
  instructor: string;
  instructorTitle: string;
  instructorAvatar: string;
  rating: number;
  reviews: number;
  students: number;
  hours: number;
  image: string;
  badge?: string;
  free?: boolean;
  isNew?: boolean;
  progress?: number;
  tags: string[];
  outcomes: string[];
  curriculum: Module[];
}
