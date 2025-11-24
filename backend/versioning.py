"""
API Versioning middleware and utilities
Implements /api/v1/ versioning with deprecation warnings
"""

from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from typing import Callable, Optional
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

# API version configuration
CURRENT_VERSION = "v1"
SUPPORTED_VERSIONS = ["v1"]
DEPRECATED_VERSIONS = []  # Add versions here when deprecating

# Deprecation dates (version: deprecation_date)
DEPRECATION_DATES = {
    # "v0": "2024-12-31"
}


class APIVersion:
    """API version information"""
    
    def __init__(self, version: str):
        self.version = version
        self.is_supported = version in SUPPORTED_VERSIONS
        self.is_deprecated = version in DEPRECATED_VERSIONS
        self.deprecation_date = DEPRECATION_DATES.get(version)
    
    def __str__(self) -> str:
        return self.version


def extract_version_from_path(path: str) -> Optional[str]:
    """
    Extract API version from request path
    
    Args:
        path: Request path (e.g., /api/v1/inventory)
        
    Returns:
        Version string (e.g., "v1") or None
    """
    parts = path.split("/")
    
    # Look for version in path (e.g., /api/v1/...)
    for part in parts:
        if part.startswith("v") and part[1:].isdigit():
            return part
    
    return None


async def version_middleware(request: Request, call_next: Callable):
    """
    Middleware to handle API versioning
    
    - Extracts version from path
    - Validates version is supported
    - Adds deprecation warnings
    - Adds version to response headers
    """
    path = request.url.path
    
    # Skip non-API paths
    if not path.startswith("/api/"):
        return await call_next(request)
    
    # Extract version
    version_str = extract_version_from_path(path)
    
    # If no version specified, use current version
    if not version_str:
        # Redirect to versioned endpoint
        logger.warning(f"Request to unversioned endpoint: {path}")
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "error": "API version required",
                "message": f"Please use /api/{CURRENT_VERSION}/ prefix",
                "current_version": CURRENT_VERSION,
                "supported_versions": SUPPORTED_VERSIONS
            }
        )
    
    # Create version object
    api_version = APIVersion(version_str)
    
    # Check if version is supported
    if not api_version.is_supported:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "error": "Unsupported API version",
                "message": f"API version {version_str} is not supported",
                "current_version": CURRENT_VERSION,
                "supported_versions": SUPPORTED_VERSIONS
            }
        )
    
    # Add version to request state
    request.state.api_version = api_version
    
    # Process request
    response = await call_next(request)
    
    # Add version headers
    response.headers["X-API-Version"] = version_str
    response.headers["X-API-Current-Version"] = CURRENT_VERSION
    
    # Add deprecation warning if applicable
    if api_version.is_deprecated:
        deprecation_date = api_version.deprecation_date or "TBD"
        response.headers["X-API-Deprecated"] = "true"
        response.headers["X-API-Deprecation-Date"] = deprecation_date
        response.headers["Warning"] = (
            f'299 - "API version {version_str} is deprecated. '
            f'Please migrate to {CURRENT_VERSION} before {deprecation_date}"'
        )
        
        logger.warning(
            f"Deprecated API version used: {version_str}",
            extra={
                "version": version_str,
                "path": path,
                "deprecation_date": deprecation_date
            }
        )
    
    return response


def require_version(min_version: str):
    """
    Decorator to require minimum API version
    
    Usage:
        @router.get("/endpoint")
        @require_version("v1")
        async def endpoint(...):
            ...
    """
    def decorator(func: Callable):
        async def wrapper(request: Request, *args, **kwargs):
            api_version = getattr(request.state, "api_version", None)
            
            if not api_version:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="API version required"
                )
            
            # Simple version comparison (assumes v1, v2, v3, etc.)
            current_ver = int(api_version.version[1:])
            min_ver = int(min_version[1:])
            
            if current_ver < min_ver:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"This endpoint requires API version {min_version} or higher"
                )
            
            return await func(request, *args, **kwargs)
        
        return wrapper
    return decorator


def get_api_version(request: Request) -> APIVersion:
    """
    Get API version from request
    
    Args:
        request: FastAPI request object
        
    Returns:
        APIVersion object
    """
    return getattr(request.state, "api_version", APIVersion(CURRENT_VERSION))


# Version-specific response models
def version_response(data: dict, request: Request) -> dict:
    """
    Add version information to response
    
    Args:
        data: Response data
        request: FastAPI request
        
    Returns:
        Response with version metadata
    """
    api_version = get_api_version(request)
    
    return {
        "version": api_version.version,
        "data": data,
        "meta": {
            "current_version": CURRENT_VERSION,
            "deprecated": api_version.is_deprecated,
            "deprecation_date": api_version.deprecation_date
        }
    }
