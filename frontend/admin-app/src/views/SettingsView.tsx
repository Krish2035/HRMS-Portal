import React from 'react';
import {
  Settings,
  Check,
  Clock,
  Calendar,
  CheckSquare,
  DollarSign,
  Target,
  ShieldCheck,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { SCALE_PRESETS, OrgScale } from '../types';

export default function SettingsView() {
  const { orgScale, enabledModules, applyScalePreset, toggleModule } = useAdmin();

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="pb-6 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-400" />
            Organization Scale & Capability Configuration
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Tailor the portal to your actual organization size. Enable only the facilities your employees need.
          </p>
        </div>

        {/* 3 Presets */}
        <div className="my-6">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 block">
            Choose Organizational Scale Preset
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(Object.keys(SCALE_PRESETS) as OrgScale[]).map((scale) => {
              const preset = SCALE_PRESETS[scale];
              const isSelected = orgScale === scale;
              return (
                <div
                  key={scale}
                  onClick={() => applyScalePreset(scale)}
                  className={`p-5 rounded-2xl border cursor-pointer transition relative ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500 shadow-lg shadow-indigo-950/50'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {isSelected && (
                    <span className="absolute top-4 right-4 w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                  <p className="text-base font-bold text-white">{preset.badge}</p>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{preset.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Granular Module Toggles */}
        <div className="pt-6 border-t border-slate-800 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">Custom Capability Toggles</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Toggle specific features on or off. Disabled features will not clutter navigation or confuse employees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Time Tracking */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <p className="text-sm font-semibold text-white">Work Timer & Presence</p>
                </div>
                <p className="text-xs text-slate-400 mt-1">Live tracking with break deduction engine</p>
              </div>
              <button
                onClick={() => toggleModule('time_tracking')}
                className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  enabledModules.time_tracking ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {enabledModules.time_tracking ? 'Active' : 'Off'}
              </button>
            </div>

            {/* Leaves */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-sky-400" />
                  <p className="text-sm font-semibold text-white">Leaves & Holidays</p>
                </div>
                <p className="text-xs text-slate-400 mt-1">Quota balances & time-off applications</p>
              </div>
              <button
                onClick={() => toggleModule('leaves')}
                className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  enabledModules.leaves ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {enabledModules.leaves ? 'Active' : 'Off'}
              </button>
            </div>

            {/* Timesheets Gate */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-amber-400" />
                  <p className="text-sm font-semibold text-white">Timesheet Approval Gate</p>
                </div>
                <p className="text-xs text-slate-400 mt-1">Manager weekly sign-off before payroll locking</p>
              </div>
              <button
                onClick={() => toggleModule('timesheets')}
                className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  enabledModules.timesheets ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {enabledModules.timesheets ? 'Active' : 'Off'}
              </button>
            </div>

            {/* Payroll & ACH */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <p className="text-sm font-semibold text-white">Payroll & ACH/NACHA Banking</p>
                </div>
                <p className="text-xs text-slate-400 mt-1">Direct deposit batches & payslip generation</p>
              </div>
              <button
                onClick={() => toggleModule('payroll')}
                className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  enabledModules.payroll ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {enabledModules.payroll ? 'Active' : 'Off'}
              </button>
            </div>

            {/* Performance OKRs */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-purple-400" />
                  <p className="text-sm font-semibold text-white">Performance Reviews & OKRs</p>
                </div>
                <p className="text-xs text-slate-400 mt-1">Goal tracking & 360 review matrices</p>
              </div>
              <button
                onClick={() => toggleModule('performance')}
                className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  enabledModules.performance ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {enabledModules.performance ? 'Active' : 'Off'}
              </button>
            </div>

            {/* Audit Logs */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-rose-400" />
                  <p className="text-sm font-semibold text-white">Compliance Audit Trail</p>
                </div>
                <p className="text-xs text-slate-400 mt-1">Immutable security & administrative logging</p>
              </div>
              <button
                onClick={() => toggleModule('audit')}
                className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  enabledModules.audit ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {enabledModules.audit ? 'Active' : 'Off'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
