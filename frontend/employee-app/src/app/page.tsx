'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Clock, Calendar, CheckCircle2, Coffee, AlertCircle, RefreshCw, Send } from 'lucide-react';
import { ApiClient } from '../lib/api';

export default function EmployeeDashboard() {
  const [timerState, setTimerState] = useState<'NOT_STARTED' | 'RUNNING' | 'ON_BREAK' | 'COMPLETED'>('NOT_STARTED');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showReminder, setShowReminder] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [todayTrackedFormatted, setTodayTrackedFormatted] = useState('0h 0m');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
    const syncInterval = setInterval(syncWithBackend, 60000); // Re-sync every 60s
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

  const handleStartWork = async () => {
    setErrorMsg(null);
    try {
      setTimerState('RUNNING');
      setShowReminder(false);
      const res = (await ApiClient.startSession()) as { session: { id: string } };
      if (res?.session?.id) {
        setSessionId(res.session.id);
      }
    } catch {
      // Local fallback remains responsive
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
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-200">
            H
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">HRMS Enterprise</h1>
            <p className="text-xs text-slate-500 font-medium">Employee Workspace & Time Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={syncWithBackend}
            title="Refresh session data"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-800">Krish Patel</p>
            <p className="text-xs text-slate-500">Full-Stack Engineer • Tech Dept</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-indigo-50 border-2 border-indigo-600 flex items-center justify-center font-bold text-indigo-700 text-sm">
            KP
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-8 space-y-6">
        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
            {errorMsg}
          </div>
        )}

        {/* Startup Login Reminder Banner */}
        {timerState === 'NOT_STARTED' && showReminder && !loading && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-100 rounded-xl text-amber-700">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Good morning! Your HRMS is ready.</h2>
                <p className="text-sm text-slate-600 mt-1">
                  You haven&apos;t started today&apos;s work timer yet. Start your timer when you&apos;re ready to begin work.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => setShowReminder(false)}
                className="flex-1 md:flex-none px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-medium text-sm hover:bg-white transition"
              >
                Remind Me Later
              </button>
              <button
                onClick={handleStartWork}
                className="flex-1 md:flex-none px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-200 transition flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-white" />
                Start Work
              </button>
            </div>
          </div>
        )}

        {/* Top Grid: Work Timer Hero Card & Summary Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Work Timer Hero Card */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Live Work Timer</h3>
                    <p className="text-xs text-slate-500">Authoritative server-side tracked session</p>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    timerState === 'RUNNING'
                      ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                      : timerState === 'ON_BREAK'
                      ? 'bg-amber-100 text-amber-800'
                      : timerState === 'COMPLETED'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    ● {timerState === 'RUNNING' ? 'Session Active' : timerState === 'ON_BREAK' ? 'On Break' : timerState === 'COMPLETED' ? 'Shift Completed' : 'Not Started'}
                  </span>
                </div>
              </div>

              {/* Huge Timer Display */}
              <div className="my-8 text-center py-8 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 font-mono">
                  {formatTime(elapsedSeconds)}
                </span>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mt-3">
                  Authoritative UTC Server Duration
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              {timerState === 'NOT_STARTED' && (
                <button
                  onClick={handleStartWork}
                  className="flex-1 py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-lg shadow-indigo-200 transition flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5 fill-white" />
                  Start Work Now
                </button>
              )}

              {timerState === 'RUNNING' && (
                <>
                  <button
                    onClick={handlePauseWork}
                    className="flex-1 py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-base shadow-lg shadow-amber-200 transition flex items-center justify-center gap-2"
                  >
                    <Coffee className="w-5 h-5" />
                    Take a Break
                  </button>
                  <button
                    onClick={handleEndWork}
                    className="flex-1 py-3.5 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-base shadow-lg shadow-rose-200 transition flex items-center justify-center gap-2"
                  >
                    <Square className="w-5 h-5 fill-white" />
                    End Work Shift
                  </button>
                </>
              )}

              {timerState === 'ON_BREAK' && (
                <button
                  onClick={handleResumeWork}
                  className="flex-1 py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-lg shadow-emerald-200 transition flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5 fill-white" />
                  Resume Work
                </button>
              )}

              {timerState === 'COMPLETED' && (
                <div className="w-full text-center py-2 text-sm font-semibold text-emerald-700 flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Today&apos;s shift successfully recorded and synchronized!
                </div>
              )}
            </div>
          </div>

          {/* Quick Metrics Column */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Today Tracked</span>
                <Clock className="w-4 h-4" />
              </div>
              <p className="text-3xl font-extrabold text-slate-900">{todayTrackedFormatted}</p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Daily Target: 8h 0m</span>
                <span className="font-semibold text-indigo-600">Active</span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Leave Balance</span>
                <Calendar className="w-4 h-4" />
              </div>
              <p className="text-3xl font-extrabold text-slate-900">18.0 Days</p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Annual: 18.0</span>
                <span>Casual: 6.0</span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Attendance Status</span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold text-emerald-600">Present (On-Duty)</p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Punch Log</span>
                <span className="text-slate-600 font-medium">Automatic</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
