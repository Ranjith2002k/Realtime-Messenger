from pydantic import BaseModel
from datetime import datetime


class ProfileResponse(BaseModel):
    id: str
    name: str
    avatar_url: str | None = None
    status: str = "offline"
    last_seen: str | None = None


class ProfileUpdate(BaseModel):
    status: str | None = None
    last_seen: str | None = None
    name: str | None = None
    avatar_url: str | None = None
