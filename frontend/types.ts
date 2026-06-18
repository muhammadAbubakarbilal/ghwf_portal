/**
 * GHWF Student Registration Portal — Shared TypeScript Definitions
 */

export enum UserRole {
  STUDENT = 'student',
  MANAGING_ADMIN = 'managing_admin',
  DOWNLOAD_ADMIN = 'download_admin',
  SUPER_ADMIN = 'super_admin',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface StudentForm {
  id: string;
  user_id: string;
  registration_number: string;
  academic_year: number;
  full_name: string;
  gender: Gender;
  father_name: string;
  age: number;
  class_name: string;
  guardian_cnic: string;
  guardian_mobile: string;
  teacher_contact?: string;
  school_name: string;
  referred_by_name?: string;
  referred_by_mobile?: string;
  address_district_village: string;
  additional_info?: string;
  submitted_at: string | null;
  last_edited_at: string;
  edit_locked: boolean;
  downloaded_by_student: boolean;
  created_at: string;
}

export interface SystemSettings {
  download_window_start: string;
  download_window_end: string;
  current_academic_year: number;
}

export interface AuditLog {
  id: string;
  actor_id: string;
  actor_name: string;
  action: string;
  target_id?: string;
  target_name?: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
