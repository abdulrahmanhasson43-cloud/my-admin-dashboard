import React from 'react';
import type { Course } from '../../core/entities';
import { Rail } from '../../shared/ui';
import { CoursePoster } from '../../modules/curriculum/ui/CoursePoster';

export interface TopItem { course: Course; title?: string; sub?: string }

/** أفضل 10: ملصقات بنفس الحجم والرقم الأبيض داخل الملصق في الركن (أسلوب Apple TV). */
export const Top10Rail: React.FC<{ items: TopItem[]; title: string; href?: string }> = ({ items, title, href }) => (
  <Rail href={href} title={title}>
    {items.slice(0, 10).map((it, k) => <CoursePoster key={`${it.course.id}-${k}`} course={it.course} caption={it.title} sub={it.sub} rank={k + 1} eager={k < 3} />)}
  </Rail>
);
