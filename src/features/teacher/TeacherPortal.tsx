import React from 'react';
import { LayoutDashboard, Clapperboard, Users, KeyRound, Wallet } from 'lucide-react';
import { StudioShell, type NavItem } from '../../shared/studio/StudioShell';
import { go, useRoute } from '../../shared/lib/router';
import { useAuth } from '../auth/AuthProvider';
import { CodesPage } from '../../modules/codes/ui/CodesPage';
import OverviewPage from './OverviewPage';
import ContentPage from './ContentPage';
import StudentsPage from './StudentsPage';
import EarningsPage from './EarningsPage';
import { useTeacherScope } from './scope';

const FULL: NavItem[] = [
  { label: 'نظرة عامة', href: '/teacher', icon: LayoutDashboard },
  { label: 'المحتوى', href: '/teacher/content', icon: Clapperboard },
  { label: 'الطلاب', href: '/teacher/students', icon: Users },
  { label: 'الأكواد', href: '/teacher/codes', icon: KeyRound },
  { label: 'الأرباح', href: '/teacher/earnings', icon: Wallet },
];
/** المشرف (مساعد المدرّس): نظرة عامة والطلاب والأكواد فقط. */
const ASSISTANT_PATHS = new Set(['/teacher', '/teacher/students', '/teacher/codes']);

const TeacherPortal: React.FC = () => {
  const { path } = useRoute();
  const { user } = useAuth();
  const { courses, isAssistant } = useTeacherScope();
  const base = path.split('?')[0].replace(/\/$/, '') || '/teacher';

  if (!user || (user.role !== 'teacher' && user.role !== 'assistant')) {
    return (
      <div className="min-h-[70vh] grid place-items-center gutter">
        <div className="max-w-sm">
          <h1 className="text-[34px]">هذه الصفحة للمدرّسين</h1>
          <p className="text-muted mt-2">سجّل دخولك بحساب مدرّس أو مشرف.</p>
          <div className="btn-pair mt-6"><button onClick={() => go('/login')} className="btn btn-primary">تسجيل الدخول</button><button onClick={() => go('/')} className="btn btn-ghost">الرئيسية</button></div>
        </div>
      </div>
    );
  }
  const nav = isAssistant ? FULL.filter((n) => ASSISTANT_PATHS.has(n.href)) : FULL;
  const allowed = !isAssistant || ASSISTANT_PATHS.has(base);

  let page: React.ReactNode = <OverviewPage />;
  if (!allowed) page = <p className="text-muted pt-6">ليست لديك صلاحية لهذه الصفحة.</p>;
  else if (base === '/teacher/content') page = <ContentPage />;
  else if (base === '/teacher/students') page = <StudentsPage />;
  else if (base === '/teacher/codes') page = <CodesPage courses={courses} createdBy={user.email} />;
  else if (base === '/teacher/earnings') page = <EarningsPage />;

  return <StudioShell portal={isAssistant ? 'لوحة المشرف' : 'لوحة المدرّس'} root="/teacher" nav={nav}>{page}</StudioShell>;
};

export default TeacherPortal;
