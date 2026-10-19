import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

export default function OnboardModal() {
  const { showOnboardModal, setShowOnboardModal, addEmployee } = useAdmin();

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

  if (!showOnboardModal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardForm.firstName || !onboardForm.lastName || !onboardForm.email) {
      alert('Please fill in all employee name and email fields.');
      return;
    }

    addEmployee({
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
    });

    setShowOnboardModal(false);
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

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Onboard New Team Member</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Configure identity and select Salaried or Hourly wage model
            </p>
          </div>
          <button
            onClick={() => setShowOnboardModal(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
              placeholder="alex.rivera@company.com"
              value={onboardForm.email}
              onChange={(e) => setOnboardForm({ ...onboardForm, email: e.target.value })}
              className="w-full mt-1.5 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300">Department</label>
              <select
                value={onboardForm.dept}
                onChange={(e) => setOnboardForm({ ...onboardForm, dept: e.target.value })}
                className="w-full mt-1.5 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Product">Product</option>
                <option value="Operations">Operations</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Compensation Model</label>
              <select
                value={onboardForm.compensationType}
                onChange={(e) =>
                  setOnboardForm({
                    ...onboardForm,
                    compensationType: e.target.value as 'salaried' | 'hourly',
                  })
                }
                className="w-full mt-1.5 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="salaried">Salaried (Exempt)</option>
                <option value="hourly">Hourly (Non-Exempt + OT)</option>
              </select>
            </div>
          </div>

          {onboardForm.compensationType === 'salaried' ? (
            <div>
              <label className="text-xs font-semibold text-slate-300">Monthly Base Salary ($)</label>
              <input
                type="number"
                min="1000"
                step="100"
                value={onboardForm.baseSalary}
                onChange={(e) => setOnboardForm({ ...onboardForm, baseSalary: Number(e.target.value) })}
                className="w-full mt-1.5 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-800/40 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-purple-200">Hourly Base Rate ($)</label>
                  <input
                    type="number"
                    min="10"
                    step="0.5"
                    value={onboardForm.hourlyRate}
                    onChange={(e) => setOnboardForm({ ...onboardForm, hourlyRate: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-purple-200">Overtime Multiplier</label>
                  <input
                    type="text"
                    disabled
                    value="1.5x (> 40h/wk)"
                    className="w-full mt-1 px-3 py-1.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-400 font-mono"
                  />
                </div>
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
  );
}
