from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, EmailStr

class UserRole(str, Enum):
    STUDENT = 'student'
    MANAGING_ADMIN = 'managing_admin'
    DOWNLOAD_ADMIN = 'download_admin'
    SUPER_ADMIN = 'super_admin'

class Gender(str, Enum):
    MALE = 'male'
    FEMALE = 'female'

class User(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    role: UserRole
    is_active: bool
    created_at: str

class StudentForm(BaseModel):
    id: str
    user_id: str
    registration_number: str
    academic_year: int
    full_name: str
    gender: Gender
    father_name: str
    age: int
    class_name: str
    guardian_cnic: str
    guardian_mobile: str
    teacher_contact: Optional[str] = None
    school_name: str
    referred_by_name: Optional[str] = None
    referred_by_mobile: Optional[str] = None
    address_district_village: str
    additional_info: Optional[str] = None
    submitted_at: Optional[str]
    last_edited_at: str
    edit_locked: bool
    downloaded_by_student: bool
    created_at: str

class SystemSettings(BaseModel):
    download_window_start: str
    download_window_end: str
    current_academic_year: int

class AuditLog(BaseModel):
    id: str
    actor_id: str
    actor_name: str
    action: str
    target_id: Optional[str] = None
    target_name: Optional[str] = None
    metadata: Dict[str, Any]
    created_at: str

class AuthResponse(BaseModel):
    user: User
    token: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class CreateUserRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: UserRole

class UpdateUserRequest(BaseModel):
    is_active: Optional[bool] = None
    role: Optional[UserRole] = None

class StudentFormPayload(BaseModel):
    full_name: str
    gender: Gender
    father_name: str
    age: int
    class_name: str
    guardian_cnic: str
    guardian_mobile: str
    teacher_contact: Optional[str] = None
    school_name: str
    referred_by_name: Optional[str] = None
    referred_by_mobile: Optional[str] = None
    address_district_village: str
    additional_info: Optional[str] = None

class SettingsUpdateRequest(BaseModel):
    download_window_start: Optional[str] = None
    download_window_end: Optional[str] = None
    current_academic_year: Optional[int] = None
    reset_sequence: Optional[bool] = None

class StudentFormStatusResponse(BaseModel):
    edit_locked: bool
    submitted_at: Optional[str] = None
    downloaded_by_student: bool
    download_window_active: bool
    download_window_start: Optional[str] = None
    download_window_end: Optional[str] = None
    seconds_remaining: int
