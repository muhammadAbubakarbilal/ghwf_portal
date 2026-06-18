import os
import uuid
from datetime import datetime, timedelta
from typing import Any, Dict, Optional

from fastapi import Depends, Header, HTTPException, Security, status
from jose import JWTError, jwt

from .database import db
from .schemas import UserRole

JWT_SECRET = os.environ.get('JWT_SECRET', 'ghwf-jwt-secret-key-2026-safe-default-key-321')
ALGORITHM = 'HS256'
ACCESS_TOKEN_EXPIRE_MINUTES = 7 * 24 * 60

class TokenData:
    def __init__(self, sub: str, email: str, role: str, full_name: str, jti: str):
        self.sub = sub
        self.email = email
        self.role = role
        self.full_name = full_name
        self.jti = jti


def create_access_token(subject: str, email: str, role: str, full_name: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode: Dict[str, Any] = {
        'sub': subject,
        'email': email,
        'role': role,
        'full_name': full_name,
        'jti': str(uuid.uuid4()),
        'exp': expire,
    }
    return jwt.encode(to_encode, JWT_SECRET, algorithm=ALGORITHM)


def decode_token(token: str) -> TokenData:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        sub = payload.get('sub')
        email = payload.get('email')
        role = payload.get('role')
        full_name = payload.get('full_name')
        jti = payload.get('jti')
        if not sub or not email or not role or not full_name or not jti:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid token payload.')
        if jti in db.get_blacklisted_tokens():
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Session expired. Please log in again.')
        return TokenData(sub=sub, email=email, role=role, full_name=full_name, jti=jti)
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid or expired session token.')


def get_current_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Authorization required.')
    token = authorization.split(' ')[1]
    token_data = decode_token(token)
    user = db.get_user_by_id(token_data.sub)
    if not user or not user.get('is_active'):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Account is blocked or inactive.')
    return {**user, 'token_jti': token_data.jti}


def require_roles(roles):
    def dependency(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
        if current_user['role'] not in [role.value for role in roles]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='You are not authorized to perform this action.')
        return current_user
    return dependency
