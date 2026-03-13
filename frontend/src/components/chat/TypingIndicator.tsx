const TypingIndicator = () => {
  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="flex items-center gap-1 rounded-2xl bg-chat-bubble-received px-4 py-3">
        <span className="h-2 w-2 rounded-full bg-chat-typing animate-pulse-dot" style={{ animationDelay: "0s" }} />
        <span className="h-2 w-2 rounded-full bg-chat-typing animate-pulse-dot" style={{ animationDelay: "0.2s" }} />
        <span className="h-2 w-2 rounded-full bg-chat-typing animate-pulse-dot" style={{ animationDelay: "0.4s" }} />
      </div>
    </div>
  );
};

export default TypingIndicator;
