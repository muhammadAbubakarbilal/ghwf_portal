import React from 'react';

interface LoadingOverlayProps {
  message?: string;
  subtext?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  message = 'Preparing your portal experience...',
  subtext = 'Connecting securely and loading your dashboard data.',
}) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div className="relative max-w-xl w-full rounded-[2rem] border border-white/10 bg-slate-900/95 shadow-2xl shadow-slate-950/50 backdrop-blur-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-sky-400/10" />
        <div className="relative p-10 text-center">
          <div className="mx-auto mb-8 w-28 h-28 rounded-full border-4 border-slate-800 border-t-transparent bg-slate-950/80 shadow-inner shadow-slate-950/50 animate-spin" />
          <div className="space-y-3">
            <p className="text-xl font-semibold tracking-tight text-slate-100">{message}</p>
            <p className="text-sm text-slate-400 leading-relaxed">{subtext}</p>
          </div>
          <div className="mt-10 flex items-center justify-center gap-3 text-[11px] uppercase tracking-[0.3em] text-slate-500">
            <span className="inline-flex h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
            <span>Optimizing your session</span>
          </div>
        </div>
      </div>
    </div>
  );
};
