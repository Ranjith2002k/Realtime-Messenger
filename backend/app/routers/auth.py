from fastapi import APIRouter, HTTPException, status
from app.schemas.auth import LoginRequest, SignupRequest, AuthResponse
from app.supabase_client import get_supabase

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login")
async def login(body: LoginRequest):
    """Sign in with email and password via Supabase Auth."""
    sb = get_supabase()
    try:
        result = sb.auth.sign_in_with_password(
            {"email": body.email, "password": body.password}
        )
        return {
            "access_token": result.session.access_token,
            "refresh_token": result.session.refresh_token,
            "user": {
                "id": result.user.id,
                "email": result.user.email,
                "user_metadata": result.user.user_metadata,
            },
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
        )


@router.post("/signup")
async def signup(body: SignupRequest):
    """Create a new account via Supabase Auth."""
    sb = get_supabase()
    try:
        result = sb.auth.sign_up(
            {
                "email": body.email,
                "password": body.password,
                "options": {"data": {"name": body.name}},
            }
        )

        response = {
            "user": {
                "id": result.user.id,
                "email": result.user.email,
                "user_metadata": result.user.user_metadata,
            }
        }

        if result.session:
            response["access_token"] = result.session.access_token
            response["refresh_token"] = result.session.refresh_token

        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post("/logout")
async def logout():
    """Sign out — client should discard tokens."""
    return {"message": "Logged out successfully"}
