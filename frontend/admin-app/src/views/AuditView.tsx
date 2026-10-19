import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export default function AuditView() {
  const { auditLogs } = useAdmin();

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-rose-400" />
              Compliance & Security Audit Stream
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Immutable trail for labor laws, payroll sign-offs, and administrative changes
            </p>
          </div>
          <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Tamper-Evident Active
          </span>
        </div>

        <div className="divide-y divide-slate-800/60 mt-4">
          {auditLogs.map((log) => (
            <div key={log.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-800/20 px-3 rounded-xl transition">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-indigo-400 font-semibold">{log.action}</span>
                  <span className="text-xs text-slate-400">• by {log.actor}</span>
                </div>
                <p className="text-sm text-slate-200">{log.details}</p>
              </div>
              <div className="text-left sm:text-right text-xs text-slate-500 font-mono">
                <p>{log.timestamp}</p>
                <p className="text-[11px] text-slate-600">IP: {log.ip}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
