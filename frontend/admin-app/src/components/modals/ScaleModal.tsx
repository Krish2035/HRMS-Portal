import React from 'react';
import { X, Check } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { SCALE_PRESETS, OrgScale } from '../../types';

export default function ScaleModal() {
  const { showScaleModal, setShowScaleModal, orgScale, applyScalePreset } = useAdmin();

  if (!showScaleModal) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Tailor Portal to Organization Scale</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select your company size to remove unnecessary features and eliminate bloat
            </p>
          </div>
          <button
            onClick={() => setShowScaleModal(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-3">
            {(Object.keys(SCALE_PRESETS) as OrgScale[]).map((scale) => {
              const preset = SCALE_PRESETS[scale];
              const isSelected = orgScale === scale;
              return (
                <div
                  key={scale}
                  onClick={() => {
                    applyScalePreset(scale);
                    setShowScaleModal(false);
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition flex items-start gap-4 ${
                    isSelected
                      ? 'bg-indigo-950/50 border-indigo-500 shadow-md shadow-indigo-950/60'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-lg shrink-0">
                    {scale === 'micro' ? '🌱' : scale === 'growing' ? '🚀' : '🏢'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-white">{preset.title}</p>
                      {isSelected && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{preset.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 flex items-center justify-end">
            <button
              type="button"
              onClick={() => setShowScaleModal(false)}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
