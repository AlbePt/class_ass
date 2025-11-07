from __future__ import annotations

import os
import sqlite3
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

from fastapi import HTTPException, status

USER_DB_PATH = Path(os.getenv("USER_DB_PATH", Path(__file__).resolve().parent.parent / "users.db"))
USER_DB_PATH.parent.mkdir(parents=True, exist_ok=True)


@dataclass
class User:
    id: int
    email: str
    password_hash: str


def _get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(USER_DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with _get_conn() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL
            );
            """
        )
        conn.commit()


init_db()


def create_user(email: str, password_hash: str) -> User:
    try:
        with _get_conn() as conn:
            cursor = conn.execute(
                "INSERT INTO users (email, password_hash) VALUES (?, ?)", (email, password_hash)
            )
            conn.commit()
            user_id = cursor.lastrowid
    except sqlite3.IntegrityError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="User already exists") from exc
    return User(id=user_id, email=email, password_hash=password_hash)


def get_user_by_email(email: str) -> Optional[User]:
    with _get_conn() as conn:
        cursor = conn.execute("SELECT id, email, password_hash FROM users WHERE email = ?", (email,))
        row = cursor.fetchone()
    if row:
        return User(id=row["id"], email=row["email"], password_hash=row["password_hash"])
    return None


def authenticate_user(email: str, password: str, verify_callback) -> Optional[User]:
    user = get_user_by_email(email)
    if not user:
        return None
    if not verify_callback(password, user.password_hash):
        return None
    return user


__all__ = ["User", "create_user", "get_user_by_email", "authenticate_user"]
