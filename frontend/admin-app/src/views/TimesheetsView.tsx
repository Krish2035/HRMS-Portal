import React from 'react';
import { CheckSquare, Check, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export default function TimesheetsView() {
  const { pendingTimesheets, handleApproveTimesheet, handleRejectTimesheet } = useAdmin();

  const submitted = pendingTimesheets.filter((t) => t.status === 'submitted');
  const approved = pendingTimesheets.filter((t) => t.status === 'approved');

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-amber-400" />
                Manager Timesheet Approval Gate
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Statutory verification: All weekly timesheets and overtime hours must be locked before payroll disbursement
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg font-semibold">
              {submitted.length} Awaiting Review
            </span>
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg font-semibold">
              {approved.length} Locked for Payroll
            </span>
          </div>
        </div>

        {/* Timesheets Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800/80 mt-6">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs text-slate-400 uppercase border-b border-slate-800">
              <tr>
                <th className="px-6 py-3.5 font-semibold">Employee</th>
                <th className="px-6 py-3.5 font-semibold">Department</th>
                <th className="px-6 py-3.5 font-semibold">Pay Period</th>
                <th className="px-6 py-3.5 font-semibold">Hours Breakdown</th>
                <th className="px-6 py-3.5 font-semibold">Gross Est.</th>
                <th className="px-6 py-3.5 font-semibold">State</th>
                <th className="px-6 py-3.5 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {pendingTimesheets.map((ts) => (
                <tr key={ts.id} className="hover:bg-slate-800/40 transition">
                  <td className="px-6 py-4 font-semibold text-white">{ts.employeeName}</td>
                  <td className="px-6 py-4 text-slate-400">{ts.department}</td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-400">{ts.week}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="font-mono font-bold text-white">{ts.totalHours.toFixed(1)}h</span>
                      <span className="text-[11px] text-slate-400">
                        ({ts.regularHours.toFixed(1)}h +{' '}
                        <strong className="text-purple-400">{ts.overtimeHours.toFixed(1)}h OT</strong>)
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-emerald-400">
                    ${ts.estimatedGross.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        ts.status === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : ts.status === 'rejected'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {ts.status === 'approved'
                        ? '● Approved'
                        : ts.status === 'rejected'
                        ? '● Rejected'
                        : '● Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {ts.status === 'submitted' ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleApproveTimesheet(ts.id, ts.employeeName)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectTimesheet(ts.id, ts.employeeName)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500 italic flex items-center justify-end gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        Locked for Payroll
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
