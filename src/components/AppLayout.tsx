import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useDeviceType } from '@/hooks/useDeviceType';
import { MenuIcon, NotificationIcon, LogoutIcon, XIcon } from '@/components/icons';
import { mainNavItems, moreSections, bottomNavItems, pageTitles } from '@/constants/navigation';

export default function AppLayout() {
  const deviceType = useDeviceType();
  const isMobile = deviceType === 'mobile';
  const isDesktop = deviceType === 'desktop';
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [moreOpen, setMoreOpen] = useState(false);

  const currentPath = location.pathname;
  const isLanding = currentPath === '/';
  const isDashboard = currentPath === '/dashboard';

  if (isLanding) {
    return <Outlet />;
  }

  const isActive = (path: string) => {
    if (path === '/dashboard' && currentPath === '/dashboard') return true;
    if (path === '/pos' && currentPath === '/pos') return true;
    if (path === '/products' && currentPath === '/products') return true;
    if (path === '/invoices' && currentPath === '/invoices') return true;
    if (path === '/inventory' && currentPath === '/inventory') return true;
    return currentPath === path;
  };

  const showBottomNav = isMobile && !isLanding && !currentPath.includes('/login');
  const showSidebar = (isDesktop || deviceType === 'tablet') && !isLanding && !currentPath.includes('/login');

  const sidebarWidth = sidebarOpen ? 'w-64' : 'w-20';

  return (
    <div className="min-h-screen bg-[var(--vuno-bg)]" dir="rtl">
      {/* Desktop/Tablet Sidebar */}
      {showSidebar && (
        <aside
          className={`fixed top-0 right-0 h-full bg-white border-l border-[var(--vuno-border)] z-40 transition-all duration-300 ${sidebarWidth}`}
        >
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--vuno-border)]">
            {sidebarOpen ? (
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl gradient-header flex items-center justify-center">
                  <span className="text-white font-bold text-lg">V</span>
                </div>
                <div>
                  <h1 className="font-bold text-[var(--vuno-text)] text-lg leading-tight">Vuno</h1>
                  <p className="text-xs text-[var(--vuno-text-muted)]">لوحة التحكم</p>
                </div>
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl gradient-header flex items-center justify-center mx-auto">
                <span className="text-white font-bold text-lg">V</span>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 rounded-lg hover:bg-gray-100 text-[var(--vuno-text-muted)]"
            >
              <MenuIcon size={18} />
            </button>
          </div>

          {/* Main Nav Items */}
          <nav className="p-3 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
            {mainNavItems.map((item) => {
              const active = isActive(item.path);
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                    active
                      ? 'sidebar-item-active font-semibold'
                      : 'sidebar-item-inactive'
                  }`}
                >
                  <Icon size={20} className={active ? 'text-[var(--vuno-primary)]' : ''} />
                  {sidebarOpen && <span className="text-sm">{item.label}</span>}
                </button>
              );
            })}

            {/* Divider */}
            {sidebarOpen && <div className="my-2 border-t border-[var(--vuno-border)]" />}

            {/* More Sections */}
            {moreSections.map((item) => {
              const active = isActive(item.path);
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                    active
                      ? 'sidebar-item-active font-semibold'
                      : 'sidebar-item-inactive'
                  }`}
                >
                  <Icon size={20} className={active ? 'text-[var(--vuno-primary)]' : ''} />
                  {sidebarOpen && <span className="text-sm">{item.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* User section at bottom */}
          {sidebarOpen && (
            <div className="absolute bottom-0 right-0 left-0 p-4 border-t border-[var(--vuno-border)] bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--vuno-primary) 12%, transparent)' }}>
                  <span className="text-[var(--vuno-primary)] font-bold text-sm">أح</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--vuno-text)] truncate">أحمد محمد</p>
                  <p className="text-xs text-[var(--vuno-text-muted)]">المدير العام</p>
                </div>
                <button
                  onClick={() => navigate('/login')}
                  className="p-2 rounded-lg hover:bg-red-50 text-red-400 transition-colors"
                >
                  <LogoutIcon size={16} />
                </button>
              </div>
            </div>
          )}
        </aside>
      )}

      {/* Main Content */}
      <main
        className={`${
          showSidebar ? (sidebarOpen ? 'mr-64' : 'mr-20') : ''
        } ${showBottomNav ? 'mb-20' : ''}`}
      >
        {/* Header */}
        {!isLanding && !currentPath.includes('/login') && !isDashboard && (
          <header className="sticky top-0 z-30 bg-white border-b border-[var(--vuno-border)]">
            <div className="flex items-center justify-between px-4 lg:px-6 py-3">
              {/* Mobile Menu Toggle */}
              {isMobile && (
                <button
                  onClick={() => setMoreOpen(!moreOpen)}
                  className="p-2 rounded-xl hover:bg-gray-100"
                >
                  <MenuIcon size={20} className="text-[var(--vuno-text)]" />
                </button>
              )}

              {/* Page Title */}
              <div className="flex-1 text-center lg:text-right">
                <h2 className="text-lg font-bold text-[var(--vuno-text)]">
                  {getPageTitle(currentPath)}
                </h2>
              </div>

              {/* Notification */}
              <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <NotificationIcon size={22} className="text-[var(--vuno-text-secondary)]" />
                <span className="absolute top-1 left-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
              </button>
            </div>
          </header>
        )}

        {/* Page Content */}
        <div className="p-4 lg:p-6">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      {showBottomNav && (
        <nav
          className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--vuno-border)] z-50"
        >
            <div className="flex items-center justify-around py-2 px-4">
              {bottomNavItems.map((item) => {
                const active = item.path === '/more'
                  ? moreOpen
                  : isActive(item.path);
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      if (item.path === '/more') {
                        setMoreOpen(!moreOpen);
                      } else {
                        setMoreOpen(false);
                        navigate(item.path);
                      }
                    }}
                    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 ${
                      active && item.path !== '/more'
                        ? 'text-[var(--vuno-primary)]'
                        : 'text-[var(--vuno-text-muted)]'
                    }`}
                  >
                    <div className="p-1.5 rounded-xl transition-all" style={active && item.path !== '/more' ? { background: 'color-mix(in srgb, var(--vuno-primary) 10%, transparent)' } : undefined}>
                      <Icon size={22} />
                    </div>
                    <span className="text-[10px] font-semibold">{item.label}</span>
                  </button>
                );
              })}
            </div>
        </nav>
      )}

      {/* Mobile More Menu — bottom sheet (pure CSS transition, no animation library) */}
      {isMobile && moreOpen && (
        <>
          <div
            onClick={() => setMoreOpen(false)}
            className="fixed inset-0 bg-black/40 z-[60] animate-in fade-in duration-200"
          />
          <div
            className="fixed bottom-0 inset-x-0 z-[70] bg-white rounded-t-3xl max-h-[75vh] overflow-y-auto animate-in slide-in-from-bottom duration-200"
          >
            <div className="w-10 h-1 rounded-full bg-[var(--vuno-border)] mx-auto mt-3 mb-1" />
            <div className="flex items-center justify-between px-5 pt-2 pb-3">
              <h3 className="font-bold text-[var(--vuno-text)]">كل الصفحات</h3>
              <button onClick={() => setMoreOpen(false)} className="p-1.5 rounded-full hover:bg-gray-100">
                <XIcon size={18} className="text-[var(--vuno-text-secondary)]" />
              </button>
            </div>
            <div className="p-3 pb-8 grid grid-cols-3 gap-2">
              {[...mainNavItems, ...moreSections].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setMoreOpen(false);
                    }}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--vuno-primary) 8%, transparent)' }}>
                      <Icon size={20} className="text-[var(--vuno-primary)]" />
                    </div>
                    <span className="text-xs text-[var(--vuno-text)] text-center leading-tight">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function getPageTitle(path: string): string {
  return pageTitles[path] || 'Vuno';
}
