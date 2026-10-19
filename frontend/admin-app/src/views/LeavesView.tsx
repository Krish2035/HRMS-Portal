import React from 'react';
import { Calendar, Check, X, Clock, Plus } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export default function LeavesView() {
  const { leaveRequests, handleApproveLeave, handleRejectLeave, showToast } = useAdmin();

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-sky-400" />
              Leaves & Time-Off Management Hub
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Review employee time-off requests, statutory leave quotas, and upcoming holidays
            </p>
          </div>
          <button
            onClick={() => showToast('New Leave Request form initiated')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Apply on Behalf</span>
          </button>
        </div>

        {/* Quota Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <p className="text-xs text-slate-400">Total Statutory Leaves</p>
            <p className="text-xl font-bold text-white mt-1">24.0 Days/yr</p>
            <p className="text-xs text-slate-500 mt-1">Annual standard allocation</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <p className="text-xs text-slate-400">Team Members Away Today</p>
            <p className="text-xl font-bold text-sky-400 mt-1">4 Employees</p>
            <p className="text-xs text-slate-500 mt-1">Across Design & Engineering</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <p className="text-xs text-slate-400">Upcoming Holiday</p>
            <p className="text-xl font-bold text-amber-400 mt-1">Thanksgiving</p>
            <p className="text-xs text-slate-500 mt-1">Nov 26, 2026 (Paid holiday)</p>
          </div>
        </div>

        {/* Request List */}
        <div className="overflow-x-auto rounded-xl border border-slate-800/80">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs text-slate-400 uppercase border-b border-slate-800">
              <tr>
                <th className="px-6 py-3.5 font-semibold">Employee</th>
                <th className="px-6 py-3.5 font-semibold">Leave Type</th>
                <th className="px-6 py-3.5 font-semibold">Requested Period</th>
                <th className="px-6 py-3.5 font-semibold">Reason</th>
                <th className="px-6 py-3.5 font-semibold">Status</th>
                <th className="px-6 py-3.5 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {leaveRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-800/40 transition">
                  <td className="px-6 py-4 font-semibold text-white">{req.employeeName}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                      {req.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-300">{req.period}</td>
                  <td className="px-6 py-4 text-xs text-slate-400">{req.reason}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        req.status === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : req.status === 'rejected'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      ● {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {req.status === 'pending' ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleApproveLeave(req.id, req.employeeName)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectLeave(req.id, req.employeeName)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                        >
                          <X className="w-3.5 h-3.5" />
                          Deny
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500 italic">Resolved</span>
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
