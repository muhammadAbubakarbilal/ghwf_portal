'use client';

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { LanguageProvider, useLanguage } from '../context/LanguageContext';
import { UserRole, Gender, StudentForm, SystemSettings, AuditLog } from '../types';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { PrintTemplate } from './PrintTemplate';
import { StudentFormEditor } from './StudentFormEditor';
import { DashboardStats } from './DashboardStats';
import { AuditLogTable } from './AuditLogTable';
import { Users, Lock, FileText, CheckCircle2, AlertTriangle, Printer, DownloadCloud, Calendar, RotateCcw, Plus, Trash2, ShieldAlert, Sliders, ToggleLeft, ToggleRight, Eye, RefreshCw, Filter, Search, ChevronLeft, ChevronRight, FileSpreadsheet } from 'lucide-react';

function MainAppContent() {
  const { user, token, loading, login, register, logout } = useAuth();
  const { language, setLanguage, t, isUrdu } = useLanguage();
  const [currentTab, setCurrentTab] = useState<string>('student_dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [autoLoggedOut, setAutoLoggedOut] = useState(false);
  const [showLandingPage, setShowLandingPage] = useState(true);
  const [landingSlide, setLandingSlide] = useState(0);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authFullName, setAuthFullName] = useState('');
  const [authConfirmPass, setAuthConfirmPass] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [studentForm, setStudentForm] = useState<StudentForm | null>(null);
  const [studentFormStatus, setStudentFormStatus] = useState<any>(null);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [studentsList, setStudentsList] = useState<StudentForm[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterYear, setFilterYear] = useState<string>('');
  const [filterClass, setFilterClass] = useState<string>('');
  const [filterSchool, setFilterSchool] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [activeStudentDetail, setActiveStudentDetail] = useState<StudentForm | null>(null);
  const [configStart, setConfigStart] = useState('');
  const [configEnd, setConfigEnd] = useState('');
  const [configYear, setConfigYear] = useState('');
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [settingsSuccess, setSettingsSuccess] = useState<string | null>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPass, setNewAdminPass] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<UserRole>(UserRole.MANAGING_ADMIN);
  const [adminCreateError, setAdminCreateError] = useState<string | null>(null);
  const [adminCreateSuccess, setAdminCreateSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    if (user.role === UserRole.STUDENT) {
      setCurrentTab('student_dashboard');
      loadStudentData();
    } else {
      setCurrentTab('admin_dashboard');
      loadAdminStats();
      loadPatientsGrid();
      loadSystemSettings();
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    if (currentTab === 'admin_dashboard') loadAdminStats();
    if (currentTab === 'admin_export') loadAuditHistory();
    if (currentTab === 'super_users') loadUserManagement();
  }, [currentTab, user]);

  useEffect(() => {
    if (!user || user.role === UserRole.STUDENT) return;
    loadPatientsGrid();
  }, [page, filterYear, filterClass, searchQuery, filterSchool, filterDistrict, user]);

  useEffect(() => {
    if (!user) return;
    let inactivityTimeout: NodeJS.Timeout;
    const timeoutMs = 15 * 60 * 1000;
    const resetTimer = () => {
      if (inactivityTimeout) clearTimeout(inactivityTimeout);
      inactivityTimeout = setTimeout(() => {
        logout().then(() => setAutoLoggedOut(true)).catch(() => {});
      }, timeoutMs);
    };
    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click', 'keypress'];
    activityEvents.forEach(evt => window.addEventListener(evt, resetTimer, { passive: true }));
    resetTimer();
    return () => {
      clearTimeout(inactivityTimeout);
      activityEvents.forEach(evt => window.removeEventListener(evt, resetTimer));
    };
  }, [user, logout]);

  useEffect(() => {
    if (!user) {
      setShowLandingPage(true);
      setIsRegisterMode(false);
    } else {
      setShowLandingPage(false);
    }
  }, [user]);

  useEffect(() => {
    if (authEmail || authPassword) setAutoLoggedOut(false);
  }, [authEmail, authPassword]);

  const handleStartAuth = (mode: 'login' | 'register') => {
    setIsRegisterMode(mode === 'register');
    setShowLandingPage(false);
    setAuthError(null);
    setAuthSuccess(null);
  };

  const handleReturnToLanding = () => {
    setShowLandingPage(true);
    setAuthError(null);
    setAuthSuccess(null);
    setIsRegisterMode(false);
  };

  const loadStudentData = async () => {
    if (!token) return;
    try {
      const formRes = await fetch('/api/v1/student/form', { headers: { Authorization: `Bearer ${token}` } });
      if (formRes.ok) {
        const formData = await formRes.json();
        setStudentForm(formData.form);
      }
      const statusRes = await fetch('/api/v1/student/form/status', { headers: { Authorization: `Bearer ${token}` } });
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setStudentFormStatus(statusData);
      }
    } catch (e) {
      console.error('Error fetching student core structures:', e);
    }
  };

  const loadSystemSettings = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/v1/settings', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setSystemSettings(data.settings);
        setConfigStart(data.settings.download_window_start);
        setConfigEnd(data.settings.download_window_end);
        setConfigYear(String(data.settings.current_academic_year));
      }
    } catch (e) {
      console.error('Error loading settings Room:', e);
    }
  };

  const loadAdminStats = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/v1/admin/stats', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setAdminStats(data);
      }
    } catch (e) {
      console.error('Failed statistical tracking:', e);
    }
  };

  const loadPatientsGrid = async () => {
    if (!token) return;
    try {
      const queryParams = new URLSearchParams({ page: String(page), search: searchQuery, year: filterYear, class_name: filterClass, school_name: filterSchool, district: filterDistrict });
      const res = await fetch(`/api/v1/admin/students?${queryParams.toString()}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setStudentsList(data.students);
        setTotalPages(data.totalPages);
        setTotalRecords(data.total);
      }
    } catch (e) {
      console.error('Error compiled grid loading:', e);
    }
  };

  const loadAuditHistory = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/v1/export/logs', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data.logs);
      }
    } catch (e) {
      console.error('Error load exporters:', e);
    }
  };

  const loadUserManagement = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/v1/super-admin/users', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setUsersList(data.users);
      }
    } catch (e) {
      console.error('Error load admins roster:', e);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    setAutoLoggedOut(false);
    if (!authEmail.trim() || !authPassword) {
      setAuthError('Please fill out all fields correctly.');
      return;
    }
    try {
      if (isRegisterMode) {
        if (!authFullName.trim()) {
          setAuthError('Student full name is required.');
          return;
        }
        if (authPassword !== authConfirmPass) {
          setAuthError('Passwords do not match.');
          return;
        }
        await register(authEmail, authPassword, authFullName);
        setAuthSuccess('Registration completed successfully! Welcome to the portal.');
      } else {
        await login(authEmail, authPassword);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed. Please try again.');
    }
  };

  const triggerSelfDownload = async () => {
    if (!token || !studentForm) return;
    try {
      const res = await fetch('/api/v1/student/form/download', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'The download action could not be initialized.');
        return;
      }
      alert('Success! Download window permission has been verified. You may now print your registration form.');
      await loadStudentData();
      setCurrentTab('student_view');
    } catch (e) {
      alert('A network error occurred.');
    }
  };

  const triggerExcelExport = async () => {
    if (!token) return;
    const queryParams = new URLSearchParams({ search: searchQuery, year: filterYear, class_name: filterClass, school_name: filterSchool, district: filterDistrict });
    try {
      const response = await fetch(`/api/v1/export/excel?${queryParams.toString()}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) {
        const err = await response.json();
        alert(err.error || 'Excel export failed.');
        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Sponsored_Students_Export_${new Date().getFullYear()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      loadAuditHistory();
    } catch (e) {
      alert('Failed to download the Excel file.');
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsError(null);
    setSettingsSuccess(null);
    try {
      const res = await fetch('/api/v1/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ download_window_start: configStart, download_window_end: configEnd, current_academic_year: parseInt(configYear) }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update settings.');
      setSettingsSuccess('Portal configurations successfully updated and saved.');
      setSystemSettings(data.settings);
    } catch (err: any) {
      setSettingsError(err.message);
    }
  };

  const triggerSequenceReset = async () => {
    const confirmReset = window.confirm('Are you sure you want to reset the registration sequence number back to zero? New registrations will start from GHWF-YEAR-0001.');
    if (!confirmReset) return;
    try {
      const res = await fetch('/api/v1/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ reset_sequence: true }) });
      if (res.ok) alert('Registration number sequence has been successfully reset.');
    } catch (e) {
      alert('Process failed.');
    }
  };

  const handleAdminRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminCreateError(null);
    setAdminCreateSuccess(null);
    if (!newAdminEmail.trim() || !newAdminPass || !newAdminName.trim() || !newAdminRole) {
      setAdminCreateError('Please provide all details.');
      return;
    }
    try {
      const res = await fetch('/api/v1/super-admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ email: newAdminEmail, password: newAdminPass, full_name: newAdminName, role: newAdminRole }) });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Admin creation failed.');
      }
      setAdminCreateSuccess('New administrative profile has been successfully registered.');
      setNewAdminEmail('');
      setNewAdminPass('');
      setNewAdminName('');
      loadUserManagement();
    } catch (err: any) {
      setAdminCreateError(err.message);
    }
  };

  const toggleUserActive = async (targetId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/v1/super-admin/users/${targetId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ is_active: !currentStatus }) });
      if (res.ok) loadUserManagement();
    } catch (e) {
      alert('Failed to update blocking status.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1115] flex flex-col justify-center items-center px-6 py-12">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="relative flex items-center justify-center h-24 w-24 rounded-full bg-slate-900/90 shadow-2xl shadow-slate-950/30 border border-slate-800">
            <div className="absolute inset-0 rounded-full border-4 border-slate-800" />
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
            <div className="absolute inset-5 rounded-full bg-[#0F1115]" />
            <div className="relative text-[11px] uppercase tracking-[0.35em] text-slate-400">Loading</div>
          </div>
          <div className="max-w-md">
            <p className="text-base sm:text-lg font-semibold text-slate-100 tracking-tight">Loading your GHWF registration portal...</p>
            <p className="mt-3 text-sm text-slate-400">One moment while we retrieve your secure profile and portal settings.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0s' }} />
            <span className="h-2.5 w-2.5 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '0.15s' }} />
            <span className="h-2.5 w-2.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0.3s' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return showLandingPage ? (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-emerald-300 font-semibold">GHWF</p>
              <h1 className="text-base font-black tracking-tight">Student Registration Portal</h1>
            </div>
            <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
              <a href="#home" className="hover:text-white">Home</a>
              <a href="#about" className="hover:text-white">About</a>
              <a href="#empower" className="hover:text-white">Empowerment</a>
              <a href="#eligibility" className="hover:text-white">Eligibility</a>
              <a href="#contact" className="hover:text-white">Contact</a>
            </nav>
            <div className="flex gap-3">
              <button onClick={() => handleStartAuth('login')} className="rounded-none border border-emerald-400 bg-emerald-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300 hover:bg-emerald-400/20">Login</button>
              <button onClick={() => handleStartAuth('register')} className="rounded-none bg-emerald-400 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-950 hover:bg-emerald-300">Sign Up</button>
            </div>
          </div>
        </header>

        <main id="home" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <section className="grid gap-10 lg:grid-cols-[1.2fr_0.9fr] items-center">
            <div className="space-y-6">
              <div className="inline-flex rounded-none border border-emerald-500/20 bg-emerald-500/10 px-4 py-1 text-xs uppercase tracking-[0.35em] text-emerald-300">GHWF Sponsorship</div>
              <h2 className="text-4xl font-black tracking-tight text-white sm:text-5xl">Register students for GHWF sponsorship — secure, official, and community-led.</h2>
              <p className="max-w-2xl text-slate-400 text-base leading-8">The Gakkhar Heritage & Welfare Foundation portal helps students, sponsors, and foundation staff manage registration, verify support, and access approved documentation in a secure digital workflow.</p>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => handleStartAuth('register')} className="rounded-none bg-emerald-400 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-950 hover:bg-emerald-300">Register now</button>
                <button onClick={() => handleStartAuth('login')} className="rounded-none border border-slate-700 bg-slate-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-100 hover:bg-slate-800">Login to portal</button>
              </div>
            </div>
            <div className="rounded-none border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-8">
              <div className="grid gap-4">
                <div className="rounded-none border border-slate-800 bg-slate-900 p-6">
                  <p className="text-sm uppercase tracking-[0.35em] text-emerald-300">Trusted by GHWF</p>
                  <h3 className="mt-3 text-2xl font-bold text-white">Designed for student sponsorship and verified enrollment.</h3>
                  <p className="mt-3 text-slate-400 text-sm leading-6">A simple portal for submitting forms, tracking approval, and downloading the official registration document once the window opens.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-none border border-slate-800 bg-slate-900 p-5">
                    <p className="text-sm font-semibold text-white">Active Enrollment</p>
                    <p className="mt-2 text-slate-400 text-xs leading-5">Monitor registration and download windows at a glance.</p>
                  </div>
                  <div className="rounded-none border border-slate-800 bg-slate-900 p-5">
                    <p className="text-sm font-semibold text-white">Secure Access</p>
                    <p className="mt-2 text-slate-400 text-xs leading-5">Login protected by portal session security.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="about" className="mt-16 rounded-none border border-slate-800 bg-slate-900 p-8">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_0.7fr]">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-emerald-300">About GHWF</p>
                <h3 className="mt-4 text-2xl font-bold text-white">Supporting student education through transparent sponsorship.</h3>
                <p className="mt-4 text-slate-400 leading-7">Gakkhar Heritage & Welfare Foundation connects deserving students with verified sponsors. This portal makes the registration process traceable, reduces paperwork, and ensures approved records remain accessible.</p>
              </div>
              <div className="space-y-4 rounded-none border border-slate-800 bg-slate-950 p-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Foundation message</p>
                  <p className="mt-3 text-slate-300 text-sm leading-6">“We are committed to empowering competitive students by making registration fair, secure, and easy to manage for students, sponsors, and staff.”</p>
                </div>
                <div className="rounded-none border border-slate-800 bg-slate-900 p-4">
                  <p className="text-sm font-semibold text-white">Why this portal?</p>
                  <ul className="mt-3 space-y-2 text-slate-400 text-sm">
                    <li>• One portal for registration, sponsorship status, and form downloads.</li>
                    <li>• Verified student and sponsor data for GHWF oversight.</li>
                    <li>• Clear tracking of active download windows and approvals.</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section id="empower" className="mt-16 grid gap-6 lg:grid-cols-3">
            <div className="rounded-none border border-slate-800 bg-slate-900 p-6">
              <p className="text-xs uppercase tracking-[0.35em] text-emerald-300">Empowerment</p>
              <h4 className="mt-3 text-xl font-bold text-white">Empowering competitive students</h4>
              <p className="mt-3 text-slate-400 text-sm leading-6">GHWF serves students who demonstrate need and merit, ensuring that sponsorship and enrollment records are managed with dignity and accuracy.</p>
            </div>
            <div className="rounded-none border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-300">Focus areas</p>
              <ul className="mt-4 space-y-3 text-slate-400 text-sm">
                <li>• Registration record accuracy</li>
                <li>• Sponsor verification</li>
                <li>• Student status monitoring</li>
              </ul>
            </div>
            <div className="rounded-none border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-300">Portal value</p>
              <ul className="mt-4 space-y-3 text-slate-400 text-sm">
                <li>• Official registration form management</li>
                <li>• Secure sponsor-student pairing</li>
                <li>• Clear download window compliance</li>
              </ul>
            </div>
          </section>

          <section id="eligibility" className="mt-16 rounded-none border border-slate-800 bg-slate-950 p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-emerald-300">Eligibility criteria</p>
                <h3 className="mt-3 text-2xl font-bold text-white">Who can register?</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                <span className="rounded-none border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs uppercase tracking-[0.25em] text-emerald-300">Students</span>
                <span className="rounded-none border border-slate-700 bg-slate-900 px-4 py-2 text-xs uppercase tracking-[0.25em] text-slate-300">Sponsors</span>
              </div>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-none border border-slate-800 bg-slate-900 p-5">
                <p className="font-semibold text-white">Student criteria</p>
                <ul className="mt-3 space-y-2 text-slate-400 text-sm">
                  <li>• Enrolled or applying for GHWF sponsorship</li>
                  <li>• Meets foundation support requirements</li>
                  <li>• Requires official registration documentation</li>
                </ul>
              </div>
              <div className="rounded-none border border-slate-800 bg-slate-900 p-5">
                <p className="font-semibold text-white">Sponsor criteria</p>
                <ul className="mt-3 space-y-2 text-slate-400 text-sm">
                  <li>• Provides verified support for the student</li>
                  <li>• Confirms sponsorship details in portal</li>
                  <li>• Helps maintain updated student records</li>
                </ul>
              </div>
              <div className="rounded-none border border-slate-800 bg-slate-900 p-5">
                <p className="font-semibold text-white">Foundation rules</p>
                <ul className="mt-3 space-y-2 text-slate-400 text-sm">
                  <li>• Form downloads only during active periods</li>
                  <li>• GHWF verification is required</li>
                  <li>• Data must be complete and accurate</li>
                </ul>
              </div>
            </div>
          </section>

          <section id="contact" className="mt-16 rounded-none border border-slate-800 bg-slate-900 p-8">
            <div className="grid gap-8 lg:grid-cols-[1fr_0.7fr] items-start">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-emerald-300">Contact</p>
                <h3 className="mt-4 text-2xl font-bold text-white">Need support or have a question?</h3>
                <p className="mt-4 text-slate-400 leading-7">Contact GHWF administrative support for registration guidance, sponsorship verification, or portal assistance.</p>
              </div>
              <div className="rounded-none border border-slate-800 bg-slate-950 p-6">
                <p className="text-sm font-semibold text-white">GHWF Support</p>
                <p className="mt-4 text-slate-400 text-sm">Phone: 042-XXX-XXXX</p>
                <p className="mt-2 text-slate-400 text-sm">Email: info@ghwf.org</p>
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t border-slate-800 bg-slate-900/95 py-6">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <p>© {new Date().getFullYear()} Gakkhar Heritage & Welfare Foundation</p>
            <div className="flex flex-wrap gap-3">
              <a href="#home" className="hover:text-white">Home</a>
              <a href="#about" className="hover:text-white">About</a>
              <a href="#eligibility" className="hover:text-white">Eligibility</a>
            </div>
          </div>
        </footer>
      </div>
    ) : (
      <div className="min-h-screen bg-[#0F1115] flex items-center justify-center p-4 sm:p-6 border-2 sm:border-8 border-[#1A1D23] relative">
        <div className="bg-[#16191E] rounded-none overflow-hidden shadow-2xl max-w-lg w-full border border-slate-800 relative">
          <div className="bg-[#0F1115] p-8 text-white text-center border-b border-slate-800 relative">
            <h1 className="text-xl sm:text-2xl font-black font-sans leading-snug tracking-wider text-slate-100">Gakkhar Heritage & Welfare Foundation</h1>
            <p className="text-xs text-slate-500 mt-2 font-mono uppercase tracking-widest leading-relaxed">GP - STUDENT REGISTRATION PORTAL</p>
          </div>
          <form onSubmit={handleAuthSubmit} className="p-8 space-y-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-bold text-slate-400 border-b border-slate-800/60 pb-3 uppercase tracking-widest font-mono">{isRegisterMode ? 'CREATE STUDENT PROFILE' : 'SECURE PORTAL ACCESS'}</h2>
              <button type="button" onClick={handleReturnToLanding} className="text-xs uppercase tracking-wider text-indigo-400 font-bold hover:text-white transition">Back to home</button>
            </div>
            {autoLoggedOut && (
              <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-none">
                <div className="flex gap-2.5 items-start">
                  <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <h4 className="text-amber-300 font-bold text-xs leading-none">Auto Security Timeout</h4>
                    <p className="text-slate-400 text-[11px] leading-relaxed mt-1.5 font-sans">For security purposes, you have been auto-logged out due to 15 minutes of inactivity. Please reauthenticate to access student registry.</p>
                  </div>
                </div>
              </div>
            )}
            {authError && (
              <div className="bg-rose-950/20 border-r-4 border-rose-600 p-3.5 rounded-none flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <span className="text-rose-200 font-bold text-xs">{authError}</span>
              </div>
            )}
            {authSuccess && (
              <div className="bg-emerald-950/20 border-r-4 border-emerald-600 p-3.5 rounded-none flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span className="text-emerald-200 font-bold text-xs">{authSuccess}</span>
              </div>
            )}
            {isRegisterMode && (
              <div>
                <label className="block text-slate-500 text-xs font-bold mb-1.5">Student Full Name *</label>
                <input type="text" required value={authFullName} onChange={(e) => setAuthFullName(e.target.value)} placeholder="John Doe" className="w-full px-4 py-2.5 bg-[#0F1115] border border-slate-800 text-slate-100 rounded-none text-sm placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50" />
              </div>
            )}
            <div>
              <label className="block text-slate-500 text-xs font-bold mb-1.5">Email Address *</label>
              <input type="email" required value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} placeholder="ali@example.com" className="w-full px-4 py-2.5 bg-[#0F1115] border border-slate-800 text-slate-100 rounded-none text-sm text-left font-sans placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50" />
            </div>
            <div>
              <label className="block text-slate-500 text-xs font-bold mb-1.5">Security Password *</label>
              <input type="password" required value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} placeholder="Password" className="w-full px-4 py-2.5 bg-[#0F1115] border border-slate-800 text-slate-100 rounded-none text-sm text-left placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50" />
            </div>
            {isRegisterMode && (
              <div>
                <label className="block text-slate-500 text-xs font-bold mb-1.5">Confirm Password *</label>
                <input type="password" required value={authConfirmPass} onChange={(e) => setAuthConfirmPass(e.target.value)} placeholder="Password confirmation" className="w-full px-4 py-2.5 bg-[#0F1115] border border-slate-800 text-slate-100 rounded-none text-sm text-left placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50" />
              </div>
            )}
            <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-none shadow-lg shadow-indigo-500/20 cursor-pointer transition duration-150 active:translate-y-[1px] mt-2 font-mono text-xs uppercase tracking-widest">{isRegisterMode ? 'COMPLETE REGISTRATION' : 'AUTHORIZE INGRESS'}</button>
            <div className="pt-4 border-t border-slate-850 text-center text-xs">
              {isRegisterMode ? (
                <p className="text-slate-500">Already have an account?{' '}
                  <button type="button" onClick={() => { setIsRegisterMode(false); setAuthError(null); }} className="text-indigo-400 font-bold hover:underline cursor-pointer">Sign in here.</button>
                </p>
              ) : (
                <p className="text-slate-500">Are you a new student?{' '}
                  <button type="button" onClick={() => { setIsRegisterMode(true); setAuthError(null); }} className="text-indigo-400 font-bold hover:underline cursor-pointer">Create profile here.</button>
                </p>
              )}
            </div>
          </form>
          {!isRegisterMode && (
            <div className="px-8 pb-8">
              <div className="bg-[#0F1115] p-4 border border-slate-800 rounded-none">
                <span className="text-[9px] font-bold text-indigo-400 tracking-wider block mb-2 font-mono">DEMO ACCESS CREDS (DEVELOPER EVALUATION):</span>
                <div className="space-y-1.5 text-[11px] text-slate-400 font-mono">
                  <div>🔐 Super: <span className="font-bold text-slate-200">superadmin@ghwf.org</span> / admin123</div>
                  <div>🔐 Managing: <span className="font-bold text-slate-200">manager@ghwf.org</span> / password123</div>
                  <div>🔐 Exporter: <span className="font-bold text-slate-200">exporter@ghwf.org</span> / password123</div>
                </div>
              </div>
            </div>
          )}
          <div className="bg-[#0F1115] p-4 border-t border-slate-800 text-center text-[10px] text-slate-600 font-mono tracking-wider">GAKKHAR HERITAGE © {new Date().getFullYear()} — SYSTEM SECURED</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1115] text-slate-300 flex border-2 md:border-8 border-[#1A1D23] selection:bg-indigo-500/30 selection:text-white">
      <Sidebar currentTab={currentTab} onChangeTab={setCurrentTab} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 sm:py-8">
          {currentTab === 'student_dashboard' && (
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="bg-[#16191E] p-8 rounded-none border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white font-sans">Welcome back, {user.full_name}!</h1>
                  <p className="text-slate-500 text-xs font-sans mt-0.5">Welcome to the Gakkhar Heritage & Welfare Foundation sponsorship services portal.</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setCurrentTab('student_form')} className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-none transition cursor-pointer font-sans tracking-wide">Fill Out / Edit Form</button>
                  <button onClick={() => setCurrentTab('student_view')} className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-none border border-slate-700 transition cursor-pointer font-sans tracking-wide">Print Your Form</button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-[#16191E] p-8 rounded-none border border-slate-800 space-y-4">
                  <h3 className="font-bold text-white text-base border-b pb-3 border-slate-800/80 font-sans">Registration Submission Status</h3>
                  {!studentForm ? (
                    <div className="text-center py-6 space-y-3">
                      <div className="inline-flex w-10 h-10 rounded-none bg-amber-500/10 border border-amber-500/30 text-amber-500 items-center justify-center font-bold font-mono">!</div>
                      <p className="text-amber-400 font-bold font-sans">You have not submitted a registration form yet.</p>
                      <button onClick={() => setCurrentTab('student_form')} className="text-xs font-bold text-indigo-400 underline hover:text-indigo-300 cursor-pointer">Click here to start filling your registration form.</button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center bg-emerald-500/10 p-4 border border-emerald-500/30">
                        <span className="text-emerald-400 font-bold text-sm font-sans">{studentFormStatus?.edit_locked ? 'Form submitted & locked' : 'Successfully submitted (Open for edits)'}</span>
                        <span className={`w-3 h-3 rounded-none ${studentFormStatus?.edit_locked ? 'bg-slate-600' : 'bg-emerald-500 animate-pulse'}`}></span>
                      </div>
                      <div className="space-y-2.5 text-xs font-sans text-slate-400">
                        <div>📝 <span className="font-semibold text-slate-400">Registration ID:</span> <span className="font-mono bg-[#0F1115] text-indigo-400 border border-slate-800 font-semibold px-2 py-0.5 rounded-none text-[11px]">{studentForm.registration_number}</span></div>
                        <div>📅 <span className="font-semibold">Submission Date/Time:</span> <span className="font-mono bg-[#0F1115] px-2 py-0.5 border border-slate-800 text-slate-400 rounded-none text-[11px]">{new Date(studentForm.submitted_at || '').toLocaleString('en-US')}</span></div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="bg-[#16191E] p-8 rounded-none border border-slate-800 space-y-4">
                  <h3 className="font-bold text-white text-base border-b pb-3 border-slate-800/80 font-sans">Get Form Download</h3>
                  {!studentForm ? (
                    <p className="text-slate-500 text-xs text-center py-8">Please complete and submit your registration form first.</p>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-xs text-slate-400 leading-relaxed font-sans">According to Foundation policy, students can download their official registration form only once during the designated annual window.</p>
                      <div className="bg-[#0F1115] p-4 rounded-none border border-slate-800 text-xs font-mono text-slate-400 space-y-1">
                        <div>📅 Download Window Start: <span className="font-bold text-slate-300">{studentFormStatus?.download_window_start || 'N/A'}</span></div>
                        <div>📅 Download Window End: <span className="font-bold text-slate-300">{studentFormStatus?.download_window_end || 'N/A'}</span></div>
                      </div>
                      {studentFormStatus?.download_window_active ? (studentForm.downloaded_by_student ? (
                        <div className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 p-3.5 rounded-none text-xs font-sans">You have already downloaded your registration form. If you need physical prints, please print directly from the sidebar print utility.</div>
                      ) : (
                        <button onClick={triggerSelfDownload} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-none flex items-center justify-center gap-2 transition cursor-pointer"><DownloadCloud className="w-4 h-4" /><span>Download Registry Form PDF</span></button>
                      )) : (
                        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-500 p-3.5 rounded-none text-xs font-sans">The download window is currently inactive. The official download button will be enabled during the active schedule.</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentTab === 'student_form' && (<StudentFormEditor form={studentForm} status={studentFormStatus} onFormSubmitted={(savedForm) => { setStudentForm(savedForm); loadStudentData(); }} onRefreshStatus={loadStudentData} />)}

          {currentTab === 'student_view' && (<div className="max-w-4xl mx-auto space-y-6">{!studentForm ? (<div className="bg-[#16191E] p-12 text-center rounded-none border border-slate-800"><p className="text-slate-400 font-bold text-base font-sans">Please submit your registration form first to preview the print layout.</p></div>) : (<><div className="bg-[#16191E] border border-slate-800 rounded-none p-4 flex flex-col sm:flex-row gap-4 items-center justify-between no-print"><span className="text-xs font-bold text-slate-400 font-sans">This is the candidate's official registration record. Click 'Print Form' to trigger the browser's PDF/Print layout context.</span><button onClick={() => window.print()} className="px-6 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 font-bold rounded-none flex items-center gap-2 cursor-pointer transition h-11 text-xs font-mono uppercase tracking-wider"><Printer className="w-4.5 h-5" /><span>Print Form (PDF/Paper)</span></button></div><PrintTemplate form={studentForm} /></> )}</div>)}

          {currentTab === 'admin_dashboard' && (<div className="max-w-5xl mx-auto space-y-8"><div className="flex justify-between items-center pb-4 border-b border-slate-800"><div><h1 className="text-xl md:text-2xl font-black text-white font-sans">Institutional Reporting Deck</h1><p className="text-slate-400 text-xs font-sans mt-0.5">Provides monitoring analytics and annual sponsorship distribution insights.</p></div><button onClick={loadAdminStats} className="p-2 border border-slate-800 hover:bg-slate-800 text-slate-400 bg-[#16191E] rounded-none transition" title="Refresh analytics reports"><RefreshCw className="w-4.5 h-4.5" /></button></div><DashboardStats stats={adminStats} /></div>)}

          {currentTab === 'admin_students' && (<div className="max-w-6xl mx-auto space-y-6"><div className="bg-[#16191E] p-6 rounded-none border border-slate-800 shadow-2xl flex flex-col gap-6 no-print"><div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800/80 pb-4 mb-1"><div><h2 className="text-white font-extrabold text-base font-sans uppercase tracking-wider">Candidate Registry Search</h2><p className="text-slate-400 text-xs font-sans mt-0.5">Filter through candidate profiles and retrieve details below.</p></div><span className="font-mono text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 px-3 py-1.5 rounded-none font-bold">Total Registered Records: {totalRecords}</span></div><div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4"><div className="relative"><Search className="w-4 h-4 text-slate-500 absolute right-3.5 top-3.5" /><input type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }} placeholder="Search name, parentage, registration..." className="w-full pr-10 pl-4 py-2 bg-[#0F1115] border border-slate-800 rounded-none text-xs text-slate-100 placeholder:text-slate-500 h-11 focus:outline-none focus:border-indigo-500 transition" /></div><div><select value={filterYear} onChange={(e) => { setFilterYear(e.target.value); setPage(1); }} className="w-full px-4 py-2 bg-[#0F1115] border border-slate-800 rounded-none text-xs text-slate-200 h-11 font-sans focus:outline-none focus:border-indigo-500 transition [&>option]:bg-[#16191E] [&>option]:text-white"><option value="">All Academic Years</option><option value="2026">2026</option><option value="2025">2025</option><option value="2024">2024</option></select></div><div><input type="text" value={filterSchool} onChange={(e) => { setFilterSchool(e.target.value); setPage(1); }} placeholder="Filter by school name..." className="w-full px-4 py-2 bg-[#0F1115] border border-slate-800 rounded-none text-xs text-slate-100 placeholder:text-slate-500 h-11 focus:outline-none focus:border-indigo-500 transition" /></div><div><input type="text" value={filterDistrict} onChange={(e) => { setFilterDistrict(e.target.value); setPage(1); }} placeholder="Search district/village..." className="w-full px-4 py-2 bg-[#0F1115] border border-slate-800 rounded-none text-xs text-slate-100 placeholder:text-slate-500 h-11 focus:outline-none focus:border-indigo-500 transition" /></div></div><div className="flex justify-end gap-2 border-t pt-4 border-slate-800/60"><button onClick={() => { setSearchQuery(''); setFilterYear(''); setFilterClass(''); setFilterSchool(''); setFilterDistrict(''); setPage(1); }} className="px-5 py-2.5 bg-[#0F1115] hover:bg-slate-800 border border-slate-850 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-none transition cursor-pointer">Reset Filters</button>{(user.role === UserRole.DOWNLOAD_ADMIN || user.role === UserRole.SUPER_ADMIN) && (<button onClick={triggerExcelExport} className="px-5 py-2.5 bg-emerald-600/10 hover:bg-emerald-650 border border-emerald-500/20 hover:border-emerald-500 text-emerald-400 hover:text-white text-xs font-extrabold rounded-none flex items-center gap-1.5 cursor-pointer transition-all uppercase tracking-wider font-mono h-10.5"><FileSpreadsheet className="w-4 h-4" /><span>Download Filtered Sheet (Excel)</span></button>)}</div></div><div className="bg-[#16191E] rounded-none border border-slate-800 shadow-2xl overflow-hidden no-print"><div className="overflow-x-auto">{studentsList.length === 0 ? (<div className="py-24 text-center text-slate-500 font-semibold font-sans text-sm">No student records match current active search criteria.</div>) : (<table className="w-full text-left text-sm border-collapse"><thead><tr className="bg-[#0F1115] text-slate-400 border-b border-slate-800 text-[11px] font-extrabold uppercase tracking-widest"><th className="py-4 px-6 font-sans">Reg Number</th><th className="py-4 px-6 font-sans">Candidate Name</th><th className="py-4 px-6 font-sans">Father's Name</th><th className="py-4 px-6 font-sans font-mono text-center">Class Level</th><th className="py-4 px-6 font-sans">School Name</th><th className="py-4 px-6 font-sans">District/Village</th><th className="py-4 px-6 text-center font-sans">Actions</th></tr></thead><tbody className="divide-y divide-slate-800/50 text-slate-300">{studentsList.map((st) => (<tr key={st.id} className="hover:bg-slate-800/25 transition duration-150 border-b border-slate-800/40"><td className="py-4 px-6 font-mono text-xs font-black text-indigo-400">{st.registration_number}</td><td className="py-4 px-6 font-bold text-slate-100">{st.full_name}</td><td className="py-4 px-6 text-slate-400">{st.father_name}</td><td className="py-4 px-6 text-center"><span className="inline-block bg-slate-800 px-2 py-0.5 border border-slate-700/50 text-[11px] font-mono text-slate-300 font-semibold uppercase rounded-none">{st.class_name}</span></td><td className="py-4 px-6 text-xs text-slate-300 truncate max-w-[200px]" title={st.school_name}>{st.school_name}</td><td className="py-4 px-6 text-xs text-slate-400">{st.address_district_village}</td><td className="py-4 px-6 text-center"><button onClick={() => setActiveStudentDetail(st)} className="px-4 py-2 bg-indigo-500/10 hover:bg-indigo-600 border border-indigo-500/20 hover:border-indigo-500 text-indigo-400 hover:text-white text-xs font-bold rounded-none transition-all cursor-pointer flex items-center justify-center gap-1.5"><Eye className="w-4 h-4" /><span>View Details & Print</span></button></td></tr>))}</tbody></table>)}</div>{totalPages > 1 && (<div className="p-5 border-t border-slate-800 bg-[#0F1115]/50 flex justify-between items-center text-xs font-semibold"><button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-4 py-2 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-300 bg-[#0F1115] disabled:opacity-35 disabled:pointer-events-none rounded-none flex items-center gap-1 cursor-pointer transition font-sans"><ChevronLeft className="w-4 h-4" /><span>Previous</span></button><span className="font-mono text-slate-400">Page {page} of {totalPages} (Total Records: {totalRecords})</span><button disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="px-4 py-2 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-300 bg-[#0F1115] disabled:opacity-35 disabled:pointer-events-none rounded-none flex items-center gap-1 cursor-pointer transition font-sans"><span>Next</span><ChevronRight className="w-4 h-4" /></button></div>)}</div>{activeStudentDetail && (<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center overflow-y-auto px-4 py-12 no-print"><div className="bg-slate-50 rounded-3xl overflow-hidden shadow-2xl max-w-4xl w-full h-fit flex flex-col"><div className="bg-[#1B4F72] p-5 text-white flex justify-between items-center sm:rounded-t-3xl"><h3 className="font-bold text-base md:text-lg font-sans">Candidate Registration Details ({activeStudentDetail.registration_number})</h3><div className="flex gap-2"><button onClick={() => { const printElem = document.getElementById(`print-template-${activeStudentDetail.id}`); if (printElem) { const origContent = document.body.innerHTML; document.body.innerHTML = printElem.outerHTML; window.print(); window.location.reload(); } }} className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer transition"><Printer className="w-4 h-4" /><span>Print Form (A4)</span></button><button onClick={() => setActiveStudentDetail(null)} className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg text-xs cursor-pointer transition">Close</button></div></div><div className="p-8 bg-slate-100 flex justify-center transition"><PrintTemplate form={activeStudentDetail} /></div></div></div> )}</div>)}

          {currentTab === 'admin_export' && (<div className="max-w-5xl mx-auto space-y-8"><div className="border-b border-slate-800 pb-4"><h1 className="text-xl md:text-2xl font-black text-white font-sans uppercase tracking-wider">Export Data (Administrative Export Suite)</h1><p className="text-slate-400 text-xs font-sans mt-0.5">Export filtered student records instantly as Microsoft Excel spreadsheets.</p></div><div className="bg-[#16191E] p-8 rounded-none border border-slate-800 shadow-2xl space-y-6"><div><h3 className="text-white font-bold text-base border-b pb-3 border-slate-850 font-sans uppercase tracking-wider">Export Filtration Control</h3><p className="text-slate-400 text-xs font-sans mt-1">Apply specific filters below to export targeted candidate cohorts. Click download to fetch current list.</p></div><div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2"><input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search name or ID..." className="w-full px-4 py-2 bg-[#0F1115] border border-slate-800 rounded-none text-xs text-slate-100 placeholder:text-slate-500 h-11 focus:outline-none focus:border-indigo-500 transition" /><select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="w-full px-4 py-2 bg-[#0F1115] border border-slate-800 rounded-none text-xs text-slate-200 h-11 font-sans focus:outline-none focus:border-indigo-500 transition [&>option]:bg-[#16191E] [&>option]:text-white"><option value="">Select Academic Year</option><option value="2026">2026</option><option value="2025">2025</option></select><input type="text" value={filterSchool} onChange={(e) => setFilterSchool(e.target.value)} placeholder="Filter by school..." className="w-full px-4 py-2 bg-[#0F1115] border border-slate-800 rounded-none text-xs text-slate-100 placeholder:text-slate-500 h-11 focus:outline-none focus:border-indigo-500 transition" /><input type="text" value={filterDistrict} onChange={(e) => setFilterDistrict(e.target.value)} placeholder="Search district/village..." className="w-full px-4 py-2 bg-[#0F1115] border border-slate-800 rounded-none text-xs text-slate-100 placeholder:text-slate-500 h-11 focus:outline-none focus:border-indigo-500 transition" /></div><div className="flex justify-end gap-3 border-t pt-4 border-slate-800/60"><button onClick={triggerExcelExport} className="px-6 py-3 bg-emerald-600/10 hover:bg-emerald-600 border border-emerald-500/20 hover:border-emerald-500 text-emerald-400 hover:text-white font-bold rounded-none flex items-center justify-center gap-2 transition-all cursor-pointer text-xs font-mono uppercase tracking-wider h-11"><FileSpreadsheet className="w-4 h-4" /><span>Download Excel Spreadsheet (XLSX)</span></button><button onClick={() => { if (studentsList.length === 0) { alert('No records available to print.'); return; } const confirmBulk = window.confirm(`Are you sure you want to trigger bulk printing for these ${totalRecords} records?`); if (!confirmBulk) return; const printWin = window.open('', '_blank'); if (printWin) { const content = studentsList.map(st => `<div class="print-page" style="page-break-after: always; margin-bottom: 30px;">${document.getElementById(`print-template-${st.id}`)?.outerHTML || `<div class="p-8">Record load failure</div>`}</div>`).join(''); printWin.document.write(`<html><head><title>GHWF Bulk Forms Export</title><style>@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap'); body { font-family: 'Inter', sans-serif; direction: ltr; } @media print { .print-page { page-break-after: always !important; } }</style><link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet"></head><body onload="window.print()"><div class="max-w-4xl mx-auto p-4">${content}</div></body></html>`); printWin.document.close(); } }} className="px-6 py-3 bg-[#0F1115] hover:bg-slate-800 border border-slate-850 hover:border-slate-700 text-slate-300 hover:text-white font-bold rounded-none flex items-center justify-center gap-2 transition cursor-pointer text-xs h-11"><Printer className="w-4 h-4" /><span>Print Selected Bulk (A4 PDF Roll)</span></button></div></div><AuditLogTable logs={auditLogs} /></div>)}

          {currentTab === 'super_users' && user.role === UserRole.SUPER_ADMIN && (<div className="max-w-5xl mx-auto space-y-8"><div className="border-b border-slate-800 pb-4"><h1 className="text-xl md:text-2xl font-black text-white font-sans uppercase tracking-wider">Administrative Account Management (Roster Accounts)</h1><p className="text-slate-400 text-xs font-sans mt-0.5">Provision new administrator staff, manage active accounts and view access control roster.</p></div><div className="grid grid-cols-1 lg:grid-cols-3 gap-8"><div className="bg-[#16191E] p-6 rounded-none border border-slate-800 shadow-2xl h-fit"><h3 className="text-white font-bold text-base border-b pb-3 border-slate-850 font-sans uppercase tracking-wider">Create Admin Account</h3><form onSubmit={handleAdminRegistration} className="pt-4 space-y-4">{authError && (<div className="bg-red-500/10 border border-red-500/20 p-3 rounded-none text-xs font-bold text-red-400">{authError}</div>)}{authSuccess && (<div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-none text-xs font-bold text-emerald-400">{authSuccess}</div>)}<div><label className="block text-slate-400 text-xs font-bold mb-1.5 font-sans uppercase tracking-wider">Full Name</label><input type="text" required value={newAdminName} onChange={(e) => setNewAdminName(e.target.value)} placeholder="Enter staff full name" className="w-full px-4 py-2.5 bg-[#0F1115] border border-slate-800 rounded-none text-xs text-slate-100 placeholder:text-slate-500 h-11 focus:outline-none focus:border-indigo-500 transition" /></div><div><label className="block text-slate-400 text-xs font-bold mb-1.5 font-sans uppercase tracking-wider">Email Address</label><input type="email" required value={newAdminEmail} onChange={(e) => setNewAdminEmail(e.target.value)} placeholder="name@ghwf.org" className="w-full px-4 py-2.5 bg-[#0F1115] border border-slate-800 rounded-none text-xs text-slate-100 placeholder:text-slate-500 h-11 focus:outline-none focus:border-indigo-500 transition" /></div><div><label className="block text-slate-400 text-xs font-bold mb-1.5 font-sans uppercase tracking-wider">Password</label><input type="password" required value={newAdminPass} onChange={(e) => setNewAdminPass(e.target.value)} placeholder="Password" className="w-full px-4 py-2.5 bg-[#0F1115] border border-slate-800 rounded-none text-xs text-slate-100 placeholder:text-slate-500 h-11 focus:outline-none focus:border-indigo-500 transition" /></div><div><label className="block text-slate-400 text-xs font-bold mb-1.5 font-sans uppercase tracking-wider">Admin Role</label><select value={newAdminRole} onChange={(e) => setNewAdminRole(e.target.value as UserRole)} className="w-full px-4 py-2 bg-[#0F1115] border border-slate-800 rounded-none text-xs text-slate-200 h-11 font-sans focus:outline-none focus:border-indigo-500 transition [&>option]:bg-[#16191E] [&>option]:text-white"><option value={UserRole.MANAGING_ADMIN}>Managing Admin</option><option value={UserRole.DOWNLOAD_ADMIN}>Download Exporter</option></select></div><button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-none text-xs tracking-wider uppercase font-mono transition cursor-pointer h-11">Register Administrative Account</button></form></div><div className="bg-[#16191E] rounded-none border border-slate-800 shadow-2xl overflow-hidden lg:col-span-2"><div className="px-6 py-5 bg-[#0F1115] border-b border-slate-800"><h3 className="font-bold text-white text-base font-sans uppercase tracking-wider">Active Administrative Accounts</h3></div><div className="overflow-x-auto"><table className="w-full text-left text-xs border-collapse"><thead><tr className="bg-[#0F1115]/50 text-slate-400 border-b border-slate-800 text-[10px] font-extrabold uppercase tracking-widest"><th className="py-3.5 px-6 font-sans">Staff Member Info</th><th className="py-3.5 px-6 font-sans">Admin Role</th><th className="py-3.5 px-6 font-sans">Status</th><th className="py-3.5 px-6 text-center font-sans">Action</th></tr></thead><tbody className="divide-y divide-slate-800/40 text-slate-300">{usersList.map((usr) => (<tr key={usr.id} className="hover:bg-slate-800/25 transition duration-150 border-b border-slate-800/40"><td className="py-4 px-6"><div className="font-bold text-slate-200 text-sm">{usr.full_name}</div><div className="text-slate-500 font-mono mt-0.5">{usr.email}</div></td><td className="py-4 px-6 font-mono font-bold text-xs text-indigo-400">{usr.role}</td><td className="py-4 px-6"><span className={`inline-flex px-2 py-0.5 rounded-none text-[10px] font-sans font-bold border ${usr.is_active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-455 border-rose-500/20'}`}>{usr.is_active ? 'ACTIVE' : 'BLOCKED'}</span></td><td className="py-4 px-6 text-center">{usr.id !== user.id ? (<button onClick={() => toggleUserActive(usr.id, usr.is_active)} className={`px-3.5 py-1.5 font-bold rounded-none text-[10px] border transition cursor-pointer font-mono uppercase tracking-wider ${usr.is_active ? 'border-rose-500/20 hover:border-rose-500 bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white' : 'border-emerald-500/20 hover:border-emerald-500 bg-emerald-500/10 hover:bg-emerald-600 text-emerald-400 hover:text-white'}`}>{usr.is_active ? 'Block Account' : 'Activate'}</button>) : (<span className="text-slate-500 text-[10px] font-mono font-bold uppercase tracking-wider">Current User</span>)}</td></tr>))}</tbody></table></div></div></div></div>)}

          {currentTab === 'super_settings' && user.role === UserRole.SUPER_ADMIN && (<div className="max-w-3xl mx-auto space-y-8"><div className="border-b border-slate-800 pb-4"><h1 className="text-xl md:text-2xl font-black text-white font-sans uppercase tracking-wider">System Portal Settings (Control Settings)</h1><p className="text-slate-500 text-xs font-sans mt-0.5">Configure annual academic sessions, dynamic numbering, and download active dates constraints.</p></div><div className="bg-[#16191E] p-8 rounded-none border border-slate-800 shadow-2xl space-y-6"><h3 className="text-white font-bold text-base border-b pb-3 border-slate-850 font-sans uppercase tracking-wider">Control Panel Settings</h3><form onSubmit={handleSettingsSubmit} className="space-y-6">{settingsError && (<div className="bg-red-500/10 border-r-4 border-red-500 p-3 text-xs font-bold text-red-400">{settingsError}</div>)}{settingsSuccess && (<div className="bg-emerald-500/10 border-r-4 border-emerald-500 p-3 text-xs font-bold text-emerald-400">{settingsSuccess}</div>)}<div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div><label className="block text-slate-400 text-xs font-bold mb-2 font-sans uppercase tracking-wider">Active Session Year</label><input type="number" required value={configYear} onChange={(e) => setConfigYear(e.target.value)} placeholder="2026" className="w-full px-4 py-2.5 bg-[#0F1115] border border-slate-800 rounded-none text-xs text-slate-100 placeholder:text-slate-500 h-11 focus:outline-none focus:border-indigo-500 transition" /></div><div><label className="block text-slate-400 text-xs font-bold mb-2 font-sans uppercase tracking-wider">Download Window Start Date</label><input type="date" required value={configStart} onChange={(e) => setConfigStart(e.target.value)} className="w-full px-4 py-2.5 bg-[#0F1115] border border-slate-800 rounded-none text-xs text-slate-100 placeholder:text-slate-500 h-11 focus:outline-none focus:border-indigo-500 transition font-sans" /></div><div><label className="block text-slate-400 text-xs font-bold mb-2 font-sans uppercase tracking-wider">Download Window End Date</label><input type="date" required value={configEnd} onChange={(e) => setConfigEnd(e.target.value)} className="w-full px-4 py-2.5 bg-[#0F1115] border border-slate-800 rounded-none text-xs text-slate-100 placeholder:text-slate-500 h-11 focus:outline-none focus:border-indigo-500 transition font-sans" /></div></div><div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-transparent"><button type="button" onClick={triggerSequenceReset} className="px-4 py-3 bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 hover:border-rose-500 text-rose-400 hover:text-white text-xs font-extrabold rounded-none transition flex items-center justify-center gap-1.5 cursor-pointer uppercase font-mono h-11"><RotateCcw className="w-4 h-4" /><span>Reset Registration Sequence</span></button><button type="submit" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-none cursor-pointer h-11 transition uppercase tracking-wider font-mono">Save Settings</button></div></form></div></div>)}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}
