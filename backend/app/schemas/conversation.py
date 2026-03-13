from pydantic import BaseModel


class ConversationCreate(BaseModel):
    other_user_id: str


class GroupConversationCreate(BaseModel):
    name: str
    member_ids: list[str]


class ConversationResponse(BaseModel):
    id: str
    type: str
    name: str
    participants: list[dict] = []
    last_message: dict | None = None
    unread_count: int = 0
