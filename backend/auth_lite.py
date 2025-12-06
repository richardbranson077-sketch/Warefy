"""
Authentication and authorization utilities for Warefy (Lite Version).
Handles JWT token generation, password hashing, and user verification.
Uses SQLite-compatible models and database connection.
"""

from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import os
from dotenv import load_dotenv

# Changed imports for Lite version
from backend.database_lite import get_db
from backend.models_lite import User
from backend.schemas import TokenData

load_dotenv()

# Configuration
SECRET_KEY = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# Password hashing - use pbkdf2_sha256 instead of bcrypt for better compatibility
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

from backend.cache import cache

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    """Get the current authenticated user from JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    
    # Check cache first
    cache_key = f"user:{token_data.username}"
    cached_user_data = cache.get(cache_key)
    
    if cached_user_data:
        # Reconstruct User object from cached dictionary
        # Note: This is a simplified reconstruction. For full ORM features, 
        # we might need to query DB if critical fields are missing.
        # But for basic auth checks, this is usually sufficient.
        # However, to be safe and ensure SQLAlchemy session attachment if needed later,
        # we might still query DB but use cache to skip query if we trust cache fully.
        # For this implementation, we'll use cache to store the ID and basic info,
        # but if we need a full ORM object attached to session, we might still need a query.
        # A common pattern is to cache the user ID and then query by ID (faster than username index sometimes)
        # OR just query DB if we need the attached object.
        # Let's stick to DB query for safety in this "Lite" version but use cache to avoid
        # repeated lookups if we were doing stateless auth. 
        # Actually, for "get_current_user", we return a User ORM object.
        # Caching the ORM object directly is tricky.
        # Let's cache the user ID lookup from username.
        pass

    # For now, let's keep the DB query to ensure we have a valid ORM object attached to the session
    # Optimization: We could cache the user record ID to avoid index lookup on username if that's slow,
    # but username is likely indexed/unique.
    
    # REAL CACHING STRATEGY:
    # We can cache the user dictionary and return a Pydantic model or lightweight object
    # if the endpoint doesn't strictly need a DB-attached ORM object.
    # But since many endpoints depend on `current_user` being a DB model (e.g. for relationships),
    # returning a dict might break things.
    
    # Alternative: Cache the result of the query (the User object state)
    # and use `db.merge()` or similar if we need it attached? No, that's complex.
    
    # Let's just cache the EXISTENCE/VALIDITY check for now to avoid overhead?
    # Actually, the most expensive part is usually the DB round trip.
    
    # Let's stick to the safe approach: Query DB. 
    # But we can cache the "username -> user_id" mapping if we wanted.
    
    user = db.query(User).filter(User.username == token_data.username).first()
    if user is None:
        raise credentials_exception
    
    return user

def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Ensure the current user is active"""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def require_role(required_roles: list):
    """Dependency to check if user has required role"""
    def role_checker(current_user: User = Depends(get_current_active_user)) -> User:
        if current_user.role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {', '.join(required_roles)}"
            )
        return current_user
    return role_checker

async def get_current_user_from_token(token: str, db: Session) -> User:
    """
    Get the current authenticated user from JWT token (async version for WebSockets)
    
    Args:
        token: JWT token string
        db: Database session
        
    Returns:
        User object if authentication successful
        
    Raises:
        HTTPException: If authentication fails
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.username == token_data.username).first()
    if user is None:
        raise credentials_exception
    
    return user
