import os
import uuid
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Any, Dict, List, Optional

from .config import load_env_file
from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    JSON,
    String,
    create_engine,
    select,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship, sessionmaker

load_env_file()

from .schemas import Gender, UserRole

BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / 'data'
DATA_DIR.mkdir(parents=True, exist_ok=True)
DEFAULT_SQLITE_URL = f"sqlite:///{(DATA_DIR / 'ghwf.db').as_posix()}"
DATABASE_URL = os.environ.get('DATABASE_URL', DEFAULT_SQLITE_URL)

engine = create_engine(DATABASE_URL, future=True)
SessionLocal = sessionmaker(bind=engine, expire_on_commit=False, future=True)


class Base(DeclarativeBase):
    pass


class UserModel(Base):
    __tablename__ = 'users'

    id: Mapped[str] = mapped_column(String, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    full_name: Mapped[str] = mapped_column(String, nullable=False)
    role: Mapped[str] = mapped_column(String, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)

    password: Mapped['PasswordModel'] = relationship('PasswordModel', uselist=False, back_populates='user', cascade='all, delete-orphan')
    form: Mapped['StudentFormModel'] = relationship('StudentFormModel', uselist=False, back_populates='user')
    audit_logs: Mapped[List['AuditLogModel']] = relationship('AuditLogModel', back_populates='actor')


class PasswordModel(Base):
    __tablename__ = 'passwords'

    user_id: Mapped[str] = mapped_column(String, ForeignKey('users.id'), primary_key=True)
    password: Mapped[str] = mapped_column(String, nullable=False)

    user: Mapped[UserModel] = relationship('UserModel', back_populates='password')


class StudentFormModel(Base):
    __tablename__ = 'student_forms'

    id: Mapped[str] = mapped_column(String, primary_key=True, index=True)
    user_id: Mapped[str] = mapped_column(String, ForeignKey('users.id'), unique=True, nullable=False)
    registration_number: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    academic_year: Mapped[int] = mapped_column(Integer, nullable=False)
    full_name: Mapped[str] = mapped_column(String, nullable=False)
    gender: Mapped[str] = mapped_column(String, nullable=False)
    father_name: Mapped[str] = mapped_column(String, nullable=False)
    age: Mapped[int] = mapped_column(Integer, nullable=False)
    class_name: Mapped[str] = mapped_column(String, nullable=False)
    guardian_cnic: Mapped[str] = mapped_column(String, nullable=False)
    guardian_mobile: Mapped[str] = mapped_column(String, nullable=False)
    teacher_contact: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    school_name: Mapped[str] = mapped_column(String, nullable=False)
    referred_by_name: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    referred_by_mobile: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    address_district_village: Mapped[str] = mapped_column(String, nullable=False)
    additional_info: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    submitted_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    last_edited_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    edit_locked: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    downloaded_by_student: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)

    user: Mapped[UserModel] = relationship('UserModel', back_populates='form')


class SettingModel(Base):
    __tablename__ = 'settings'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    download_window_start: Mapped[date] = mapped_column(Date, nullable=False)
    download_window_end: Mapped[date] = mapped_column(Date, nullable=False)
    current_academic_year: Mapped[int] = mapped_column(Integer, nullable=False)
    registration_sequence: Mapped[int] = mapped_column(Integer, nullable=False, default=0)


class AuditLogModel(Base):
    __tablename__ = 'audit_logs'

    id: Mapped[str] = mapped_column(String, primary_key=True, index=True)
    actor_id: Mapped[str] = mapped_column(String, ForeignKey('users.id'), nullable=False)
    actor_name: Mapped[str] = mapped_column(String, nullable=False)
    action: Mapped[str] = mapped_column(String, nullable=False)
    target_id: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    target_name: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    metadata_json: Mapped[Dict[str, Any]] = mapped_column('metadata', JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)

    actor: Mapped[UserModel] = relationship('UserModel', back_populates='audit_logs')


class BlacklistedTokenModel(Base):
    __tablename__ = 'blacklisted_tokens'

    jti: Mapped[str] = mapped_column(String, primary_key=True, index=True)
    blacklisted_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)


def _iso(value: Optional[datetime]) -> Optional[str]:
    return value.isoformat() if value else None


class Database:
    def __init__(self) -> None:
        Base.metadata.create_all(engine)
        self.SessionLocal = SessionLocal
        self._seed_defaults()

    def _seed_defaults(self) -> None:
        with self.SessionLocal() as session:
            if not session.scalar(select(SettingModel)):
                session.add(SettingModel(
                    id=1,
                    download_window_start=date(2026, 6, 1),
                    download_window_end=date(2026, 8, 31),
                    current_academic_year=2026,
                    registration_sequence=3,
                ))
            if not session.scalar(select(UserModel).where(UserModel.role == UserRole.SUPER_ADMIN.value)):
                admin_users = [
                    ('usr_super', 'superadmin@ghwf.org', 'Super Admin', UserRole.SUPER_ADMIN, 'admin123'),
                    ('usr_manager', 'manager@ghwf.org', 'Managing Admin', UserRole.MANAGING_ADMIN, 'password123'),
                    ('usr_exporter', 'exporter@ghwf.org', 'Download Admin', UserRole.DOWNLOAD_ADMIN, 'password123'),
                ]
                for user_id, email, full_name, role, password in admin_users:
                    user = UserModel(
                        id=user_id,
                        email=email,
                        full_name=full_name,
                        role=role.value,
                        is_active=True,
                        created_at=datetime.utcnow(),
                    )
                    session.add(user)
                    session.add(PasswordModel(user_id=user_id, password=password))
            session.commit()

    def _row_to_user(self, row: UserModel) -> Dict[str, Any]:
        return {
            'id': row.id,
            'email': row.email,
            'full_name': row.full_name,
            'role': row.role,
            'is_active': row.is_active,
            'created_at': row.created_at.isoformat(),
        }

    def _row_to_student(self, row: StudentFormModel) -> Dict[str, Any]:
        return {
            'id': row.id,
            'user_id': row.user_id,
            'registration_number': row.registration_number,
            'academic_year': row.academic_year,
            'full_name': row.full_name,
            'gender': row.gender,
            'father_name': row.father_name,
            'age': row.age,
            'class_name': row.class_name,
            'guardian_cnic': row.guardian_cnic,
            'guardian_mobile': row.guardian_mobile,
            'teacher_contact': row.teacher_contact,
            'school_name': row.school_name,
            'referred_by_name': row.referred_by_name,
            'referred_by_mobile': row.referred_by_mobile,
            'address_district_village': row.address_district_village,
            'additional_info': row.additional_info,
            'submitted_at': _iso(row.submitted_at),
            'last_edited_at': row.last_edited_at.isoformat(),
            'edit_locked': row.edit_locked,
            'downloaded_by_student': row.downloaded_by_student,
            'created_at': row.created_at.isoformat(),
        }

    def _row_to_audit_log(self, row: AuditLogModel) -> Dict[str, Any]:
        return {
            'id': row.id,
            'actor_id': row.actor_id,
            'actor_name': row.actor_name,
            'action': row.action,
            'target_id': row.target_id,
            'target_name': row.target_name,
            'metadata': row.metadata_json,
            'created_at': row.created_at.isoformat(),
        }

    def get_users(self) -> List[Dict[str, Any]]:
        with self.SessionLocal() as session:
            return [self._row_to_user(row) for row in session.scalars(select(UserModel)).all()]

    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        with self.SessionLocal() as session:
            row = session.get(UserModel, user_id)
            return self._row_to_user(row) if row else None

    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        with self.SessionLocal() as session:
            row = session.scalar(select(UserModel).where(UserModel.email == email.strip().lower()))
            return self._row_to_user(row) if row else None

    def get_user_password(self, user_id: str) -> Optional[str]:
        with self.SessionLocal() as session:
            row = session.get(PasswordModel, user_id)
            return row.password if row else None

    def create_user(self, email: str, full_name: str, role: UserRole, password: str, user_id: Optional[str] = None) -> Dict[str, Any]:
        user_id = user_id or f'usr_{uuid.uuid4().hex[:9]}'
        with self.SessionLocal() as session:
            user = UserModel(
                id=user_id,
                email=email.strip().lower(),
                full_name=full_name,
                role=role.value,
                is_active=True,
                created_at=datetime.utcnow(),
            )
            session.add(user)
            session.add(PasswordModel(user_id=user.id, password=password))
            session.commit()
            return self._row_to_user(user)

    def update_user(self, user_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        with self.SessionLocal() as session:
            user = session.get(UserModel, user_id)
            if not user:
                return None
            if updates.get('email'):
                user.email = updates['email'].strip().lower()
            if updates.get('full_name') is not None:
                user.full_name = updates['full_name']
            if updates.get('role') is not None:
                user.role = updates['role'].value if isinstance(updates['role'], UserRole) else updates['role']
            if updates.get('is_active') is not None:
                user.is_active = updates['is_active']
            session.commit()
            return self._row_to_user(user)

    def get_students(self) -> List[Dict[str, Any]]:
        with self.SessionLocal() as session:
            return [self._row_to_student(row) for row in session.scalars(select(StudentFormModel)).all()]

    def get_student_by_id(self, student_id: str) -> Optional[Dict[str, Any]]:
        with self.SessionLocal() as session:
            row = session.get(StudentFormModel, student_id)
            return self._row_to_student(row) if row else None

    def get_student_by_user_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        with self.SessionLocal() as session:
            row = session.scalar(select(StudentFormModel).where(StudentFormModel.user_id == user_id))
            return self._row_to_student(row) if row else None

    def generate_registration_number(self, year: int) -> str:
        with self.SessionLocal() as session:
            settings = session.get(SettingModel, 1)
            settings.registration_sequence += 1
            session.commit()
            return f'GHWF-{year}-{settings.registration_sequence:04d}'

    def submit_student_form(self, user_id: str, form_data: Dict[str, Any]) -> Dict[str, Any]:
        if self.get_student_by_user_id(user_id):
            raise ValueError('Form already submitted for this user')
        with self.SessionLocal() as session:
            settings = session.get(SettingModel, 1)
            registration_number = self.generate_registration_number(settings.current_academic_year)
            form = StudentFormModel(
                id=f'std_{uuid.uuid4().hex[:9]}',
                user_id=user_id,
                registration_number=registration_number,
                academic_year=settings.current_academic_year,
                full_name=form_data['full_name'],
                gender=form_data['gender'],
                father_name=form_data['father_name'],
                age=form_data['age'],
                class_name=form_data['class_name'],
                guardian_cnic=form_data['guardian_cnic'],
                guardian_mobile=form_data['guardian_mobile'],
                teacher_contact=form_data.get('teacher_contact'),
                school_name=form_data['school_name'],
                referred_by_name=form_data.get('referred_by_name'),
                referred_by_mobile=form_data.get('referred_by_mobile'),
                address_district_village=form_data['address_district_village'],
                additional_info=form_data.get('additional_info'),
                submitted_at=datetime.utcnow(),
                last_edited_at=datetime.utcnow(),
                edit_locked=False,
                downloaded_by_student=False,
                created_at=datetime.utcnow(),
            )
            session.add(form)
            session.commit()
            return self._row_to_student(form)

    def update_student_form(self, user_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        with self.SessionLocal() as session:
            student = session.scalar(select(StudentFormModel).where(StudentFormModel.user_id == user_id))
            if not student:
                return None
            if student.edit_locked:
                raise ValueError('EDIT_LOCKED')
            for field, value in updates.items():
                if value is not None and hasattr(student, field):
                    setattr(student, field, value)
            student.last_edited_at = datetime.utcnow()
            session.commit()
            return self._row_to_student(student)

    def set_student_downloaded(self, user_id: str, downloaded: bool) -> Optional[Dict[str, Any]]:
        with self.SessionLocal() as session:
            student = session.scalar(select(StudentFormModel).where(StudentFormModel.user_id == user_id))
            if not student:
                return None
            student.downloaded_by_student = downloaded
            session.commit()
            return self._row_to_student(student)

    def verify_and_lock_old_submissions(self) -> int:
        with self.SessionLocal() as session:
            locked_count = 0
            for student in session.scalars(select(StudentFormModel).where(StudentFormModel.edit_locked == False)).all():
                if student.submitted_at and datetime.utcnow() - student.submitted_at > timedelta(hours=24):
                    student.edit_locked = True
                    locked_count += 1
            if locked_count:
                session.commit()
            return locked_count

    def get_settings(self) -> Dict[str, Any]:
        with self.SessionLocal() as session:
            settings = session.get(SettingModel, 1)
            return {
                'download_window_start': settings.download_window_start.isoformat(),
                'download_window_end': settings.download_window_end.isoformat(),
                'current_academic_year': settings.current_academic_year,
            }

    def update_settings(self, updates: Dict[str, Any]) -> Dict[str, Any]:
        with self.SessionLocal() as session:
            settings = session.get(SettingModel, 1)
            if updates.get('download_window_start'):
                settings.download_window_start = date.fromisoformat(updates['download_window_start'])
            if updates.get('download_window_end'):
                settings.download_window_end = date.fromisoformat(updates['download_window_end'])
            if updates.get('current_academic_year') is not None:
                settings.current_academic_year = updates['current_academic_year']
            if updates.get('reset_sequence'):
                settings.registration_sequence = 0
            session.commit()
            return self.get_settings()

    def reset_sequence(self) -> None:
        with self.SessionLocal() as session:
            settings = session.get(SettingModel, 1)
            settings.registration_sequence = 0
            session.commit()

    def get_audit_logs(self) -> List[Dict[str, Any]]:
        with self.SessionLocal() as session:
            return [self._row_to_audit_log(row) for row in session.scalars(select(AuditLogModel).order_by(AuditLogModel.created_at.desc())).all()]

    def add_audit_log(self, actor_id: str, action: str, metadata: Dict[str, Any], target_id: Optional[str] = None, target_name: Optional[str] = None) -> Dict[str, Any]:
        with self.SessionLocal() as session:
            actor = session.get(UserModel, actor_id)
            new_log = AuditLogModel(
                id=f'log_{uuid.uuid4().hex[:9]}',
                actor_id=actor_id,
                actor_name=actor.full_name if actor else 'Unknown',
                action=action,
                target_id=target_id,
                target_name=target_name,
                metadata_json=metadata,
                created_at=datetime.utcnow(),
            )
            session.add(new_log)
            session.commit()
            return self._row_to_audit_log(new_log)

    def get_blacklisted_tokens(self) -> List[str]:
        with self.SessionLocal() as session:
            return [row.jti for row in session.scalars(select(BlacklistedTokenModel)).all()]

    def blacklist_token(self, jti: str) -> None:
        with self.SessionLocal() as session:
            if not session.get(BlacklistedTokenModel, jti):
                session.add(BlacklistedTokenModel(jti=jti, blacklisted_at=datetime.utcnow()))
                session.commit()


db = Database()
