import { useState, useRef, KeyboardEvent } from "react";
import { useChatStore } from "@/stores/chatStore";
import { uploadApi } from "@/services/api";
import { Send, Paperclip, Smile, X, FileText, Image, Video, Contact } from "lucide-react";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { AttachmentMenu } from "./AttachmentMenu";
import { ContactPickerDialog } from "./ContactPickerDialog";
import { toast } from "sonner";

export function MessageInput() {
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [contactPickerOpen, setContactPickerOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ file: File; type: "document" | "photo" | "video" } | null>(null);
  const [uploading, setUploading] = useState(false);
  const { sendMessage, activeConversationId, darkMode } = useChatStore();

  const handleSend = async () => {
    if (!text.trim() && !selectedFile) return;

    if (selectedFile) {
      setUploading(true);
      try {
        // Upload file via FastAPI backend
        const uploadResult = await uploadApi.upload(selectedFile.file, activeConversationId || undefined);

        const msgType = selectedFile.type === "photo" ? "image" : selectedFile.type === "video" ? "video" : "file";
        await sendMessage(
          text || `Sent ${selectedFile.file.name}`,
          msgType,
          uploadResult.file_name,
          uploadResult.file_url
        );
      } catch (err: unknown) {
        toast.error("Upload failed: " + (err instanceof Error ? err.message : String(err)));
      } finally {
        setUploading(false);
        setSelectedFile(null);
      }
    } else {
      await sendMessage(text.trim());
    }
    setText("");
    setShowEmoji(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (file: File, type: "document" | "photo" | "video") => {
    setSelectedFile({ file, type });
  };

  const handleContactSelect = (name: string) => {
    sendMessage(`📇 Shared contact: ${name}`, "text");
  };

  const getFileIcon = () => {
    if (!selectedFile) return <Paperclip className="h-4 w-4 text-muted-foreground" />;
    switch (selectedFile.type) {
      case "photo": return <Image className="h-4 w-4 text-emerald-500" />;
      case "video": return <Video className="h-4 w-4 text-rose-500" />;
      default: return <FileText className="h-4 w-4 text-indigo-500" />;
    }
  };

  if (!activeConversationId) return null;

  return (
    <div className="relative border-t border-border bg-card p-3">
      {selectedFile && (
        <div className="mb-2 flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm">
          {getFileIcon()}
          <span className="truncate flex-1 text-foreground">{selectedFile.file.name}</span>
          <span className="text-xs text-muted-foreground shrink-0">
            {(selectedFile.file.size / 1024).toFixed(0)} KB
          </span>
          <button onClick={() => setSelectedFile(null)} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Preview for images */}
      {selectedFile?.type === "photo" && (
        <div className="mb-2 rounded-lg overflow-hidden max-w-[200px]">
          <img src={URL.createObjectURL(selectedFile.file)} alt="Preview" className="w-full h-auto" />
        </div>
      )}

      {/* Preview for videos */}
      {selectedFile?.type === "video" && (
        <div className="mb-2 rounded-lg overflow-hidden max-w-[200px]">
          <video src={URL.createObjectURL(selectedFile.file)} className="w-full h-auto" controls muted />
        </div>
      )}

      {showEmoji && (
        <div className="absolute bottom-full left-0 mb-2 z-50">
          <EmojiPicker
            theme={darkMode ? Theme.DARK : Theme.LIGHT}
            onEmojiClick={(e) => setText((prev) => prev + e.emoji)}
            width={320}
            height={400}
          />
        </div>
      )}

      <AttachmentMenu
        open={showAttachments}
        onClose={() => setShowAttachments(false)}
        onFileSelect={handleFileSelect}
        onContactsClick={() => setContactPickerOpen(true)}
      />

      <div className="flex items-end gap-2">
        <button
          onClick={() => { setShowEmoji(!showEmoji); setShowAttachments(false); }}
          className="shrink-0 rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Smile className="h-5 w-5" />
        </button>

        <button
          onClick={() => { setShowAttachments(!showAttachments); setShowEmoji(false); }}
          className="shrink-0 rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Paperclip className="h-5 w-5" />
        </button>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          className="flex-1 resize-none rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring max-h-32"
        />

        <button
          onClick={handleSend}
          disabled={(!text.trim() && !selectedFile) || uploading}
          className="shrink-0 rounded-full bg-primary p-2.5 text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>

      <ContactPickerDialog
        open={contactPickerOpen}
        onOpenChange={setContactPickerOpen}
        onSelect={handleContactSelect}
      />
    </div>
  );
}
