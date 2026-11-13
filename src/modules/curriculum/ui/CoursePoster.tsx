import React from 'react';
import type { Course } from '../../../core/entities';
import { Poster } from '../../../shared/ui';
import { useCurriculum } from './CurriculumProvider';

/** ملصق كورس بأسماء المادة والصف من إعدادات المنهج. `caption` و`sub` يغيّران السطرين عند الحاجة. */
export const CoursePoster: React.FC<{ course: Course; caption?: string; sub?: string; rank?: number; eager?: boolean; fluid?: boolean; size?: 'md' | 'lg' }> = ({ course, caption, sub, ...rest }) => {
  const { gradeName } = useCurriculum();
  return <Poster course={course} title={caption ?? course.offering} sub={sub ?? gradeName(course.gradeId)} {...rest} />;
};
