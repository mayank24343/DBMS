from rest_framework.permissions import BasePermission

def IsRole(*roles):
    class _IsRole(BasePermission):
        def has_permission(self, request, view):
            user = getattr(request, 'user', None)
            return bool(
                user and getattr(user, 'is_authenticated', False)
                and user.role in roles
            )
    return _IsRole

class IsOwnerCitizenOrStaff(BasePermission):
    """For endpoints with citizen_id in the URL kwargs."""
    def has_permission(self, request, view):
        user = getattr(request, 'user', None)
        if not user or not getattr(user, 'is_authenticated', False):
            return False
        if user.role in ('worker', 'admin'):
            return True
        if user.role == 'citizen':
            citizen_id = view.kwargs.get('citizen_id')
            return citizen_id is not None and str(user.id) == str(citizen_id)
        return False