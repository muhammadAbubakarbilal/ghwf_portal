'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { StudentForm, Gender } from '../types';
import { Save, Lock, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

interface StudentFormEditorProps {
  form: StudentForm | null;
  status: {
    edit_locked: boolean;
    submitted_at: string | null;
    seconds_remaining: number;
    download_window_start?: string;
    download_window_end?: string;
    download_window_active?: boolean;
    downloaded_by_student?: boolean;
  } | null;
  onFormSubmitted: (savedForm: StudentForm) => void;
  onRefreshStatus: () => void;
}

export const StudentFormEditor: React.FC<StudentFormEditorProps> = ({ form, status, onFormSubmitted, onRefreshStatus }) => {
  const { user, token } = useAuth();
  const { t } = useLanguage();

  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<Gender>(Gender.MALE);
  const [fatherName, setFatherName] = useState('');
  const [age, setAge] = useState('');
  const [className, setClassName] = useState('');
  const [guardianCnic, setGuardianCnic] = useState('');
  const [guardianMobile, setGuardianMobile] = useState('');
  const [teacherContact, setTeacherContact] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [referredByName, setReferredByName] = useState('');
  const [referredByMobile, setReferredByMobile] = useState('');
  const [addressDistrictVillage, setAddressDistrictVillage] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [countdown, setCountdown] = useState(0);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);
  const [draftRestored, setDraftRestored] = useState(false);

  useEffect(() => {
    if (form) {
      setFullName(form.full_name || '');
      setGender(form.gender || Gender.MALE);
      setFatherName(form.father_name || '');
      setAge(form.age ? String(form.age) : '');
      setClassName(form.class_name || '');
      setGuardianCnic(form.guardian_cnic || '');
      setGuardianMobile(form.guardian_mobile || '');
      setTeacherContact(form.teacher_contact || '');
      setSchoolName(form.school_name || '');
      setReferredByName(form.referred_by_name || '');
      setReferredByMobile(form.referred_by_mobile || '');
      setAddressDistrictVillage(form.address_district_village || '');
      setAdditionalInfo(form.additional_info || '');
    } else if (user) {
      const draftKey = `ghwf_draft_${user.id}`;
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft);
          const hasData = Object.values(draft).some((v) => v && v !== '');
          if (hasData) {
            setFullName(draft.full_name || '');
            setGender(draft.gender || Gender.MALE);
            setFatherName(draft.father_name || '');
            setAge(draft.age || '');
            setClassName(draft.class_name || '');
            setGuardianCnic(draft.guardian_cnic || '');
            setGuardianMobile(draft.guardian_mobile || '');
            setTeacherContact(draft.teacher_contact || '');
            setSchoolName(draft.school_name || '');
            setReferredByName(draft.referred_by_name || '');
            setReferredByMobile(draft.referred_by_mobile || '');
            setAddressDistrictVillage(draft.address_district_village || '');
            setAdditionalInfo(draft.additional_info || '');
            setDraftRestored(true);
            setSuccessMessage(t('draft_restored_success'));
          }
        } catch (error) {
          console.error('Error parsing draft:', error);
        }
      }
    }
  }, [form, user, t]);

  useEffect(() => {
    const isLocked = status?.edit_locked || false;
    if (user && !form && !isLocked) {
      const hasAnyInput = [
        fullName,
        fatherName,
        age,
        className,
        guardianCnic,
        guardianMobile,
        teacherContact,
        schoolName,
        referredByName,
        referredByMobile,
        addressDistrictVillage,
        additionalInfo,
      ].some((val) => val && val.trim() !== '');

      if (hasAnyInput) {
        const draftKey = `ghwf_draft_${user.id}`;
        const draftObj = {
          full_name: fullName,
          gender,
          father_name: fatherName,
          age,
          class_name: className,
          guardian_cnic: guardianCnic,
          guardian_mobile: guardianMobile,
          teacher_contact: teacherContact,
          school_name: schoolName,
          referred_by_name: referredByName,
          referred_by_mobile: referredByMobile,
          address_district_village: addressDistrictVillage,
          additional_info: additionalInfo,
        };
        localStorage.setItem(draftKey, JSON.stringify(draftObj));
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setDraftSavedAt(timeString);
      }
    }
  }, [
    fullName,
    gender,
    fatherName,
    age,
    className,
    guardianCnic,
    guardianMobile,
    teacherContact,
    schoolName,
    referredByName,
    referredByMobile,
    addressDistrictVillage,
    additionalInfo,
    user,
    form,
    status,
  ]);

  useEffect(() => {
    if (status && status.seconds_remaining > 0) {
      setCountdown(status.seconds_remaining);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            onRefreshStatus();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setCountdown(0);
    }
  }, [status, onRefreshStatus]);

  const handleClearDraft = () => {
    if (!window.confirm(t('draft_clear_confirm')))
      return;
    setFullName('');
    setGender(Gender.MALE);
    setFatherName('');
    setAge('');
    setClassName('');
    setGuardianCnic('');
    setGuardianMobile('');
    setTeacherContact('');
    setSchoolName('');
    setReferredByName('');
    setReferredByMobile('');
    setAddressDistrictVillage('');
    setAdditionalInfo('');
    setDraftRestored(false);
    setDraftSavedAt(null);
    if (user) {
      localStorage.removeItem(`ghwf_draft_${user.id}`);
    }
    setSuccessMessage(t('draft_cleared_msg'));
    setErrorMessage(null);
  };

  const handleManualSaveDraft = () => {
    if (!user) return;
    const draftKey = `ghwf_draft_${user.id}`;
    const draftObj = {
      full_name: fullName,
      gender,
      father_name: fatherName,
      age,
      class_name: className,
      guardian_cnic: guardianCnic,
      guardian_mobile: guardianMobile,
      teacher_contact: teacherContact,
      school_name: schoolName,
      referred_by_name: referredByName,
      referred_by_mobile: referredByMobile,
      address_district_village: addressDistrictVillage,
      additional_info: additionalInfo,
    };
    localStorage.setItem(draftKey, JSON.stringify(draftObj));
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setDraftSavedAt(timeString);
    setSuccessMessage(t('draft_saved_success').replace('{time}', timeString));
    setErrorMessage(null);
  };

  const handleCnicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 13) val = val.substring(0, 13);
    let formatted = val;
    if (val.length > 5 && val.length <= 12) {
      formatted = `${val.substring(0, 5)}-${val.substring(5)}`;
    } else if (val.length > 12) {
      formatted = `${val.substring(0, 5)}-${val.substring(5, 12)}-${val.substring(12, 13)}`;
    }
    setGuardianCnic(formatted);
  };

  const formatPhone = (val: string) => {
    return val.replace(/[^\d+]/g, '');
  };

  const formatTime = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs}h ${mins}m ${secs}s`;
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!fullName.trim()) {
      errors.full_name = t('form_lbl_name') + ' is required.';
    }
    if (!fatherName.trim()) {
      errors.father_name = t('form_lbl_father') + ' is required.';
    }

    const parsedAge = parseInt(age, 10);
    if (!age || isNaN(parsedAge) || parsedAge < 1 || parsedAge > 30) {
      errors.age = 'Enter valid age (1 to 30 years).';
    }

    if (!className.trim()) {
      errors.class_name = t('form_lbl_class') + ' is required.';
    }

    const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
    if (!guardianCnic || !cnicRegex.test(guardianCnic)) {
      errors.guardian_cnic = 'CNIC format is invalid (e.g. 37405-1234567-1)';
    }

    const phoneRegex = /^(\+92|0)[0-9]{10}$/;
    if (!guardianMobile || !phoneRegex.test(guardianMobile)) {
      errors.guardian_mobile = 'Mobile number is invalid (e.g. 03001234567)';
    }

    if (teacherContact && !phoneRegex.test(teacherContact)) {
      errors.teacher_contact = 'Teacher mobile phone is invalid';
    }

    if (referredByMobile && !phoneRegex.test(referredByMobile)) {
      errors.referred_by_mobile = 'Reference contact phone is invalid';
    }

    if (!schoolName.trim()) {
      errors.school_name = t('form_lbl_school') + ' is required.';
    }
    if (!addressDistrictVillage.trim()) {
      errors.address_district_village = t('form_lbl_address') + ' is required.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!validate()) {
      setErrorMessage('Please correct the errors in the form.');
      return;
    }

    if (!window.confirm('Are you sure you want to submit this form? Under foundation rules, after submission, modifications are only permitted for up to 24 hours.')) {
      return;
    }

    if (!token) {
      setErrorMessage('Authentication token is missing. Please log in again.');
      return;
    }

    setIsSubmitting(true);
    const isNew = !form;

    try {
      const response = await fetch('/api/v1/student/form', {
        method: isNew ? 'POST' : 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: fullName,
          gender,
          father_name: fatherName,
          age: parseInt(age, 10),
          class_name: className,
          guardian_cnic: guardianCnic,
          guardian_mobile: guardianMobile,
          teacher_contact: teacherContact || undefined,
          school_name: schoolName,
          referred_by_name: referredByName || undefined,
          referred_by_mobile: referredByMobile || undefined,
          address_district_village: addressDistrictVillage,
          additional_info: additionalInfo || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'An error occurred while saving the form.');
      }
      setSuccessMessage('Success! Your registration form has been successfully submitted to GHWF.');
      if (user) {
        localStorage.removeItem(`ghwf_draft_${user.id}`);
      }
      onFormSubmitted(data.form);
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to submit form.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLocked = status?.edit_locked || false;

  return (
    <div className="max-w-4xl mx-auto py-4 px-2" style={{ direction: 'ltr' }}>
      {isLocked && (
        <div className="bg-rose-500/10 border border-rose-500/30 p-5 rounded-none mb-6 flex items-start gap-4">
          <Lock className="w-8 h-8 text-rose-400 mt-1 flex-shrink-0" />
          <div className="text-left">
            <h3 className="text-rose-300 font-extrabold text-lg font-sans">Registration Form Locked</h3>
            <p className="text-rose-400/80 text-sm mt-1 leading-relaxed font-sans">
              Your form submission is locked after 24 hours. Under active guidelines, modifications are no longer permitted on this entry. Please contact the foundation office for any corrections.
            </p>
            {status?.submitted_at && (
              <span className="inline-block mt-3 bg-rose-500/20 text-rose-300 text-xs px-3 py-1 font-mono font-medium rounded-none">
                Form Submission Timestamp: {new Date(status.submitted_at).toLocaleString('en-US')}
              </span>
            )}
          </div>
        </div>
      )}

      {!isLocked && form && countdown > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-none mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-amber-400 flex-shrink-0 animate-pulse" />
            <div className="text-left">
              <p className="text-amber-300 font-bold font-sans leading-none">Time remaining for edits:</p>
              <p className="text-amber-400/80 font-mono text-xs leading-normal mt-1">{formatTime(countdown)}</p>
            </div>
          </div>
          <span className="text-xs bg-amber-500/20 text-amber-300 px-3 py-1 font-bold rounded-none font-sans">EDIT MODE</span>
        </div>
      )}

      {!isLocked && !form && (
        <div className="bg-slate-800/40 border border-slate-800/80 p-4 rounded-none mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative mr-2">
              <span className="flex h-3.5 w-3.5 absolute -top-1.5 -right-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-60"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-indigo-500"></span>
              </span>
            </div>
            <div className="text-left">
              <p className="text-indigo-300 font-bold font-sans leading-none">Offline/Unsubmitted Data Draft</p>
              <p className="text-slate-400 text-[11px] font-sans mt-1">
                {draftSavedAt ? `Last auto-save: ${draftSavedAt}` : 'Start typing to enable dynamic background auto-saving'}
              </p>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={handleManualSaveDraft} className="text-xs bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 px-3 py-1.5 transition font-sans font-semibold cursor-pointer">
              Save Draft
            </button>
            {(draftSavedAt || draftRestored || fullName || fatherName) && (
              <button type="button" onClick={handleClearDraft} className="text-xs bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 px-3 py-1.5 transition font-sans font-semibold cursor-pointer">
                Clear Draft
              </button>
            )}
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-none mb-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <span className="text-rose-300 font-medium text-sm font-sans">{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-none mb-6 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-emerald-300 font-medium text-sm font-sans">{successMessage}</span>
        </div>
      )}

      <div className="bg-[#16191E] rounded-none border border-slate-800 shadow-2xl overflow-hidden relative">
        <div className="bg-[#0F1115] p-6 border-b border-slate-800 flex justify-between items-center text-left">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-white font-sans">{t('form_header_title')}</h2>
            <p className="text-xs text-slate-500 font-sans tracking-wide mt-1">{t('form_header_desc')}</p>
          </div>
          <div className="w-4 h-4 bg-indigo-500 rotate-45 hidden md:block" />
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div>
              <label className="block text-slate-400 font-bold text-sm mb-2 font-sans">{t('form_lbl_name')}</label>
              <input
                type="text"
                disabled={isLocked}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t('form_placeholder_name')}
                className={`w-full px-4 py-3 bg-[#0F1115] border rounded-none text-white focus:outline-none focus:border-indigo-500 transition font-sans ${validationErrors.full_name ? 'border-rose-500' : 'border-slate-800'} disabled:opacity-40`}
              />
              {validationErrors.full_name && <p className="text-rose-500 text-xs mt-1.5 font-sans">{validationErrors.full_name}</p>}
            </div>

            <div>
              <label className="block text-slate-400 font-bold text-sm mb-2 font-sans">{t('form_lbl_gender')}</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  disabled={isLocked}
                  onClick={() => setGender(Gender.MALE)}
                  className={`py-3 px-4 border rounded-none font-bold flex justify-center items-center cursor-pointer transition ${gender === Gender.MALE ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' : 'bg-[#0F1115] border-slate-800 hover:bg-[#1A1D23] text-slate-400'} disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  {t('form_gender_male')}
                </button>
                <button
                  type="button"
                  disabled={isLocked}
                  onClick={() => setGender(Gender.FEMALE)}
                  className={`py-3 px-4 border rounded-none font-bold flex justify-center items-center cursor-pointer transition ${gender === Gender.FEMALE ? 'bg-rose-500/10 border-rose-500 text-rose-400' : 'bg-[#0F1115] border-slate-800 hover:bg-[#1A1D23] text-slate-400'} disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  {t('form_gender_female')}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-bold text-sm mb-2 font-sans">{t('form_lbl_father')}</label>
              <input
                type="text"
                disabled={isLocked}
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                placeholder={t('form_placeholder_father')}
                className={`w-full px-4 py-3 bg-[#0F1115] border rounded-none text-white focus:outline-none focus:border-indigo-500 transition font-sans ${validationErrors.father_name ? 'border-rose-500' : 'border-slate-800'} disabled:opacity-40`}
              />
              {validationErrors.father_name && <p className="text-rose-500 text-xs mt-1.5 font-sans">{validationErrors.father_name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 font-bold text-sm mb-2 font-sans">{t('form_lbl_age')}</label>
                <input
                  type="number"
                  disabled={isLocked}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder={t('form_placeholder_age')}
                  className={`w-full px-4 py-3 bg-[#0F1115] border rounded-none text-white focus:outline-none focus:border-indigo-500 transition font-sans ${validationErrors.age ? 'border-rose-500' : 'border-slate-800'} disabled:opacity-40`}
                />
                {validationErrors.age && <p className="text-rose-500 text-xs mt-1.5 font-sans">{validationErrors.age}</p>}
              </div>

              <div>
                <label className="block text-slate-400 font-bold text-sm mb-2 font-sans">{t('form_lbl_class')}</label>
                <input
                  type="text"
                  disabled={isLocked}
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder={t('form_placeholder_class')}
                  className={`w-full px-4 py-3 bg-[#0F1115] border rounded-none text-white focus:outline-none focus:border-indigo-500 transition font-sans ${validationErrors.class_name ? 'border-rose-500' : 'border-slate-800'} disabled:opacity-40`}
                />
                {validationErrors.class_name && <p className="text-rose-500 text-xs mt-1.5 font-sans">{validationErrors.class_name}</p>}
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-bold text-sm mb-2 font-sans">{t('form_lbl_cnic')}</label>
              <input
                type="text"
                disabled={isLocked}
                value={guardianCnic}
                onChange={handleCnicChange}
                placeholder={t('form_placeholder_cnic')}
                className={`w-full px-4 py-3 bg-[#0F1115] border rounded-none text-white text-left font-mono tracking-widest focus:outline-none focus:border-indigo-500 transition ${validationErrors.guardian_cnic ? 'border-rose-500' : 'border-slate-800'} disabled:opacity-40`}
              />
              <span className="text-[10px] text-slate-500 block mt-1 font-sans">{t('form_cnic_hint')}</span>
              {validationErrors.guardian_cnic && <p className="text-rose-500 text-xs mt-1.5 font-sans">{validationErrors.guardian_cnic}</p>}
            </div>

            <div>
              <label className="block text-slate-400 font-bold text-sm mb-2 font-sans">{t('form_lbl_mobile')}</label>
              <input
                type="text"
                disabled={isLocked}
                value={guardianMobile}
                onChange={(e) => setGuardianMobile(formatPhone(e.target.value))}
                placeholder={t('form_placeholder_mobile')}
                className={`w-full px-4 py-3 bg-[#0F1115] border rounded-none text-white text-left font-mono tracking-widest focus:outline-none focus:border-indigo-500 transition ${validationErrors.guardian_mobile ? 'border-rose-500' : 'border-slate-800'} disabled:opacity-40`}
              />
              {validationErrors.guardian_mobile && <p className="text-rose-500 text-xs mt-1.5 font-sans">{validationErrors.guardian_mobile}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-slate-400 font-bold text-sm mb-2 font-sans">{t('form_lbl_school')}</label>
              <input
                type="text"
                disabled={isLocked}
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder={t('form_placeholder_school')}
                className={`w-full px-4 py-3 bg-[#0F1115] border rounded-none text-white focus:outline-none focus:border-indigo-500 transition font-sans ${validationErrors.school_name ? 'border-rose-500' : 'border-slate-800'} disabled:opacity-40`}
              />
              {validationErrors.school_name && <p className="text-rose-500 text-xs mt-1.5 font-sans">{validationErrors.school_name}</p>}
            </div>

            <div>
              <label className="block text-slate-400 font-bold text-sm mb-2 font-sans">{t('form_lbl_teacher')}</label>
              <input
                type="text"
                disabled={isLocked}
                value={teacherContact}
                onChange={(e) => setTeacherContact(formatPhone(e.target.value))}
                placeholder={t('form_placeholder_teacher')}
                className={`w-full px-4 py-3 bg-[#0F1115] border rounded-none text-white text-left font-mono focus:outline-none focus:border-indigo-500 ${validationErrors.teacher_contact ? 'border-rose-500' : 'border-slate-800'} disabled:opacity-40`}
              />
              {validationErrors.teacher_contact && <p className="text-rose-500 text-xs mt-1.5 font-sans">{validationErrors.teacher_contact}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 font-bold text-sm mb-2 font-sans">{t('form_lbl_referred')}</label>
                <input
                  type="text"
                  disabled={isLocked}
                  value={referredByName}
                  onChange={(e) => setReferredByName(e.target.value)}
                  placeholder={t('form_placeholder_referred')}
                  className="w-full px-4 py-3 bg-[#0F1115] border border-slate-800 rounded-none text-white focus:outline-none focus:border-indigo-500 disabled:opacity-40 font-sans"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-bold text-sm mb-2 font-sans">{t('form_lbl_ref_mobile')}</label>
                <input
                  type="text"
                  disabled={isLocked}
                  value={referredByMobile}
                  onChange={(e) => setReferredByMobile(formatPhone(e.target.value))}
                  placeholder={t('form_placeholder_ref_mobile')}
                  className={`w-full px-4 py-3 bg-[#0F1115] border rounded-none text-white text-left font-mono focus:outline-none focus:border-indigo-500 ${validationErrors.referred_by_mobile ? 'border-rose-500' : 'border-slate-800'} disabled:opacity-40`}
                />
                {validationErrors.referred_by_mobile && <p className="text-rose-500 text-xs mt-1.5 font-sans">{validationErrors.referred_by_mobile}</p>}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-slate-400 font-bold text-sm mb-2 font-sans">{t('form_lbl_address')}</label>
              <textarea
                disabled={isLocked}
                rows={2}
                value={addressDistrictVillage}
                onChange={(e) => setAddressDistrictVillage(e.target.value)}
                placeholder={t('form_placeholder_address')}
                className={`w-full px-4 py-3 bg-[#0F1115] border rounded-none text-white focus:outline-none focus:border-indigo-500 transition font-sans ${validationErrors.address_district_village ? 'border-rose-500' : 'border-slate-800'} disabled:opacity-40`}
              />
              {validationErrors.address_district_village && <p className="text-rose-500 text-xs mt-1.5 font-sans">{validationErrors.address_district_village}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-slate-400 font-bold text-sm mb-2 font-sans">{t('form_lbl_remarks')}</label>
              <textarea
                disabled={isLocked}
                rows={3}
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                placeholder={t('form_placeholder_remarks')}
                className="w-full px-4 py-3 bg-[#0F1115] border border-slate-800 rounded-none text-white focus:outline-none focus:border-indigo-500 disabled:opacity-40 font-sans"
              />
            </div>
          </div>

          {!isLocked && (
            <div className="pt-6 border-t border-slate-800/80 flex items-center justify-end gap-4 text-xs font-mono uppercase tracking-wider">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-none flex items-center gap-2 cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <Save className="w-5 h-5" />
                )}
                <span>{isSubmitting ? t('form_btn_submitting') : t('form_btn_submit')}</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
