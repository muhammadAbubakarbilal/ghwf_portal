'use client';

import React from 'react';
import { AuditLog } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { Calendar, FileBarChart2, Filter, User } from 'lucide-react';

interface AuditLogTableProps {
  logs: AuditLog[];
}

export const AuditLogTable: React.FC<AuditLogTableProps> = ({ logs }) => {
  const { t } = useLanguage();

  const getFilterString = (meta: Record<string, any>) => {
    const filters = meta.filters || {};
    const parts = [];
    if (filters.search) parts.push(`Search: "${filters.search}"`);
    if (filters.year) parts.push(`Year: ${filters.year}`);
    if (filters.className) parts.push(`Class: ${filters.className}`);
    if (filters.schoolName) parts.push(`School: "${filters.schoolName}"`);
    if (filters.district) parts.push(`District: "${filters.district}"`);
    return parts.length > 0 ? parts.join(' | ') : t('filter_none');
  };

  return (
    <div className="bg-[#16191E] rounded-none border border-slate-800 overflow-hidden">
      <div className="px-6 py-5 bg-[#0F1115] border-b border-slate-800 flex items-center gap-2 flex-row justify-start">
        <FileBarChart2 className="w-5 h-5 text-indigo-400 font-sans" />
        <h3 className="font-extrabold text-white text-base">{t('audit_log_title')}</h3>
      </div>
      <div className="overflow-x-auto">
        {logs.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm font-sans">No exports have been recorded yet.</div>
        ) : (
          <table className="w-full text-sm border-collapse text-left">
            <thead>
              <tr className="bg-[#0F1115]/50 text-slate-400 border-b border-slate-800 text-xs font-bold font-sans">
                <th className="py-4 px-6">{t('col_actor')}</th>
                <th className="py-4 px-6">{t('col_format')}</th>
                <th className="py-4 px-6">{t('col_count')}</th>
                <th className="py-4 px-6">{t('col_filters')}</th>
                <th className="py-4 px-6 text-left">{t('col_time')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/20 transition duration-150">
                  <td className="py-4 px-6 font-semibold text-slate-200"><div className="flex items-center gap-2"><User className="w-4 h-4 text-slate-500" /><span>{log.actor_name}</span></div></td>
                  <td className="py-4 px-6"><span className="inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-none bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono tracking-wider">{log.action === 'EXPORT_EXCEL' ? 'XLSX (Microsoft Excel)' : 'PDF Forms Document'}</span></td>
                  <td className="py-4 px-6 font-bold font-mono text-indigo-400">{log.metadata.count || 0} Records</td>
                  <td className="py-4 px-6 text-xs text-slate-400 font-sans max-w-sm truncate" title={getFilterString(log.metadata)}><div className="flex items-center gap-1"><Filter className="w-3.5 h-3.5 text-slate-600" /><span>{getFilterString(log.metadata)}</span></div></td>
                  <td className="py-4 px-6 text-xs text-slate-500 font-mono"><div className="flex items-center gap-1.5 justify-start"><Calendar className="w-3.5 h-3.5 text-slate-600" /><span>{new Date(log.created_at).toLocaleString('en-US')}</span></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
