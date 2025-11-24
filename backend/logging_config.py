"""
Structured logging configuration for Warefy
Provides JSON-formatted logs with correlation IDs and request tracking
"""

import logging
import json
import sys
from datetime import datetime
from typing import Optional, Dict, Any
from contextvars import ContextVar
import uuid

# Context variable for request correlation ID
correlation_id: ContextVar[Optional[str]] = ContextVar('correlation_id', default=None)


class JSONFormatter(logging.Formatter):
    """
    Custom JSON formatter for structured logging
    """
    
    def format(self, record: logging.LogRecord) -> str:
        """
        Format log record as JSON
        
        Args:
            record: Log record to format
            
        Returns:
            JSON-formatted log string
        """
        log_data = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }
        
        # Add correlation ID if available
        corr_id = correlation_id.get()
        if corr_id:
            log_data["correlation_id"] = corr_id
        
        # Add extra fields
        if hasattr(record, 'user_id'):
            log_data["user_id"] = record.user_id
        
        if hasattr(record, 'endpoint'):
            log_data["endpoint"] = record.endpoint
        
        if hasattr(record, 'method'):
            log_data["method"] = record.method
        
        if hasattr(record, 'status_code'):
            log_data["status_code"] = record.status_code
        
        if hasattr(record, 'duration_ms'):
            log_data["duration_ms"] = record.duration_ms
        
        # Add exception info if present
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
        
        # Add stack trace if present
        if record.stack_info:
            log_data["stack_trace"] = self.formatStack(record.stack_info)
        
        return json.dumps(log_data)


def setup_logging(
    level: str = "INFO",
    log_file: Optional[str] = None,
    json_format: bool = True
) -> None:
    """
    Configure application logging
    
    Args:
        level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_file: Optional file path for log output
        json_format: Use JSON formatting if True, standard format if False
    """
    # Get root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, level.upper()))
    
    # Remove existing handlers
    root_logger.handlers = []
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(getattr(logging, level.upper()))
    
    if json_format:
        console_handler.setFormatter(JSONFormatter())
    else:
        console_handler.setFormatter(
            logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
        )
    
    root_logger.addHandler(console_handler)
    
    # File handler (optional)
    if log_file:
        file_handler = logging.FileHandler(log_file)
        file_handler.setLevel(getattr(logging, level.upper()))
        
        if json_format:
            file_handler.setFormatter(JSONFormatter())
        else:
            file_handler.setFormatter(
                logging.Formatter(
                    '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
                )
            )
        
        root_logger.addHandler(file_handler)


def get_logger(name: str) -> logging.Logger:
    """
    Get a logger instance
    
    Args:
        name: Logger name (usually __name__)
        
    Returns:
        Logger instance
    """
    return logging.getLogger(name)


def log_request(
    method: str,
    endpoint: str,
    status_code: int,
    duration_ms: float,
    user_id: Optional[int] = None,
    extra: Optional[Dict[str, Any]] = None
) -> None:
    """
    Log HTTP request with structured data
    
    Args:
        method: HTTP method (GET, POST, etc.)
        endpoint: API endpoint
        status_code: HTTP status code
        duration_ms: Request duration in milliseconds
        user_id: User ID if authenticated
        extra: Additional fields to log
    """
    logger = get_logger("api.requests")
    
    log_data = {
        "method": method,
        "endpoint": endpoint,
        "status_code": status_code,
        "duration_ms": round(duration_ms, 2),
    }
    
    if user_id:
        log_data["user_id"] = user_id
    
    if extra:
        log_data.update(extra)
    
    # Log at appropriate level based on status code
    if status_code >= 500:
        logger.error(f"{method} {endpoint} - {status_code}", extra=log_data)
    elif status_code >= 400:
        logger.warning(f"{method} {endpoint} - {status_code}", extra=log_data)
    else:
        logger.info(f"{method} {endpoint} - {status_code}", extra=log_data)


def log_database_query(
    query: str,
    duration_ms: float,
    rows_affected: Optional[int] = None
) -> None:
    """
    Log database query execution
    
    Args:
        query: SQL query (sanitized)
        duration_ms: Query duration in milliseconds
        rows_affected: Number of rows affected
    """
    logger = get_logger("database")
    
    log_data = {
        "query": query[:200],  # Truncate long queries
        "duration_ms": round(duration_ms, 2),
    }
    
    if rows_affected is not None:
        log_data["rows_affected"] = rows_affected
    
    # Warn on slow queries (>1000ms)
    if duration_ms > 1000:
        logger.warning(f"Slow query detected", extra=log_data)
    else:
        logger.debug(f"Query executed", extra=log_data)


def log_security_event(
    event_type: str,
    severity: str,
    details: Dict[str, Any],
    user_id: Optional[int] = None
) -> None:
    """
    Log security-related events
    
    Args:
        event_type: Type of security event
        severity: Severity level (low, medium, high, critical)
        details: Event details
        user_id: User ID if applicable
    """
    logger = get_logger("security")
    
    log_data = {
        "event_type": event_type,
        "severity": severity,
        "details": details,
    }
    
    if user_id:
        log_data["user_id"] = user_id
    
    # Log at appropriate level
    if severity in ["high", "critical"]:
        logger.error(f"Security event: {event_type}", extra=log_data)
    elif severity == "medium":
        logger.warning(f"Security event: {event_type}", extra=log_data)
    else:
        logger.info(f"Security event: {event_type}", extra=log_data)


def log_business_event(
    event_type: str,
    entity_type: str,
    entity_id: Any,
    action: str,
    user_id: Optional[int] = None,
    details: Optional[Dict[str, Any]] = None
) -> None:
    """
    Log business events (e.g., order created, inventory updated)
    
    Args:
        event_type: Type of business event
        entity_type: Type of entity (order, inventory, etc.)
        entity_id: ID of the entity
        action: Action performed (created, updated, deleted)
        user_id: User who performed the action
        details: Additional details
    """
    logger = get_logger("business")
    
    log_data = {
        "event_type": event_type,
        "entity_type": entity_type,
        "entity_id": entity_id,
        "action": action,
    }
    
    if user_id:
        log_data["user_id"] = user_id
    
    if details:
        log_data["details"] = details
    
    logger.info(f"{entity_type} {action}: {entity_id}", extra=log_data)


def set_correlation_id(corr_id: Optional[str] = None) -> str:
    """
    Set correlation ID for request tracking
    
    Args:
        corr_id: Correlation ID (auto-generated if not provided)
        
    Returns:
        Correlation ID
    """
    if not corr_id:
        corr_id = str(uuid.uuid4())
    
    correlation_id.set(corr_id)
    return corr_id


def get_correlation_id() -> Optional[str]:
    """
    Get current correlation ID
    
    Returns:
        Correlation ID or None
    """
    return correlation_id.get()


# Initialize logging on module import
setup_logging(
    level="INFO",
    log_file="backend.log",
    json_format=True
)
