import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { OrgScale, SCALE_PRESETS } from '../../types';

export default function RegisterOrgModal() {
  const { showRegisterOrgModal, setShowRegisterOrgModal, applyScalePreset, showToast } = useAdmin();

  const [orgForm, setOrgForm] = useState({
    companyName: '',
    adminName: '',
    adminEmail: '',
    password: '',
    scale: 'growing' as OrgScale,
  });

  if (!showRegisterOrgModal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgForm.companyName || !orgForm.adminName || !orgForm.adminEmail || !orgForm.password) {
      alert('Please fill in all organization registration details.');
      return;
    }

    const scale = orgForm.scale;
    applyScalePreset(scale);

    const code = orgForm.companyName.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6) + '-101';
    setShowRegisterOrgModal(false);
    showToast(
      `🏢 Registered "${orgForm.companyName}" with ${SCALE_PRESETS[scale].badge} configuration! Org Code: ${code}`
    );

    setOrgForm({ companyName: '', adminName: '', adminEmail: '', password: '', scale: 'growing' });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Register Organization</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Set up your company and choose the facilities you want enabled
            </p>
          </div>
          <button
            onClick={() => setShowRegisterOrgModal(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300">Company Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Apex Innovations"
              value={orgForm.companyName}
              onChange={(e) => setOrgForm({ ...orgForm, companyName: e.target.value })}
              className="w-full mt-1.5 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300">Team Size & Facilities</label>
            <select
              value={orgForm.scale}
              onChange={(e) => setOrgForm({ ...orgForm, scale: e.target.value as OrgScale })}
              className="w-full mt-1.5 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="micro">🌱 Micro Startup (1–15 Employees) • Lightweight</option>
              <option value="growing">🚀 Growing Team (15–100 Employees) • Approvals + Payroll</option>
              <option value="enterprise">🏢 Enterprise (100+ Employees) • Full Compliance Suite</option>
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              You can fine-tune individual module switches anytime in Settings.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300">Super Admin Name</label>
              <input
                type="text"
                required
                placeholder="Jane Doe"
                value={orgForm.adminName}
                onChange={(e) => setOrgForm({ ...orgForm, adminName: e.target.value })}
                className="w-full mt-1.5 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300">Admin Email</label>
              <input
                type="email"
                required
                placeholder="admin@company.com"
                value={orgForm.adminEmail}
                onChange={(e) => setOrgForm({ ...orgForm, adminEmail: e.target.value })}
                className="w-full mt-1.5 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
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
              Register Organization
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
