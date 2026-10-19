import React from 'react';
import { Sparkles } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export default function Toast() {
  const { notification } = useAdmin();

  if (!notification) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 bg-indigo-600/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-2xl border border-indigo-400/30 text-sm font-medium animate-in fade-in slide-in-from-top-4 duration-300">
      <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
      <span>{notification}</span>
    </div>
  );
}
