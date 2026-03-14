import { useChatStore } from "@/stores/chatStore";
import { UserAvatar } from "./UserAvatar";
import { Phone, Video, MoreVertical } from "lucide-react";

export function ChatHeader() {
  const { activeConversationId, conversations } = useChatStore();
  const profile = useChatStore((s) => s.profile);

  if (!activeConversationId) return null;

  const conv = conversations.find((c) => c.id === activeConversationId);
  if (!conv) return null;

  const otherParticipant = conv.participants.find((p) => p.id !== profile?.id);
  const displayStatus = conv.type === "direct" && otherParticipant ? otherParticipant.status : undefined;

  return (
    <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
      <div className="flex items-center gap-3">
        <UserAvatar
          name={conv.name}
          status={displayStatus as "online" | "offline" | "away" | undefined}
          size="md"
        />
        <div>
          <h2 className="text-sm font-semibold text-foreground">{conv.name}</h2>
          <p className="text-xs text-muted-foreground">
            {conv.type === "group"
              ? `${conv.participants.length} members`
              : displayStatus === "online"
              ? "Online"
              : "Offline"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button className="rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <Phone className="h-5 w-5" />
        </button>
        <button className="rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <Video className="h-5 w-5" />
        </button>
        <button className="rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
