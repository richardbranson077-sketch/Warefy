from slowapi import Limiter
from slowapi.util import get_remote_address

# Initialize limiter with default limits
# Uses in-memory storage by default, but can be configured for Redis
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["100/minute"]
)
