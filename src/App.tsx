import React, { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { Sidebar } from './components/navigation/Sidebar';
import { Header } from './components/navigation/Header';
import { MobileNavBar } from './components/navigation/MobileNavBar';
import { QuickAddModal } from './components/navigation/QuickAddModal';
import { CommandPalette } from './components/command-palette/CommandPalette';
import { ToastContainer } from './components/common/ToastContainer';
import { AuthModal } from './components/auth/AuthModal';
import { AnnouncementBanner } from './components/common/AnnouncementBanner';

// Module Views
import { TodayDashboard } from './components/dashboard/TodayDashboard';
import { TasksView } from './components/tasks/TasksView';
import { CalendarView } from './components/calendar/CalendarView';
import { FinanceView } from './components/finance/FinanceView';
import { HabitsView } from './components/habits/HabitsView';
import { NexusView } from './components/nexus/NexusView';
import { SettingsView } from './components/settings/SettingsView';
import { AdminPortal } from './components/admin/AdminPortal';
import { Construction } from 'lucide-react';

export function App() {
  const {
    activeTab,
    setActiveTab,
    userPreferences,
    adminSystemConfig,
    isAdminAuthenticated,
    checkExistingSession
  } = useAppStore();

  // Initialize theme and density attributes on root element
  useEffect(() => {
    const theme = userPreferences.theme || 'dark';
    const density = userPreferences.density || 'comfortable';
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-density', density);
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, [userPreferences.theme, userPreferences.density]);

  // Check Supabase session on startup
  useEffect(() => {
    checkExistingSession();
  }, [checkExistingSession]);

  // Listen for #admin URL hash or navigation
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setActiveTab('admin');
      }
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [setActiveTab]);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'today':
        return <TodayDashboard />;
      case 'tasks':
        return <TasksView />;
      case 'calendar':
        return <CalendarView />;
      case 'finance':
        return <FinanceView />;
      case 'habits':
        return <HabitsView />;
      case 'nexus':
        return <NexusView />;
      case 'settings':
        return <SettingsView />;
      case 'admin':
        return <AdminPortal />;
      default:
        return <TodayDashboard />;
    }
  };

  // Maintenance mode blocks all users except authenticated admin
  const isMaintenanceBlocked = adminSystemConfig.maintenanceMode && !isAdminAuthenticated;

  return (
    <div className="flex min-h-screen bg-background text-text-main font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* 1. Left Sidebar Navigation (Desktop Persistent & Mobile Drawer) */}
      <Sidebar />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Global Announcement Banner (admin-controlled, dismissible) */}
        <AnnouncementBanner />

        {/* Top Header */}
        <Header />

        {/* Maintenance Mode Overlay */}
        {isMaintenanceBlocked ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-5 shadow-lg">
              <Construction className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold font-display text-text-main mb-2">
              Scheduled Maintenance
            </h2>
            <p className="text-sm text-text-muted text-center max-w-sm leading-relaxed">
              NexusOS is undergoing a planned maintenance window. Our systems will be back online shortly.
            </p>
            {adminSystemConfig.systemAnnouncement && (
              <p className="mt-4 text-xs text-text-subtle text-center max-w-sm px-4 py-2.5 rounded-xl bg-surface-subtle border border-border">
                {adminSystemConfig.systemAnnouncement}
              </p>
            )}
          </div>
        ) : (
          /* Dynamic Main Workspace with mobile bottom nav clearance */
          <main className="flex-1 p-3.5 sm:p-6 lg:p-8 pb-24 md:pb-8 max-w-7xl w-full mx-auto">
            {renderActiveView()}
          </main>
        )}
      </div>

      {/* 3. Mobile Glassmorphic Bottom Navigation Dock */}
      <MobileNavBar />

      {/* 4. Global Overlays & Modals */}
      <CommandPalette />
      <QuickAddModal />
      <AuthModal />
      <ToastContainer />
    </div>
  );
}

export default App;
