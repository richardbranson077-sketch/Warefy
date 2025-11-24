"""
Security utilities for input validation, sanitization, and error handling
"""

from typing import Any, Optional, Dict, List
from pydantic import BaseModel, validator, Field
from fastapi import HTTPException, status
import re
import html
import bleach
from datetime import datetime


# ============================================================================
# INPUT VALIDATION SCHEMAS
# ============================================================================

class SafeString(BaseModel):
    """Validated and sanitized string input"""
    value: str = Field(..., min_length=1, max_length=1000)
    
    @validator('value')
    def sanitize_string(cls, v):
        # Remove any potential XSS
        return bleach.clean(v, strip=True)


class SafeEmail(BaseModel):
    """Validated email address"""
    email: str = Field(..., regex=r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    
    @validator('email')
    def lowercase_email(cls, v):
        return v.lower().strip()


class SafeSKU(BaseModel):
    """Validated SKU/product code"""
    sku: str = Field(..., regex=r'^[A-Z0-9\-_]{1,50}$')


class SafeInteger(BaseModel):
    """Validated integer with range"""
    value: int = Field(..., ge=0, le=1000000000)


class SafeFloat(BaseModel):
    """Validated float with range"""
    value: float = Field(..., ge=0.0, le=1000000000.0)


# ============================================================================
# XSS PROTECTION
# ============================================================================

def sanitize_html(text: str) -> str:
    """
    Remove all HTML tags and dangerous content
    
    Args:
        text: Input text that may contain HTML
        
    Returns:
        Sanitized text with HTML removed
    """
    if not text:
        return ""
    
    # Use bleach to remove all HTML tags
    return bleach.clean(text, tags=[], strip=True)


def sanitize_output(data: Any) -> Any:
    """
    Recursively sanitize all string values in data structure
    
    Args:
        data: Dictionary, list, or primitive value
        
    Returns:
        Sanitized data structure
    """
    if isinstance(data, dict):
        return {k: sanitize_output(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [sanitize_output(item) for item in data]
    elif isinstance(data, str):
        return html.escape(data)
    else:
        return data


# ============================================================================
# SQL INJECTION PREVENTION
# ============================================================================

def validate_sql_identifier(identifier: str) -> str:
    """
    Validate SQL identifiers (table names, column names)
    Only allow alphanumeric and underscore
    
    Args:
        identifier: SQL identifier to validate
        
    Returns:
        Validated identifier
        
    Raises:
        HTTPException: If identifier is invalid
    """
    if not re.match(r'^[a-zA-Z_][a-zA-Z0-9_]*$', identifier):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid identifier format"
        )
    return identifier


def validate_order_by(order_by: str, allowed_fields: List[str]) -> str:
    """
    Validate ORDER BY clause to prevent SQL injection
    
    Args:
        order_by: Field name to order by
        allowed_fields: List of allowed field names
        
    Returns:
        Validated field name
        
    Raises:
        HTTPException: If field is not allowed
    """
    if order_by not in allowed_fields:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid order_by field. Allowed: {', '.join(allowed_fields)}"
        )
    return order_by


# ============================================================================
# INPUT VALIDATION
# ============================================================================

def validate_pagination(skip: int = 0, limit: int = 100) -> tuple:
    """
    Validate pagination parameters
    
    Args:
        skip: Number of records to skip
        limit: Maximum number of records to return
        
    Returns:
        Tuple of (validated_skip, validated_limit)
        
    Raises:
        HTTPException: If parameters are invalid
    """
    if skip < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Skip must be >= 0"
        )
    
    if limit < 1 or limit > 1000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Limit must be between 1 and 1000"
        )
    
    return skip, limit


def validate_date_range(start_date: Optional[datetime], end_date: Optional[datetime]) -> tuple:
    """
    Validate date range
    
    Args:
        start_date: Start date
        end_date: End date
        
    Returns:
        Tuple of (start_date, end_date)
        
    Raises:
        HTTPException: If date range is invalid
    """
    if start_date and end_date and start_date > end_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Start date must be before end date"
        )
    
    return start_date, end_date


def validate_id(id_value: int, entity_name: str = "Entity") -> int:
    """
    Validate ID parameter
    
    Args:
        id_value: ID to validate
        entity_name: Name of entity for error message
        
    Returns:
        Validated ID
        
    Raises:
        HTTPException: If ID is invalid
    """
    if id_value < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{entity_name} ID must be positive"
        )
    
    return id_value


# ============================================================================
# ERROR HANDLING
# ============================================================================

class APIError(Exception):
    """Base exception for API errors"""
    def __init__(self, message: str, status_code: int = 500, details: Optional[Dict] = None):
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


class ValidationError(APIError):
    """Validation error"""
    def __init__(self, message: str, details: Optional[Dict] = None):
        super().__init__(message, status.HTTP_400_BAD_REQUEST, details)


class NotFoundError(APIError):
    """Resource not found error"""
    def __init__(self, resource: str, identifier: Any):
        message = f"{resource} with ID {identifier} not found"
        super().__init__(message, status.HTTP_404_NOT_FOUND)


class UnauthorizedError(APIError):
    """Unauthorized access error"""
    def __init__(self, message: str = "Unauthorized"):
        super().__init__(message, status.HTTP_401_UNAUTHORIZED)


class ForbiddenError(APIError):
    """Forbidden access error"""
    def __init__(self, message: str = "Forbidden"):
        super().__init__(message, status.HTTP_403_FORBIDDEN)


def handle_database_error(error: Exception) -> HTTPException:
    """
    Convert database errors to HTTP exceptions
    
    Args:
        error: Database exception
        
    Returns:
        HTTPException with appropriate status code
    """
    error_str = str(error).lower()
    
    # Integrity errors (duplicate, foreign key, etc.)
    if 'unique' in error_str or 'duplicate' in error_str:
        return HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Resource already exists"
        )
    
    if 'foreign key' in error_str:
        return HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Referenced resource does not exist"
        )
    
    # Generic database error
    return HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Database error occurred"
    )


# ============================================================================
# RATE LIMITING (Simple in-memory implementation)
# ============================================================================

from collections import defaultdict
from time import time

class RateLimiter:
    """Simple in-memory rate limiter"""
    
    def __init__(self, max_requests: int = 100, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests = defaultdict(list)
    
    def is_allowed(self, identifier: str) -> bool:
        """
        Check if request is allowed
        
        Args:
            identifier: Unique identifier (e.g., IP address, user ID)
            
        Returns:
            True if allowed, False if rate limit exceeded
        """
        now = time()
        window_start = now - self.window_seconds
        
        # Remove old requests
        self.requests[identifier] = [
            req_time for req_time in self.requests[identifier]
            if req_time > window_start
        ]
        
        # Check if limit exceeded
        if len(self.requests[identifier]) >= self.max_requests:
            return False
        
        # Add current request
        self.requests[identifier].append(now)
        return True


# Global rate limiter instance
rate_limiter = RateLimiter(max_requests=100, window_seconds=60)


# ============================================================================
# LOGGING
# ============================================================================

import logging
from typing import Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)


def log_security_event(event_type: str, details: Dict, user_id: Optional[int] = None):
    """
    Log security-related events
    
    Args:
        event_type: Type of security event
        details: Event details
        user_id: User ID if applicable
    """
    logger.warning(
        f"SECURITY EVENT: {event_type}",
        extra={
            "user_id": user_id,
            "details": details,
            "timestamp": datetime.utcnow().isoformat()
        }
    )


def log_api_error(error: Exception, endpoint: str, user_id: Optional[int] = None):
    """
    Log API errors
    
    Args:
        error: Exception that occurred
        endpoint: API endpoint where error occurred
        user_id: User ID if applicable
    """
    logger.error(
        f"API ERROR at {endpoint}: {str(error)}",
        extra={
            "user_id": user_id,
            "error_type": type(error).__name__,
            "timestamp": datetime.utcnow().isoformat()
        },
        exc_info=True
    )
