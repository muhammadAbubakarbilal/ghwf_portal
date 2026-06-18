'use client';

import React, { createContext, useContext, useEffect } from 'react';

export type Language = 'en';

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isUrdu: boolean;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

const translations: Record<string, string> = {
  'portal_title': 'Student Sponsorship Portal',
  'portal_subtitle': 'Gakkhar Heritage & Welfare Foundation',
  'secure_portal': 'Secure Portal Access',
  'create_profile': 'Create Student Profile',
  'email_label': 'Email Address',
  'password_label': 'Password',
  'fullname_label': 'Full Name',
  'confirm_password_label': 'Confirm Password',
  'login_btn': 'Authorize Login',
  'register_btn': 'Proceed with Registration',
  'have_account': 'Already have an account? Log in here.',
  'no_account': 'New student? Create a registration account here.',
  'demo_creds': 'DEMO ACCESS CREDENTIALS (DEVELOPER EVALUATION):',
  'secured_msg': 'GAKKHAR HERITAGE © {year} — SYSTEM SECURED',
  'invalid_creds': 'Invalid credentials. Please verify your email and password.',
  'missing_fields': 'Please fulfill all fields correctly.',
  'pass_mismatch': 'Passwords do not match. Please verify.',
  'reg_success': 'Account created successfully! Please log in now.',
  'auto_logout_title': 'Security Session Timeout',
  'auto_logout_desc': 'Due to 15 minutes of inactivity, you have been logged out to safeguard sensitive student records. Please log in again.',
  'menu_dashboard': 'Dashboard',
  'menu_form': 'Registration Form',
  'menu_print': 'Print Form',
  'menu_stats': 'Stats Report',
  'menu_registry': 'Student Registry',
  'menu_export': 'Export Data (Excel)',
  'menu_users': 'Admin Accounts',
  'menu_settings': 'System Settings',
  'menu_logout': 'Logout Session',
  'role_student': 'Student',
  'role_manager': 'Manager',
  'role_exporter': 'Exporter',
  'role_super': 'Super Admin',
  'welcome_back': 'Welcome Back, {name}!',
  'dashboard_desc': 'Welcome to Gakkhar Heritage & Welfare Foundation Sponsorship Services Portal.',
  'fill_edit_form': 'Fill / Edit Form',
  'print_form_btn': 'Print Your Form',
  'form_status_title': 'Form Submission Status',
  'no_form_submitted': 'You have not submitted a form yet.',
  'start_filling_form': 'Begin filling registration form here.',
  'form_locked_msg': 'Form is final and edit-locked',
  'form_open_msg': 'Successfully submitted (Open for corrections)',
  'reg_number': 'Registration No:',
  'submitted_at': 'Submitted At:',
  'form_download_lbl': 'Download Filed Record',
  'download_rules': 'A student can download their official submitted data sheet once a year during the scheduled download window.',
  'download_start': 'Download Window Start:',
  'download_end': 'Download Window End:',
  'not_submitted_download': 'Please submit your registration form first.',
  'download_not_active': 'Download window is currently inactive. The download action button will be active here during the scheduled dates.',
  'download_once_already': 'You have already downloaded your form once. If you require a printout, please navigate to the "Print Form" panel on the left.',
  'download_btn': 'Download Submitted PDF Record',
  'important_instructions': 'Important Guidelines for Students',
  'instruction_1': 'All sponsored students must submit their academic registration form values to be processed for the annual foundation scholarship program.',
  'instruction_2': 'Once submitted, you are allowed up to 24 hours to review and make corrections. After 24 hours (or once final verification occurs), your file is locked permanently.',
  'instruction_3': 'If you require further corrections or have questions, please reach out directly to the Foundation Management Office.',
  'form_header_title': 'Registration Form for Sponsored Students',
  'form_header_desc': 'Please fill all fields accurately. Fields marked with asterisk (*) are required.',
  'form_lbl_name': 'Name of Student (Boy/Girl) *',
  'form_placeholder_name': 'Write the candidate name',
  'form_lbl_gender': 'Gender *',
  'form_gender_male': 'Male',
  'form_gender_female': 'Female',
  'form_lbl_father': "Father's Name (Parentage) *",
  'form_placeholder_father': 'Write full name of father',
  'form_lbl_age': 'Current Age *',
  'form_placeholder_age': 'Example: 14',
  'form_lbl_class': 'Class level *',
  'form_placeholder_class': 'Example: Class 8th',
  'form_lbl_cnic': "Guardian's CNIC Number *",
  'form_placeholder_cnic': 'XXXXX-XXXXXXX-X',
  'form_cnic_hint': 'Dashes are autocompleted during input',
  'form_lbl_mobile': "Guardian's Active Mobile No *",
  'form_placeholder_mobile': '03001234567',
  'form_lbl_school': 'School / Institute Name with Address *',
  'form_placeholder_school': 'Write full school name and campus location',
  'form_lbl_teacher': 'Class Teacher Contact (or Principal Mobile)',
  'form_placeholder_teacher': '03120000000',
  'form_lbl_referred': 'Referred By / Sponsoring Member Name',
  'form_placeholder_referred': 'Enter reference member name',
  'form_lbl_ref_mobile': 'Reference Mobile No',
  'form_placeholder_ref_mobile': '03001112223',
  'form_lbl_address': 'Permanent / Residential Address (District, Village, House/Street) *',
  'form_placeholder_address': 'Enter village, residential address and Union Council details completely',
  'form_lbl_remarks': 'Additional Remarks / Background details',
  'form_placeholder_remarks': 'Details of orphanhood, physical disability, household financial situation or educational notes...',
  'form_btn_submit': 'Submit Registration Data',
  'form_btn_submitting': 'Sending data...',
  'draft_title': 'Auto-Saved Form Draft (Offline Backup)',
  'draft_desc_active': 'Drafting input is saved locally. You can securely return later or resume offline.',
  'draft_desc_empty': 'Type to trigger automated local auto-saving stream.',
  'draft_btn_save': 'Save Draft Now',
  'draft_btn_clear': 'Clear Active Draft',
  'draft_saved_success': 'Draft successfully archived. Saved at: {time}',
  'draft_restored_success': 'Restored unsaved progress from your last saved local draft.',
  'draft_clear_confirm': 'Are you sure you want to discard this draft progress and reset the editor fields?',
  'draft_cleared_msg': 'Working draft has been cleared.',
  'print_instructions_title': 'Official Print Instructions',
  'print_desc_line1': '1. Click "Open Print Spooler" below to print or save the document as a high-fidelity vector PDF.',
  'print_desc_line2': '2. Ensure "Background Graphics" is checked and "Margins" are set to "None" or "Default" in printer advanced dialog to preserve the official colored template.',
  'print_desc_line3': '3. Sign and affix official stamps at the footer before submitting the physical page copy.',
  'print_spool_btn': 'Open Print Spooler (Ctrl+P)',
  'print_loading': 'Processing print canvas...',
  'stats_title': 'Administrative Dashboard Statistics',
  'stats_card_total': 'Total Registrations',
  'stats_card_locked': 'Lock Count',
  'stats_card_exported': 'Finalized Downloads',
  'stats_card_pending': 'Pending Corrections',
  'class_dist': 'Class Level Distribution',
  'school_dist': 'Most Active Schools Performance',
  'academic_sessions': 'Academic Registration Sessions Covered',
  'no_records': 'No records found.',
  'students_count': '{count} Students',
  'registry_title': 'Student Registration Registry',
  'search_placeholder': 'Search by student name, father name or registration...',
  'filter_year': 'Academic Year',
  'filter_class': 'All Classes',
  'filter_school': 'Filter by School/Campus',
  'filter_district': 'Filter by District/Village',
  'btn_reset': 'Reset Filters',
  'btn_search': 'Search',
  'col_reg': 'Registration ID',
  'col_name': 'Candidate Name',
  'col_father': "Father's Name", 
  'col_class': 'Class',
  'col_school': 'School / Campus Address',
  'col_status': 'Edit Lock Status',
  'col_actions': 'Operations',
  'status_unlocked': 'Unlocked',
  'status_locked': 'Locked',
  'op_view': 'View',
  'op_unlock': 'Unlock Edits',
  'op_lock': 'Lock Edits',
  'op_download': 'Get PDF',
  'op_delete': 'Remove',
  'delete_confirm': 'Are you sure you want to delete this student record? This operation is permanent and irreversible.',
  'delete_success': 'Student record successfully purged.',
  'lock_success': 'Edit locked successfully.',
  'unlock_success': 'Form unlocked! Student has 24 hours to revise details.',
  'details_popup_title': 'Student Registry Detailed Dossier',
  'student_details': 'Candidate Particulars',
  'guardian_details': 'Guardian & Referrer Details',
  'district_address': 'Residential Address & Territory',
  'academic_history': 'Academic History & Metadata',
  'remarks_lbl': 'Dossier Remarks / Special Case Details',
  'none': 'None / Standard Profile',
  'btn_close': 'Close Window',
  'no_students_found': 'No matching student registrations found.',
  'page_prev': 'Previous',
  'page_next': 'Next',
  'pages_lbl': 'Page {curr} of {tot}',
  'export_title': 'Advanced Data Extraction & Archival Engine',
  'export_intro': 'Extract bulk student registration sheets as polished, fully certified format exports for board compilation.',
  'export_xlsx_btn': 'Download Excel File (XLSX)',
  'export_pdf_btn': 'Download All Forms (Bulk PDF Roll)',
  'empty_export': 'No records matched current search parameters to export.',
  'export_success': 'Export compiled and dispatched successfully!',
  'audit_log_title': 'Data Export History Logs',
  'col_actor': 'Actor',
  'col_format': 'Block Format',
  'col_count': 'Total Records',
  'col_filters': 'Filters Imposed',
  'col_time': 'Timestamp',
  'filter_none': 'No filters (Whole list scope)',
  'export_loading': 'Compiling records...',
  'portal_settings_title': 'Portal Administration Settings',
  'settings_dates': 'Form Download Window Boundaries',
  'settings_start': 'Download Window Start Date',
  'settings_end': 'Download Window End Date',
  'settings_year': 'Current Dynamic Academic Year',
  'btn_save_settings': 'Apply System Parameters',
  'settings_success_msg': 'Global system settings updated and compiled successfully.',
  'settings_error_msg': 'Failed to adjust system settings. Please verify inputs.',
  'user_mgmt_title': 'Administrative Access Accounts Control',
  'create_user_title': 'Provision New Administrative Staff',
  'user_name_lbl': 'Full Name of Staff',
  'user_email_lbl': 'Corporate / Official Email',
  'user_role_lbl': 'Assigned Security Cleared Role',
  'btn_create_staff': 'Deploy Access Credentials',
  'staff_success': 'Credentials provisioned and deployed correctly.',
  'staff_error': 'Failed to provision staff. Please check email address originality.',
  'col_user': 'Credential Host',
  'col_joined': 'Created On',
  'col_role': 'Role Clearance',
  'cannot_delete_self': 'You cannot purge or restrict your own active login credentials.',
  'user_purged': 'Clearance credentials revoked to prevent portal compromise.'
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const language: Language = 'en';
  const isUrdu = false;

  const setLanguage = () => {
    // only English supported for now
  };

  const t = (key: string): string => {
    return translations[key] || key;
  };

  useEffect(() => {
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.lang = 'en';
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isUrdu }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
