import { useMemo } from 'react';
import { COURSES } from '../../data/catalog';
import { useAuth } from '../auth/AuthProvider';

/** نطاق بيانات المدرّس. المنصة بمدرّس واحد، فكل الكورسات له، والمشرف يرى بيانات المدرّس الذي يساعده. */
export const useTeacherScope = () => {
  const { user } = useAuth();
  const isAssistant = user?.role === 'assistant';
  const teacherName = (isAssistant ? user?.teacherName : user?.name) ?? '';
  const courses = useMemo(() => COURSES, []);
  return { user, teacherName, courses, isAssistant };
};
