from fastapi import APIRouter, Depends, HTTPException, status
from app.dependencies import get_current_user
from app.schemas.profile import ProfileResponse, ProfileUpdate
from app.supabase_client import get_supabase

router = APIRouter(prefix="/profiles", tags=["profiles"])


@router.get("/")
async def list_profiles(user: dict = Depends(get_current_user)):
    """List all user profiles."""
    sb = get_supabase()
    result = sb.table("profiles").select("*").execute()
    return result.data


@router.get("/{profile_id}")
async def get_profile(profile_id: str, user: dict = Depends(get_current_user)):
    """Get a single profile by ID."""
    sb = get_supabase()
    result = (
        sb.table("profiles")
        .select("*")
        .eq("id", profile_id)
        .single()
        .execute()
    )
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found",
        )
    return result.data


@router.patch("/{profile_id}")
async def update_profile(
    profile_id: str,
    body: ProfileUpdate,
    user: dict = Depends(get_current_user),
):
    """Update profile fields (status, last_seen, name, avatar_url)."""
    if user["id"] != profile_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot update another user's profile",
        )

    sb = get_supabase()
    update_data = body.model_dump(exclude_none=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update",
        )

    result = (
        sb.table("profiles")
        .update(update_data)
        .eq("id", profile_id)
        .execute()
    )
    return result.data[0] if result.data else {}
