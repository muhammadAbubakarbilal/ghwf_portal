'use client';

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { UserRole } from '../types';
import { LayoutDashboard, FileEdit, Printer, Users, TrendingUp, Download, Settings, ShieldAlert, LogOut, X } from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onChangeTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onChangeTab, isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  if (!user) return null;

  const isStudent = user.role === UserRole.STUDENT;
  const isSuper = user.role === UserRole.SUPER_ADMIN;
  const isExporter = user.role === UserRole.DOWNLOAD_ADMIN;

  const menuItems = [
    { id: 'student_dashboard', label: t('menu_dashboard'), icon: LayoutDashboard, visible: isStudent },
    { id: 'student_form', label: t('menu_form'), icon: FileEdit, visible: isStudent },
    { id: 'student_view', label: t('menu_print'), icon: Printer, visible: isStudent },
    { id: 'admin_dashboard', label: t('menu_stats'), icon: TrendingUp, visible: !isStudent },
    { id: 'admin_students', label: t('menu_registry'), icon: Users, visible: !isStudent },
    { id: 'admin_export', label: t('menu_export'), icon: Download, visible: isExporter || isSuper },
    { id: 'super_users', label: t('menu_users'), icon: ShieldAlert, visible: isSuper },
    { id: 'super_settings', label: t('menu_settings'), icon: Settings, visible: isSuper },
  ];

  const alignmentClass = `left-0 border-r border-slate-800 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`;
  const borderClass = 'border-l-4';
  const textAlignmentClass = 'text-left pl-3 pr-1';

  return (
    <>
      {isOpen && (<button aria-label="Close Overlay" className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-none cursor-pointer border-0" onClick={onClose} />)}
      <aside className={`w-68 bg-[#0F1115] text-slate-300 h-screen flex flex-col justify-between no-print fixed lg:sticky top-0 z-50 transform transition-transform duration-300 ease-in-out ${alignmentClass}`}>
        <div className="flex-1 flex flex-col py-6 overflow-y-auto">
          <div className="px-6 pb-6 border-b border-slate-800 mb-6 flex justify-between items-center">
            <div className="flex items-center gap-3 text-white">
              <div className="w-8 h-8 bg-indigo-500 rounded-sm rotate-45 flex items-center justify-center text-white" style={{ transform: 'rotate(45deg)' }}><div className="font-extrabold text-xs" style={{ transform: 'rotate(-45deg)' }}>G</div></div>
              <div className="flex flex-col ml-1">
                <span className="font-bold text-sm tracking-wide text-white">Gakkhar Foundation</span>
                <span className="text-[9px] text-slate-500 font-mono tracking-wider">FOUNDATION PORTAL</span>
              </div>
            </div>
            <button onClick={onClose} className="lg:hidden p-1.5 text-slate-500 hover:text-white hover:bg-slate-850 rounded-none transition cursor-pointer" title="Close Menu"><X className="w-5 h-5" /></button>
          </div>
          <nav className="flex-1 px-3 space-y-2">
            {menuItems.filter(item => item.visible).map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button key={item.id} onClick={() => { onChangeTab(item.id); onClose(); }} className={`w-full flex items-center justify-between px-4 py-3 rounded-none text-sm font-semibold transition-all duration-200 ${borderClass} ${isActive ? 'bg-slate-800/50 text-white border-indigo-500' : 'hover:bg-slate-800/30 hover:text-white text-slate-400 border-transparent'}`}>
                  <Icon className={`w-4 h-5 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                  <span className={`font-sans leading-none flex-1 text-xs uppercase tracking-wider ${textAlignmentClass}`}>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
        <div className="p-4 border-t border-slate-800">
          <button onClick={() => { logout(); onClose(); }} className={`w-full flex items-center justify-between px-4 py-3 rounded-none text-sm font-semibold hover:bg-rose-950/20 hover:text-rose-400 text-slate-400 transition-all duration-200 ${borderClass} border-transparent hover:border-rose-500 group cursor-pointer`} title="Logout system">
            <LogOut className="w-4 h-5 text-slate-500 group-hover:text-rose-400" />
            <span className={`font-sans leading-none flex-1 text-xs uppercase tracking-wider ${textAlignmentClass}`}>{t('menu_logout')}</span>
          </button>
        </div>
      </aside>
    </>
  );
};
