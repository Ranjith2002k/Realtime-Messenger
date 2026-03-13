from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from app.dependencies import get_current_user
from app.supabase_client import get_supabase
import time

router = APIRouter(prefix="/upload", tags=["upload"])


@router.post("/")
async def upload_file(
    file: UploadFile = File(...),
    conversation_id: str = "",
    user: dict = Depends(get_current_user),
):
    """Upload a file to Supabase Storage and return the public URL."""
    sb = get_supabase()

    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file provided",
        )

    # Generate unique path
    ext = file.filename.rsplit(".", 1)[-1] if "." in file.filename else "bin"
    path = f"{conversation_id or 'general'}/{int(time.time() * 1000)}.{ext}"

    # Read file content
    content = await file.read()

    # Upload to Supabase Storage
    try:
        sb.storage.from_("chat-attachments").upload(
            path,
            content,
            file_options={"content-type": file.content_type or "application/octet-stream"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Upload failed: {str(e)}",
        )

    # Get public URL
    public_url = sb.storage.from_("chat-attachments").get_public_url(path)

    return {
        "file_url": public_url,
        "file_name": file.filename,
        "file_size": len(content),
    }
