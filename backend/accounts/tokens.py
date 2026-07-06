# accounts/tokens.py
import secrets
from datetime import timedelta
from django.db import connection
from django.utils import timezone

TOKEN_LIFETIME = timedelta(hours=24)

def issue_token(user_id, role):
    key = secrets.token_hex(32)
    cursor = connection.cursor()
    cursor.execute(
        "INSERT INTO auth_token (`key`, user_id, role) VALUES (%s, %s, %s)",
        [key, user_id, role]
    )
    return key

def resolve_token(key):
    """Returns (user_id, role) or None if invalid/expired."""
    cursor = connection.cursor()
    cursor.execute(
        "SELECT user_id, role, created_at FROM auth_token WHERE `key` = %s",
        [key]
    )
    row = cursor.fetchone()
    if not row:
        return None
    user_id, role, created_at = row
    if timezone.now() - created_at > TOKEN_LIFETIME:
        cursor.execute("DELETE FROM auth_token WHERE `key` = %s", [key])
        return None
    return user_id, role