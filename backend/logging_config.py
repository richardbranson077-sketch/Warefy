import logging
import sys
import uuid
import contextvars
from pythonjsonlogger import jsonlogger

# Context variable for correlation ID
correlation_id_ctx = contextvars.ContextVar("correlation_id", default=None)

def setup_logging(level="INFO", log_file=None, json_format=True):
    """Configure structured JSON logging for the application."""
    logger = logging.getLogger()
    
    # Remove existing handlers
    for handler in logger.handlers:
        logger.removeHandler(handler)
        
    # Create console handler
    handler = logging.StreamHandler(sys.stdout)
    
    if json_format:
        # Define the fields we want in our logs
        formatter = jsonlogger.JsonFormatter(
            "%(asctime)s %(levelname)s %(name)s %(message)s %(correlation_id)s",
            rename_fields={"asctime": "timestamp", "levelname": "level"}
        )
    else:
        formatter = logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        )
    
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    
    # Set log level
    log_level = getattr(logging, level.upper(), logging.INFO)
    logger.setLevel(log_level)
    
    # Quiet down some noisy libraries
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    
    return logger

def get_logger(name):
    """Get a logger instance with the given name."""
    return logging.getLogger(name)

def set_correlation_id(cid=None):
    """Set the correlation ID for the current context."""
    if cid is None:
        cid = str(uuid.uuid4())
    correlation_id_ctx.set(cid)
    return cid

def get_correlation_id():
    """Get the correlation ID from the current context."""
    return correlation_id_ctx.get()

def log_request(method, endpoint, status_code, duration_ms):
    """Log details of an HTTP request."""
    logger = logging.getLogger("request_logger")
    logger.info(
        "Request processed",
        extra={
            "method": method,
            "endpoint": endpoint,
            "status_code": status_code,
            "duration_ms": round(duration_ms, 2),
            "correlation_id": get_correlation_id()
        }
    )

# Add a filter to inject correlation ID into logs
class CorrelationIdFilter(logging.Filter):
    def filter(self, record):
        record.correlation_id = get_correlation_id()
        return True

# Apply filter to root logger
logging.getLogger().addFilter(CorrelationIdFilter())
