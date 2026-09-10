import base64
import hashlib
import hmac
import json
import os
import time

TOKEN_TTL_SECONDS = 60 * 60 * 12


def _secret() -> bytes:
    secret = os.getenv('HIND_PHARMA_AUTH_SECRET', 'change-this-secret-before-production')
    return secret.encode('utf-8')


def _encode(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).decode('ascii').rstrip('=')


def _decode(value: str) -> bytes:
    return base64.urlsafe_b64decode(value + '=' * (-len(value) % 4))


def create_token(user_id: int, username: str, role: str, admin_id: int | None = None) -> str:
    payload = {
        'id': user_id,
        'username': username,
        'role': role,
        'admin_id': admin_id,
        'exp': int(time.time()) + TOKEN_TTL_SECONDS,
    }
    body = _encode(json.dumps(payload, separators=(',', ':')).encode('utf-8'))
    signature = _encode(hmac.new(_secret(), body.encode('ascii'), hashlib.sha256).digest())
    return f'{body}.{signature}'


def verify_token(token: str) -> dict:
    try:
        body, signature = token.split('.', 1)
        expected = _encode(hmac.new(_secret(), body.encode('ascii'), hashlib.sha256).digest())
        if not hmac.compare_digest(signature, expected):
            raise ValueError('Invalid token')
        payload = json.loads(_decode(body))
        if int(payload.get('exp', 0)) < int(time.time()):
            raise ValueError('Expired token')
        return payload
    except (ValueError, TypeError, json.JSONDecodeError, UnicodeDecodeError):
        raise ValueError('Invalid or expired token')
