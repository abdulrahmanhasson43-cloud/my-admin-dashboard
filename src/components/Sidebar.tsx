import { motion } from 'framer-motion';
import type { Page } from '../types';

interface SidebarProps {
  active: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

function OverviewIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? '#F5C443' : 'none'}
      stroke={active ? '#F5C443' : '#8E8E93'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="7" height="7" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
      <rect width="7" height="7" x="3" y="14" rx="1" />
    </svg>
  );
}

function MerchantsIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke={active ? '#F5C443' : '#8E8E93'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function ShipmentsIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke={active ? '#F5C443' : '#8E8E93'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21 16-9 5-9-5" /><path d="m21 8-9 5-9-5" />
      <line x1="12" x2="12" y1="13" y2="21" />
      <polyline points="3 8 12 3 21 8" />
    </svg>
  );
}

function CommissionsIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke={active ? '#F5C443' : '#8E8E93'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
      <path d="M12 18V6" />
    </svg>
  );
}

function SettingsIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke={active ? '#F5C443' : '#8E8E93'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="#FF5757" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  );
}

const navItems: { id: Page; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'merchants', label: 'التجار' },
  { id: 'shipments', label: 'الشحنات' },
  { id: 'commissions', label: 'العمولات' },
  { id: 'settings', label: 'الإعدادات' },
];

function NavIcon({ page, active }: { page: Page; active: boolean }) {
  switch (page) {
    case 'overview': return <OverviewIcon active={active} />;
    case 'merchants': return <MerchantsIcon active={active} />;
    case 'shipments': return <ShipmentsIcon active={active} />;
    case 'commissions': return <CommissionsIcon active={active} />;
    case 'settings': return <SettingsIcon active={active} />;
  }
}

export default function Sidebar({ active, onNavigate, onLogout }: SidebarProps) {
  return (
    <aside className="w-[220px] min-h-screen bg-[#111113] flex flex-col border-r border-[#2C2C2E]">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-[#2C2C2E]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#F5C443] rounded-lg flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1C1C1E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21 16-9 5-9-5" /><path d="m21 8-9 5-9-5" />
              <line x1="12" x2="12" y1="13" y2="21" />
              <polyline points="3 8 12 3 21 8" />
            </svg>
          </div>
          <div>
            <p className="text-white text-sm font-bold leading-none">Packsy</p>
            <p className="text-[#8E8E93] text-[10px] mt-0.5">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = active === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              whileTap={{ scale: 0.97 }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#F5C443]/10 text-[#F5C443]'
                  : 'text-[#8E8E93] hover:bg-[#2C2C2E] hover:text-white'
              }`}
            >
              <NavIcon page={item.id} active={isActive} />
              {item.label}
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-[#F5C443]"
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-3 pb-5 border-t border-[#2C2C2E] pt-4 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2.5">
          <div className="w-7 h-7 rounded-full bg-[#F5C443] flex items-center justify-center text-[#1C1C1E] text-xs font-bold">
            S
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">Super Admin</p>
            <p className="text-[#8E8E93] text-[10px] truncate">admin@packsy.com</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#FF5757] hover:bg-[#FF5757]/10 transition-colors"
        >
          <LogoutIcon />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  );
}
