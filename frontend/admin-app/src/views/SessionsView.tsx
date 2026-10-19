import React, { useState } from 'react';
import { Clock, Plus, Search, Filter } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export default function SessionsView() {
  const { activeSessions, setShowOnboardModal, showToast } = useAdmin();
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('All');

  const filteredSessions = activeSessions.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.dept.toLowerCase().includes(search.toLowerCase());
    const matchesDept = filterDept === 'All' || s.dept === filterDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              Live Employee Work Sessions & Presence
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Authoritative server-side UTC timestamps with real-time status and dual compensation engines
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowOnboardModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-indigo-600/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Employee</span>
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 my-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Search by name or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="px-3 py-1.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Design">Design</option>
              <option value="Product">Product</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800/80">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs text-slate-400 uppercase border-b border-slate-800">
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
              {filteredSessions.map((session) => (
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
                      {session.compensationType === 'salaried' ? '🏢 Salaried' : '⏱️ Hourly'}: {session.rateDetails}
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
                      onClick={() => showToast(`Opening detailed time ledger for ${session.name}`)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                    >
                      Audit Ledger
                    </button>
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
