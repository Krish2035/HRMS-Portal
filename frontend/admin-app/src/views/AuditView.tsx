import React from 'react';
import { ShieldCheck, Lock, AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export default function AuditView() {
  const { auditLogs } = useAdmin();

  return (
    <div className="space-y-6">
      {/* Security Engine Banners: Anti-IDOR & ROLA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-start gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Anti-IDOR Protection</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Insecure Direct Object Reference guards prevent cross-tenant and cross-user data tampering on all database UUIDs.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-start gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">ROLA Contextual Authorization</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                ENFORCED
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Role-Object Level Authorization restricts managers exclusively to their assigned reporting chain and departments.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              Compliance & Security Audit Stream
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Immutable trail capturing administrative sign-offs and blocked IDOR/ROLA security violations
            </p>
          </div>
          <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Tamper-Evident Active
          </span>
        </div>

        <div className="divide-y divide-slate-800/60 mt-4">
          {auditLogs.map((log) => {
            const isSecurityAlert = log.severity === 'security' || log.action.includes('SECURITY_ALERT');
            const isWarning = log.severity === 'warning';

            return (
              <div
                key={log.id}
                className={`py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 rounded-xl transition ${
                  isSecurityAlert
                    ? 'bg-rose-950/20 border border-rose-900/40 my-1.5'
                    : isWarning
                    ? 'bg-amber-950/15 border border-amber-900/30 my-1.5'
                    : 'hover:bg-slate-800/20'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                        isSecurityAlert
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : isWarning
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-indigo-500/10 text-indigo-400'
                      }`}
                    >
                      {log.action}
                    </span>
                    <span className="text-xs text-slate-400">• by {log.actor}</span>
                  </div>
                  <p className="text-sm text-slate-200">{log.details}</p>
                </div>
                <div className="text-left sm:text-right text-xs text-slate-500 font-mono shrink-0">
                  <p>{log.timestamp}</p>
                  <p className="text-[11px] text-slate-500">IP: {log.ip}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
