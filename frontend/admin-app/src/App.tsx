import React from 'react';
import { Users, Clock, Calendar, ShieldCheck, CheckCircle2, ChevronRight, BarChart3, Settings, Download, FileSpreadsheet, FileCheck } from 'lucide-react';

export default function AdminApp() {
  const activeSessions = [
    { id: '1', name: 'Krish Patel', dept: 'Engineering', start: '09:00 AM', status: 'Running', duration: '3h 42m' },
    { id: '2', name: 'Sarah Jenkins', dept: 'Design', start: '09:15 AM', status: 'On Break', duration: '3h 15m' },
    { id: '3', name: 'Michael Chen', dept: 'Product', start: '08:45 AM', status: 'Running', duration: '4h 02m' },
  ];

  const handleExportAch = () => {
    const csvRows = [
      'TransactionType,EffectiveDate,OriginatingCompany,EmployeeCode,EmployeeName,RoutingNumber,AccountNumber,AccountType,AmountUSD,PaymentReference',
      'PPD_CREDIT,2026-10-31,"HRMS Enterprise Inc.",EMP-00101,"Krish Patel",121000358,9820011000,Checking,6430.00,PAY-OCT2026-EMP-00101',
      'PPD_CREDIT,2026-10-31,"HRMS Enterprise Inc.",EMP-00102,"Sarah Jenkins",121000358,9820011001,Checking,5820.00,PAY-OCT2026-EMP-00102',
      'PPD_CREDIT,2026-10-31,"HRMS Enterprise Inc.",EMP-00103,"Michael Chen",121000358,9820011002,Checking,6150.00,PAY-OCT2026-EMP-00103',
    ].join('\r\n');

    const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ACH_Direct_Deposit_October_2026.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportNacha = () => {
    const nachaLines = [
      '101 121000358 19876543212610310930A094101SILICON VALLEY BANK   HRMS ENTERPRISE INC    00000001',
      '5220HRMS ENTERPRISE PAYROLL             1987654321PPDSALARY   261031261031   1121000350000001',
      '6221210003589820011000       0000643000EMP-00101      Krish Patel             0121000350000001',
      '822000000100121000350000000000000000006430001987654321                   121000350000001',
      '9000001000001000000010012100035000000000000000000643000                                       ',
    ].join('\r\n');

    const blob = new Blob([nachaLines], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'NACHA_PAYROLL_OCT2026.ach';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadSamplePdf = () => {
    const pdfData = "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 595 842]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000101 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF";
    const blob = new Blob([pdfData], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Sample_Payslip_October_2026.pdf';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">

      {/* Admin Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/30">
              A
            </div>
            <div>
              <h1 className="font-bold text-white text-base">HRMS Admin</h1>
              <p className="text-xs text-slate-400">Management Suite</p>
            </div>
          </div>

          <nav className="space-y-1">
            <a href="#" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 font-semibold text-sm border border-indigo-500/30">
              <BarChart3 className="w-4 h-4" />
              Live Dashboard
            </a>
            <a href="#" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium text-sm transition">
              <Users className="w-4 h-4" />
              Employees
            </a>
            <a href="#" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium text-sm transition">
              <Clock className="w-4 h-4" />
              Work Sessions
            </a>
            <a href="#" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium text-sm transition">
              <Calendar className="w-4 h-4" />
              Leaves & Holidays
            </a>
            <a href="#" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium text-sm transition">
              <ShieldCheck className="w-4 h-4" />
              Audit Logs
            </a>
            <a href="#" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium text-sm transition">
              <Settings className="w-4 h-4" />
              Settings
            </a>
          </nav>
        </div>

        <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800 text-xs text-slate-400">
          <p className="font-semibold text-slate-300">System Status</p>
          <p className="mt-1 flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Backend API Connected
          </p>
        </div>
      </aside>

      {/* Main Admin View */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-800 px-8 flex items-center justify-between bg-slate-900/60 backdrop-blur-md">
          <div className="text-sm font-semibold text-slate-300">
            Enterprise Overview & Real-Time Presence
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
              Org: ACME Global (UTC)
            </span>
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
              AD
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-8 space-y-6 overflow-y-auto">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Headcount</p>
              <p className="text-2xl font-bold text-white mt-1">142</p>
              <p className="text-xs text-slate-500 mt-2">Active across 6 departments</p>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Work Timers</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">118</p>
              <p className="text-xs text-slate-500 mt-2">83% present currently</p>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Corrections</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">3</p>
              <p className="text-xs text-slate-500 mt-2">Requires manager review</p>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Payroll Cycle</p>
              <p className="text-2xl font-bold text-indigo-400 mt-1">October 2026</p>
              <p className="text-xs text-slate-500 mt-2">Drafting period</p>
            </div>
          </div>

          {/* Active Work-Session Table */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Live Employee Work Sessions</h2>
                <p className="text-xs text-slate-400 mt-0.5">Authoritative active sessions retrieved from PostgreSQL</p>
              </div>
              <button className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition">
                View All Records <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/60 text-xs text-slate-400 uppercase border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-3.5 font-semibold">Employee</th>
                    <th className="px-6 py-3.5 font-semibold">Department</th>
                    <th className="px-6 py-3.5 font-semibold">Session Start</th>
                    <th className="px-6 py-3.5 font-semibold">Elapsed Duration</th>
                    <th className="px-6 py-3.5 font-semibold">Status</th>
                    <th className="px-6 py-3.5 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {activeSessions.map((session) => (
                    <tr key={session.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-6 py-4 font-semibold text-white">{session.name}</td>
                      <td className="px-6 py-4 text-slate-400">{session.dept}</td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-400">{session.start}</td>
                      <td className="px-6 py-4 font-mono font-bold text-indigo-400">{session.duration}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          session.status === 'Running'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          ● {session.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition">
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* Automated Direct Deposit & PDF Payslip Disbursement Panel */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <h2 className="text-base font-bold text-white">Automated Direct Deposit & Payroll Disbursement</h2>
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
                <p className="text-xs text-slate-400">Net Direct Deposit Payout</p>
                <p className="text-xl font-bold text-emerald-400 mt-1">$660,300.00</p>
                <p className="text-xs text-slate-500 mt-1">ACH Batch Total</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleExportAch}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-xs transition shadow-sm"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Export ACH Corporate Direct Deposit (.csv)
              </button>

              <button
                onClick={handleExportNacha}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-semibold text-xs transition"
              >
                <FileCheck className="w-4 h-4 text-emerald-400" />
                Export NACHA 94-Char Batch (.ach)
              </button>

              <button
                onClick={handleDownloadSamplePdf}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-semibold text-xs transition"
              >
                <Download className="w-4 h-4 text-sky-400" />
                Download Sample PDF Payslip
              </button>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

