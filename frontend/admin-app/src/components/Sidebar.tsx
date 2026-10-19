import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  Clock,
  Calendar,
  CheckSquare,
  DollarSign,
  Target,
  ShieldCheck,
  Settings,
  Sliders,
  ChevronRight,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { SCALE_PRESETS } from '../types';

export default function Sidebar() {
  const { orgScale, enabledModules, setShowScaleModal, pendingTimesheets, leaveRequests } = useAdmin();

  const activeModulesCount = Object.values(enabledModules).filter(Boolean).length;
  const pendingTimesheetsCount = pendingTimesheets.filter((t) => t.status === 'submitted').length;
  const pendingLeavesCount = leaveRequests.filter((l) => l.status === 'pending').length;

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition ${
      isActive
        ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/25 shadow-sm'
        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
    }`;

  return (
    <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between shrink-0 min-h-screen">
      <div>
        {/* Brand Logo */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/30">
            H
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight text-white leading-tight">HRMS Enterprise</h1>
            <p className="text-[11px] font-medium text-slate-400">Administration Console</p>
          </div>
        </div>

        {/* Current Scale Preset Card */}
        <button
          onClick={() => setShowScaleModal(true)}
          className="w-full mb-6 p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-indigo-500/50 text-left transition group shadow-inner"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Company Tier</span>
            <Sliders className="w-3.5 h-3.5 text-indigo-400 group-hover:rotate-45 transition-transform" />
          </div>
          <p className="text-xs font-bold text-indigo-300 mt-1 flex items-center gap-1.5">
            <span>{SCALE_PRESETS[orgScale].badge}</span>
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">{activeModulesCount} of 6 modules active</p>
        </button>

        {/* Dynamic Navigation Links via React Router */}
        <nav className="space-y-1">
          <NavLink to="/" end className={navLinkClasses}>
            <div className="flex items-center gap-3">
              <BarChart3 className="w-4 h-4" />
              Overview
            </div>
          </NavLink>

          {enabledModules.time_tracking && (
            <NavLink to="/sessions" className={navLinkClasses}>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4" />
                Live Sessions
              </div>
            </NavLink>
          )}

          {enabledModules.leaves && (
            <NavLink to="/leaves" className={navLinkClasses}>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4" />
                Leaves & Holidays
              </div>
              {pendingLeavesCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-sky-500/20 text-sky-300">
                  {pendingLeavesCount}
                </span>
              )}
            </NavLink>
          )}

          {enabledModules.timesheets && (
            <NavLink to="/timesheets" className={navLinkClasses}>
              <div className="flex items-center gap-3">
                <CheckSquare className="w-4 h-4" />
                Timesheet Gate
              </div>
              {pendingTimesheetsCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300">
                  {pendingTimesheetsCount}
                </span>
              )}
            </NavLink>
          )}

          {enabledModules.payroll && (
            <NavLink to="/payroll" className={navLinkClasses}>
              <div className="flex items-center gap-3">
                <DollarSign className="w-4 h-4" />
                Payroll & Banking
              </div>
            </NavLink>
          )}

          {enabledModules.performance && (
            <NavLink to="/performance" className={navLinkClasses}>
              <div className="flex items-center gap-3">
                <Target className="w-4 h-4" />
                Performance OKRs
              </div>
            </NavLink>
          )}

          {enabledModules.audit && (
            <NavLink to="/audit" className={navLinkClasses}>
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4" />
                Audit Logs
              </div>
            </NavLink>
          )}

          <NavLink to="/settings" className={navLinkClasses}>
            <div className="flex items-center gap-3">
              <Settings className="w-4 h-4" />
              Settings & Modules
            </div>
          </NavLink>
        </nav>
      </div>

      {/* Modular Footprint Box & Status */}
      <div className="pt-4 border-t border-slate-800 space-y-3">
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-semibold text-slate-300">Modular Footprint</span>
            <span className="text-[10px] text-indigo-400 font-bold">{Math.round((activeModulesCount / 6) * 100)}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${(activeModulesCount / 6) * 100}%` }}
            ></div>
          </div>
          <button
            onClick={() => setShowScaleModal(true)}
            className="mt-2.5 text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition"
          >
            Configure Modules <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>API Engine Online</span>
        </div>
      </div>
    </aside>
  );
}
