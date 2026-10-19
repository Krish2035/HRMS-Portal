import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  OrgScale,
  EnabledModules,
  SCALE_PRESETS,
  EmployeeSession,
  TimesheetRecord,
  LeaveRequest,
  OkrGoal,
  AuditLogItem,
} from '../types';

interface AdminContextType {
  orgScale: OrgScale;
  enabledModules: EnabledModules;
  activeSessions: EmployeeSession[];
  pendingTimesheets: TimesheetRecord[];
  leaveRequests: LeaveRequest[];
  okrs: OkrGoal[];
  auditLogs: AuditLogItem[];
  notification: string | null;
  showOnboardModal: boolean;
  showRegisterOrgModal: boolean;
  showScaleModal: boolean;
  setShowOnboardModal: (v: boolean) => void;
  setShowRegisterOrgModal: (v: boolean) => void;
  setShowScaleModal: (v: boolean) => void;
  showToast: (msg: string) => void;
  applyScalePreset: (scale: OrgScale) => void;
  toggleModule: (moduleKey: keyof EnabledModules) => void;
  handleApproveTimesheet: (id: string, name: string) => void;
  handleRejectTimesheet: (id: string, name: string) => void;
  handleApproveLeave: (id: string, name: string) => void;
  handleRejectLeave: (id: string, name: string) => void;
  addEmployee: (employee: Omit<EmployeeSession, 'id'>) => void;
  exportAchCsv: () => void;
  exportNachaBatch: () => void;
  downloadSamplePdf: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [orgScale, setOrgScale] = useState<OrgScale>('growing');
  const [enabledModules, setEnabledModules] = useState<EnabledModules>(SCALE_PRESETS.growing.modules);

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

  const [pendingTimesheets, setPendingTimesheets] = useState<TimesheetRecord[]>([
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
      status: 'submitted',
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
      status: 'submitted',
    },
  ]);

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([
    {
      id: 'lr-1',
      employeeName: 'Michael Chen',
      type: 'Paid Time Off (PTO)',
      period: 'Oct 23 – Oct 26, 2026 (3 Days)',
      reason: 'Family wedding out of town',
      status: 'pending',
    },
    {
      id: 'lr-2',
      employeeName: 'Elena Rostova',
      type: 'Sick Leave',
      period: 'Oct 20, 2026 (1 Day)',
      reason: 'Medical appointment',
      status: 'approved',
    },
  ]);

  const [okrs] = useState<OkrGoal[]>([
    {
      id: 'okr-1',
      title: 'Accelerate Core API Latency below 80ms',
      owner: 'Krish Patel',
      department: 'Engineering',
      quarter: 'Q4 2026',
      progress: 78,
      status: 'On Track',
    },
    {
      id: 'okr-2',
      title: 'Rollout Unified Design System & Component Library',
      owner: 'Sarah Jenkins',
      department: 'Design',
      quarter: 'Q4 2026',
      progress: 92,
      status: 'Ahead',
    },
    {
      id: 'okr-3',
      title: 'Achieve 99.95% Work Timer Uptime & Zero Drift',
      owner: 'David Miller',
      department: 'Infrastructure',
      quarter: 'Q4 2026',
      progress: 65,
      status: 'Attention Needed',
    },
  ]);

  const [auditLogs] = useState<AuditLogItem[]>([
    {
      id: 'aud-1',
      timestamp: 'Today at 09:15:22 UTC',
      actor: 'Sarah Jenkins (EMP-00102)',
      action: 'PAUSE_WORK_SESSION',
      details: 'Started break record (Coffee/Personal)',
      ip: '192.168.1.45',
      severity: 'info',
    },
    {
      id: 'aud-2',
      timestamp: 'Today at 09:00:01 UTC',
      actor: 'Krish Patel (EMP-00101)',
      action: 'START_WORK_SESSION',
      details: 'Authoritative server UTC work session initiated',
      ip: '192.168.1.12',
      severity: 'info',
    },
    {
      id: 'aud-3',
      timestamp: 'Yesterday at 17:30:10 UTC',
      actor: 'Super Admin',
      action: 'APPROVE_TIMESHEET',
      details: 'Timesheet locked for payroll disbursement (ID: ts-1)',
      ip: '10.0.4.1',
      severity: 'security',
    },
  ]);

  const [notification, setNotification] = useState<string | null>(null);
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [showRegisterOrgModal, setShowRegisterOrgModal] = useState(false);
  const [showScaleModal, setShowScaleModal] = useState(false);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const applyScalePreset = (scale: OrgScale) => {
    setOrgScale(scale);
    setEnabledModules(SCALE_PRESETS[scale].modules);
    showToast(`🏢 Applied preset: ${SCALE_PRESETS[scale].title}`);
  };

  const toggleModule = (moduleKey: keyof EnabledModules) => {
    setEnabledModules((prev) => {
      const next = { ...prev, [moduleKey]: !prev[moduleKey] };
      const activeCount = Object.values(next).filter(Boolean).length;
      showToast(
        `${next[moduleKey] ? '✅ Enabled' : '⏸️ Disabled'} ${moduleKey.replace('_', ' ').toUpperCase()} module (${activeCount} active)`
      );
      return next;
    });
  };

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

  const handleApproveLeave = (id: string, name: string) => {
    setLeaveRequests((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: 'approved' } : l))
    );
    showToast(`🎉 Approved leave application for ${name}`);
  };

  const handleRejectLeave = (id: string, name: string) => {
    setLeaveRequests((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: 'rejected' } : l))
    );
    showToast(`⚠️ Denied leave application for ${name}`);
  };

  const addEmployee = (employee: Omit<EmployeeSession, 'id'>) => {
    const newSession: EmployeeSession = {
      ...employee,
      id: (activeSessions.length + 1).toString(),
    };
    setActiveSessions((prev) => [newSession, ...prev]);
    showToast(`🎉 Successfully onboarded ${newSession.name} (${newSession.rateDetails})`);
  };

  const exportAchCsv = () => {
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

  const exportNachaBatch = () => {
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
    link.download = 'NACHA_Payroll_October_2026.ach';
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadSamplePdf = () => {
    const samplePdfContent =
      '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 595 842]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000101 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF';
    const blob = new Blob([samplePdfContent], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Payslip_Sample_Voucher.pdf';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminContext.Provider
      value={{
        orgScale,
        enabledModules,
        activeSessions,
        pendingTimesheets,
        leaveRequests,
        okrs,
        auditLogs,
        notification,
        showOnboardModal,
        showRegisterOrgModal,
        showScaleModal,
        setShowOnboardModal,
        setShowRegisterOrgModal,
        setShowScaleModal,
        showToast,
        applyScalePreset,
        toggleModule,
        handleApproveTimesheet,
        handleRejectTimesheet,
        handleApproveLeave,
        handleRejectLeave,
        addEmployee,
        exportAchCsv,
        exportNachaBatch,
        downloadSamplePdf,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
