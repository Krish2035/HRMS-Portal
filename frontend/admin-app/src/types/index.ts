export type OrgScale = 'micro' | 'growing' | 'enterprise';

export interface EnabledModules {
  time_tracking: boolean;
  leaves: boolean;
  timesheets: boolean;
  payroll: boolean;
  performance: boolean;
  audit: boolean;
}

export const SCALE_PRESETS: Record<
  OrgScale,
  { title: string; badge: string; desc: string; modules: EnabledModules }
> = {
  micro: {
    title: 'Micro Startup (1–15 Employees)',
    badge: '🌱 Micro Startup',
    desc: 'Streamlined essentials. Live timer, daily presence, and leaves. Zero corporate bureaucracy.',
    modules: {
      time_tracking: true,
      leaves: true,
      timesheets: false,
      payroll: false,
      performance: false,
      audit: false,
    },
  },
  growing: {
    title: 'Growing Business (15–100 Employees)',
    badge: '🚀 Growing Team',
    desc: 'Operational scale. Adds manager timesheet approval gates, overtime tracking, and payroll export.',
    modules: {
      time_tracking: true,
      leaves: true,
      timesheets: true,
      payroll: true,
      performance: false,
      audit: false,
    },
  },
  enterprise: {
    title: 'Enterprise Suite (100+ Employees)',
    badge: '🏢 Enterprise Suite',
    desc: 'Maximum compliance & scale. Full ACH/NACHA direct deposit, performance reviews, and tamper-evident audit logs.',
    modules: {
      time_tracking: true,
      leaves: true,
      timesheets: true,
      payroll: true,
      performance: true,
      audit: true,
    },
  },
};

export interface EmployeeSession {
  id: string;
  name: string;
  dept: string;
  start: string;
  status: 'Running' | 'On Break' | 'Completed';
  duration: string;
  compensationType: 'salaried' | 'hourly';
  rateDetails: string;
}

export interface TimesheetRecord {
  id: string;
  employeeName: string;
  department: string;
  week: string;
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  rate: number;
  estimatedGross: number;
  status: 'submitted' | 'approved' | 'rejected';
}

export interface LeaveRequest {
  id: string;
  employeeName: string;
  type: string;
  period: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface OkrGoal {
  id: string;
  title: string;
  owner: string;
  department: string;
  quarter: string;
  progress: number;
  status: 'On Track' | 'Ahead' | 'Attention Needed';
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details: string;
  ip: string;
  severity: 'info' | 'security' | 'warning';
}
