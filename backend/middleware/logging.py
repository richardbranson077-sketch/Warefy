import time
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request, Response

logger = logging.getLogger(__name__)

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # Process request
        try:
            response = await call_next(request)
            process_time = (time.time() - start_time) * 1000
            
            # Log request details
            log_data = {
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "processing_time_ms": round(process_time, 2),
                "client_ip": request.client.host if request.client else "unknown",
            }
            
            # Log at appropriate level
            if response.status_code >= 500:
                logger.error("Request failed", extra=log_data)
            else:
                logger.info("Request processed", extra=log_data)
                
            return response
            
        except Exception as e:
            process_time = (time.time() - start_time) * 1000
            logger.error(
                f"Request failed with exception: {str(e)}",
                extra={
                    "method": request.method,
                    "path": request.url.path,
                    "processing_time_ms": round(process_time, 2),
                    "error": str(e)
                },
                exc_info=True
            )
            raise e
