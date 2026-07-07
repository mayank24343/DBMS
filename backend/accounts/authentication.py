from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from .tokens import resolve_token

class SimpleUser:
    def __init__(self, id, role):
        self.id = id
        self.role = role
        self.is_authenticated = True

class TokenAuth(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Token '):
            return None  # anonymous; permission classes decide if that's allowed

        key = auth_header.split(' ', 1)[1].strip()
        result = resolve_token(key)
        if result is None:
            raise AuthenticationFailed('Invalid or expired token')

        user_id, role = result
        return (SimpleUser(user_id, role), None)