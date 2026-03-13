import { useState, useEffect } from "react";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";
import { useChatStore } from "@/stores/chatStore";
import { useAuthStore } from "@/stores/authStore";
import { Menu, Loader2 } from "lucide-react";

const ChatPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { activeConversationId, darkMode, loadProfile, loadConversations, subscribeRealtime, unsubscribeRealtime, updateStatus, loading } = useChatStore();
  const { user } = useAuthStore();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (!user) return;

    const init = async () => {
      await loadProfile(user.id);
      await useChatStore.getState().loadConversations(user.id);
      subscribeRealtime(user.id);
      updateStatus("online");
    };

    init();

    // Set offline on unmount
    return () => {
      updateStatus("offline");
      unsubscribeRealtime();
    };
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <ChatSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile menu button + header */}
        <div className="flex items-center border-b border-border bg-card md:hidden px-2">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1">
            {activeConversationId && <ChatHeader />}
          </div>
        </div>

        {/* Desktop header */}
        <div className="hidden md:block">
          <ChatHeader />
        </div>

        <MessageList />
        <MessageInput />
      </div>
    </div>
  );
};

export default ChatPage;
