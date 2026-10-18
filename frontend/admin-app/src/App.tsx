import React, { useState } from 'react';
import {
  Users,
  Clock,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  BarChart3,
  Settings,
  Download,
  FileSpreadsheet,
  FileCheck,
  Plus,
  X,
  Building,
  DollarSign,
  Sparkles,
  Check,
  AlertTriangle,
} from 'lucide-react';


interface EmployeeSession {
  id: string;
  name: string;
  dept: string;
  start: string;
  status: 'Running' | 'On Break' | 'Completed';
  duration: string;
  compensationType: 'salaried' | 'hourly';
  rateDetails: string;
}

export default function AdminApp() {
  const [activeSessions, setActiveSessions] = useState<EmployeeSession[]>([
    {
      id: '1',
      name: 'Krish Patel',
      dept: 'Engineering',
      start: '09:00 AM',
      status: 'Running',
      duration: '3h 42m',
      compensationType: 'salaried',
      rateDetails: '$6,500/mo',
    },
    {
      id: '2',
      name: 'Sarah Jenkins',
      dept: 'Design',
      start: '09:15 AM',
      status: 'On Break',
      duration: '3h 15m',
      compensationType: 'hourly',
      rateDetails: '$45.00/hr (1.5x OT)',
    },
    {
      id: '3',
      name: 'Michael Chen',
      dept: 'Product',
      start: '08:45 AM',
      status: 'Running',
      duration: '4h 02m',
      compensationType: 'salaried',
      rateDetails: '$7,200/mo',
    },
  ]);

  const [notification, setNotification] = useState<string | null>(null);

  // Modals state
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [showRegisterOrgModal, setShowRegisterOrgModal] = useState(false);

  // Onboard form state
  const [onboardForm, setOnboardForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dept: 'Engineering',
    compensationType: 'salaried' as 'salaried' | 'hourly',
    baseSalary: 5500,
    hourlyRate: 40,
    overtimeMultiplier: 1.5,
  });

  // Org registration form state
  const [orgForm, setOrgForm] = useState({
    companyName: '',
    adminName: '',
    adminEmail: '',
    password: '',
  });

  // Manager Timesheet Approval Gate State
  const [pendingTimesheets, setPendingTimesheets] = useState([
    {
      id: 'ts-1',
      employeeName: 'David Miller',
      department: 'Product Design',
      week: 'Oct 12 – Oct 18, 2026',
      totalHours: 48.0,
      regularHours: 40.0,
      overtimeHours: 8.0,
      rate: 40.0,
      estimatedGross: 2080.0,
      status: 'submitted' as 'submitted' | 'approved' | 'rejected',
    },
    {
      id: 'ts-2',
      employeeName: 'Sarah Jenkins',
      department: 'Design',
      week: 'Oct 12 – Oct 18, 2026',
      totalHours: 42.5,
      regularHours: 40.0,
      overtimeHours: 2.5,
      rate: 45.0,
      estimatedGross: 1968.75,
      status: 'submitted' as 'submitted' | 'approved' | 'rejected',
    },
  ]);

  const handleApproveTimesheet = (id: string, name: string) => {
    setPendingTimesheets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'approved' } : t))
    );
    showToast(`✅ Approved timesheet for ${name}. Hours locked for payroll!`);
  };

  const handleRejectTimesheet = (id: string, name: string) => {
    setPendingTimesheets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'rejected' } : t))
    );
    showToast(`⚠️ Rejected timesheet for ${name}. Revision request sent back.`);
  };


  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardForm.firstName || !onboardForm.lastName || !onboardForm.email) {
      alert('Please fill in all employee name and email fields.');
      return;
    }

    const newEmp: EmployeeSession = {
      id: (activeSessions.length + 1).toString(),
      name: `${onboardForm.firstName} ${onboardForm.lastName}`,
      dept: onboardForm.dept,
      start: 'Just now',
      status: 'Running',
      duration: '0h 01m',
      compensationType: onboardForm.compensationType,
      rateDetails:
        onboardForm.compensationType === 'salaried'
          ? `$${Number(onboardForm.baseSalary).toLocaleString()}/mo`
          : `$${Number(onboardForm.hourlyRate).toFixed(2)}/hr (${onboardForm.overtimeMultiplier}x OT)`,
    };

    setActiveSessions([newEmp, ...activeSessions]);
    setShowOnboardModal(false);
    showToast(
      `🎉 Successfully onboarded ${newEmp.name} (${newEmp.compensationType.toUpperCase()} • ${newEmp.rateDetails})`
    );

    // Reset
    setOnboardForm({
      firstName: '',
      lastName: '',
      email: '',
      dept: 'Engineering',
      compensationType: 'salaried',
      baseSalary: 5500,
      hourlyRate: 40,
      overtimeMultiplier: 1.5,
    });
  };

  const handleRegisterOrg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgForm.companyName || !orgForm.adminName || !orgForm.adminEmail || !orgForm.password) {
      alert('Please fill in all organization registration details.');
      return;
    }

    const code = orgForm.companyName.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6) + '-101';
    setShowRegisterOrgModal(false);
    showToast(`🏢 Organization "${orgForm.companyName}" registered! Org Code: ${code}. Super Admin: ${orgForm.adminEmail}`);

    setOrgForm({ companyName: '', adminName: '', adminEmail: '', password: '' });
  };

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
    const pdfData =
      '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 595 842]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000101 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF';
    const blob = new Blob([pdfData], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Sample_Payslip_October_2026.pdf';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 relative">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-sm font-semibold border border-indigo-400/40 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-300" />
          {notification}
        </div>
      )}

      {/* Admin Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/30">
              A
            </div>
            <div>
              <h1 className="font-bold text-white text-base">HRMS Admin</h1>
              <p className="text-xs text-slate-400">Enterprise Suite</p>
            </div>
          </div>

          <nav className="space-y-1">
            <a
              href="#"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 font-semibold text-sm border border-indigo-500/30"
            >
              <BarChart3 className="w-4 h-4" />
              Live Dashboard
            </a>
            <a
              href="#"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium text-sm transition"
            >
              <Users className="w-4 h-4" />
              Employees
            </a>
            <a
              href="#"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium text-sm transition"
            >
              <Clock className="w-4 h-4" />
              Work Sessions
            </a>
            <a
              href="#"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium text-sm transition"
            >
              <Calendar className="w-4 h-4" />
              Leaves & Holidays
            </a>
            <a
              href="#"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium text-sm transition"
            >
              <ShieldCheck className="w-4 h-4" />
              Audit Logs
            </a>
            <a
              href="#"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium text-sm transition"
            >
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
          <div className="text-sm font-semibold text-slate-300 flex items-center gap-3">
            <span>Enterprise Overview & Presence</span>
            <span className="text-xs px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
              Org: ACME Global (UTC)
            </span>
          </div>

          {/* Quick Action Onboarding Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowRegisterOrgModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition"
            >
              <Building className="w-3.5 h-3.5 text-indigo-400" />
              Register Company
            </button>

            <button
              onClick={() => setShowOnboardModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-indigo-600/20"
            >
              <Plus className="w-3.5 h-3.5" />
              Onboard Employee
            </button>

            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white ml-2">
              SA
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-8 space-y-6 overflow-y-auto">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Headcount</p>
              <p className="text-2xl font-bold text-white mt-1">{142 + (activeSessions.length - 3)}</p>
              <p className="text-xs text-slate-500 mt-2">Active full-time & contractors</p>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Work Timers</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">118</p>
              <p className="text-xs text-slate-500 mt-2">83% present currently</p>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Timesheets</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">3</p>
              <p className="text-xs text-slate-500 mt-2">Manager approval gate</p>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Payroll Cycle</p>
              <p className="text-2xl font-bold text-indigo-400 mt-1">October 2026</p>
              <p className="text-xs text-slate-500 mt-2">Drafting & reconciliation</p>
            </div>
          </div>

          {/* Active Work-Session Table with Compensation Tags */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Live Employee Work Sessions & Compensation</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time presence tracking with dual Salaried and Hourly rate engines
                </p>
              </div>
              <button
                onClick={() => setShowOnboardModal(true)}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
              >
                + Add Employee Profile
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/60 text-xs text-slate-400 uppercase border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-3.5 font-semibold">Employee</th>
                    <th className="px-6 py-3.5 font-semibold">Department</th>
                    <th className="px-6 py-3.5 font-semibold">Compensation Model</th>
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

          {/* Manager Timesheet Approval Gate (Weekly Review) */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                  <h2 className="text-base font-bold text-white">Manager Timesheet Approval Gate</h2>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Required verification gate: Weekly timesheets must be manager-approved before locking into payroll
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg font-semibold">
                  {pendingTimesheets.filter((t) => t.status === 'submitted').length} Awaiting Review
                </span>
                <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg font-semibold">
                  {pendingTimesheets.filter((t) => t.status === 'approved').length} Approved for Payroll
                </span>
              </div>
            </div>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/60 text-xs text-slate-400 uppercase border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-3.5 font-semibold">Employee</th>
                    <th className="px-6 py-3.5 font-semibold">Department</th>
                    <th className="px-6 py-3.5 font-semibold">Pay Period</th>
                    <th className="px-6 py-3.5 font-semibold">Hours Breakdown</th>
                    <th className="px-6 py-3.5 font-semibold">Gross Est.</th>
                    <th className="px-6 py-3.5 font-semibold">Review State</th>
                    <th className="px-6 py-3.5 font-semibold text-right">Manager Action</th>
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
                            ({ts.regularHours.toFixed(1)}h reg +{' '}
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
                            ? '● Approved (Payroll Ready)'
                            : ts.status === 'rejected'
                            ? '● Rejected (Revision Requested)'
                            : '● Pending Manager Review'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {ts.status === 'submitted' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleApproveTimesheet(ts.id, ts.employeeName)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition shadow-sm"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectTimesheet(ts.id, ts.employeeName)}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-800 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 italic">Locked & Processed</span>
                        )}
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

      {/* --- MODAL 1: ONBOARD EMPLOYEE (Hourly vs Salaried) --- */}
      {showOnboardModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Onboard New Team Member</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure identity and select Salaried or Hourly wage model
                </p>
              </div>
              <button
                onClick={() => setShowOnboardModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300">First Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex"
                    value={onboardForm.firstName}
                    onChange={(e) => setOnboardForm({ ...onboardForm, firstName: e.target.value })}
                    className="w-full mt-1.5 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Last Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rivera"
                    value={onboardForm.lastName}
                    onChange={(e) => setOnboardForm({ ...onboardForm, lastName: e.target.value })}
                    className="w-full mt-1.5 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Work Email</label>
                <input
                  type="email"
                  required
                  placeholder="alex.rivera@enterprise.com"
                  value={onboardForm.email}
                  onChange={(e) => setOnboardForm({ ...onboardForm, email: e.target.value })}
                  className="w-full mt-1.5 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Department</label>
                <select
                  value={onboardForm.dept}
                  onChange={(e) => setOnboardForm({ ...onboardForm, dept: e.target.value })}
                  className="w-full mt-1.5 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Product Design</option>
                  <option value="Operations">Operations & HR</option>
                  <option value="Sales">Sales & Marketing</option>
                </select>
              </div>

              {/* Compensation Model Selector */}
              <div className="pt-2">
                <label className="text-xs font-semibold text-slate-300 block mb-2">Compensation Structure</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setOnboardForm({ ...onboardForm, compensationType: 'salaried' })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      onboardForm.compensationType === 'salaried'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🏢 Full-Time Salaried
                  </button>
                  <button
                    type="button"
                    onClick={() => setOnboardForm({ ...onboardForm, compensationType: 'hourly' })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      onboardForm.compensationType === 'hourly'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    ⏱️ Hourly Contractor
                  </button>
                </div>
              </div>

              {/* Dynamic Compensation Fields */}
              {onboardForm.compensationType === 'salaried' ? (
                <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 space-y-2">
                  <label className="text-xs font-semibold text-indigo-300">Monthly Base Salary ($)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-slate-500 font-bold">$</span>
                    <input
                      type="number"
                      required
                      min="100"
                      value={onboardForm.baseSalary}
                      onChange={(e) => setOnboardForm({ ...onboardForm, baseSalary: Number(e.target.value) })}
                      className="w-full pl-8 pr-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 font-mono font-bold"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Fixed monthly compensation. Not deducted for approved company leaves or holidays.
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/20 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-purple-300">Hourly Rate ($/hr)</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-2.5 text-slate-500 font-bold">$</span>
                        <input
                          type="number"
                          required
                          min="1"
                          step="0.5"
                          value={onboardForm.hourlyRate}
                          onChange={(e) => setOnboardForm({ ...onboardForm, hourlyRate: Number(e.target.value) })}
                          className="w-full pl-8 pr-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500 font-mono font-bold"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-purple-300">Overtime Policy</label>
                      <input
                        type="text"
                        disabled
                        value="1.5x (> 40h/wk)"
                        className="w-full mt-0 px-3.5 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-400 font-mono font-semibold"
                      />
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-purple-900/40 pt-2">
                    <span>Regular Rate: ${onboardForm.hourlyRate.toFixed(2)}/hr</span>
                    <span className="text-purple-300 font-bold">
                      Overtime Rate: ${(onboardForm.hourlyRate * 1.5).toFixed(2)}/hr
                    </span>
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowOnboardModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-md"
                >
                  Confirm & Onboard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: REGISTER NEW ORGANIZATION --- */}
      {showRegisterOrgModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Register New Organization</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Self-service tenant creation with instant Super Administrator account
                </p>
              </div>
              <button
                onClick={() => setShowRegisterOrgModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterOrg} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300">Company / Organization Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Global Technologies"
                  value={orgForm.companyName}
                  onChange={(e) => setOrgForm({ ...orgForm, companyName: e.target.value })}
                  className="w-full mt-1.5 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Super Admin Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jane Doe"
                  value={orgForm.adminName}
                  onChange={(e) => setOrgForm({ ...orgForm, adminName: e.target.value })}
                  className="w-full mt-1.5 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Admin Work Email</label>
                <input
                  type="email"
                  required
                  placeholder="jane.doe@apex-global.com"
                  value={orgForm.adminEmail}
                  onChange={(e) => setOrgForm({ ...orgForm, adminEmail: e.target.value })}
                  className="w-full mt-1.5 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Admin Master Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={orgForm.password}
                  onChange={(e) => setOrgForm({ ...orgForm, password: e.target.value })}
                  className="w-full mt-1.5 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">Secured with OWASP Argon2id password hashing</p>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowRegisterOrgModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-md"
                >
                  Create Organization
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
