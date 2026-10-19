import React from 'react';
import { DollarSign, FileSpreadsheet, FileCheck, Download } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export default function PayrollView() {
  const { exportAchCsv, exportNachaBatch, downloadSamplePdf } = useAdmin();

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                Automated Direct Deposit & Payroll Disbursement
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              1-Click batch banking export (NACHA & ACH CSV) and executive PDF voucher generation
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg font-semibold">
              Period: October 2026
            </span>
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg font-semibold">
              142 Records Prepared
            </span>
          </div>
        </div>

        {/* Aggregated Totals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <p className="text-xs text-slate-400">Total Gross Wages</p>
            <p className="text-xl font-bold text-white mt-1">$710,000.00</p>
            <p className="text-xs text-slate-500 mt-1">Base + Overtime + Allowances</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <p className="text-xs text-slate-400">Statutory Tax & Deductions</p>
            <p className="text-xl font-bold text-rose-400 mt-1">-$49,700.00</p>
            <p className="text-xs text-slate-500 mt-1">Federal, State & Healthcare</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <p className="text-xs text-slate-400">Net ACH Direct Deposit Payout</p>
            <p className="text-xl font-bold text-emerald-400 mt-1">$660,300.00</p>
            <p className="text-xs text-slate-500 mt-1">Corporate ACH Batch Total</p>
          </div>
        </div>

        {/* Banking Action Buttons */}
        <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center gap-3">
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
    </div>
  );
}
