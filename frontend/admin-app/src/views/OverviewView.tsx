import React from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  Calendar,
  CheckSquare,
  DollarSign,
  Check,
  AlertTriangle,
  FileSpreadsheet,
  FileCheck,
  Download,
  ArrowRight,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { SCALE_PRESETS } from '../types';

export default function OverviewView() {
  const {
    orgScale,
    enabledModules,
    setShowScaleModal,
    activeSessions,
    pendingTimesheets,
    leaveRequests,
    setShowOnboardModal,
    handleApproveTimesheet,
    handleRejectTimesheet,
    exportAchCsv,
    exportNachaBatch,
    downloadSamplePdf,
    showToast,
  } = useAdmin();

  return (
    <div className="space-y-6">
      {/* Micro-Mode Welcome Notice */}
      {orgScale === 'micro' && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-800/40 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              🌱
            </div>
            <div>
              <p className="font-bold text-emerald-300">Clean Micro-Startup Mode Active</p>
              <p className="text-slate-400 mt-0.5">
                Enterprise bureaucracy modules are hidden to keep your team's interface clean and fast.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowScaleModal(true)}
            className="px-3 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 font-semibold border border-emerald-500/30 transition shrink-0"
          >
            Change Preferences
          </button>
        </div>
      )}

      {/* Dynamic Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Headcount</p>
          <p className="text-2xl font-bold text-white mt-1">{142 + (activeSessions.length - 3)}</p>
          <p className="text-xs text-slate-500 mt-2">Active roster members</p>
        </div>

        {enabledModules.time_tracking && (
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-sm">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Work Timers</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">118</p>
            <p className="text-xs text-slate-500 mt-2">83% team presence today</p>
          </div>
        )}

        {enabledModules.leaves && (
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-sm">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Leaves Today</p>
            <p className="text-2xl font-bold text-sky-400 mt-1">4</p>
            <p className="text-xs text-slate-500 mt-2">Approved time off</p>
          </div>
        )}

        {enabledModules.timesheets && (
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-sm">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Timesheets</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">
              {pendingTimesheets.filter((t) => t.status === 'submitted').length}
            </p>
            <p className="text-xs text-slate-500 mt-2">Manager approval required</p>
          </div>
        )}

        {enabledModules.payroll && !enabledModules.timesheets && (
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-sm">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Payroll Cycle</p>
            <p className="text-2xl font-bold text-indigo-400 mt-1">October 2026</p>
            <p className="text-xs text-slate-500 mt-2">Direct deposit ready</p>
          </div>
        )}
      </div>

      {/* Live Work Sessions Table Preview */}
      {enabledModules.time_tracking && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Live Employee Presence & Work Sessions</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Authoritative server-side UTC timestamps with instant status synchronization
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/sessions"
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
              >
                View Full Roster <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => setShowOnboardModal(true)}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 transition"
              >
                + Add
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/60 text-xs text-slate-400 uppercase border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Employee</th>
                  <th className="px-6 py-3.5 font-semibold">Department</th>
                  <th className="px-6 py-3.5 font-semibold">Compensation</th>
                  <th className="px-6 py-3.5 font-semibold">Session Start</th>
                  <th className="px-6 py-3.5 font-semibold">Elapsed</th>
                  <th className="px-6 py-3.5 font-semibold">Status</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {activeSessions.map((session) => (
                  <tr key={session.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-6 py-4 font-semibold text-white">{session.name}</td>
                    <td className="px-6 py-4 text-slate-400">{session.dept}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                          session.compensationType === 'salaried'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                        }`}
                      >
                        {session.compensationType === 'salaried' ? '🏢 Salaried' : '⏱️ Hourly'}:{' '}
                        {session.rateDetails}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">{session.start}</td>
                    <td className="px-6 py-4 font-mono font-bold text-indigo-400">{session.duration}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          session.status === 'Running'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        ● {session.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => showToast(`Inspecting session details for ${session.name}`)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Manager Timesheet Approval Gate (Visible if enabled) */}
      {enabledModules.timesheets && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                <h2 className="text-base font-bold text-white">Manager Timesheet Approval Gate</h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Weekly hours & overtime sign-off before locking into payroll
              </p>
            </div>
            <Link
              to="/timesheets"
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition"
            >
              Open Timesheet Gate <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/60 text-xs text-slate-400 uppercase border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Employee</th>
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
                        <span className="text-xs text-slate-500 italic">Locked</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Automated Direct Deposit (Visible if enabled) */}
      {enabledModules.payroll && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <h2 className="text-base font-bold text-white">Automated Direct Deposit & Payroll Disbursement</h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                1-Click batch banking export (NACHA & ACH CSV) and employee PDF vouchers
              </p>
            </div>
            <Link
              to="/payroll"
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition"
            >
              Manage Banking Batch <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <p className="text-xs text-slate-400">Total Gross Pay</p>
              <p className="text-xl font-bold text-white mt-1">$710,000.00</p>
              <p className="text-xs text-slate-500 mt-1">Base + Allowances</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <p className="text-xs text-slate-400">Statutory Deductions</p>
              <p className="text-xl font-bold text-rose-400 mt-1">-$49,700.00</p>
              <p className="text-xs text-slate-500 mt-1">Tax, Benefits & Social Security</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <p className="text-xs text-slate-400">Net ACH Payout</p>
              <p className="text-xl font-bold text-emerald-400 mt-1">$660,300.00</p>
              <p className="text-xs text-slate-500 mt-1">ACH Batch Total</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={exportAchCsv}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-xs transition shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Export ACH Corporate Direct Deposit (.csv)
            </button>

            <button
              onClick={exportNachaBatch}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-semibold text-xs transition"
            >
              <FileCheck className="w-4 h-4 text-emerald-400" />
              Export NACHA 94-Char Batch (.ach)
            </button>

            <button
              onClick={downloadSamplePdf}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-semibold text-xs transition"
            >
              <Download className="w-4 h-4 text-sky-400" />
              Download Sample PDF Payslip
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
