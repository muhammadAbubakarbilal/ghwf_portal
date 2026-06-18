'use client';

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { UserRole } from '../types';
import { LogOut, Shield, GraduationCap, DownloadCloud, Menu } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  if (!user) return null;

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return (<span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-none bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono tracking-wide uppercase"><Shield className="w-3.5 h-3.5" />{t('role_super')}</span>);
      case UserRole.DOWNLOAD_ADMIN:
        return (<span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-none bg-amber-500/10 border border-amber-500/30 text-amber-500 font-mono tracking-wide uppercase"><DownloadCloud className="w-3.5 h-3.5" />{t('role_exporter')}</span>);
      case UserRole.MANAGING_ADMIN:
        return (<span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-none bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono tracking-wide uppercase"><Shield className="w-3.5 h-3.5" />{t('role_manager')}</span>);
      case UserRole.STUDENT:
        return (<span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-none bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-mono tracking-wide uppercase"><GraduationCap className="w-3.5 h-3.5" />{t('role_student')}</span>);
      default:
        return null;
    }
  };

  return (
    <header className="bg-[#16191E] border-b border-slate-800 px-4 sm:px-6 py-4 flex justify-between items-center no-print">
      <div className="flex items-center gap-2 sm:gap-4">
        <button onClick={onToggleSidebar} className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition focus:outline-none cursor-pointer" title="Open Menu"><Menu className="w-5 h-5 sm:w-6 sm:h-6" /></button>
        <div className="w-8 h-8 bg-indigo-500 rounded-sm rotate-45 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-indigo-500/20 hidden xs:flex" style={{ transform: 'rotate(45deg)' }}><span style={{ transform: 'rotate(-45deg)', display: 'block' }}>G</span></div>
        <div className="ml-1 sm:ml-3">
          <h2 className="text-xs sm:text-base font-bold text-white font-sans tracking-wider uppercase leading-snug">{t('portal_title')}</h2>
          <span className="text-[10px] sm:text-xs text-slate-500 font-sans leading-none block mt-0.5">{t('portal_subtitle')}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-sm font-semibold text-slate-200 leading-tight">{user.full_name}</span>
          <span className="text-xs text-slate-500 font-mono">{user.email}</span>
        </div>
        <div className="flex items-center gap-2 border-r pr-2 sm:pr-4 border-slate-800">
          <span className="hidden xs:inline-block">{getRoleBadge(user.role)}</span>
          <button onClick={logout} className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-950/25 rounded-none border border-transparent hover:border-red-900/40 transition-all duration-350 ml-1 cursor-pointer" title="Logout session"><LogOut className="w-4 h-4 sm:w-4.5 sm:h-4.5" /></button>
        </div>
      </div>
    </header>
  );
};
