import React from 'react';
import { LayoutDashboard, GraduationCap, Library, BarChart3, SlidersHorizontal, Users, Headset, CreditCard } from 'lucide-react';
import { StudioShell, PageHeader, type NavItem } from '../../shared/studio/StudioShell';
import { go, useRoute } from '../../shared/lib/router';
import { useAuth } from '../auth/AuthProvider';
import OwnerSitePage from '../../modules/site/ui/OwnerSitePage';
import OwnerPaymentsPage from '../../modules/wallet/ui/OwnerPaymentsPage';
import OwnerCurriculumPage from '../../modules/curriculum/ui/OwnerCurriculumPage';
import OverviewPage from './OverviewPage';
import TeachersPage from './TeachersPage';
import FinancePage from './FinancePage';
import TeamPage from './TeamPage';
import { SupportInbox } from '../../modules/support/ui/SupportInbox';
import { OWNER_EMAIL } from '../../shared/lib/config';

const NAV: NavItem[] = [
  { label: 'التحكم في المنصة', href: '/owner', icon: SlidersHorizontal },
  { label: 'الدفع والشحن', href: '/owner/payments', icon: CreditCard },
  { label: 'المنهج والمسميات', href: '/owner/curriculum', icon: Library },
  { label: 'الفريق', href: '/owner/team', icon: Users },
  { label: 'المدرّسون', href: '/owner/teachers', icon: GraduationCap },
  { label: 'طلبات الدعم', href: '/owner/support', icon: Headset },
  { label: 'نظرة عامة', href: '/owner/overview', icon: LayoutDashboard },
  { label: 'المالية', href: '/owner/finance', icon: BarChart3 },
];

const OwnerPortal: React.FC = () => {
  const { path } = useRoute();
  const { user } = useAuth();
  const base = path.split('?')[0].replace(/\/$/, '') || '/owner';

  if (user?.role !== 'admin' || user.email !== OWNER_EMAIL) {
    return (
      <div className="min-h-[70vh] grid place-items-center gutter">
        <div className="max-w-sm">
          <h1 className="text-[34px]">هذه الصفحة للسوبر أدمن فقط</h1>
          <p className="text-muted mt-2">سجّل دخولك بحساب الإدارة للوصول إليها.</p>
          <div className="btn-pair mt-6"><button onClick={() => go('/login')} className="btn btn-primary">تسجيل الدخول</button><button onClick={() => go('/')} className="btn btn-ghost">الرئيسية</button></div>
        </div>
      </div>
    );
  }
  let page: React.ReactNode = <OwnerSitePage />;
  if (base === '/owner/overview') page = <OverviewPage />;
  else if (base === '/owner/payments') page = <OwnerPaymentsPage />;
  else if (base === '/owner/teachers') page = <TeachersPage />;
  else if (base === '/owner/curriculum') page = <OwnerCurriculumPage />;
  else if (base === '/owner/finance') page = <FinancePage />;
  else if (base === '/owner/team') page = <TeamPage />;
  else if (base === '/owner/support') page = <><PageHeader title="طلبات الدعم" sub="طلبات الطلاب لتغيير السنة أو الترم." /><SupportInbox /></>;
  return <StudioShell portal="لوحة السوبر أدمن" root="/owner" nav={NAV}>{page}</StudioShell>;
};

export default OwnerPortal;
