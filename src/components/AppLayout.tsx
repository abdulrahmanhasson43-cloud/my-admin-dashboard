import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useDeviceType } from '@/hooks/useDeviceType';
import { MenuIcon, LogoutIcon, XIcon, QuickSellIcon, CommandIcon, MoonIcon, SunIcon, BranchesIcon, ChevronDownIcon, PlusIcon } from '@/components/icons';
import { mainNavItems, moreSections, bottomNavItems, pageTitles } from '@/constants/navigation';
import NotificationCenter from '@/components/NotificationCenter';
import { useCommandPalette } from '@/hooks/useCommandPalette';
import { useTheme } from '@/context/theme-context-value';
import { useBranch } from '@/context/branch-context-value';
import { useShift } from '@/context/shift-context-value';
import { useLowStockAlert } from '@/hooks/useLowStockAlert';
import { toast } from 'sonner';

export default function AppLayout() {
  const deviceType = useDeviceType();
  const isMobile = deviceType === 'mobile';
  const isDesktop = deviceType === 'desktop';
  const location = useLocation();
  const navigate = useNavigate();
  const { togglePalette } = useCommandPalette();
  const { theme, toggleTheme } = useTheme();
  const { branches, activeBranch, setActiveBranchId } = useBranch();
  const { currentShift } = useShift();
  const { lowStockCount } = useLowStockAlert();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [moreOpen, setMoreOpen] = useState(false);
  const [branchMenuOpen, setBranchMenuOpen] = useState(false);

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
              const isInventory = item.path === '/inventory';
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
                  <span className="relative">
                    <Icon size={20} className={active ? 'text-[var(--vuno-primary)]' : ''} />
                    {isInventory && lowStockCount > 0 && (
                      <span
                        className="absolute -top-1.5 -left-1.5 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold text-white flex items-center justify-center animate-pulse"
                        style={{ background: 'var(--vuno-danger)' }}
                      >
                        {lowStockCount}
                      </span>
                    )}
                  </span>
                  {sidebarOpen && (
                    <span className="text-sm flex-1 text-right">{item.label}</span>
                  )}
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
                  onClick={toggleTheme}
                  className="p-2 rounded-lg hover:bg-gray-100 text-[var(--vuno-text-muted)] transition-colors"
                  aria-label="تبديل الوضع الليلي"
                  title={theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}
                >
                  {theme === 'dark' ? <SunIcon size={16} /> : <MoonIcon size={16} />}
                </button>
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
            <div className="flex items-center justify-between px-4 sm:px-5 lg:px-6 xl:px-8 py-3 max-w-[1600px] mx-auto">
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

              {/* Branch Switcher */}
              {activeBranch && (
                <div className="relative flex-shrink-0 hidden sm:block">
                  <button
                    onClick={() => setBranchMenuOpen(!branchMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--vuno-border)] hover:bg-gray-50 transition-colors"
                  >
                    <BranchesIcon size={16} className="text-[var(--vuno-primary)]" />
                    <span className="text-sm font-medium text-[var(--vuno-text)] max-w-[120px] truncate">{activeBranch.name}</span>
                    <ChevronDownIcon size={14} className={`text-[var(--vuno-text-muted)] transition-transform ${branchMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {branchMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setBranchMenuOpen(false)} />
                      <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-[var(--vuno-border)] z-40 overflow-hidden">
                        <p className="px-3 py-2 text-xs font-semibold text-[var(--vuno-text-muted)] border-b border-[var(--vuno-border-light)]">تبديل الفرع</p>
                        {branches.map(branch => (
                          <button
                            key={branch.id}
                            onClick={() => {
                              setActiveBranchId(branch.id);
                              setBranchMenuOpen(false);
                              toast.success(`تم التبديل إلى ${branch.name}`);
                            }}
                            className={`w-full flex items-center gap-2 px-3 py-2.5 text-right hover:bg-gray-50 transition-colors ${
                              branch.id === activeBranch.id ? 'bg-[var(--vuno-surface-pearl)]' : ''
                            }`}
                          >
                            <BranchesIcon size={14} className={branch.id === activeBranch.id ? 'text-[var(--vuno-primary)]' : 'text-[var(--vuno-text-muted)]'} />
                            <span className="flex-1 text-sm font-medium text-[var(--vuno-text)] truncate">{branch.name}</span>
                            {branch.id === activeBranch.id && (
                              <span className="w-2 h-2 rounded-full bg-[var(--vuno-success)] flex-shrink-0" />
                            )}
                          </button>
                        ))}
                        {/* Add new branch option — الفكرة #18 */}
                        <button
                          onClick={() => {
                            navigate('/branches');
                            setBranchMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-right hover:bg-gray-50 transition-colors border-t border-[var(--vuno-border-light)]"
                        >
                          <PlusIcon size={14} className="text-[var(--vuno-primary)]" />
                          <span className="flex-1 text-sm font-medium text-[var(--vuno-primary)]">إضافة فرع جديد</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Shift Status Badge — الفكرة #14 */}
              <button
                onClick={() => navigate('/shifts')}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-colors"
                style={{
                  background: currentShift ? 'color-mix(in srgb, var(--vuno-success) 8%, transparent)' : 'var(--vuno-surface)',
                  borderColor: currentShift ? 'color-mix(in srgb, var(--vuno-success) 25%, transparent)' : 'var(--vuno-border)',
                }}
                title={currentShift ? `وردية مفتوحة: ${currentShift.cashierName}` : 'لا توجد وردية مفتوحة'}
              >
                <span
                  className={`w-2 h-2 rounded-full ${currentShift ? 'animate-pulse' : ''}`}
                  style={{ background: currentShift ? 'var(--vuno-success)' : 'var(--vuno-text-muted)' }}
                />
                <span
                  className="text-[11px] font-semibold"
                  style={{ color: currentShift ? 'var(--vuno-success)' : 'var(--vuno-text-muted)' }}
                >
                  {currentShift ? 'وردية مفتوحة' : 'لا وردية'}
                </span>
              </button>

              {/* Command Palette Trigger + Theme Toggle + Notification Center */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={togglePalette}
                  className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                  aria-label="لوحة الأوامر (Ctrl+K)"
                  title="لوحة الأوامر (Ctrl+K)"
                >
                  <CommandIcon size={20} className="text-[var(--vuno-text-secondary)]" />
                </button>
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                  aria-label="تبديل الوضع الليلي"
                  title={theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}
                >
                  {theme === 'dark'
                    ? <SunIcon size={20} className="text-[var(--vuno-text-secondary)]" />
                    : <MoonIcon size={20} className="text-[var(--vuno-text-secondary)]" />}
                </button>
                <NotificationCenter />
              </div>
            </div>
          </header>
        )}

        {/* Page Content
            Dashboard يتحكم في هوامشه الداخلية بنفسه (full-bleed على
            الموبايل)، لذا لا نضع padding هنا على صفحة Dashboard. باقي
            الصفحات تحتفظ بالهوامش المعتادة p-4 lg:p-6. */}
        <div className={isDashboard ? '' : 'p-4 lg:p-6'}>
          {/* Center content on very large desktop screens so proportions stay
              close to mobile/tablet rather than stretching edge-to-edge. */}
          <div className="max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation — narrower, inset floating bar (iPhone
          tab-bar style) instead of a full-bleed edge-to-edge strip, with a
          standalone floating quick-sell button beside it. */}
      {showBottomNav && (
        <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none pb-2 px-4">
          <div className="max-w-sm mx-auto flex items-center justify-center gap-2">
            <button
              onClick={() => navigate('/pos')}
              className="pointer-events-auto flex flex-col items-center justify-center gap-0.5 w-16 h-16 rounded-full bg-[var(--vuno-text)] text-white shadow-[0_8px_24px_rgba(0,0,0,0.25)] flex-shrink-0"
            >
              <QuickSellIcon size={20} />
              <span className="text-[8px] font-semibold leading-none">البيع السريع</span>
            </button>

            <nav className="flex-1 bg-white border border-[var(--vuno-border)] rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.12)] pointer-events-auto">
            <div className="flex items-center justify-around py-2 px-2">
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
                    className={`flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-2xl transition-all duration-200 ${
                      active && item.path !== '/more'
                        ? 'text-[var(--vuno-text)]'
                        : 'text-[var(--vuno-text-muted)]'
                    }`}
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                      style={active && item.path !== '/more' ? { background: 'var(--vuno-text)' } : undefined}
                    >
                      <Icon size={18} className={active && item.path !== '/more' ? 'text-white' : undefined} />
                    </div>
                    <span className="text-[9px] font-semibold">{item.label}</span>
                  </button>
                );
              })}
            </div>
            </nav>
          </div>
        </div>
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
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-[var(--vuno-bg)] transition-colors"
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

      {/* AI assistant is reached via its own icon in the dashboard's top
          action row now (next to "العملاء"), not a floating support-chat
          bubble — see DashboardAction 'heroActions'. */}
    </div>
  );
}

function getPageTitle(path: string): string {
  return pageTitles[path] || 'Vuno';
}
