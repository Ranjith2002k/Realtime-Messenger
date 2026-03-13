import { MessageRow } from "@/stores/chatStore";
import { formatTime } from "@/utils/formatters";
import { FileText, Image, Video, Download } from "lucide-react";

interface MessageBubbleProps {
  message: MessageRow;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const renderAttachment = () => {
    if (message.type === "image" && message.file_url) {
      return (
        <div className="mb-1 rounded-lg overflow-hidden">
          <img src={message.file_url} alt={message.file_name || "Image"} className="max-w-full max-h-60 rounded-lg cursor-pointer" onClick={() => window.open(message.file_url!, "_blank")} />
        </div>
      );
    }
    if (message.type === "video" && message.file_url) {
      return (
        <div className="mb-1 rounded-lg overflow-hidden">
          <video src={message.file_url} className="max-w-full max-h-60 rounded-lg" controls />
        </div>
      );
    }
    if (message.type === "file" && message.file_url) {
      return (
        <a href={message.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 mb-1 rounded-lg bg-background/20 px-3 py-2 hover:bg-background/30 transition-colors">
          <FileText className="h-5 w-5 shrink-0" />
          <span className="text-sm truncate flex-1">{message.file_name}</span>
          <Download className="h-4 w-4 shrink-0 opacity-60" />
        </a>
      );
    }
    if (message.type === "file" && !message.file_url) {
      return (
        <div className="flex items-center gap-2 mb-1">
          <FileText className="h-4 w-4 shrink-0" />
          <span className="text-sm truncate">{message.file_name}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} animate-fade-in-up`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
          isOwn
            ? "bg-chat-bubble-sent text-chat-bubble-sent-fg rounded-br-md"
            : "bg-chat-bubble-received text-chat-bubble-received-fg rounded-bl-md"
        }`}
      >
        {renderAttachment()}
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        <p className={`text-[10px] mt-1 ${isOwn ? "text-chat-bubble-sent-fg/60" : "text-muted-foreground"} text-right`}>
          {formatTime(new Date(message.created_at))}
        </p>
      </div>
    </div>
  );
}
