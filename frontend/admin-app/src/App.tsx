import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminProvider } from './context/AdminContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Toast from './components/Toast';
import ScaleModal from './components/modals/ScaleModal';
import OnboardModal from './components/modals/OnboardModal';
import RegisterOrgModal from './components/modals/RegisterOrgModal';

import OverviewView from './views/OverviewView';
import SessionsView from './views/SessionsView';
import LeavesView from './views/LeavesView';
import TimesheetsView from './views/TimesheetsView';
import PayrollView from './views/PayrollView';
import PerformanceView from './views/PerformanceView';
import AuditView from './views/AuditView';
import SettingsView from './views/SettingsView';

export default function App() {
  return (
    <BrowserRouter>
      <AdminProvider>
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row antialiased font-sans">
          {/* Floating Toast Notification */}
          <Toast />

          {/* Dynamic Sidebar Navigation */}
          <Sidebar />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0">
            <Header />

            <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto">
              <Routes>
                <Route path="/" element={<OverviewView />} />
                <Route path="/sessions" element={<SessionsView />} />
                <Route path="/leaves" element={<LeavesView />} />
                <Route path="/timesheets" element={<TimesheetsView />} />
                <Route path="/payroll" element={<PayrollView />} />
                <Route path="/performance" element={<PerformanceView />} />
                <Route path="/audit" element={<AuditView />} />
                <Route path="/settings" element={<SettingsView />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>

          {/* Modals Container */}
          <ScaleModal />
          <OnboardModal />
          <RegisterOrgModal />
        </div>
      </AdminProvider>
    </BrowserRouter>
  );
}
