import { getInitials, getAvatarColor } from "@/utils/formatters";

interface UserAvatarProps {
  name: string;
  avatar?: string;
  status?: "online" | "offline" | "away";
  size?: "sm" | "md" | "lg";
  showStatus?: boolean;
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
};

const statusDotSize = {
  sm: "h-2.5 w-2.5",
  md: "h-3 w-3",
  lg: "h-4 w-4",
};

export function UserAvatar({ name, status, size = "md", showStatus = true }: UserAvatarProps) {
  const colorClass = getAvatarColor(name);

  return (
    <div className="relative inline-flex shrink-0">
      <div
        className={`${sizeClasses[size]} ${colorClass} rounded-full flex items-center justify-center font-semibold text-primary-foreground`}
      >
        {getInitials(name)}
      </div>
      {showStatus && status && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 ${statusDotSize[size]} rounded-full border-2 border-background ${
            status === "online"
              ? "bg-chat-online"
              : status === "away"
              ? "bg-yellow-500"
              : "bg-chat-offline"
          }`}
        />
      )}
    </div>
  );
}
