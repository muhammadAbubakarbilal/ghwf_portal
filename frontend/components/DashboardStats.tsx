'use client';

import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Users, Lock, DownloadCloud, GraduationCap, School, Calendar } from 'lucide-react';

interface StatsProps {
  stats: {
    totalStudents: number;
    lockedCount: number;
    downloadedCount: number;
    byYear: Record<number, number>;
    byClass: Record<string, number>;
    bySchool: Array<{ school: string; count: number }>;
  } | null;
}

export const DashboardStats: React.FC<StatsProps> = ({ stats }) => {
  const { t } = useLanguage();
  if (!stats) {
    return (<div className="flex justify-center items-center h-64"><span className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-none animate-spin"></span></div>);
  }
  const classEntries = Object.entries(stats.byClass);
  const maxClassCount = classEntries.length > 0 ? Math.max(...classEntries.map(([_, count]) => Number(count))) : 1;
  const schoolEntries = stats.bySchool;
  const maxSchoolCount = schoolEntries.length > 0 ? Math.max(...schoolEntries.map(s => Number(s.count))) : 1;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#16191E] p-6 rounded-none border border-slate-800 relative overflow-hidden transition duration-150">
          <div className="absolute top-0 right-0 p-2 bg-emerald-500/10 text-emerald-500 text-[9px] font-bold tracking-widest font-mono">ACTIVE</div>
          <div className="space-y-2">
            <span className="text-[10px] text-slate-500 font-bold tracking-wider uppercase block">{t('stats_card_total')}</span>
            <span className="text-2xl font-mono text-white font-black block mt-2">{stats.totalStudents}</span>
          </div>
        </div>
        <div className="bg-[#16191E] p-6 rounded-none border border-slate-800 relative overflow-hidden transition duration-150">
          <div className="absolute top-0 right-0 p-2 bg-rose-500/10 text-rose-500 text-[9px] font-bold tracking-widest font-mono">LOCKED</div>
          <div className="space-y-2">
            <span className="text-[10px] text-slate-500 font-bold tracking-wider uppercase block">{t('stats_card_locked')}</span>
            <span className="text-2xl font-mono text-white font-black block mt-2">{stats.lockedCount}</span>
          </div>
        </div>
        <div className="bg-[#16191E] p-6 rounded-none border border-slate-800 relative overflow-hidden transition duration-150">
          <div className="absolute top-0 right-0 p-2 bg-amber-500/10 text-amber-500 text-[9px] font-bold tracking-widest font-mono">EXPORTED</div>
          <div className="space-y-2">
            <span className="text-[10px] text-slate-500 font-bold tracking-wider uppercase block">{t('stats_card_exported')}</span>
            <span className="text-2xl font-mono text-white font-black block mt-2">{stats.downloadedCount}</span>
          </div>
        </div>
        <div className="bg-[#16191E] p-6 rounded-none border border-slate-800 relative overflow-hidden transition duration-150">
          <div className="absolute top-0 right-0 p-2 bg-indigo-500/10 text-indigo-400 text-[9px] font-bold tracking-widest font-mono">PENDING</div>
          <div className="space-y-2">
            <span className="text-[10px] text-slate-500 font-bold tracking-wider uppercase block">{t('stats_card_pending')}</span>
            <span className="text-2xl font-mono text-white font-black block mt-2">{stats.totalStudents - stats.lockedCount}</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#16191E] p-8 rounded-none border border-slate-800">
          <div className="flex items-center gap-2 border-b border-slate-800/80 pb-4 mb-6"><GraduationCap className="w-5 h-5 text-indigo-400" /><h3 className="font-bold text-white text-sm uppercase tracking-wider">{t('class_dist')}</h3></div>
          {classEntries.length === 0 ? (<p className="text-slate-500 text-xs text-center py-12">{t('no_records')}</p>) : (<div className="space-y-4">{classEntries.map(([className, count]) => { const numericCount = Number(count); const percentage = Math.round((numericCount / maxClassCount) * 100); return (<div key={className} className="space-y-1.5 font-sans"><div className="flex justify-between text-xs font-semibold"><span className="text-slate-300">{className}</span><span className="font-mono text-slate-500">{t('students_count').replace('{count}', String(numericCount))} ({Math.round(numericCount / stats.totalStudents * 100)}%)</span></div><div className="w-full bg-[#0F1115] h-2 rounded-none overflow-hidden border border-slate-800/60"><div className="bg-indigo-500 h-full transition-all duration-1000" style={{ width: `${percentage}%` }}></div></div></div>); })}</div>)}
        </div>
        <div className="bg-[#16191E] p-8 rounded-none border border-slate-800">
          <div className="flex items-center gap-2 border-b border-slate-800/80 pb-4 mb-6"><School className="w-5 h-5 text-indigo-400" /><h3 className="font-bold text-white text-sm uppercase tracking-wider">{t('school_dist')}</h3></div>
          {schoolEntries.length === 0 ? (<p className="text-slate-500 text-xs text-center py-12">{t('no_records')}</p>) : (<div className="space-y-4">{schoolEntries.map((item, index) => { const percentage = Math.round((item.count / maxSchoolCount) * 100); return (<div key={item.school} className="space-y-1.5 font-sans"><div className="flex justify-between items-center text-xs font-semibold"><div className="flex items-center gap-2"><span className="w-5 h-5 bg-[#0F1115] border border-slate-800 rounded-none flex items-center justify-center font-mono text-[10px] text-slate-400">{index + 1}</span><span className="text-slate-300 truncate max-w-[200px] sm:max-w-xs">{item.school}</span></div><span className="font-mono text-slate-500">{t('students_count').replace('{count}', String(item.count))}</span></div><div className="w-full bg-[#0F1115] h-2 rounded-none overflow-hidden border border-slate-800/60"><div className="bg-indigo-400 opacity-80 h-full transition-all duration-1000" style={{ width: `${percentage}%` }}></div></div></div>); })}</div>)}
        </div>
      </div>
      <div className="bg-[#16191E] p-8 rounded-none border border-slate-800">
        <div className="flex items-center gap-2 border-b border-slate-800/80 pb-4 mb-4"><Calendar className="w-5 h-5 text-indigo-400" /><h3 className="font-bold text-white text-sm uppercase tracking-wider">{t('academic_sessions')}</h3></div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">{Object.entries(stats.byYear).map(([year, count]) => (<div key={year} className="bg-[#0F1115] p-4 rounded-none text-center border border-slate-800"><span className="text-slate-500 text-[10px] font-bold font-sans block">Session {year}</span><span className="text-base font-black text-white font-mono mt-1 block">{t('students_count').replace('{count}', String(count))}</span></div>))}</div>
      </div>
    </div>
  );
};
