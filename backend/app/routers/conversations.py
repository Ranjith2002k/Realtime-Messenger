from fastapi import APIRouter, Depends, HTTPException, status
from app.dependencies import get_current_user
from app.schemas.conversation import (
    ConversationCreate,
    GroupConversationCreate,
    ConversationResponse,
)
from app.supabase_client import get_supabase

router = APIRouter(prefix="/conversations", tags=["conversations"])


@router.get("/")
async def list_conversations(user: dict = Depends(get_current_user)):
    """
    List all conversations the current user participates in,
    enriched with participants and last message.
    """
    sb = get_supabase()
    user_id = user["id"]

    # Get conversation IDs user participates in
    participant_rows = (
        sb.table("conversation_participants")
        .select("conversation_id")
        .eq("user_id", user_id)
        .execute()
    )

    if not participant_rows.data:
        return []

    conv_ids = [r["conversation_id"] for r in participant_rows.data]

    # Load conversations
    conv_rows = (
        sb.table("conversations")
        .select("*")
        .in_("id", conv_ids)
        .execute()
    )

    if not conv_rows.data:
        return []

    # Load all participants for these conversations
    all_participants = (
        sb.table("conversation_participants")
        .select("conversation_id, user_id")
        .in_("conversation_id", conv_ids)
        .execute()
    )

    # Load all profiles
    all_profiles = sb.table("profiles").select("*").execute()
    profiles_map = {p["id"]: p for p in (all_profiles.data or [])}

    # Build enriched conversations
    conversations = []
    for conv in conv_rows.data:
        # Get last message
        last_msg_result = (
            sb.table("messages")
            .select("*")
            .eq("conversation_id", conv["id"])
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        last_message = last_msg_result.data[0] if last_msg_result.data else None

        # Get participants
        participant_user_ids = [
            p["user_id"]
            for p in (all_participants.data or [])
            if p["conversation_id"] == conv["id"]
        ]
        participants = [
            profiles_map[uid]
            for uid in participant_user_ids
            if uid in profiles_map
        ]

        # Display name
        display_name = conv.get("name") or "Unnamed"
        if conv["type"] == "direct":
            other = next(
                (p for p in participants if p["id"] != user_id), None
            )
            if other:
                display_name = other["name"]

        conversations.append(
            {
                "id": conv["id"],
                "type": conv["type"],
                "name": display_name,
                "participants": participants,
                "last_message": last_message,
                "unread_count": 0,
            }
        )

    # Sort by last message time (newest first)
    conversations.sort(
        key=lambda c: c["last_message"]["created_at"]
        if c["last_message"]
        else "",
        reverse=True,
    )

    return conversations


@router.post("/")
async def create_direct_conversation(
    body: ConversationCreate, user: dict = Depends(get_current_user)
):
    """
    Create a direct conversation between the current user and another user.
    Returns existing conversation if one already exists.
    """
    sb = get_supabase()
    user_id = user["id"]
    other_user_id = body.other_user_id

    # Check if direct conversation already exists
    my_convs = (
        sb.table("conversation_participants")
        .select("conversation_id")
        .eq("user_id", user_id)
        .execute()
    )
    their_convs = (
        sb.table("conversation_participants")
        .select("conversation_id")
        .eq("user_id", other_user_id)
        .execute()
    )

    if my_convs.data and their_convs.data:
        my_ids = {r["conversation_id"] for r in my_convs.data}
        shared_ids = [
            r["conversation_id"]
            for r in their_convs.data
            if r["conversation_id"] in my_ids
        ]

        if shared_ids:
            # Check if any are direct
            direct_convs = (
                sb.table("conversations")
                .select("id")
                .in_("id", shared_ids)
                .eq("type", "direct")
                .execute()
            )
            if direct_convs.data:
                return {"id": direct_convs.data[0]["id"], "existing": True}

    # Create new conversation
    conv_result = (
        sb.table("conversations")
        .insert({"type": "direct", "created_by": user_id})
        .execute()
    )

    if not conv_result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create conversation",
        )

    conv_id = conv_result.data[0]["id"]

    # Add both participants
    sb.table("conversation_participants").insert(
        [
            {"conversation_id": conv_id, "user_id": user_id},
            {"conversation_id": conv_id, "user_id": other_user_id},
        ]
    ).execute()

    return {"id": conv_id, "existing": False}


@router.post("/group")
async def create_group_conversation(
    body: GroupConversationCreate, user: dict = Depends(get_current_user)
):
    """Create a group conversation with specified members."""
    sb = get_supabase()
    user_id = user["id"]

    # Create conversation
    conv_result = (
        sb.table("conversations")
        .insert({"type": "group", "name": body.name, "created_by": user_id})
        .execute()
    )

    if not conv_result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create group conversation",
        )

    conv_id = conv_result.data[0]["id"]

    # Add all participants (creator + members)
    all_member_ids = [user_id] + body.member_ids
    participants = [
        {"conversation_id": conv_id, "user_id": uid}
        for uid in all_member_ids
    ]

    sb.table("conversation_participants").insert(participants).execute()

    return {"id": conv_id}
