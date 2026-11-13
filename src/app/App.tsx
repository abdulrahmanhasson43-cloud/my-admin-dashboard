import React, { useEffect } from 'react';
import { AuthProvider, useAuth, portalOf } from '../features/auth/AuthProvider';
import { SiteProvider } from '../modules/site/ui/SiteProvider';
import { CurriculumProvider } from '../modules/curriculum/ui/CurriculumProvider';
import GradePage from '../features/auth/GradePage';
import SupportPortal from '../features/support/SupportPortal';
import StudentRequestPage from '../modules/support/ui/StudentRequestPage';
import EnrollPage from '../features/enrollment/EnrollPage';
import { WalletProvider } from '../modules/wallet/ui/WalletProvider';
import WalletPage from '../modules/wallet/ui/WalletPage';
import { useRoute, go } from '../shared/lib/router';
import { TopBar } from '../shared/layout/TopBar';
import { BottomTabs } from '../shared/layout/BottomTabs';
import { Footer } from '../shared/layout/Footer';
import HomePage from '../features/home/HomePage';
import LoginPage from '../features/auth/LoginPage';
import CoursesPage from '../features/catalog/CoursesPage';
import CourseDetailPage from '../features/catalog/CourseDetailPage';
import PlayerPage from '../features/learning/PlayerPage';
import MyLearningPage from '../features/learning/MyLearningPage';
import TeacherPortal from '../features/teacher/TeacherPortal';
import OwnerPortal from '../features/owner/OwnerPortal';
import RedeemPage from '../modules/codes/ui/RedeemPage';
import InfoPage from '../modules/site/ui/InfoPage';

const NotFound: React.FC = () => (
  <div className="min-h-[70vh] grid place-items-center gutter pt-24">
    <div className="max-w-sm">
      <h1 className="text-[44px]">الصفحة غير موجودة</h1>
      <p className="text-muted mt-3">الرابط غير صحيح أو أن الصفحة نُقلت. ارجع للرئيسية أو تصفّح الدورات.</p>
      <div className="btn-pair mt-6">
        <button onClick={() => go('/')} className="btn btn-primary">الرئيسية</button>
        <button onClick={() => go('/courses')} className="btn btn-ghost">الدورات</button>
      </div>
    </div>
  </div>
);

/** المسار القديم /admin يوجّه كل دور إلى بوابته. */
const AdminRedirect: React.FC = () => {
  const { user } = useAuth();
  useEffect(() => { go(user ? portalOf(user.role) : '/login'); }, [user]);
  return null;
};

/** يحدّد الصفحة المناسبة للمسار. الصفحات «العارية» (لوحة التحكم، المشغّل، الدخول) بلا شريط عام. */
const Shell: React.FC = () => {
  const { path } = useRoute();
  const { user } = useAuth();
  const base = path.split('#')[0] || '/';
  const bare = base.startsWith('/admin') || base.startsWith('/owner') || base.startsWith('/support') && base !== '/support-request' || base.startsWith('/teacher') || base.startsWith('/learn/') || base === '/login' || base === '/signup';

  useEffect(() => {
    const anchor = path.match(/^\/?#(.+)$/)?.[1];
    if (!anchor) return;
    const t = setTimeout(() => document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
    return () => clearTimeout(t);
  }, [path]);

  let page: React.ReactNode;
  if (base === '/' || base === '') page = <HomePage />;
  else if (base === '/courses') page = <CoursesPage />;
  else if (base.startsWith('/course/')) page = <CourseDetailPage />;
  else if (base.startsWith('/learn/')) page = <PlayerPage />;
  else if (base === '/my-learning') page = <MyLearningPage />;
  else if (base === '/login' || base === '/signup') page = <LoginPage />;
  else if (base === '/grade') page = <GradePage />;
  else if (base === '/support-request') page = <StudentRequestPage />;
  else if (base === '/support') page = <SupportPortal />;
  else if (base === '/wallet') page = <WalletPage />;
  else if (base === '/subscribe') page = <EnrollPage />;
  else if (base === '/redeem') page = <RedeemPage />;
  else if (base.startsWith('/page/')) page = <InfoPage />;
  else if (base.startsWith('/owner')) page = <OwnerPortal />;
  else if (base.startsWith('/teacher')) page = <TeacherPortal />;
  else if (base.startsWith('/admin')) page = <AdminRedirect />;
  else page = <NotFound />;

  return (
    <div className="min-h-screen bg-ink">
      {!bare && <TopBar />}
      <main id="main">{page}</main>
      {!bare && <Footer />}
      {!bare && <BottomTabs />}
    </div>
  );
};

const App: React.FC = () => (
  <SiteProvider>
  <CurriculumProvider>
    <AuthProvider>
      <WalletProvider>
        <Shell />
      </WalletProvider>
    </AuthProvider>
  </CurriculumProvider>
  </SiteProvider>
);

export default App;
