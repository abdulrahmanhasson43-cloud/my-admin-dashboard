import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Overview from './pages/Overview';
import Merchants from './pages/Merchants';
import Shipments from './pages/Shipments';
import Commissions from './pages/Commissions';
import Settings from './pages/Settings';
import type { Page } from './types';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('overview');

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="flex min-h-screen bg-[#1C1C1E]">
      <Sidebar
        active={currentPage}
        onNavigate={(page) => setCurrentPage(page)}
        onLogout={() => { setIsLoggedIn(false); setCurrentPage('overview'); }}
      />
      <main className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {currentPage === 'overview'     && <Overview />}
            {currentPage === 'merchants'    && <Merchants />}
            {currentPage === 'shipments'    && <Shipments />}
            {currentPage === 'commissions'  && <Commissions />}
            {currentPage === 'settings'     && <Settings />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
