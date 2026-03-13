import { useEffect, useRef, useState } from "react";
import { useChatStore } from "@/stores/chatStore";
import { MessageBubble } from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

export function MessageList() {
  const { messages, activeConversationId, profile } = useChatStore();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showTyping, setShowTyping] = useState(false);

  const activeMessages = activeConversationId ? messages[activeConversationId] || [] : [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages.length]);

  // Simulate random typing indicator
  useEffect(() => {
    if (!activeConversationId) return;
    const timer = setTimeout(() => {
      setShowTyping(true);
      setTimeout(() => setShowTyping(false), 3000);
    }, 5000);
    return () => clearTimeout(timer);
  }, [activeConversationId]);

  if (!activeConversationId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-lg font-semibold text-foreground">Select a conversation</h3>
          <p className="text-sm text-muted-foreground mt-1">Choose a chat to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
      {activeMessages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} isOwn={msg.sender_id === profile?.id} />
      ))}
      {showTyping && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
}
