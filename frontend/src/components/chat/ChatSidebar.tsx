import { useChatStore } from "@/stores/chatStore";
import { UserAvatar } from "./UserAvatar";
import { CreateGroupDialog } from "./CreateGroupDialog";
import { formatRelativeTime } from "@/utils/formatters";
import { Users, MessageSquare, Search, Sun, Moon, LogOut, UserPlus } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatSidebar({ isOpen, onClose }: ChatSidebarProps) {
  const {
    conversations, profiles, activeConversationId,
    setActiveConversation, darkMode, toggleDarkMode, profile,
    startNewConversation,
  } = useChatStore();
  const { logout } = useAuthStore();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"chats" | "users">("chats");
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);

  const filtered = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const otherUsers = profiles.filter((p) => p.id !== profile?.id);

  const handleSelect = (id: string) => {
    setActiveConversation(id);
    onClose();
  };

  const handleStartChat = async (userId: string) => {
    const convId = await startNewConversation(userId);
    if (convId) {
      setActiveConversation(convId);
      setTab("chats");
      onClose();
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed md:relative z-40 h-full w-80 flex flex-col border-r border-border bg-chat-sidebar transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            {profile && (
              <>
                <UserAvatar name={profile.name} status={profile.status as "online" | "offline" | "away"} size="md" />
                <div>
                  <p className="text-sm font-semibold text-foreground">{profile.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{profile.status}</p>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setGroupDialogOpen(true)} className="rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="New group">
              <Users className="h-4 w-4" />
            </button>
            <button onClick={toggleDarkMode} className="rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button onClick={logout} className="rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-3">
          <div className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setTab("chats")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
              tab === "chats" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            Chats
          </button>
          <button
            onClick={() => setTab("users")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
              tab === "users" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="h-4 w-4" />
            Users
          </button>
        </div>

        {/* List */}
        <div className="relative flex-1 overflow-y-auto scrollbar-thin">
          {tab === "chats" ? (
            filtered.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                No conversations yet. Go to Users tab to start a chat!
              </div>
            ) : (
              filtered.map((conv) => {
                const otherParticipant = conv.type === "direct"
                  ? conv.participants.find((p) => p.id !== profile?.id)
                  : undefined;

                return (
                  <button
                    key={conv.id}
                    onClick={() => handleSelect(conv.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/60 ${
                      activeConversationId === conv.id ? "bg-muted" : ""
                    }`}
                  >
                    <UserAvatar
                      name={conv.name}
                      status={otherParticipant?.status as "online" | "offline" | "away" | undefined}
                      size="md"
                      showStatus={conv.type === "direct"}
                    />
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground truncate">{conv.name}</span>
                        {conv.lastMessage && (
                          <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                            {formatRelativeTime(new Date(conv.lastMessage.created_at))}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <p className="text-xs text-muted-foreground truncate">
                          {conv.type === "group" && <Users className="inline h-3 w-3 mr-1" />}
                          {conv.lastMessage?.content || "No messages yet"}
                        </p>
                        {conv.unreadCount > 0 && (
                          <span className="shrink-0 ml-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-chat-unread px-1.5 text-[10px] font-bold text-destructive-foreground">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )
          ) : (
            otherUsers.map((u) => (
              <button
                key={u.id}
                onClick={() => handleStartChat(u.id)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/60 transition-colors"
              >
                <UserAvatar name={u.name} status={u.status as "online" | "offline" | "away"} size="md" />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-foreground">{u.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{u.status}</p>
                </div>
                <UserPlus className="h-4 w-4 text-muted-foreground" />
              </button>
            ))
          )}

          {/* WhatsApp-style FAB */}
          {tab === "chats" && (
            <button
              onClick={() => setTab("users")}
              className="absolute bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
              title="New chat"
            >
              <MessageSquare className="h-5 w-5" />
            </button>
          )}
        </div>
      </aside>

      <CreateGroupDialog open={groupDialogOpen} onOpenChange={setGroupDialogOpen} />
    </>
  );
}
