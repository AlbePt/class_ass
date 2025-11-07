from __future__ import annotations

import os
import threading
import uuid
from abc import ABC, abstractmethod
from typing import Optional

from cachetools import TTLCache

from backend.core.models import ReportSessionPayload

try:
    import redis  # type: ignore
except Exception:  # pragma: no cover
    redis = None


class SessionStore(ABC):
    @abstractmethod
    def set(self, key: str, value: ReportSessionPayload) -> None:
        ...

    @abstractmethod
    def get(self, key: str) -> Optional[ReportSessionPayload]:
        ...

    @abstractmethod
    def delete(self, key: str) -> None:
        ...


class InMemorySessionStore(SessionStore):
    def __init__(self, ttl_seconds: int = 1800, max_entries: int = 256) -> None:
        self.cache: TTLCache[str, ReportSessionPayload] = TTLCache(maxsize=max_entries, ttl=ttl_seconds)
        self.lock = threading.Lock()

    def set(self, key: str, value: ReportSessionPayload) -> None:
        with self.lock:
            self.cache[key] = value

    def get(self, key: str) -> Optional[ReportSessionPayload]:
        with self.lock:
            return self.cache.get(key)

    def delete(self, key: str) -> None:
        with self.lock:
            if key in self.cache:
                del self.cache[key]


class RedisSessionStore(SessionStore):  # pragma: no cover - requires redis
    def __init__(self, url: str, ttl_seconds: int) -> None:
        if redis is None:
            raise RuntimeError("Redis support not available - install redis-py")
        self.client = redis.Redis.from_url(url)
        self.ttl = ttl_seconds

    def set(self, key: str, value: ReportSessionPayload) -> None:
        self.client.setex(key, self.ttl, value.json())

    def get(self, key: str) -> Optional[ReportSessionPayload]:
        payload = self.client.get(key)
        if not payload:
            return None
        return ReportSessionPayload.parse_raw(payload)

    def delete(self, key: str) -> None:
        self.client.delete(key)


_session_store: Optional[SessionStore] = None

def get_session_store() -> SessionStore:
    global _session_store
    if _session_store is None:
        ttl_minutes = int(os.getenv("SESSION_TTL_MIN", "45"))
        ttl_seconds = ttl_minutes * 60
        redis_url = os.getenv("SESSION_REDIS_URL")
        if redis_url:
            _session_store = RedisSessionStore(redis_url, ttl_seconds)
        else:
            _session_store = InMemorySessionStore(ttl_seconds=ttl_seconds)
    return _session_store


def create_session_id() -> str:
    return uuid.uuid4().hex


def store_session(payload: ReportSessionPayload) -> str:
    session_id = payload.preview.session_id or create_session_id()
    payload.preview.session_id = session_id
    store = get_session_store()
    store.set(session_id, payload)
    return session_id


def get_session(session_id: str) -> Optional[ReportSessionPayload]:
    return get_session_store().get(session_id)


def delete_session(session_id: str) -> None:
    get_session_store().delete(session_id)


__all__ = [
    "get_session_store",
    "create_session_id",
    "store_session",
    "get_session",
    "delete_session",
]
