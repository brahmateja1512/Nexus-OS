import React, { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { Sidebar } from './components/navigation/Sidebar';
import { Header } from './components/navigation/Header';
import { MobileNavBar } from './components/navigation/MobileNavBar';
import { QuickAddModal } from './components/navigation/QuickAddModal';
import { CommandPalette } from './components/command-palette/CommandPalette';
import { ToastContainer } from './components/common/ToastContainer';
import { AuthModal } from './components/auth/AuthModal';

// Module Views
import { TodayDashboard } from './components/dashboard/TodayDashboard';
import { TasksView } from './components/tasks/TasksView';
import { CalendarView } from './components/calendar/CalendarView';
import { FinanceView } from './components/finance/FinanceView';
import { HabitsView } from './components/habits/HabitsView';
import { NexusView } from './components/nexus/NexusView';
import { SettingsView } from './components/settings/SettingsView';
import { AdminPortal } from './components/admin/AdminPortal';

export function App() {
  const {
    activeTab,
    setActiveTab,
    userPreferences,
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

  return (
    <div className="flex min-h-screen bg-background text-text-main font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* 1. Left Sidebar Navigation (Desktop Persistent & Mobile Drawer) */}
      <Sidebar />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Top Header */}
        <Header />

        {/* Dynamic Main Workspace with mobile bottom nav clearance */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 pb-24 md:pb-8 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>
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
