from pydantic import BaseModel


class MessageCreate(BaseModel):
    content: str
    type: str = "text"
    file_name: str | None = None
    file_url: str | None = None


class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    sender_id: str
    content: str
    type: str
    file_name: str | None = None
    file_url: str | None = None
    created_at: str
