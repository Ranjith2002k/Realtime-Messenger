from fastapi import APIRouter, Depends, HTTPException, status
from app.dependencies import get_current_user
from app.schemas.message import MessageCreate, MessageResponse
from app.supabase_client import get_supabase

router = APIRouter(prefix="/conversations", tags=["messages"])


@router.get("/{conversation_id}/messages")
async def get_messages(
    conversation_id: str, user: dict = Depends(get_current_user)
):
    """Get all messages for a conversation, ordered by time ascending."""
    sb = get_supabase()

    # Verify user is a participant
    participant_check = (
        sb.table("conversation_participants")
        .select("id")
        .eq("conversation_id", conversation_id)
        .eq("user_id", user["id"])
        .execute()
    )
    if not participant_check.data:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a participant of this conversation",
        )

    result = (
        sb.table("messages")
        .select("*")
        .eq("conversation_id", conversation_id)
        .order("created_at", desc=False)
        .execute()
    )
    return result.data or []


@router.post("/{conversation_id}/messages")
async def send_message(
    conversation_id: str,
    body: MessageCreate,
    user: dict = Depends(get_current_user),
):
    """Send a message to a conversation."""
    sb = get_supabase()

    # Verify user is a participant
    participant_check = (
        sb.table("conversation_participants")
        .select("id")
        .eq("conversation_id", conversation_id)
        .eq("user_id", user["id"])
        .execute()
    )
    if not participant_check.data:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a participant of this conversation",
        )

    message_data = {
        "conversation_id": conversation_id,
        "sender_id": user["id"],
        "content": body.content,
        "type": body.type,
        "file_name": body.file_name,
        "file_url": body.file_url,
    }

    result = (
        sb.table("messages")
        .insert(message_data)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send message",
        )

    return result.data[0]
