'use client';

import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Square,
  Clock,
  Calendar,
  CheckCircle2,
  Coffee,
  AlertCircle,
  RefreshCw,
  Send,
  Download,
  FileText,
  Plus,
  X,
  Sparkles,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { ApiClient } from '../lib/api';

export default function EmployeeDashboard() {
  const [timerState, setTimerState] = useState<'NOT_STARTED' | 'RUNNING' | 'ON_BREAK' | 'COMPLETED'>('NOT_STARTED');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showReminder, setShowReminder] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [todayTrackedFormatted, setTodayTrackedFormatted] = useState('0h 0m');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Leave Management State
  const [leaveBalance, setLeaveBalance] = useState({
    annual: 18.0,
    casual: 6.0,
    sick: 5.0,
  });
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    type: 'Paid Time Off (PTO)',
    startDate: '',
    endDate: '',
    reason: '',
  });

  // Time Correction Request State
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [correctionForm, setCorrectionForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    requestedStart: '09:00',
    requestedEnd: '17:30',
    reason: '',
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Sync with backend on component mount
  const syncWithBackend = async () => {
    try {
      const res = await ApiClient.getCurrentSession();
      if (res.hasActiveSession && res.session) {
        setSessionId(res.session.id);
        setTimerState(res.session.status === 'running' ? 'RUNNING' : 'ON_BREAK');
        setElapsedSeconds(res.elapsedSeconds);
        setShowReminder(false);
      } else {
        setTimerState('NOT_STARTED');
        setSessionId(null);
      }

      const summary = await ApiClient.getSummary();
      if (summary?.today?.formattedTracked) {
        setTodayTrackedFormatted(summary.today.formattedTracked);
      }
    } catch (err: unknown) {
      console.warn('Backend sync warning:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    syncWithBackend();
    const syncInterval = setInterval(syncWithBackend, 60000);
    return () => clearInterval(syncInterval);
  }, []);

  // Real-time ticking interval when timer is actively RUNNING
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerState === 'RUNNING') {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerState]);

  // Format seconds to HH:MM:SS
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600).toString().padStart(2, '0');
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const handleDownloadPayslipPdf = () => {
    const samplePdfContent =
      '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 595 842]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000101 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF';
    const blob = new Blob([samplePdfContent], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Payslip-EMP-00101-October_2026.pdf';
    link.click();
    URL.revokeObjectURL(url);
    showToast('📥 Downloaded Payslip PDF Voucher for October 2026');
  };

  const handleStartWork = async () => {
    setErrorMsg(null);
    try {
      setTimerState('RUNNING');
      setShowReminder(false);
      const res = (await ApiClient.startSession()) as { session: { id: string } };
      if (res?.session?.id) {
        setSessionId(res.session.id);
      }
      showToast('🚀 Work timer started! Session synchronized with server.');
    } catch {
      showToast('🚀 Work timer active (Local Session)');
    }
  };

  const handlePauseWork = async () => {
    setErrorMsg(null);
    setTimerState('ON_BREAK');
    if (sessionId) {
      try {
        await ApiClient.pauseSession(sessionId, 'coffee');
      } catch (err) {
        console.warn('Pause error', err);
      }
    }
    showToast('☕ Break recorded. Work timer paused.');
  };

  const handleResumeWork = async () => {
    setErrorMsg(null);
    setTimerState('RUNNING');
    if (sessionId) {
      try {
        await ApiClient.resumeSession(sessionId);
      } catch (err) {
        console.warn('Resume error', err);
      }
    }
    showToast('▶️ Resumed active work session.');
  };

  const handleEndWork = async () => {
    setErrorMsg(null);
    setTimerState('COMPLETED');
    if (sessionId) {
      try {
        await ApiClient.endSession(sessionId);
        await syncWithBackend();
      } catch (err) {
        console.warn('End session error', err);
      }
    }
    showToast('🏁 Shift completed and hours locked for payroll.');
  };

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveForm.startDate || !leaveForm.endDate || !leaveForm.reason) {
      alert('Please fill in all leave request fields.');
      return;
    }

    setLeaveBalance((prev) => ({
      ...prev,
      annual: Math.max(0, prev.annual - 1),
    }));

    setShowLeaveModal(false);
    showToast(`🏖️ Submitted ${leaveForm.type} application for manager approval!`);
    setLeaveForm({ type: 'Paid Time Off (PTO)', startDate: '', endDate: '', reason: '' });
  };

  const handleApplyCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctionForm.date || !correctionForm.reason) {
      alert('Please fill in date and justification for time correction.');
      return;
    }

    setShowCorrectionModal(false);
    showToast(`📝 Correction request for ${correctionForm.date} sent to your manager!`);
    setCorrectionForm({
      date: new Date().toISOString().slice(0, 10),
      requestedStart: '09:00',
      requestedEnd: '17:30',
      reason: '',
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 antialiased font-sans">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-indigo-600 text-white px-4 py-3 rounded-2xl shadow-xl border border-indigo-400/30 text-sm font-medium animate-in fade-in slide-in-from-top-4 duration-300">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Header with Matching Dark Aesthetics */}
      <header className="bg-slate-900/80 border-b border-slate-800 px-8 py-4 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-600/30">
            H
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight leading-tight">HRMS Enterprise</h1>
            <p className="text-[11px] font-medium text-slate-400">Employee Workspace & Time Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={syncWithBackend}
            title="Refresh session data"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2.5 pl-3 border-l border-slate-800">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-slate-800">
              KP
            </div>
            <div className="hidden sm:block text-left text-xs">
              <p className="font-semibold text-white">Krish Patel</p>
              <p className="text-slate-400 text-[10px]">Senior Software Engineer</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-8 space-y-6">
        {/* Startup Login Reminder Banner */}
        {showReminder && timerState === 'NOT_STARTED' && (
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-indigo-950/40">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Welcome back, Krish!</p>
                <p className="text-xs text-slate-300 mt-0.5">
                  You signed into your workstation at 09:00 AM UTC. Don&apos;t forget to record your shift!
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowReminder(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
              >
                Dismiss
              </button>
              <button
                onClick={handleStartWork}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md shadow-indigo-600/30"
              >
                Start Shift Now
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Work Timer Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900/80 rounded-3xl p-8 border border-slate-800 shadow-sm relative overflow-hidden">
              {/* Subtle Ambient Glow */}
              <div
                className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-opacity duration-1000 ${
                  timerState === 'RUNNING'
                    ? 'bg-emerald-500/10 opacity-100'
                    : timerState === 'ON_BREAK'
                    ? 'bg-amber-500/10 opacity-100'
                    : 'bg-indigo-500/5 opacity-50'
                }`}
              ></div>

              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-lg font-bold text-white">Authoritative Work Session</h2>
                  <p className="text-xs text-slate-400 mt-0.5">PostgreSQL Single Source of Truth</p>
                </div>

                {/* Status Badges */}
                {timerState === 'NOT_STARTED' && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    ● Not Started
                  </span>
                )}
                {timerState === 'RUNNING' && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Actively Working
                  </span>
                )}
                {timerState === 'ON_BREAK' && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
                    <Coffee className="w-3.5 h-3.5" />
                    On Break
                  </span>
                )}
                {timerState === 'COMPLETED' && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                    ✓ Shift Complete
                  </span>
                )}
              </div>

              {/* Digital Elapsed Display */}
              <div className="my-8 text-center py-6 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <p className="font-mono text-5xl md:text-6xl font-black text-white tracking-wider">
                  {formatTime(elapsedSeconds)}
                </p>
                <p className="text-xs text-slate-400 mt-3 font-medium">
                  {timerState === 'RUNNING'
                    ? 'Synchronized UTC Session • Live Ticking'
                    : timerState === 'ON_BREAK'
                    ? 'Timer Paused • Break Deducted'
                    : timerState === 'COMPLETED'
                    ? 'Day Concluded • Hours Recorded'
                    : 'Ready to begin shift'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                {timerState === 'NOT_STARTED' && (
                  <button
                    onClick={handleStartWork}
                    className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    Start Shift
                  </button>
                )}

                {timerState === 'RUNNING' && (
                  <>
                    <button
                      onClick={handlePauseWork}
                      className="flex-1 w-full py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Pause className="w-4 h-4 fill-current" />
                      Take Break
                    </button>
                    <button
                      onClick={handleEndWork}
                      className="flex-1 w-full py-3.5 px-6 rounded-2xl bg-slate-800 hover:bg-rose-950 text-slate-200 hover:text-rose-300 border border-slate-700 rounded-2xl font-bold text-xs transition flex items-center justify-center gap-2"
                    >
                      <Square className="w-4 h-4 fill-current" />
                      End Shift
                    </button>
                  </>
                )}

                {timerState === 'ON_BREAK' && (
                  <>
                    <button
                      onClick={handleResumeWork}
                      className="flex-1 w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      Resume Work
                    </button>
                    <button
                      onClick={handleEndWork}
                      className="flex-1 w-full py-3.5 px-6 rounded-2xl bg-slate-800 hover:bg-rose-950 text-slate-200 hover:text-rose-300 border border-slate-700 rounded-2xl font-bold text-xs transition flex items-center justify-center gap-2"
                    >
                      <Square className="w-4 h-4 fill-current" />
                      End Shift
                    </button>
                  </>
                )}

                {timerState === 'COMPLETED' && (
                  <div className="w-full py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold text-xs text-center flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Today&apos;s shift successfully recorded and synchronized!
                  </div>
                )}
              </div>

              {/* Time Correction Deep Link */}
              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Forgot to clock in or had a network hiccup?</span>
                <button
                  onClick={() => setShowCorrectionModal(true)}
                  className="font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  Request Time Correction
                </button>
              </div>
            </div>
          </div>

          {/* Quick Metrics Column */}
          <div className="space-y-4">
            {/* Today Tracked */}
            <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Today Tracked</span>
                <Clock className="w-4 h-4 text-indigo-400" />
              </div>
              <p className="text-2xl font-bold text-white">{todayTrackedFormatted}</p>
              <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>Daily Target: 8h 0m</span>
                <span className="font-semibold text-emerald-400">On Track</span>
              </div>
            </div>

            {/* Leave Balance Card with Apply Button */}
            <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Leave Balance</span>
                <Calendar className="w-4 h-4 text-sky-400" />
              </div>
              <div className="flex items-baseline justify-between">
                <p className="text-2xl font-bold text-white">{leaveBalance.annual.toFixed(1)} Days</p>
                <button
                  onClick={() => setShowLeaveModal(true)}
                  className="px-2.5 py-1 rounded-lg bg-sky-600/20 text-sky-300 hover:bg-sky-600/30 text-xs font-semibold border border-sky-500/30 transition flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Apply
                </button>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Annual: {leaveBalance.annual}</span>
                <span>Casual: {leaveBalance.casual}</span>
                <span>Sick: {leaveBalance.sick}</span>
              </div>
            </div>

            {/* Attendance Status */}
            <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Attendance Status</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xl font-bold text-emerald-400">Present (On-Duty)</p>
              <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>Punch Log</span>
                <span className="text-slate-300 font-medium">Automatic Server UTC</span>
              </div>
            </div>

            {/* Weekly Timesheet */}
            <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Weekly Timesheet</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex items-baseline justify-between">
                <p className="text-xl font-bold text-white">41.25 hrs</p>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  ● Approved
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>Oct 12 – Oct 18</span>
                <span className="text-indigo-400 font-medium">Locked for Payroll</span>
              </div>
            </div>

            {/* Latest Payslip */}
            <div className="bg-gradient-to-br from-indigo-950/60 to-slate-900 rounded-2xl p-5 border border-indigo-800/40 shadow-md">
              <div className="flex items-center justify-between text-indigo-300 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Latest Payslip</span>
                <FileText className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold text-white mt-1">$6,430.00</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ● Disbursed
                </span>
                <span className="text-xs text-slate-400">October 2026</span>
              </div>
              <button
                onClick={handleDownloadPayslipPdf}
                className="w-full mt-4 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                Download PDF Voucher
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* --- MODAL 1: APPLY FOR LEAVE MODAL --- */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Apply for Leave</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Remaining PTO Balance: {leaveBalance.annual} Days
                </p>
              </div>
              <button
                onClick={() => setShowLeaveModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyLeave} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300">Leave Category</label>
                <select
                  value={leaveForm.type}
                  onChange={(e) => setLeaveForm({ ...leaveForm, type: e.target.value })}
                  className="w-full mt-1.5 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Paid Time Off (PTO)">Paid Time Off (PTO)</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Compensatory Off">Compensatory Off</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Start Date</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                    className="w-full mt-1.5 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">End Date</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                    className="w-full mt-1.5 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Reason / Justification</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Attending family function out of town"
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  className="w-full mt-1.5 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition shadow-md"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: TIME CORRECTION REQUEST MODAL --- */}
      {showCorrectionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Request Time Correction</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Submit adjustments to your manager for retroactive review
                </p>
              </div>
              <button
                onClick={() => setShowCorrectionModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyCorrection} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300">Shift Date</label>
                <input
                  type="date"
                  required
                  value={correctionForm.date}
                  onChange={(e) => setCorrectionForm({ ...correctionForm, date: e.target.value })}
                  className="w-full mt-1.5 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Corrected Clock In</label>
                  <input
                    type="time"
                    required
                    value={correctionForm.requestedStart}
                    onChange={(e) => setCorrectionForm({ ...correctionForm, requestedStart: e.target.value })}
                    className="w-full mt-1.5 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Corrected Clock Out</label>
                  <input
                    type="time"
                    required
                    value={correctionForm.requestedEnd}
                    onChange={(e) => setCorrectionForm({ ...correctionForm, requestedEnd: e.target.value })}
                    className="w-full mt-1.5 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Reason for Correction</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Network power cut during evening sign-off"
                  value={correctionForm.reason}
                  onChange={(e) => setCorrectionForm({ ...correctionForm, reason: e.target.value })}
                  className="w-full mt-1.5 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowCorrectionModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-md"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
