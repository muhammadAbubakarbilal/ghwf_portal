from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import Any, Dict
from datetime import datetime, timedelta
from io import BytesIO
import openpyxl

from .schemas import (
    User, StudentForm, SystemSettings, AuditLog,
    LoginRequest, RegisterRequest, CreateUserRequest,
    UpdateUserRequest, StudentFormPayload, SettingsUpdateRequest,
    UserRole, Gender
)
from .database import db
from .auth import create_access_token, get_current_user, require_roles

app = FastAPI(
    title='GHWF Student Registration API',
    version='1.0.0'
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001', 'http://127.0.0.1:3001'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

@app.middleware('http')
async def verify_lock_window(request, call_next):
    try:
        db.verify_and_lock_old_submissions()
    except Exception:
        pass
    return await call_next(request)

@app.post('/api/v1/auth/register')
async def register(payload: RegisterRequest) -> Any:
    existing = db.get_user_by_email(payload.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='This email is already registered.')
    user = db.create_user(payload.email, payload.full_name, UserRole.STUDENT, payload.password)
    token = create_access_token(subject=user['id'], email=user['email'], role=user['role'], full_name=user['full_name'])
    return {'user': user, 'token': token}

@app.post('/api/v1/auth/login')
async def login(payload: LoginRequest) -> Any:
    user = db.get_user_by_email(payload.email)
    if not user or not user.get('is_active'):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid email or blocked account.')
    correct_password = db.get_user_password(user['id'])
    if correct_password != payload.password:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Incorrect password. Please try again.')
    token = create_access_token(subject=user['id'], email=user['email'], role=user['role'], full_name=user['full_name'])
    return {'user': user, 'token': token}

@app.get('/api/v1/auth/me')
async def me(current_user: Dict[str, Any] = Depends(get_current_user)) -> Any:
    return {'user': current_user}

@app.post('/api/v1/auth/logout')
async def logout(current_user: Dict[str, Any] = Depends(get_current_user)) -> Any:
    if current_user and current_user.get('token_jti'):
        db.blacklist_token(current_user['token_jti'])
    return {'success': True, 'message': 'Successfully logged out.'}

@app.get('/api/v1/student/form')
async def get_student_form(current_user: Dict[str, Any] = Depends(require_roles([UserRole.STUDENT]))) -> Any:
    form = db.get_student_by_user_id(current_user['id'])
    return {'form': form}

@app.post('/api/v1/student/form')
async def create_student_form(payload: StudentFormPayload, current_user: Dict[str, Any] = Depends(require_roles([UserRole.STUDENT]))) -> Any:
    existing = db.get_student_by_user_id(current_user['id'])
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='You have already submitted a registration form.')
    saved = db.submit_student_form(current_user['id'], payload.dict())
    db.add_audit_log(current_user['id'], 'STUDENT_SUBMIT', {'registration_number': saved['registration_number']})
    return {'form': saved}

@app.patch('/api/v1/student/form')
async def update_student_form(payload: StudentFormPayload, current_user: Dict[str, Any] = Depends(require_roles([UserRole.STUDENT]))) -> Any:
    existing = db.get_student_by_user_id(current_user['id'])
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Form not found.')
    if existing.get('edit_locked'):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Edit window of 24 hours has expired. The form is now locked.')
    if existing.get('submitted_at'):
        submitted_at = datetime.fromisoformat(existing['submitted_at'])
        if datetime.utcnow() - submitted_at > timedelta(hours=24):
            db.update_student_form(current_user['id'], {'edit_locked': True})
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Edit window of 24 hours has expired. The form is now locked.')
    updated = db.update_student_form(current_user['id'], payload.dict())
    return {'form': updated}

@app.get('/api/v1/student/form/status')
async def student_form_status(current_user: Dict[str, Any] = Depends(require_roles([UserRole.STUDENT]))) -> Any:
    existing = db.get_student_by_user_id(current_user['id'])
    settings = db.get_settings()
    if not existing:
        return {
            'edit_locked': False,
            'submitted_at': None,
            'downloaded_by_student': False,
            'download_window_active': False,
            'download_window_start': settings['download_window_start'],
            'download_window_end': settings['download_window_end'],
            'seconds_remaining': 0,
        }
    seconds_remaining = 0
    is_locked = existing.get('edit_locked', False)
    if existing.get('submitted_at') and not is_locked:
        submitted_at = datetime.fromisoformat(existing['submitted_at'])
        diff = timedelta(hours=24) - (datetime.utcnow() - submitted_at)
        if diff.total_seconds() > 0:
            seconds_remaining = int(diff.total_seconds())
        else:
            is_locked = True
            db.update_student_form(current_user['id'], {'edit_locked': True})
    now_date = datetime.utcnow().date().isoformat()
    download_window_active = settings['download_window_start'] <= now_date <= settings['download_window_end']
    return {
        'edit_locked': is_locked,
        'submitted_at': existing.get('submitted_at'),
        'downloaded_by_student': existing.get('downloaded_by_student', False),
        'download_window_active': download_window_active,
        'download_window_start': settings['download_window_start'],
        'download_window_end': settings['download_window_end'],
        'seconds_remaining': seconds_remaining,
    }

@app.post('/api/v1/student/form/download')
async def student_download_form(current_user: Dict[str, Any] = Depends(require_roles([UserRole.STUDENT]))) -> Any:
    existing = db.get_student_by_user_id(current_user['id'])
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Please complete your registration form first.')
    settings = db.get_settings()
    now_date = datetime.utcnow().date().isoformat()
    download_active = settings['download_window_start'] <= now_date <= settings['download_window_end']
    if not download_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f'Download feature is inactive. The download window is scheduled between {settings["download_window_start"]} and {settings["download_window_end"]}.')
    if existing.get('downloaded_by_student'):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='You have already downloaded your registration form. Only one download is permitted by policy.')
    updated = db.set_student_downloaded(current_user['id'], True)
    db.add_audit_log(current_user['id'], 'STUDENT_DOWNLOAD', {'registration_number': existing['registration_number']})
    return {'success': True, 'form': updated}

@app.get('/api/v1/admin/students')
async def admin_students(page: int = 1, pageSize: int = 25, search: str = '', year: int | None = None, class_name: str = '', school_name: str = '', district: str = '', current_user: Dict[str, Any] = Depends(require_roles([UserRole.MANAGING_ADMIN, UserRole.DOWNLOAD_ADMIN, UserRole.SUPER_ADMIN]))) -> Any:
    students = db.get_students()
    filtered = students
    if search:
        low = search.lower()
        filtered = [s for s in filtered if low in s['full_name'].lower() or low in s['registration_number'].lower() or low in s['father_name'].lower() or low in s['guardian_cnic'].lower()]
    if year is not None:
        filtered = [s for s in filtered if s['academic_year'] == year]
    if class_name:
        filtered = [s for s in filtered if s['class_name'] == class_name]
    if school_name:
        filtered = [s for s in filtered if school_name.lower() in s['school_name'].lower()]
    if district:
        filtered = [s for s in filtered if district.lower() in s['address_district_village'].lower()]
    total = len(filtered)
    start = (page - 1) * pageSize
    paginated = filtered[start:start + pageSize]
    return {'students': paginated, 'total': total, 'page': page, 'pageSize': pageSize, 'totalPages': (total + pageSize - 1) // pageSize}

@app.get('/api/v1/admin/students/{student_id}')
async def admin_student_detail(student_id: str, current_user: Dict[str, Any] = Depends(require_roles([UserRole.MANAGING_ADMIN, UserRole.DOWNLOAD_ADMIN, UserRole.SUPER_ADMIN]))) -> Any:
    student = db.get_student_by_id(student_id)
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Student registration record not found.')
    return {'student': student}

@app.get('/api/v1/admin/stats')
async def admin_stats(current_user: Dict[str, Any] = Depends(require_roles([UserRole.MANAGING_ADMIN, UserRole.DOWNLOAD_ADMIN, UserRole.SUPER_ADMIN]))) -> Any:
    students = db.get_students()
    total_students = len(students)
    locked_count = sum(1 for s in students if s.get('edit_locked'))
    downloaded_count = sum(1 for s in students if s.get('downloaded_by_student'))
    by_year: dict[int, int] = {}
    by_class: dict[str, int] = {}
    school_count: dict[str, int] = {}
    for s in students:
        by_year[s['academic_year']] = by_year.get(s['academic_year'], 0) + 1
        by_class[s['class_name']] = by_class.get(s['class_name'], 0) + 1
        school_count[s['school_name']] = school_count.get(s['school_name'], 0) + 1
    by_school = sorted([{'school': k, 'count': v} for k, v in school_count.items()], key=lambda item: item['count'], reverse=True)[:5]
    return {'totalStudents': total_students, 'lockedCount': locked_count, 'downloadedCount': downloaded_count, 'byYear': by_year, 'byClass': by_class, 'bySchool': by_school}

@app.get('/api/v1/export/excel')
async def export_excel(page: int = 1, pageSize: int = 25, search: str = '', year: int | None = None, class_name: str = '', school_name: str = '', district: str = '', current_user: Dict[str, Any] = Depends(require_roles([UserRole.DOWNLOAD_ADMIN, UserRole.SUPER_ADMIN]))) -> StreamingResponse:
    students = db.get_students()
    filtered = students
    if search:
        low = search.lower()
        filtered = [s for s in filtered if low in s['full_name'].lower() or low in s['registration_number'].lower() or low in s['father_name'].lower()]
    if year is not None:
        filtered = [s for s in filtered if s['academic_year'] == year]
    if class_name:
        filtered = [s for s in filtered if s['class_name'] == class_name]
    if school_name:
        filtered = [s for s in filtered if school_name.lower() in s['school_name'].lower()]
    if district:
        filtered = [s for s in filtered if district.lower() in s['address_district_village'].lower()]
    workbook = openpyxl.Workbook()
    sheet = workbook.active
    sheet.title = 'Sponsored Students'
    headers = ['S.No', 'Registration Number', 'Academic Year', 'Candidate Name', 'Gender', 'Father Name', 'Age', 'Class', 'Guardian CNIC', 'Guardian Mobile', 'Teacher School Phone', 'School Name', 'Referred By', 'Referrer Mobile', 'District/Village', 'Additional Info', 'Submitted At']
    sheet.append(headers)
    for idx, s in enumerate(filtered, start=1):
        sheet.append([
            idx,
            s['registration_number'],
            s['academic_year'],
            s['full_name'],
            'Male' if s['gender'] == Gender.MALE.value else 'Female',
            s['father_name'],
            s['age'],
            s['class_name'],
            s['guardian_cnic'],
            s['guardian_mobile'],
            s.get('teacher_contact', 'N/A') or 'N/A',
            s['school_name'],
            s.get('referred_by_name', 'N/A') or 'N/A',
            s.get('referred_by_mobile', 'N/A') or 'N/A',
            s['address_district_village'],
            s.get('additional_info', 'N/A') or 'N/A',
            s.get('submitted_at', 'Draft'),
        ])
    output = BytesIO()
    workbook.save(output)
    output.seek(0)
    db.add_audit_log(current_user['id'], 'EXPORT_EXCEL', {'count': len(filtered), 'filters': {'search': search, 'year': year, 'className': class_name, 'schoolName': school_name, 'district': district}})
    filename = f'GHWF_Export_{datetime.utcnow().year}.xlsx'
    headers = {
        'Content-Disposition': f'attachment; filename="{filename}"'
    }
    return StreamingResponse(output, media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', headers=headers)

@app.get('/api/v1/export/logs')
async def export_logs(current_user: Dict[str, Any] = Depends(require_roles([UserRole.DOWNLOAD_ADMIN, UserRole.SUPER_ADMIN]))) -> Any:
    logs = [log for log in db.get_audit_logs() if log['action'].startswith('EXPORT_')]
    return {'logs': logs}

@app.get('/api/v1/super-admin/users')
async def super_users(current_user: Dict[str, Any] = Depends(require_roles([UserRole.SUPER_ADMIN]))) -> Any:
    return {'users': db.get_users()}

@app.post('/api/v1/super-admin/users')
async def create_super_user(payload: CreateUserRequest, current_user: Dict[str, Any] = Depends(require_roles([UserRole.SUPER_ADMIN]))) -> Any:
    existing = db.get_user_by_email(payload.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='This email is already in use.')
    created_user = db.create_user(payload.email, payload.full_name, payload.role, payload.password)
    db.add_audit_log(current_user['id'], 'CREATE_ADMIN', {'target_email': payload.email, 'target_role': payload.role.value})
    return {'user': created_user}

@app.patch('/api/v1/super-admin/users/{user_id}')
async def patch_super_user(user_id: str, payload: UpdateUserRequest, current_user: Dict[str, Any] = Depends(require_roles([UserRole.SUPER_ADMIN]))) -> Any:
    if user_id == current_user['id']:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='You cannot block or modify your own profile status.')
    user = db.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User not found.')
    updates: dict[str, Any] = {}
    if payload.is_active is not None:
        updates['is_active'] = payload.is_active
    if payload.role is not None:
        updates['role'] = payload.role.value
    updated = db.update_user(user_id, updates)
    db.add_audit_log(current_user['id'], 'UPDATE_USER', {'target_id': user_id, 'updates': updates})
    return {'user': updated}

@app.get('/api/v1/settings')
async def get_settings(current_user: Dict[str, Any] = Depends(get_current_user)) -> Any:
    return {'settings': db.get_settings()}

@app.put('/api/v1/settings')
async def put_settings(payload: SettingsUpdateRequest, current_user: Dict[str, Any] = Depends(require_roles([UserRole.SUPER_ADMIN]))) -> Any:
    updates: dict[str, Any] = {}
    if payload.download_window_start is not None:
        updates['download_window_start'] = payload.download_window_start
    if payload.download_window_end is not None:
        updates['download_window_end'] = payload.download_window_end
    if payload.current_academic_year is not None:
        updates['current_academic_year'] = payload.current_academic_year
    settings = db.update_settings(updates)
    if payload.reset_sequence:
        db.reset_sequence()
        db.add_audit_log(current_user['id'], 'RESET_SEQUENCE', {})
    db.add_audit_log(current_user['id'], 'SETTINGS_UPDATE', {'updates': updates})
    return {'settings': settings}
