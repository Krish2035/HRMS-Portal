import React from 'react';
import { Target, Plus } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export default function PerformanceView() {
  const { okrs, showToast } = useAdmin();

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
              Employee Performance & OKR Goals
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Quarterly Key Results, progress tracking, and 360 review matrices
            </p>
          </div>
          <button
            onClick={() => showToast('New Objective Modal initiated')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Objective</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {okrs.map((okr) => (
            <div key={okr.id} className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-4 hover:border-slate-700 transition">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {okr.quarter}
                </span>
                <span
                  className={`text-xs font-semibold ${
                    okr.status === 'Ahead'
                      ? 'text-emerald-400'
                      : okr.status === 'On Track'
                      ? 'text-indigo-400'
                      : 'text-amber-400'
                  }`}
                >
                  ● {okr.status}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white leading-snug">{okr.title}</h3>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Progress</span>
                  <span className="font-bold text-white">{okr.progress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all"
                    style={{ width: `${okr.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 text-xs text-slate-400">
                <span>Owner: <strong className="text-slate-200">{okr.owner}</strong></span>
                <span>{okr.department}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
