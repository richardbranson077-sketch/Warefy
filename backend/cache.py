import os
import json
import time
import logging
from typing import Any, Optional
import redis

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CacheManager:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(CacheManager, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        self.use_redis = False
        self.redis_client = None
        self.local_cache = {}
        self.ttl_map = {}

        # Try to connect to Redis
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
        try:
            self.redis_client = redis.from_url(redis_url, decode_responses=True)
            self.redis_client.ping()
            self.use_redis = True
            logger.info(f"✅ Connected to Redis at {redis_url}")
        except redis.ConnectionError:
            logger.warning("⚠️ Redis not available. Falling back to in-memory caching.")
            self.use_redis = False
        except Exception as e:
            logger.error(f"❌ Error connecting to Redis: {e}. Falling back to in-memory caching.")
            self.use_redis = False

    def get(self, key: str) -> Optional[Any]:
        """Get a value from the cache."""
        if self.use_redis:
            try:
                value = self.redis_client.get(key)
                if value:
                    return json.loads(value)
                return None
            except Exception as e:
                logger.error(f"Redis get error: {e}")
                return None
        else:
            # In-memory get
            if key in self.local_cache:
                # Check TTL
                if key in self.ttl_map and time.time() > self.ttl_map[key]:
                    self.delete(key)
                    return None
                return self.local_cache[key]
            return None

    def set(self, key: str, value: Any, ttl: int = 300) -> bool:
        """Set a value in the cache with a TTL (default 5 minutes)."""
        if self.use_redis:
            try:
                self.redis_client.setex(key, ttl, json.dumps(value))
                return True
            except Exception as e:
                logger.error(f"Redis set error: {e}")
                return False
        else:
            # In-memory set
            self.local_cache[key] = value
            self.ttl_map[key] = time.time() + ttl
            
            # Basic cleanup if cache gets too big (simple LRU-ish prevention)
            if len(self.local_cache) > 1000:
                # Remove 20% of items randomly/arbitrarily to prevent memory leak
                keys_to_remove = list(self.local_cache.keys())[:200]
                for k in keys_to_remove:
                    self.delete(k)
            
            return True

    def delete(self, key: str) -> bool:
        """Delete a value from the cache."""
        if self.use_redis:
            try:
                self.redis_client.delete(key)
                return True
            except Exception as e:
                logger.error(f"Redis delete error: {e}")
                return False
        else:
            if key in self.local_cache:
                del self.local_cache[key]
            if key in self.ttl_map:
                del self.ttl_map[key]
            return True

    def clear(self):
        """Clear the entire cache."""
        if self.use_redis:
            try:
                self.redis_client.flushdb()
            except Exception as e:
                logger.error(f"Redis flush error: {e}")
        else:
            self.local_cache.clear()
            self.ttl_map.clear()

# Global instance
cache = CacheManager()
