import React from 'react';
import { useLocation } from 'react-router-dom';
import { Building, Plus, Sliders } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { SCALE_PRESETS } from '../types';

export default function Header() {
  const location = useLocation();
  const { orgScale, setShowScaleModal, setShowRegisterOrgModal, setShowOnboardModal } = useAdmin();

  const getPageTitle = (pathname: string) => {
    switch (pathname) {
      case '/':
        return 'Organization Overview';
      case '/sessions':
        return 'Live Work Sessions & Presence';
      case '/leaves':
        return 'Leaves & Time-Off Management';
      case '/timesheets':
        return 'Manager Timesheet Approval Gate';
      case '/payroll':
        return 'Payroll Preparation & Direct Deposit';
      case '/performance':
        return 'Performance & OKR Goal Tracking';
      case '/audit':
        return 'Security & Compliance Audit Logs';
      case '/settings':
        return 'Organization Scale & Capability Preferences';
      default:
        return 'Enterprise Portal';
    }
  };

  return (
    <header className="h-16 border-b border-slate-800 px-6 md:px-8 flex items-center justify-between bg-slate-900/60 backdrop-blur-md sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-white tracking-wide">
          {getPageTitle(location.pathname)}
        </span>

        {/* Clickable Scale Indicator */}
        <button
          onClick={() => setShowScaleModal(true)}
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold hover:bg-indigo-500/20 transition"
        >
          <span>{SCALE_PRESETS[orgScale].badge}</span>
          <Sliders className="w-3 h-3 text-indigo-400" />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => setShowRegisterOrgModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition"
        >
          <Building className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Register</span> Company
        </button>

        <button
          onClick={() => setShowOnboardModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-indigo-600/20"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Onboard Employee</span>
        </button>

        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white ml-1 ring-2 ring-slate-800">
          SA
        </div>
      </div>
    </header>
  );
}
