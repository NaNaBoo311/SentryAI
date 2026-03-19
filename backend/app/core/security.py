from fastapi import Depends, HTTPException, Request, status
from app.core.config import get_settings, Settings
from app.services.supabase_client import get_supabase_admin


def get_current_user(
    request: Request,
    settings: Settings = Depends(get_settings),
) -> str:
    """Extract and verify the Supabase JWT from the Authorization header.
    Uses the Supabase admin client to verify the token — works with both
    HS256 (legacy) and ES256 (newer Supabase projects).
    Returns the user_id (sub claim).
    """
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header",
        )

    token = auth_header.removeprefix("Bearer ").strip()

    try:
        client = get_supabase_admin()
        response = client.auth.get_user(token)
        user = response.user
        if not user or not user.id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
            )
        return str(user.id)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token verification failed: {e}",
        )
